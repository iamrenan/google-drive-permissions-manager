import { NextResponse } from "next/server";

export async function GET() {
    const isConfigured = !!(
        process.env.GOOGLE_CLIENT_ID &&
        process.env.GOOGLE_CLIENT_SECRET &&
        process.env.AUTH_SECRET
    );

    return NextResponse.json({
        configured: isConfigured,
        missing: {
            GOOGLE_CLIENT_ID: !process.env.GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET: !process.env.GOOGLE_CLIENT_SECRET,
            AUTH_SECRET: !process.env.AUTH_SECRET,
        },
    });
}
