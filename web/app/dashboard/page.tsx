import Link from "next/link";
import { redirect } from "next/navigation";

import { SignOutButton } from "./sign-out-button";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type SiteListItem = {
  id: string;
  name: string;
  repo_full_name: string;
  default_branch: string;
  github_app_slug: string | null;
  updated_at: string;
};

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: memberships, error } = await supabase
    .from("site_members")
    .select("role, site:sites(id, name, repo_full_name, default_branch, github_app_slug, updated_at)")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const sites: Array<{ role: string; site: SiteListItem }> = (memberships ?? []).filter(
    (membership): membership is { role: string; site: SiteListItem } => Boolean(membership.site),
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-12">
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-semibold text-white">Your sites</h1>
          <p className="text-sm text-neutral-400">Manage GitHub Pages deployments and assets from a single workspace.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/sites/new"
            className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-200"
          >
            Add site
          </Link>
          <SignOutButton />
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">Active projects</h2>
        {sites.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-800 bg-neutral-900/40 p-8 text-center">
            <p className="text-sm text-neutral-400">
              You are not a member of any sites yet. Install the GitHub App on a repository to get started.
            </p>
            <div className="mt-4 flex justify-center">
              <Link
                href="/sites/new"
                className="rounded-md border border-neutral-700 px-4 py-2 text-sm text-neutral-200 transition hover:border-neutral-500 hover:text-white"
              >
                Install GitHub App
              </Link>
            </div>
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {sites.map(({ role, site }) => (
              <li key={site.id} className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-white">{site.name}</h3>
                    <p className="text-sm text-neutral-400">{site.repo_full_name}</p>
                  </div>
                  <span className="rounded-full border border-neutral-700 px-2 py-1 text-xs uppercase tracking-wide text-neutral-300">
                    {role}
                  </span>
                </div>
                <dl className="mt-4 grid grid-cols-1 gap-3 text-sm text-neutral-400 sm:grid-cols-2">
                  <div>
                    <dt className="text-neutral-500">Default branch</dt>
                    <dd className="font-medium text-neutral-200">{site.default_branch}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">GitHub App</dt>
                    <dd className="font-medium text-neutral-200">{site.github_app_slug ?? "pending"}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-neutral-500">Last synced</dt>
                    <dd className="font-medium text-neutral-200">
                      {new Date(site.updated_at).toLocaleString()}
                    </dd>
                  </div>
                </dl>
                <div className="mt-6 flex items-center justify-between gap-3">
                  <Link
                    href={`/sites/${site.id}`}
                    className="rounded-md bg-white/90 px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-white"
                  >
                    Open workspace
                  </Link>
                  <Link
                    href={`https://github.com/${site.repo_full_name}`}
                    target="_blank"
                    className="text-sm font-medium text-neutral-400 hover:text-neutral-200"
                  >
                    View on GitHub
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
