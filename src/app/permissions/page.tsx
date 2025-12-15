"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useDriveFiles } from "@/hooks/use-drive-files";
import { AuthGuard } from "@/components/auth-guard";
import { getColumns } from "@/components/permissions/columns";
import { DataTable } from "@/components/permissions/data-table";
import { EmptyState } from "@/components/permissions/empty-state";
import { ErrorDialog } from "@/components/permissions/error-dialog";
import {
    AddPermissionDialog,
    RemovePermissionDialog,
    ViewPermissionsDialog,
    BulkActionDialog,
} from "@/components/permissions/dialogs";
import { Button } from "@/components/ui/button";
import { MappedFile, DrivePermission } from "@/lib/types";
import {
    RefreshCw,
    UserPlus,
    UserMinus,
    HardDrive,
    FolderTree,
    Users,
    FileText,
    Loader2,
} from "lucide-react";

export default function PermissionsPage() {
    const { data: session, status } = useSession();
    const {
        files,
        isLoading,
        isMappingComplete,
        progress,
        error,
        refreshFiles,
        updateFilePermissions,
    } = useDriveFiles();

    // Dialog states
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [bulkAction, setBulkAction] = useState<"add" | "remove">("add");
    const [selectedFile, setSelectedFile] = useState<MappedFile | null>(null);
    const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Show error dialog when error occurs
    useEffect(() => {
        if (error && !isLoading) {
            setErrorDialogOpen(true);
        }
    }, [error, isLoading]);

    // Handlers
    const handleAddPermission = useCallback((file: MappedFile) => {
        setSelectedFile(file);
        setAddDialogOpen(true);
    }, []);

    const handleRemovePermission = useCallback((file: MappedFile) => {
        setSelectedFile(file);
        setRemoveDialogOpen(true);
    }, []);

    const handleViewPermissions = useCallback((file: MappedFile) => {
        setSelectedFile(file);
        setViewDialogOpen(true);
    }, []);

    const handleBulkAdd = useCallback(() => {
        setBulkAction("add");
        setBulkDialogOpen(true);
    }, []);

    const handleBulkRemove = useCallback(() => {
        setBulkAction("remove");
        setBulkDialogOpen(true);
    }, []);

    const submitAddPermission = async (data: {
        type: string;
        role: string;
        emailAddress?: string;
        domain?: string;
    }) => {
        if (!selectedFile) return;

        setIsActionLoading(true);
        try {
            const response = await fetch(
                `/api/drive/permissions/${selectedFile.id}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to add permission");
            }

            const result = await response.json();

            // Update local state
            const updatedPermissions = [
                ...selectedFile.permissions,
                result.permission,
            ];
            updateFilePermissions(selectedFile.id, updatedPermissions);
            setAddDialogOpen(false);
        } catch (error) {
            console.error("Error adding permission:", error);
        } finally {
            setIsActionLoading(false);
        }
    };

    const submitRemovePermission = async (permissionId: string) => {
        if (!selectedFile) return;

        setIsActionLoading(true);
        try {
            const response = await fetch(
                `/api/drive/permissions/${selectedFile.id}?permissionId=${permissionId}`,
                { method: "DELETE" }
            );

            if (!response.ok) {
                throw new Error("Failed to remove permission");
            }

            // Update local state
            const updatedPermissions = selectedFile.permissions.filter(
                (p) => p.id !== permissionId
            );
            updateFilePermissions(selectedFile.id, updatedPermissions);

            if (updatedPermissions.filter((p) => p.role !== "owner").length === 0) {
                setRemoveDialogOpen(false);
            }
        } catch (error) {
            console.error("Error removing permission:", error);
        } finally {
            setIsActionLoading(false);
        }
    };

    const submitBulkAction = async (data: {
        action: string;
        type?: string;
        role?: string;
        emailAddress?: string;
        domain?: string;
    }) => {
        if (selectedFileIds.length === 0) return;

        setIsActionLoading(true);
        try {
            const response = await fetch("/api/drive/permissions/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...data,
                    fileIds: selectedFileIds,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to perform bulk action");
            }

            // Refresh files to get updated permissions
            await refreshFiles();
            setBulkDialogOpen(false);
        } catch (error) {
            console.error("Error in bulk action:", error);
        } finally {
            setIsActionLoading(false);
        }
    };

    // Create columns with handlers
    const columns = useMemo(
        () =>
            getColumns({
                onAddPermission: handleAddPermission,
                onRemovePermission: handleRemovePermission,
                onViewPermissions: handleViewPermissions,
            }),
        [handleAddPermission, handleRemovePermission, handleViewPermissions]
    );

    // Stats
    const stats = useMemo(() => {
        const totalFiles = files.length;
        const folders = files.filter((f) => f.isFolder).length;
        const sharedFiles = files.filter((f) => f.shared).length;
        const uniqueUsers = new Set(
            files.flatMap((f) =>
                f.permissions
                    .filter((p) => p.emailAddress)
                    .map((p) => p.emailAddress)
            )
        ).size;

        return { totalFiles, folders, sharedFiles, uniqueUsers };
    }, [files]);

    // Auth check
    if (status === "loading") {
        return (
            <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (status === "unauthenticated") {
        redirect("/");
    }

    return (
        <AuthGuard>
            <div className="container mx-auto py-8 px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Permissions Manager</h1>
                    <p className="text-muted-foreground">
                        View and manage permissions for your Google Drive files and folders.
                    </p>
                </div>

                {/* Stats */}
                {isMappingComplete && files.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-4 mb-8">
                        <div className="rounded-lg border bg-card p-4">
                            <div className="flex items-center gap-2">
                                <HardDrive className="h-5 w-5 text-primary" />
                                <span className="text-sm text-muted-foreground">Total Files</span>
                            </div>
                            <p className="text-2xl font-bold mt-2">
                                {stats.totalFiles.toLocaleString()}
                            </p>
                        </div>
                        <div className="rounded-lg border bg-card p-4">
                            <div className="flex items-center gap-2">
                                <FolderTree className="h-5 w-5 text-blue-500" />
                                <span className="text-sm text-muted-foreground">Folders</span>
                            </div>
                            <p className="text-2xl font-bold mt-2">
                                {stats.folders.toLocaleString()}
                            </p>
                        </div>
                        <div className="rounded-lg border bg-card p-4">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-green-500" />
                                <span className="text-sm text-muted-foreground">Shared Files</span>
                            </div>
                            <p className="text-2xl font-bold mt-2">
                                {stats.sharedFiles.toLocaleString()}
                            </p>
                        </div>
                        <div className="rounded-lg border bg-card p-4">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-purple-500" />
                                <span className="text-sm text-muted-foreground">Unique Users</span>
                            </div>
                            <p className="text-2xl font-bold mt-2">
                                {stats.uniqueUsers.toLocaleString()}
                            </p>
                        </div>
                    </div>
                )}

                {/* Actions bar */}
                {files.length > 0 && (
                    <div className="mb-6">
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={refreshFiles}
                                    variant="outline"
                                    disabled={isLoading}
                                >
                                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                                {isLoading && (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                        <div>
                                            <p className="text-sm font-medium">Mapping Your Drive</p>
                                            <p className="text-xs text-muted-foreground">
                                                {progress.current.toLocaleString()} files mapped
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1" />
                            {isMappingComplete && (
                                <>
                                    <Button onClick={handleBulkAdd} variant="outline">
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Bulk Add Permission
                                    </Button>
                                    <Button onClick={handleBulkRemove} variant="outline">
                                        <UserMinus className="mr-2 h-4 w-4" />
                                        Bulk Remove Permission
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Content */}
                {files.length === 0 ? (
                    <EmptyState
                        isLoading={isLoading}
                        hasFiles={false}
                        progress={progress}
                    />
                ) : (
                    <DataTable columns={columns} data={files} />
                )}

                {/* Dialogs */}
                <AddPermissionDialog
                    open={addDialogOpen}
                    onOpenChange={setAddDialogOpen}
                    file={selectedFile}
                    onSubmit={submitAddPermission}
                    isLoading={isActionLoading}
                />
                <RemovePermissionDialog
                    open={removeDialogOpen}
                    onOpenChange={setRemoveDialogOpen}
                    file={selectedFile}
                    onRemove={submitRemovePermission}
                    isLoading={isActionLoading}
                />
                <ViewPermissionsDialog
                    open={viewDialogOpen}
                    onOpenChange={setViewDialogOpen}
                    file={selectedFile}
                />
                <BulkActionDialog
                    open={bulkDialogOpen}
                    onOpenChange={setBulkDialogOpen}
                    action={bulkAction}
                    selectedCount={selectedFileIds.length || files.length}
                    onSubmit={submitBulkAction}
                    isLoading={isActionLoading}
                />
                <ErrorDialog
                    open={errorDialogOpen}
                    onOpenChange={setErrorDialogOpen}
                    error={error || "Unknown error occurred"}
                    onRetry={refreshFiles}
                />
            </div>
        </AuthGuard>
    );
}
