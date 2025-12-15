"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;

        // Check if token refresh failed
        if (session?.error === "RefreshAccessTokenError") {
            // Force re-authentication
            signIn("google", { callbackUrl: "/permissions" });
        }
    }, [session, status, router]);

    return <>{children}</>;
}
