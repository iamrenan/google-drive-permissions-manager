"use client";

import { useTranslations } from "next-intl";
import { FolderOpen, HardDrive } from "lucide-react";

interface EmptyStateProps {
    isLoading: boolean;
    hasFiles: boolean;
    progress: { current: number; total: number };
    onCancel?: () => void;
}

export function EmptyState({ isLoading, hasFiles, progress }: EmptyStateProps) {
    const t = useTranslations("emptyState");

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <HardDrive className="h-16 w-16 text-primary mb-6 animate-pulse" />
                <h3 className="text-xl font-semibold mb-2">{t("loading.title")}</h3>
                <p className="text-muted-foreground text-center max-w-md mb-4">
                    {t("loading.description")}
                </p>
                {progress.current > 0 && (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-300"
                                style={{
                                    width: `${progress.total > 0
                                        ? Math.min((progress.current / progress.total) * 100, 100)
                                        : 0
                                        }%`,
                                }}
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {t("loading.filesMapped", { count: progress.current.toLocaleString() })}
                        </p>
                    </div>
                )}
            </div>
        );
    }

    if (!hasFiles) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <FolderOpen className="h-16 w-16 text-muted-foreground mb-6" />
                <h3 className="text-xl font-semibold mb-2">{t("noFiles.title")}</h3>
                <p className="text-muted-foreground text-center max-w-md">
                    {t("noFiles.description")}
                </p>
            </div>
        );
    }

    return null;
}
