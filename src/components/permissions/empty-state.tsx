"use client";

import { FolderOpen, HardDrive, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
    isLoading: boolean;
    hasFiles: boolean;
    progress: { current: number; total: number };
    onCancel?: () => void;
}

export function EmptyState({ isLoading, hasFiles, progress, onCancel }: EmptyStateProps) {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <HardDrive className="h-16 w-16 text-primary mb-6 animate-pulse" />
                <h3 className="text-xl font-semibold mb-2">Mapping Your Drive</h3>
                <p className="text-muted-foreground text-center max-w-md mb-4">
                    We're scanning your Google Drive and building a map of your files and
                    folders. This might take a moment depending on how many files you
                    have.
                </p>
                {progress.current > 0 && (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-300"
                                style={{
                                    width: `${progress.total > 0
                                        ? Math.min((progress.current / progress.total) * 100, 100)
                                        : 0
                                        }%`,
                                }}
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {progress.current.toLocaleString()} files mapped
                        </p>
                    </div>
                )}
            </div>
        );
    }

    if (!hasFiles) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <FolderOpen className="h-16 w-16 text-muted-foreground mb-6" />
                <h3 className="text-xl font-semibold mb-2">No Files Found</h3>
                <p className="text-muted-foreground text-center max-w-md">
                    Your Google Drive appears to be empty or we couldn't find any files.
                    Try uploading some files to your Drive and refresh the page.
                </p>
            </div>
        );
    }

    return null;
}
