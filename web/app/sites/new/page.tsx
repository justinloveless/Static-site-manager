"use client";

import Link from "next/link";
import { useCallback, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession, useSessionContext, useSupabaseClient } from "@supabase/auth-helpers-react";

import { clientEnv } from "@/lib/env-client";
import type { Database } from "@/types/database";

export default function NewSitePage() {
    const router = useRouter();
    const session = useSession();
    const { isLoading } = useSessionContext();
    const supabase = useSupabaseClient<Database>();
    const [, startTransition] = useTransition();

    useEffect(() => {
        if (!isLoading && !session) {
            router.replace("/login");
            startTransition(() => { });
        }
    }, [isLoading, router, session, startTransition]);

    const handleGitHubAppInstall = useCallback(async () => {
        try {
            const githubAppClientId = clientEnv.NEXT_PUBLIC_GITHUB_APP_CLIENT_ID;

            if (!githubAppClientId) {
                alert("GitHub App is not configured. Please contact the administrator.");
                return;
            }

            const githubAuthUrl = new URL("https://github.com/apps/installations/new");
            githubAuthUrl.searchParams.set("client_id", githubAppClientId);

            window.location.href = githubAuthUrl.toString();
        } catch (error) {
            console.error("Failed to initiate GitHub App installation", error);
            alert("Failed to start GitHub App installation. Please try again.");
        }
    }, []);

    if (isLoading) {
        return (
            <main className="flex min-h-screen items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-white/60" aria-hidden />
            </main>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <main className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-12 px-6 py-12">
            <header className="space-y-6">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-sm text-slate-300/80 transition hover:text-white"
                >
                    ← Back to dashboard
                </Link>
                <div className="space-y-2">
                    <h1 className="text-3xl font-semibold text-white">Add GitHub repository</h1>
                    <p className="text-sm text-slate-300/85">
                        Install the Static Site Manager GitHub App on a repository to connect it to your workspace.
                    </p>
                </div>
            </header>

            <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_25px_80px_-35px_rgba(15,23,42,0.8)]">
                <div className="p-8 md:p-12">
                    <div className="mx-auto flex max-w-md flex-col items-center gap-8 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-indigo-500/20 text-3xl text-indigo-200">
                            <span>+</span>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-semibold text-white">Install GitHub App</h2>
                            <p className="text-sm text-slate-300/85">
                                Authorize the Static Site Manager app to access your repository and start managing GitHub Pages deployments
                                through Supabase.
                            </p>
                        </div>

                        <div className="w-full space-y-4">
                            <button
                                type="button"
                                onClick={handleGitHubAppInstall}
                                className="w-full rounded-full bg-indigo-500/90 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-indigo-400 active:scale-[0.98]"
                            >
                                Install GitHub App
                            </button>

                            <Link
                                href="/dashboard"
                                className="block w-full rounded-full border border-white/15 bg-white/10 px-6 py-3 text-center text-sm font-semibold text-slate-200 transition hover:border-white/35 hover:bg-white/20"
                            >
                                Cancel
                            </Link>
                        </div>

                        <div className="border-t border-white/10 pt-8">
                            <p className="text-xs text-slate-400/80">
                                After installation, select the repository and branch to manage from your dashboard.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

