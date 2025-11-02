"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, useSessionContext } from "@supabase/auth-helpers-react";

export default function Home() {
  const router = useRouter();
  const session = useSession();
  const { isLoading } = useSessionContext();

  useEffect(() => {
    if (!isLoading && session) {
      router.replace("/dashboard");
    }
  }, [isLoading, router, session]);

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-20 px-6 py-24">
      <section className="grid items-center gap-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="space-y-8 text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.35em] text-slate-300/90">
            GitHub Pages Ops
          </span>
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold leading-tight text-slate-100 sm:text-5xl lg:text-6xl">
              The control center for every static deployment you manage.
            </h1>
            <p className="max-w-xl text-lg text-slate-300/90">
              Static Site Manager brings Supabase auth, GitHub installations, asset staging, and deployment batching together in one opinionated dashboard. Automate your workflow without losing visibility.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-indigo-500/90 px-6 py-3 text-slate-950 shadow-[0_20px_45px_-20px_rgba(99,102,241,0.9)] transition hover:bg-indigo-400"
            >
              Launch dashboard
              <span aria-hidden className="text-lg">→</span>
            </Link>
            <Link
              href="https://supabase.com/docs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-slate-200 hover:border-white/40 hover:text-white"
            >
              Read the integration guide
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400/80">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400/80" aria-hidden />
              Real-time sync insights
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-indigo-400/80" aria-hidden />
              GitHub App secured access
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-sky-400/70" aria-hidden />
              Supabase-powered storage
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-br from-indigo-500/40 via-sky-500/25 to-emerald-400/25 blur-3xl" aria-hidden />
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-8 shadow-[0_35px_90px_-45px_rgba(15,23,42,0.85)] backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-slate-300/70">
              <span className="font-semibold uppercase tracking-[0.3em]">Deployment health</span>
              <span>Last sync · 4m ago</span>
            </div>
            <div className="mt-8 grid gap-4 text-slate-100 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400/80">Active sites</p>
                <p className="mt-3 text-3xl font-semibold">12</p>
                <p className="mt-2 text-xs text-slate-400/80">Tracking main and preview environments across GitHub organizations.</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400/80">Pending approvals</p>
                <p className="mt-3 text-3xl font-semibold text-amber-300">3</p>
                <p className="mt-2 text-xs text-slate-400/80">Repositories waiting for App install or branch protection clearance.</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400/80">Average deploy</p>
                <p className="mt-3 text-3xl font-semibold">2m 14s</p>
                <p className="mt-2 text-xs text-slate-400/80">Automated bundling with staged asset checksum verification.</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400/80">Audit log</p>
                <p className="mt-3 text-3xl font-semibold text-emerald-300">Clean</p>
                <p className="mt-2 text-xs text-slate-400/80">Granular records for every upload, commit, and sync event.</p>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between rounded-2xl border border-white/5 bg-gradient-to-r from-indigo-500/20 via-transparent to-emerald-400/20 p-4">
              <div>
                <p className="text-sm font-semibold">Scheduled batch deployment</p>
                <p className="text-xs text-slate-300/80">Tonight · 11:30 PM UTC · GitHub Actions runner</p>
              </div>
              <Link
                href="/login"
                className="rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-white"
              >
                Review tasks
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
          <h2 className="text-base font-semibold text-white">Supabase-native auth</h2>
          <p className="mt-2 text-sm text-slate-300/85">
            Centralize access control with row-level security and invite-only provisioning for your static site ops team.
          </p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
          <h2 className="text-base font-semibold text-white">Secure asset staging</h2>
          <p className="mt-2 text-sm text-slate-300/85">
            Upload, diff, and approve assets before GitHub commits to keep production branches clean and predictable.
          </p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
          <h2 className="text-base font-semibold text-white">Orchestrated deployments</h2>
          <p className="mt-2 text-sm text-slate-300/85">
            Trigger batch deployments with automated rollback safeguards and end-to-end visibility into every run.
          </p>
        </article>
      </section>
    </main>
  );
}
