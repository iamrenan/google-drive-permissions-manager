"use client";

import { SessionProvider } from "next-auth/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ReactNode } from "react";

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <ThemeProvider>
            <SessionProvider>
                <TooltipProvider>{children}</TooltipProvider>
            </SessionProvider>
        </ThemeProvider>
    );
}
