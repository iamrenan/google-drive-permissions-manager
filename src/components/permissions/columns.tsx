"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MappedFile } from "@/lib/types";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/constants";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    ArrowUpDown,
    MoreHorizontal,
    Folder,
    FileText,
    ExternalLink,
    UserPlus,
    UserMinus,
    Users,
    Eye,
} from "lucide-react";
import { formatDate, formatBytes } from "@/lib/utils";

interface ColumnsProps {
    onAddPermission: (file: MappedFile) => void;
    onRemovePermission: (file: MappedFile) => void;
    onViewPermissions: (file: MappedFile) => void;
}

export function getColumns({
    onAddPermission,
    onRemovePermission,
    onViewPermissions,
}: ColumnsProps): ColumnDef<MappedFile>[] {
    return [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const file = row.original;
                return (
                    <div className="flex items-center gap-2">
                        {file.isFolder ? (
                            <Folder className="h-4 w-4 text-blue-500" />
                        ) : (
                            <FileText className="h-4 w-4 text-gray-500" />
                        )}
                        <div className="flex flex-col">
                            <span className="font-medium">{file.name}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                                {file.path}
                            </span>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "isFolder",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Type
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                return (
                    <Badge variant="outline">
                        {row.original.isFolder ? "Folder" : "File"}
                    </Badge>
                );
            },
            filterFn: (row, id, value) => {
                if (value === "all") return true;
                if (value === "folder") return row.original.isFolder;
                if (value === "file") return !row.original.isFolder;
                return true;
            },
        },
        {
            id: "userPermissions",
            accessorFn: (row) => {
                // Return array of user identifiers for filtering
                return (row.permissions || []).map(
                    (p) => p.emailAddress || p.displayName || p.domain || p.type
                );
            },
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Permissioned Users
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const permissions = row.original.permissions || [];
                const displayCount = 3;
                const displayPermissions = permissions.slice(0, displayCount);
                const remainingCount = permissions.length - displayCount;

                return (
                    <div className="flex flex-wrap items-center gap-1">
                        {permissions.length === 0 ? (
                            <span className="text-muted-foreground text-sm">No shared access</span>
                        ) : (
                            <>
                                {displayPermissions.map((perm, index) => (
                                    <Tooltip key={perm.id || index}>
                                        <TooltipTrigger>
                                            <Badge
                                                variant="secondary"
                                                className={`text-xs ${ROLE_COLORS[perm.role] || ""}`}
                                            >
                                                {perm.type === "anyone"
                                                    ? "Anyone"
                                                    : perm.displayName || perm.emailAddress || perm.domain || "Unknown"}
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>
                                                {perm.emailAddress || perm.domain || perm.type}:{" "}
                                                {ROLE_LABELS[perm.role] || perm.role}
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                                {remainingCount > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                        +{remainingCount} more
                                    </Badge>
                                )}
                            </>
                        )}
                    </div>
                );
            },
            sortingFn: (rowA, rowB) => {
                const aLen = rowA.original.permissions?.length || 0;
                const bLen = rowB.original.permissions?.length || 0;
                return aLen - bLen;
            },
            filterFn: (row, id, value) => {
                const userIds = row.getValue(id) as string[];
                return value.some((filterValue: string) => userIds.includes(filterValue));
            },
            enableColumnFilter: true,
        },
        {
            accessorKey: "shared",
            header: "Shared",
            cell: ({ row }) => {
                return row.original.shared ? (
                    <Badge variant="default" className="bg-green-500">
                        <Users className="mr-1 h-3 w-3" />
                        Shared
                    </Badge>
                ) : (
                    <Badge variant="secondary">Private</Badge>
                );
            },
            filterFn: (row, id, value) => {
                if (value === "all") return true;
                if (value === "shared") return row.original.shared;
                if (value === "private") return !row.original.shared;
                return true;
            },
        },
        {
            accessorKey: "modifiedTime",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Modified
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const date = row.original.modifiedTime;
                return date ? (
                    <span className="text-sm text-muted-foreground">
                        {formatDate(date)}
                    </span>
                ) : (
                    <span className="text-muted-foreground">-</span>
                );
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const file = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onViewPermissions(file)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Permissions
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onAddPermission(file)}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Add Permission
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onRemovePermission(file)}
                                className="text-destructive focus:text-destructive"
                            >
                                <UserMinus className="mr-2 h-4 w-4" />
                                Remove Permission
                            </DropdownMenuItem>
                            {file.webViewLink && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <a
                                            href={file.webViewLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            Open in Drive
                                        </a>
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
}
