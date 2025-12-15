import type { Metadata } from "next";
import "./globals.css";

// Root layout - localized pages are in app/[locale]/layout.tsx
export const metadata: Metadata = {
    title: "Google Drive Permissions Manager",
    description:
        "Manage and control permissions for your Google Drive files and folders with ease.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return children;
}
