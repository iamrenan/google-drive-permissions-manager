"use client";

import { useEffect, useState, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FadeInProps {
    children: ReactNode;
    className?: string;
    duration?: number;
    delay?: number;
}

export function FadeIn({
    children,
    className,
    duration = 300,
    delay = 0
}: FadeInProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, delay);

        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <div
            className={cn(
                "transition-all ease-out",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
                className
            )}
            style={{ transitionDuration: `${duration}ms` }}
        >
            {children}
        </div>
    );
}
