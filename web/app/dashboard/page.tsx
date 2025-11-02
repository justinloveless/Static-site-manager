"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession, useSessionContext, useSupabaseClient } from "@supabase/auth-helpers-react";
import type { Session } from "@supabase/supabase-js";

import { SignOutButton } from "./sign-out-button";
import type { Database } from "@/types/database";

type SiteListItem = Pick<
  Database["public"]["Tables"]["sites"]["Row"],
  "id" | "name" | "repo_full_name" | "default_branch" | "github_app_slug" | "updated_at"
>;

type DashboardEntry = {
  role: Database["public"]["Tables"]["site_members"]["Row"]["role"];
  site: SiteListItem;
};

type SiteMembershipRow = {
  role: Database["public"]["Tables"]["site_members"]["Row"]["role"];
  site: SiteListItem | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const session = useSession();
  const { isLoading } = useSessionContext();
  const supabase = useSupabaseClient<Database>();

  const [sites, setSites] = useState<DashboardEntry[]>([]);
  const [loadingSites, setLoadingSites] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [, startStateTransition] = useTransition();

  const fetchSites = useCallback(
    async (targetSession: Session) => {
      startStateTransition(() => {
        setLoadingSites(true);
        setFetchError(null);
      });

      const { data, error } = await supabase
        .from("site_members")
        .select("role, site:sites(id, name, repo_full_name, default_branch, github_app_slug, updated_at)")
        .eq("user_id", targetSession.user.id)
        .order("created_at", { ascending: false })
        .returns<SiteMembershipRow[]>();

      if (error) {
        startStateTransition(() => {
          setFetchError(error.message ?? "Failed to load sites");
          setSites([]);
        });
      } else {
        const filtered: DashboardEntry[] = (data ?? []).flatMap((membership) =>
          membership.site ? [{ role: membership.role, site: membership.site }] : [],
        );
        startStateTransition(() => {
          setSites(filtered);
        });
      }

      startStateTransition(() => {
        setLoadingSites(false);
      });
    },
    [startStateTransition, supabase],
  );

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace("/login");
      startStateTransition(() => {
        setSites([]);
        setFetchError(null);
        setLoadingSites(false);
      });
    }
  }, [isLoading, router, session, startStateTransition]);

  useEffect(() => {
    if (session) {
      fetchSites(session);
    }
  }, [fetchSites, session]);

  const displaySites = useMemo(
    () =>
      [...sites].sort(
        (a, b) => new Date(b.site.updated_at).getTime() - new Date(a.site.updated_at).getTime(),
      ),
    [sites],
  );

  const totalSites = sites.length;
  const installations = useMemo(() => {
    const slugs = new Set<string>();
    sites.forEach(({ site }) => {
      if (site.github_app_slug) {
        slugs.add(site.github_app_slug);
      }
    });
    return slugs.size;
  }, [sites]);

  const pendingInstallations = useMemo(
    () => sites.filter(({ site }) => !site.github_app_slug).length,
    [sites],
  );

  const lastUpdatedAt = useMemo(() => {
    if (!sites.length) {
      return null;
    }
    return sites.reduce((latest, { site }) => {
      const timestamp = new Date(site.updated_at).getTime();
      return timestamp > latest ? timestamp : latest;
    }, new Date(sites[0].site.updated_at).getTime());
  }, [sites]);

  const lastUpdatedLabel = lastUpdatedAt ? new Date(lastUpdatedAt).toLocaleString() : "—";

  let content: ReactNode;

  if (loadingSites) {
    content = (
      <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-white/10 bg-white/5 p-16 text-center backdrop-blur-lg">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-white/60" aria-hidden />
        <div>
          <p className="text-sm font-medium text-slate-200">Syncing your workspaces</p>
          <p className="mt-2 text-xs text-slate-400/80">Fetching linked repositories, branches, and GitHub App installs.</p>
        </div>
      </div>
    );
  } else if (fetchError) {
    content = (
      <div className="space-y-4 rounded-3xl border border-rose-500/20 bg-rose-500/10 p-10 text-center shadow-[0_35px_90px_-45px_rgba(190,18,60,0.5)]">
        <p className="text-sm font-semibold text-rose-100">{fetchError}</p>
        <p className="text-xs text-rose-200/80">
          Something prevented us from loading your memberships. Try again or check your Supabase policies.
        </p>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs font-semibold text-white hover:border-white/40 hover:bg-white/20"
          onClick={() => {
            if (session) {
              fetchSites(session);
            }
          }}
        >
          Retry loading
        </button>
      </div>
    );
  } else if (sites.length === 0) {
    content = (
      <div className="space-y-5 rounded-3xl border border-dashed border-white/15 bg-white/5 p-12 text-center backdrop-blur-xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-indigo-500/20 text-indigo-200">
          <span className="text-lg">+</span>
        </div>
        <div className="space-y-2">
          <p className="text-base font-semibold text-white">No sites connected yet</p>
          <p className="text-sm text-slate-300/85">
            Install the Static Site Manager GitHub App on a repository to activate a workspace and begin staging assets.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 text-sm">
          <Link
            href="/sites/new"
            className="inline-flex items-center gap-2 rounded-full bg-indigo-500/90 px-5 py-2 font-semibold text-slate-950 hover:bg-indigo-400"
          >
            Install GitHub App
          </Link>
          <Link
            href="https://docs.github.com/en/apps"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2 text-slate-200 hover:border-white/35"
          >
            GitHub App docs
          </Link>
        </div>
      </div>
    );
  } else {
    content = (
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_25px_80px_-35px_rgba(15,23,42,0.8)]">
        <div className="hidden border-b border-white/5 px-6 py-4 text-xs uppercase tracking-[0.35em] text-slate-400/80 md:grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,0.7fr)]">
          <span>Site</span>
          <span>Repository</span>
          <span>Default branch</span>
          <span>GitHub App</span>
          <span>Last synced</span>
        </div>
        <div className="divide-y divide-white/5">
          {displaySites.map(({ role, site }) => (
            <div
              key={site.id}
              className="flex flex-col gap-4 px-6 py-6 text-sm text-slate-300/90 md:grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,0.7fr)] md:items-center"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-semibold text-white">{site.name}</h3>
                  <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/80">
                    {role}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-400/80 md:hidden">
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1">
                    <span className="text-white/70">Repo:</span> {site.repo_full_name}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1">
                    <span className="text-white/70">Branch:</span> {site.default_branch}
                  </span>
                </div>
              </div>
              <span className="hidden truncate text-sm text-slate-300/80 md:inline">{site.repo_full_name}</span>
              <span className="hidden text-sm font-medium text-slate-200 md:inline">{site.default_branch}</span>
              <span className="hidden text-sm font-medium text-slate-200 md:inline">
                {site.github_app_slug ?? "Pending install"}
              </span>
              <div className="flex flex-col gap-3 md:items-end">
                <span className="text-xs text-slate-400/80 md:text-sm">
                  {new Date(site.updated_at).toLocaleString()}
                </span>
                <div className="flex flex-wrap gap-2 text-xs font-medium md:justify-end">
                  <Link
                    href={`/sites/${site.id}`}
                    className="inline-flex items-center gap-1 rounded-full bg-white/90 px-4 py-2 text-slate-950 hover:bg-white"
                  >
                    Open workspace
                  </Link>
                  <Link
                    href={`https://github.com/${site.repo_full_name}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-white/15 px-4 py-2 text-slate-200 hover:border-white/35"
                  >
                    View on GitHub
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-12 px-6 py-12">
      <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-10 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.85)] backdrop-blur-xl">
          <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-br from-indigo-500/25 via-transparent to-emerald-400/25 opacity-70 blur-3xl" aria-hidden />
          <div className="relative space-y-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1 text-[10px] uppercase tracking-[0.35em] text-slate-300/80">
                  Static site manager
                </span>
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold text-white sm:text-4xl">Workspace overview</h1>
                  <p className="text-sm text-slate-300/85">
                    Monitor connected repositories, Supabase sessions, and GitHub App installations from a single control panel.
                  </p>
                </div>
              </div>
              <Link
                href="/sites/new"
                className="inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-white"
              >
                Add new site
                <span aria-hidden className="text-base">+</span>
              </Link>
            </div>
            <div className="grid gap-4 text-sm text-slate-300 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400/80">Total sites</p>
                <p className="mt-3 text-3xl font-semibold text-white">{totalSites}</p>
                <p className="mt-2 text-xs text-slate-400/80">Active Supabase memberships currently syncing to GitHub.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400/80">GitHub installs</p>
                <p className="mt-3 text-3xl font-semibold text-white">{installations || "—"}</p>
                <p className="mt-2 text-xs text-slate-400/80">Unique GitHub App installations linked to your sites.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400/80">Pending approvals</p>
                <p className="mt-3 text-3xl font-semibold text-amber-300">{pendingInstallations}</p>
                <p className="mt-2 text-xs text-slate-400/80">Repositories awaiting installation or branch protection approval.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 sm:col-span-2 lg:col-span-3">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400/80">Last activity</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  <span className="text-base font-semibold text-white">{lastUpdatedLabel}</span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300/85">
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
                    Supabase sync monitoring active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400/80">Quick actions</p>
            <div className="mt-4 space-y-3 text-sm">
              <Link
                href="/sites/new"
                className="flex items-center justify-between rounded-2xl border border-white/0 bg-white/10 px-4 py-3 text-slate-200 transition hover:border-white/20 hover:bg-white/20"
              >
                Add GitHub repository
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-slate-200 transition hover:border-white/25 hover:bg-white/10"
              >
                Open Supabase project
                <span aria-hidden>↗</span>
              </Link>
              <Link
                href="https://github.com/settings/installations"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-slate-200 transition hover:border-white/25 hover:bg-white/10"
              >
                Manage GitHub App access
                <span aria-hidden>↗</span>
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300/85 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400/80">Session</p>
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-white">{session?.user.email ?? "Signed in"}</p>
              <p className="text-xs text-slate-400/80">Authenticated via Supabase. Revoke access from your profile to enforce security rotation.</p>
            </div>
            <div className="mt-5">
              <SignOutButton />
            </div>
          </div>
        </aside>
      </header>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400/85">Active projects</h2>
          <p className="text-xs text-slate-400/70">Synced automatically every 60 seconds · Powered by Supabase + GitHub App webhooks</p>
        </div>
        {content}
      </section>
    </main>
  );
}
