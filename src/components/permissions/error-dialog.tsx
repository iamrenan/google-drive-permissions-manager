"use client";

import { useTranslations } from "next-intl";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface ErrorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    error: string;
    onRetry?: () => void;
}

export function ErrorDialog({ open, onOpenChange, error, onRetry }: ErrorDialogProps) {
    const t = useTranslations("errorDialog");
    const tCommon = useTranslations("common");

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        <AlertDialogTitle>{t("title")}</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="pt-2">
                        <div className="space-y-2">
                            <p>{t("description")}</p>
                            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                {error}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t("details")}
                            </p>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => {
                        onOpenChange(false);
                        if (onRetry) onRetry();
                    }}>
                        {tCommon("retry")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
