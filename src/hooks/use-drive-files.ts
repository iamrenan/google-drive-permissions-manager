"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { MappedFile, DrivePermission } from "@/lib/types";
import { MAX_FILES_THRESHOLD } from "@/lib/constants";
import {
    saveFileMapping,
    getFileMapping,
    clearFileMapping,
} from "@/lib/storage";

interface UseDriveFilesResult {
    files: MappedFile[];
    isLoading: boolean;
    isInitialized: boolean;
    isMappingComplete: boolean;
    progress: { current: number; total: number };
    error: string | null;
    remapFiles: () => Promise<void>;
    updateFilePermissions: (fileId: string, permissions: DrivePermission[]) => void;
}

export function useDriveFiles(): UseDriveFilesResult {
    const { data: session } = useSession();
    const [files, setFiles] = useState<MappedFile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isMappingComplete, setIsMappingComplete] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [error, setError] = useState<string | null>(null);

    const fetchAllFiles = useCallback(async () => {
        if (!session?.user?.email) return;

        setIsLoading(true);
        setError(null);
        setProgress({ current: 0, total: 0 });

        try {
            // Clear existing mapping
            await clearFileMapping(session.user.email);

            let allFiles: MappedFile[] = [];
            let pageToken: string | null = null;
            let hasMore = true;

            while (hasMore && allFiles.length < MAX_FILES_THRESHOLD) {
                const params = new URLSearchParams({
                    includePermissions: "true",
                });

                if (pageToken) {
                    params.set("pageToken", pageToken);
                }

                const response = await fetch(`/api/drive/files?${params.toString()}`);

                if (!response.ok) {
                    throw new Error("Failed to fetch files");
                }

                const data = await response.json();
                allFiles = [...allFiles, ...data.files];
                pageToken = data.nextPageToken;
                hasMore = data.hasMore && allFiles.length < MAX_FILES_THRESHOLD;

                setProgress({
                    current: allFiles.length,
                    total: allFiles.length + (hasMore ? 100 : 0),
                });

                setFiles(allFiles);
            }

            // Build file paths
            const fileMap = new Map(allFiles.map((f) => [f.id, f]));
            const filesWithPaths = allFiles.map((file) => {
                const pathParts: string[] = [file.name];
                let currentFile = file;

                while (currentFile.parentId && fileMap.has(currentFile.parentId)) {
                    currentFile = fileMap.get(currentFile.parentId)!;
                    pathParts.unshift(currentFile.name);
                }

                return {
                    ...file,
                    path: pathParts.join("/"),
                };
            });

            setFiles(filesWithPaths);
            setIsMappingComplete(true);

            // Save to IndexedDB
            await saveFileMapping(session.user.email, {
                files: filesWithPaths,
                lastUpdated: new Date().toISOString(),
                totalCount: filesWithPaths.length,
                mappingComplete: true,
                userEmail: session.user.email,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch files");
        } finally {
            setIsLoading(false);
        }
    }, [session?.user?.email]);

    const loadCachedFiles = useCallback(async () => {
        if (!session?.user?.email) return false;

        try {
            const cached = await getFileMapping(session.user.email);

            if (cached && cached.mappingComplete) {
                setFiles(cached.files);
                setIsMappingComplete(true);
                setProgress({ current: cached.totalCount, total: cached.totalCount });
                return true;
            }
        } catch (err) {
            console.error("Error loading cached files:", err);
        }

        return false;
    }, [session?.user?.email]);

    const updateFilePermissions = useCallback(
        (fileId: string, permissions: DrivePermission[]) => {
            setFiles((prevFiles) =>
                prevFiles.map((file) =>
                    file.id === fileId ? { ...file, permissions } : file
                )
            );
        },
        []
    );

    useEffect(() => {
        async function init() {
            if (!session?.user?.email) {
                setIsInitialized(true);
                return;
            }

            const hasCached = await loadCachedFiles();

            if (!hasCached) {
                await fetchAllFiles();
            }

            setIsInitialized(true);
        }

        init();
    }, [session?.user?.email]);

    return {
        files,
        isLoading,
        isInitialized,
        isMappingComplete,
        progress,
        error,
        remapFiles: fetchAllFiles,
        updateFilePermissions,
    };
}
