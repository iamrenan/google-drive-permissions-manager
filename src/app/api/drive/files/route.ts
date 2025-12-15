import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { DriveFile, DrivePermission, MappedFile } from "@/lib/types";
import {
    FOLDER_MIME_TYPE,
    BATCH_SIZE,
    MAX_FILES_THRESHOLD,
    DRIVE_API_BASE,
} from "@/lib/constants";
import { safeErrorResponse } from "@/lib/validation";

async function fetchWithAuth(url: string, accessToken: string, options?: RequestInit) {
    const response = await fetch(url, {
        ...options,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            ...options?.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
        throw new Error(error.error?.message || "API request failed");
    }

    return response.json();
}

export async function GET(request: Request) {
    const session = await auth();

    if (!session?.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pageToken = searchParams.get("pageToken");
    const includePermissions = searchParams.get("includePermissions") === "true";

    try {
        // Build fields parameter - quotaBytesUsed is the actual size field for files
        const fields = [
            "nextPageToken",
            "files(id,name,mimeType,parents,shared,webViewLink,iconLink,createdTime,modifiedTime,size,quotaBytesUsed,owners,capabilities)",
        ];

        if (includePermissions) {
            fields[1] = fields[1].replace(")", ",permissions,permissionIds)");
        }

        // Build query - exclude trashed files
        const query = "trashed=false";

        const params = new URLSearchParams({
            pageSize: BATCH_SIZE.toString(),
            fields: fields.join(","),
            q: query,
            orderBy: "folder,name",
            supportsAllDrives: "true",
            includeItemsFromAllDrives: "true",
        });

        if (pageToken) {
            params.set("pageToken", pageToken);
        }

        const data = await fetchWithAuth(
            `${DRIVE_API_BASE}/files?${params.toString()}`,
            session.accessToken
        );

        // Transform files to our format
        const files: MappedFile[] = (data.files || []).map((file: any) => ({
            id: file.id,
            name: file.name,
            mimeType: file.mimeType,
            isFolder: file.mimeType === FOLDER_MIME_TYPE,
            parentId: file.parents?.[0],
            path: "", // Will be computed client-side
            shared: file.shared || false,
            permissions: file.permissions || [],
            webViewLink: file.webViewLink,
            modifiedTime: file.modifiedTime,
            // Use quotaBytesUsed for binary files, size might not be available for Google Workspace files
            size: file.quotaBytesUsed || file.size,
            owner: file.owners?.[0]?.emailAddress,
        }));

        return NextResponse.json({
            files,
            nextPageToken: data.nextPageToken,
            hasMore: !!data.nextPageToken,
        });
    } catch (error) {
        return safeErrorResponse(error, "Failed to fetch files");
    }
}
