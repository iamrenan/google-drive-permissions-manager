import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { DrivePermission } from "@/lib/types";
import { DRIVE_API_BASE } from "@/lib/constants";
import {
    validateFileId,
    validatePermissionId,
    validateEmail,
    validateDomain,
    validateRole,
    validatePermissionType,
    safeErrorResponse,
} from "@/lib/validation";

async function fetchWithAuth(
    url: string,
    accessToken: string,
    options?: RequestInit
) {
    const response = await fetch(url, {
        ...options,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            ...options?.headers,
        },
    });

    if (!response.ok) {
        const error = await response
            .json()
            .catch(() => ({ error: { message: response.statusText } }));
        throw new Error(error.error?.message || "API request failed");
    }

    return response.json();
}

// GET - List permissions for a file
export async function GET(
    request: Request,
    { params }: { params: Promise<{ fileId: string }> }
) {
    const session = await auth();

    if (!session?.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await params;

    if (!validateFileId(fileId)) {
        return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
    }

    try {
        const data = await fetchWithAuth(
            `${DRIVE_API_BASE}/files/${fileId}/permissions?fields=permissions(id,type,role,emailAddress,displayName,photoLink,domain,deleted,expirationTime,pendingOwner)`,
            session.accessToken
        );

        return NextResponse.json({ permissions: data.permissions || [] });
    } catch (error) {
        return safeErrorResponse(error, "Failed to fetch permissions");
    }
}

// POST - Create a new permission
export async function POST(
    request: Request,
    { params }: { params: Promise<{ fileId: string }> }
) {
    const session = await auth();

    if (!session?.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await params;

    if (!validateFileId(fileId)) {
        return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
    }

    try {
        const body = await request.json();
        const { type, role, emailAddress, domain, sendNotificationEmail = false } = body;

        if (!type || !role) {
            return NextResponse.json(
                { error: "Type and role are required" },
                { status: 400 }
            );
        }

        if (!validatePermissionType(type)) {
            return NextResponse.json(
                { error: "Invalid permission type" },
                { status: 400 }
            );
        }

        if (!validateRole(role)) {
            return NextResponse.json(
                { error: "Invalid role" },
                { status: 400 }
            );
        }

        const permissionData: Record<string, unknown> = { type, role };

        if (type === "user" || type === "group") {
            if (!emailAddress) {
                return NextResponse.json(
                    { error: "Email address is required for user/group permissions" },
                    { status: 400 }
                );
            }
            if (!validateEmail(emailAddress)) {
                return NextResponse.json(
                    { error: "Invalid email address" },
                    { status: 400 }
                );
            }
            permissionData.emailAddress = emailAddress;
        } else if (type === "domain") {
            if (!domain) {
                return NextResponse.json(
                    { error: "Domain is required for domain permissions" },
                    { status: 400 }
                );
            }
            if (!validateDomain(domain)) {
                return NextResponse.json(
                    { error: "Invalid domain" },
                    { status: 400 }
                );
            }
            permissionData.domain = domain;
        }

        const data = await fetchWithAuth(
            `${DRIVE_API_BASE}/files/${fileId}/permissions?sendNotificationEmail=${sendNotificationEmail}&fields=id,type,role,emailAddress,displayName,photoLink,domain`,
            session.accessToken,
            {
                method: "POST",
                body: JSON.stringify(permissionData),
            }
        );

        return NextResponse.json({ permission: data });
    } catch (error) {
        return safeErrorResponse(error, "Failed to create permission");
    }
}

// DELETE - Remove a permission
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ fileId: string }> }
) {
    const session = await auth();

    if (!session?.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await params;

    if (!validateFileId(fileId)) {
        return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const permissionId = searchParams.get("permissionId");

        if (!permissionId) {
            return NextResponse.json(
                { error: "Permission ID is required" },
                { status: 400 }
            );
        }

        if (!validatePermissionId(permissionId)) {
            return NextResponse.json(
                { error: "Invalid permission ID" },
                { status: 400 }
            );
        }

        await fetchWithAuth(
            `${DRIVE_API_BASE}/files/${fileId}/permissions/${permissionId}`,
            session.accessToken,
            {
                method: "DELETE",
            }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        return safeErrorResponse(error, "Failed to delete permission");
    }
}
