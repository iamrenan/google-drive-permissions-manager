"use client";

import { Github, Linkedin } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";

export function Footer() {
    const t = useTranslations("footer");
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t bg-background">
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <p className="text-sm text-muted-foreground">
                        {t("copyright", { year: currentYear })}
                    </p>
                    <div className="flex items-center gap-4">
                        <Link
                            href="https://github.com/iamrenan"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Github className="h-5 w-5" />
                            <span className="sr-only">{t("github")}</span>
                        </Link>
                        <Separator orientation="vertical" className="h-5" />
                        <Link
                            href="https://linkedin.com/in/renan-aguiar"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Linkedin className="h-5 w-5" />
                            <span className="sr-only">{t("linkedin")}</span>
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
