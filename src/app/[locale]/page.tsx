"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import {
    Shield,
    Users,
    FolderTree,
    Search,
    Lock,
    Zap,
    ArrowRight,
    CheckCircle2,
    AlertTriangle,
} from "lucide-react";

const featureIcons = [FolderTree, Users, Search, Shield, Lock, Zap];

export default function HomePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations();
    const [isConfigured, setIsConfigured] = useState<boolean | null>(null);

    useEffect(() => {
        // Check if the app is configured
        fetch("/api/config/status")
            .then((res) => res.json())
            .then((data) => setIsConfigured(data.configured))
            .catch(() => setIsConfigured(false));
    }, []);

    if (status === "loading" || isConfigured === null) {
        return (
            <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    // Show setup instructions if not configured
    if (!isConfigured) {
        return (
            <div className="container mx-auto px-4 py-20">
                <div className="mx-auto max-w-2xl">
                    <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-6">
                        <div className="flex items-start gap-4">
                            <AlertTriangle className="h-6 w-6 text-yellow-500 shrink-0 mt-0.5" />
                            <div>
                                <h2 className="text-xl font-semibold mb-2">{t("home.setup.heading")}</h2>
                                <p className="text-muted-foreground mb-4">
                                    {t("home.setup.description")}
                                </p>
                                <div className="space-y-3 text-sm">
                                    <p className="font-medium">{t("home.setup.followSteps")}</p>
                                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                                        <li>
                                            <a
                                                href="https://console.cloud.google.com/apis/credentials"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary underline"
                                            >
                                                Google Cloud Console
                                            </a>
                                        </li>
                                        <li>{t("home.setup.step2")}</li>
                                        <li>{t("home.setup.step3")}</li>
                                        <li>{t("home.setup.step4")}</li>
                                        <li>{t("home.setup.step5")}</li>
                                        <li>
                                            <code className="bg-muted px-1 rounded">http://localhost:3000/api/auth/callback/google</code>
                                        </li>
                                        <li>{t("home.setup.step7")}</li>
                                    </ol>
                                    <p className="font-medium mt-4">
                                        {t("home.setup.envNote")}
                                    </p>
                                    <pre className="bg-muted p-3 rounded-md overflow-x-auto text-xs">
                                        {`GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
AUTH_SECRET=run_openssl_rand_base64_32`}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const features = [
        {
            icon: FolderTree,
            titleKey: "home.features.completeMapping.title",
            descKey: "home.features.completeMapping.description",
        },
        {
            icon: Users,
            titleKey: "home.features.permissionControl.title",
            descKey: "home.features.permissionControl.description",
        },
        {
            icon: Search,
            titleKey: "home.features.searchFilter.title",
            descKey: "home.features.searchFilter.description",
        },
        {
            icon: Shield,
            titleKey: "home.features.bulkActions.title",
            descKey: "home.features.bulkActions.description",
        },
        {
            icon: Lock,
            titleKey: "home.features.privacy.title",
            descKey: "home.features.privacy.description",
        },
        {
            icon: Zap,
            titleKey: "home.features.realtime.title",
            descKey: "home.features.realtime.description",
        },
    ];

    const benefitKeys = [
        "home.benefits.items.visualize",
        "home.benefits.items.identify",
        "home.benefits.items.removeAccess",
        "home.benefits.items.audit",
        "home.benefits.items.bulkModify",
    ];

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 md:py-32">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl text-center">
                        <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
                            {t("home.hero.title1")}{" "}
                            <span className="text-primary">{t("home.hero.title2")}</span>{" "}
                            {t("home.hero.title3")}
                        </h1>
                        <p className="mb-8 text-lg text-muted-foreground md:text-xl">
                            {t("home.hero.description")}
                        </p>
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                            <Button
                                size="lg"
                                className="gap-2 text-lg"
                                onClick={() => {
                                    if (status === "authenticated") {
                                        router.push(`/${locale}/permissions`);
                                    } else {
                                        signIn("google", { callbackUrl: `/${locale}/permissions` });
                                    }
                                }}
                            >
                                {status === "authenticated" ? t("home.hero.goToDashboard") : t("home.hero.connectDrive")}
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="text-lg"
                                onClick={() => {
                                    document.getElementById('features')?.scrollIntoView({
                                        behavior: 'smooth',
                                        block: 'start'
                                    });
                                }}
                            >
                                {t("home.hero.learnMore")}
                            </Button>
                        </div>
                        <p className="mt-4 text-sm text-muted-foreground">
                            {t("home.hero.tagline")}
                        </p>
                    </div>
                </div>
                {/* Background decoration */}
                <div className="absolute -top-24 left-1/2 -z-10 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
            </section>

            {/* Features Section */}
            <section id="features" className="py-20">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                            {t("home.features.heading")}
                        </h2>
                    </div>
                    <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature) => (
                            <div
                                key={feature.titleKey}
                                className="group rounded-xl border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
                            >
                                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                                    <feature.icon className="h-6 w-6" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold">{t(feature.titleKey)}</h3>
                                <p className="text-muted-foreground">{t(feature.descKey)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="bg-muted/50 py-20">
                <div className="container mx-auto px-4">
                    <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                        <div>
                            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                                {t("home.benefits.heading")}
                            </h2>
                            <ul className="space-y-4 mt-8">
                                {benefitKeys.map((key) => (
                                    <li key={key} className="flex items-start gap-3">
                                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                                        <span>{t(key)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative">
                            <div className="aspect-video overflow-hidden rounded-xl border bg-card shadow-2xl">
                                <div className="relative h-full w-full">
                                    <img
                                        src="/screenshot.jpg"
                                        alt={t("home.screenshot.alt")}
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-3xl rounded-2xl bg-primary p-8 text-center text-primary-foreground md:p-12">
                        <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                            {t("home.cta.heading")}
                        </h2>
                        <p className="mb-8 text-lg opacity-90">
                            {t("home.cta.description")}
                        </p>
                        <Button
                            size="lg"
                            variant="secondary"
                            className="gap-2 text-lg"
                            onClick={() => {
                                if (status === "authenticated") {
                                    router.push(`/${locale}/permissions`);
                                } else {
                                    signIn("google", { callbackUrl: `/${locale}/permissions` });
                                }
                            }}
                        >
                            {status === "authenticated" ? t("home.hero.goToDashboard") : t("home.cta.button")}
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
