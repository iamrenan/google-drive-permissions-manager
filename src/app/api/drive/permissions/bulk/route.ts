import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { DRIVE_API_BASE } from "@/lib/constants";
import {
    validateFileId,
    validateEmail,
    validateDomain,
    validateRole,
    validatePermissionType,
    safeErrorResponse,
} from "@/lib/validation";

// POST - Bulk remove permissions for a specific user from multiple files
export async function POST(request: Request) {
    const session = await auth();

    if (!session?.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { action, fileIds, emailAddress, type, role, domain } = body;

        if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
            return NextResponse.json(
                { error: "File IDs are required" },
                { status: 400 }
            );
        }

        // Validate all file IDs
        for (const fileId of fileIds) {
            if (!validateFileId(fileId)) {
                return NextResponse.json(
                    { error: `Invalid file ID: ${fileId}` },
                    { status: 400 }
                );
            }
        }

        const results: { fileId: string; success: boolean; error?: string }[] = [];

        if (action === "remove") {
            if (!emailAddress) {
                return NextResponse.json(
                    { error: "Email address is required for remove action" },
                    { status: 400 }
                );
            }

            if (!validateEmail(emailAddress)) {
                return NextResponse.json(
                    { error: "Invalid email address" },
                    { status: 400 }
                );
            }

            // For each file, find the permission with the matching email and delete it
            for (const fileId of fileIds) {
                try {
                    // First, get the permissions for this file
                    const permResponse = await fetch(
                        `${DRIVE_API_BASE}/files/${fileId}/permissions?fields=permissions(id,emailAddress)`,
                        {
                            headers: {
                                Authorization: `Bearer ${session.accessToken}`,
                            },
                        }
                    );

                    if (!permResponse.ok) {
                        results.push({
                            fileId,
                            success: false,
                            error: "Failed to fetch permissions",
                        });
                        continue;
                    }

                    const permData = await permResponse.json();
                    const permission = permData.permissions?.find(
                        (p: { emailAddress?: string }) =>
                            p.emailAddress?.toLowerCase() === emailAddress.toLowerCase()
                    );

                    if (!permission) {
                        results.push({
                            fileId,
                            success: false,
                            error: "Permission not found",
                        });
                        continue;
                    }

                    // Delete the permission
                    const deleteResponse = await fetch(
                        `${DRIVE_API_BASE}/files/${fileId}/permissions/${permission.id}`,
                        {
                            method: "DELETE",
                            headers: {
                                Authorization: `Bearer ${session.accessToken}`,
                            },
                        }
                    );

                    results.push({
                        fileId,
                        success: deleteResponse.ok,
                        error: deleteResponse.ok ? undefined : "Failed to delete permission",
                    });
                } catch (error) {
                    results.push({
                        fileId,
                        success: false,
                        error: error instanceof Error ? error.message : "Unknown error",
                    });
                }
            }
        } else if (action === "add") {
            if (!type || !role) {
                return NextResponse.json(
                    { error: "Type and role are required for add action" },
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

            for (const fileId of fileIds) {
                try {
                    const response = await fetch(
                        `${DRIVE_API_BASE}/files/${fileId}/permissions?sendNotificationEmail=false`,
                        {
                            method: "POST",
                            headers: {
                                Authorization: `Bearer ${session.accessToken}`,
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(permissionData),
                        }
                    );

                    results.push({
                        fileId,
                        success: response.ok,
                        error: response.ok ? undefined : "Failed to add permission",
                    });
                } catch (error) {
                    results.push({
                        fileId,
                        success: false,
                        error: error instanceof Error ? error.message : "Unknown error",
                    });
                }
            }
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        const successCount = results.filter((r) => r.success).length;
        const failureCount = results.filter((r) => !r.success).length;

        return NextResponse.json({
            results,
            summary: {
                total: fileIds.length,
                success: successCount,
                failed: failureCount,
            },
        });
    } catch (error) {
        return safeErrorResponse(error, "Failed to perform bulk operation");
    }
}
