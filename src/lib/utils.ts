import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export function buildFileTree<T extends { id: string; parentId?: string; subRows?: T[] }>(
    files: T[]
): T[] {
    const fileMap = new Map<string, T>();
    const rootFiles: T[] = [];

    // First pass: create a map of all files
    files.forEach((file) => {
        fileMap.set(file.id, { ...file, subRows: [] });
    });

    // Second pass: build the tree structure
    files.forEach((file) => {
        const currentFile = fileMap.get(file.id)!;
        
        if (!file.parentId) {
            // No parent ID means this is a root level file
            rootFiles.push(currentFile);
        } else {
            // Has a parent ID - check if parent exists in our data
            const parent = fileMap.get(file.parentId);
            if (parent) {
                // Parent found - add to parent's subRows
                if (!parent.subRows) {
                    parent.subRows = [];
                }
                parent.subRows.push(currentFile);
            } else {
                // Parent not in our dataset - only add as root if parent truly doesn't exist
                // Check if this is actually a root-level item (parent is outside our scope)
                const hasParentInDataset = files.some(f => f.id === file.parentId);
                if (!hasParentInDataset) {
                    rootFiles.push(currentFile);
                }
            }
        }
    });

    return rootFiles;
}
