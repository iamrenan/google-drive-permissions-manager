import { NextResponse } from "next/server";

// Validate fileId format (Google Drive file IDs are alphanumeric with some special chars)
export function validateFileId(fileId: string): boolean {
    if (!fileId || typeof fileId !== "string") return false;
    // Google Drive file IDs are typically 28-44 characters, alphanumeric with hyphens and underscores
    return /^[a-zA-Z0-9_-]{10,100}$/.test(fileId);
}

// Validate permission ID format
export function validatePermissionId(permissionId: string): boolean {
    if (!permissionId || typeof permissionId !== "string") return false;
    return /^[a-zA-Z0-9_-]{5,100}$/.test(permissionId);
}

// Validate email format
export function validateEmail(email: string): boolean {
    if (!email || typeof email !== "string") return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
}

// Validate domain format
export function validateDomain(domain: string): boolean {
    if (!domain || typeof domain !== "string") return false;
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.([a-zA-Z]{2,}\.)*[a-zA-Z]{2,}$/;
    return domainRegex.test(domain) && domain.length <= 253;
}

// Validate role
export function validateRole(role: string): boolean {
    const validRoles = ["owner", "organizer", "fileOrganizer", "writer", "commenter", "reader"];
    return validRoles.includes(role);
}

// Validate permission type
export function validatePermissionType(type: string): boolean {
    const validTypes = ["user", "group", "domain", "anyone"];
    return validTypes.includes(type);
}

// Generic error response that doesn't leak implementation details
export function safeErrorResponse(error: unknown, defaultMessage: string = "An error occurred") {
    console.error("API Error:", error);

    // In development, show more details
    if (process.env.NODE_ENV === "development") {
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : defaultMessage,
                type: error instanceof Error ? error.constructor.name : "UnknownError",
            },
            { status: 500 }
        );
    }

    // In production, return generic message
    return NextResponse.json(
        { error: defaultMessage },
        { status: 500 }
    );
}

// Sanitize user input to prevent injection
export function sanitizeInput(input: string, maxLength: number = 1000): string {
    if (!input || typeof input !== "string") return "";
    return input.trim().slice(0, maxLength);
}
