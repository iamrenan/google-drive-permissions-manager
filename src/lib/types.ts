// Types for Google Drive files and permissions

export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    parents?: string[];
    owners?: DriveUser[];
    permissions?: DrivePermission[];
    permissionIds?: string[];
    shared?: boolean;
    webViewLink?: string;
    iconLink?: string;
    createdTime?: string;
    modifiedTime?: string;
    size?: string;
    quotaBytesUsed?: string; // Actual size in bytes for binary files
    capabilities?: {
        canShare?: boolean;
        canEdit?: boolean;
        canDelete?: boolean;
    };
}

export interface DriveUser {
    kind: string;
    displayName: string;
    photoLink?: string;
    me?: boolean;
    permissionId?: string;
    emailAddress?: string;
}

export interface DrivePermission {
    id: string;
    type: "user" | "group" | "domain" | "anyone";
    role: "owner" | "organizer" | "fileOrganizer" | "writer" | "commenter" | "reader";
    emailAddress?: string;
    displayName?: string;
    photoLink?: string;
    domain?: string;
    deleted?: boolean;
    pendingOwner?: boolean;
    expirationTime?: string;
}

export interface DriveFileWithPermissions extends DriveFile {
    permissions: DrivePermission[];
}

export interface MappedFile {
    id: string;
    name: string;
    mimeType: string;
    isFolder: boolean;
    parentId?: string;
    path: string;
    shared: boolean;
    permissions: DrivePermission[];
    webViewLink?: string;
    modifiedTime?: string;
    size?: string;
    owner?: string;
}

export interface FileMapping {
    files: MappedFile[];
    lastUpdated: string;
    totalCount: number;
    mappingComplete: boolean;
    userEmail: string;
}
