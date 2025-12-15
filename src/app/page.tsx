"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

const features = [
    {
        icon: FolderTree,
        title: "Complete File Mapping",
        description:
            "Automatically scan and map your entire Google Drive structure for easy permission management.",
    },
    {
        icon: Users,
        title: "User-Based Permissions",
        description:
            "Add or remove access for specific users across multiple files and folders at once.",
    },
    {
        icon: Search,
        title: "Advanced Search & Filter",
        description:
            "Find files quickly with powerful search, sort, and filter capabilities.",
    },
    {
        icon: Shield,
        title: "Bulk Actions",
        description:
            "Manage permissions in bulk - grant or revoke access to hundreds of files simultaneously.",
    },
    {
        icon: Lock,
        title: "Privacy First",
        description:
            "Your data stays on your device. We use local storage for offline-first functionality.",
    },
    {
        icon: Zap,
        title: "Real-time Updates",
        description:
            "Changes are reflected instantly in your Google Drive with minimal API calls.",
    },
];

const benefits = [
    "View all files and their permissions in one place",
    "Remove permissions for former team members quickly",
    "Grant access to new collaborators across multiple folders",
    "Identify files with unexpected sharing settings",
];

export default function HomePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
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
                                <h2 className="text-xl font-semibold mb-2">Setup Required</h2>
                                <p className="text-muted-foreground mb-4">
                                    To use this app, you need to configure Google OAuth credentials.
                                </p>
                                <div className="space-y-3 text-sm">
                                    <p className="font-medium">Follow these steps:</p>
                                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                                        <li>
                                            Go to{" "}
                                            <a
                                                href="https://console.cloud.google.com/apis/credentials"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary underline"
                                            >
                                                Google Cloud Console
                                            </a>
                                        </li>
                                        <li>Create a new project or select an existing one</li>
                                        <li>Enable the <strong>Google Drive API</strong></li>
                                        <li>Go to <strong>APIs & Services → Credentials</strong></li>
                                        <li>Create an <strong>OAuth 2.0 Client ID</strong> (Web application)</li>
                                        <li>
                                            Add <code className="bg-muted px-1 rounded">http://localhost:3000/api/auth/callback/google</code> as an authorized redirect URI
                                        </li>
                                        <li>Copy the <strong>Client ID</strong> and <strong>Client Secret</strong></li>
                                    </ol>
                                    <p className="font-medium mt-4">
                                        Then update your <code className="bg-muted px-1 rounded">.env.local</code> file:
                                    </p>
                                    <pre className="bg-muted p-3 rounded-md overflow-x-auto text-xs">
                                        {`GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
AUTH_SECRET=run_openssl_rand_base64_32`}
                                    </pre>
                                    <p className="text-muted-foreground mt-4">
                                        After updating the environment variables, restart the development server.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 md:py-32">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl text-center">
                        <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
                            Take Control of Your{" "}
                            <span className="text-primary">Google Drive</span> Permissions
                        </h1>
                        <p className="mb-8 text-lg text-muted-foreground md:text-xl">
                            Visualize, manage, and audit file permissions across your entire
                            Google Drive. Stop manually checking permissions on individual
                            files—see everything in one powerful dashboard.
                        </p>
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                            <Button
                                size="lg"
                                className="gap-2 text-lg"
                                onClick={() => {
                                    if (status === "authenticated") {
                                        router.push("/permissions");
                                    } else {
                                        signIn("google", { callbackUrl: "/permissions" });
                                    }
                                }}
                            >
                                {status === "authenticated" ? "Go to Dashboard" : "Connect Google Drive"}
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
                                Learn More
                            </Button>
                        </div>
                        <p className="mt-4 text-sm text-muted-foreground">
                            Free to use • No credit card required • Privacy-focused
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
                            Everything You Need to Manage Permissions
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Powerful features designed to make permission management simple
                            and efficient.
                        </p>
                    </div>
                    <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className="group rounded-xl border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
                            >
                                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                                    <feature.icon className="h-6 w-6" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                                <p className="text-muted-foreground">{feature.description}</p>
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
                                Why Use Drive Permissions Manager?
                            </h2>
                            <p className="mb-8 text-lg text-muted-foreground">
                                Managing permissions in Google Drive can be tedious. Our tool
                                streamlines the process so you can focus on what matters most.
                            </p>
                            <ul className="space-y-4">
                                {benefits.map((benefit) => (
                                    <li key={benefit} className="flex items-start gap-3">
                                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                                        <span>{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative">
                            <div className="aspect-video overflow-hidden rounded-xl border bg-card shadow-2xl">
                                <div className="relative h-full w-full">
                                    <img
                                        src="/screenshot.jpg"
                                        alt="Drive Permissions Manager Dashboard"
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
                            Ready to Take Control?
                        </h2>
                        <p className="mb-8 text-lg opacity-90">
                            Connect your Google Drive and start managing permissions in
                            seconds. It&apos;s free and takes less than a minute to get
                            started.
                        </p>
                        <Button
                            size="lg"
                            variant="secondary"
                            className="gap-2 text-lg"
                            onClick={() => {
                                if (status === "authenticated") {
                                    router.push("/permissions");
                                } else {
                                    signIn("google", { callbackUrl: "/permissions" });
                                }
                            }}
                        >
                            {status === "authenticated" ? "Go to Dashboard" : "Get Started Now"}
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
