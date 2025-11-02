"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, useSessionContext } from "@supabase/auth-helpers-react";

import { LoginForm } from "./login-form";

export default function LoginPage() {
  const router = useRouter();
  const session = useSession();
  const { isLoading } = useSessionContext();

  useEffect(() => {
    if (!isLoading && session) {
      router.replace("/Static-site-manager/dashboard");
    }
  }, [isLoading, router, session]);

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-12 px-6 py-20">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
        <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-10 text-left shadow-[0_35px_120px_-60px_rgba(15,23,42,0.85)] backdrop-blur-xl">
          <div className="absolute -inset-2 rounded-[32px] bg-gradient-to-br from-indigo-500/25 via-transparent to-emerald-500/20 opacity-80 blur-3xl" aria-hidden />
          <div className="relative space-y-6">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1 text-[10px] uppercase tracking-[0.35em] text-slate-300/80">
                Static site manager
              </span>
              <h1 className="text-4xl font-semibold text-white">Welcome back</h1>
            </div>
            <p className="text-sm text-slate-300/85">
              Authenticate with Supabase to unlock your GitHub-connected workspaces. Every deployment is tracked, every asset signed, and every action auditable.
            </p>
            <div className="grid gap-4 text-sm text-slate-300/85 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400/80">Runtime security</p>
                <p className="mt-2 text-sm">Row-level security enforced on every asset interaction.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400/80">OAuth ready</p>
                <p className="mt-2 text-sm">GitHub sign-in with redirect back to your deployment dashboard.</p>
              </div>
            </div>
            <p className="text-xs text-slate-400/75">
              Need access? Ask an existing site owner to invite you via the members panel after onboarding is complete.
            </p>
          </div>
        </section>
        <section className="space-y-6">
          <LoginForm />
          <p className="text-center text-xs text-slate-400/75">
            <Link href="/Static-site-manager/" className="text-slate-200 hover:text-white">
              ← Back to marketing site
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
