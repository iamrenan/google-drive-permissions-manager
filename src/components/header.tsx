"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HardDrive, LogOut, User } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";

export function Header() {
    const { data: session, status } = useSession();
    const t = useTranslations();
    const locale = useLocale();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href={`/${locale}`} className="flex items-center gap-2">
                    <HardDrive className="h-6 w-6 text-primary" />
                    <span className="font-bold text-lg">{t("common.brand")}</span>
                </Link>

                <div className="flex items-center gap-2">
                    <LanguageSwitcher />
                    <ThemeToggle />
                    {status === "loading" ? (
                        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                    ) : session?.user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="relative h-10 w-10 rounded-full"
                                >
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage
                                            src={session.user.image || ""}
                                            alt={session.user.name || ""}
                                        />
                                        <AvatarFallback>
                                            <User className="h-4 w-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {session.user.name}
                                        </p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {session.user.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={`/${locale}`}>
                                        <HardDrive className="mr-2 h-4 w-4" />
                                        <span>{t("common.home")}</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/${locale}/permissions`}>
                                        <HardDrive className="mr-2 h-4 w-4" />
                                        <span>{t("common.myDrive")}</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => signOut({ callbackUrl: `/${locale}` })}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>{t("common.signOut")}</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button onClick={() => signIn("google", { callbackUrl: `/${locale}/permissions` })}>
                            {t("common.signIn")}
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}
