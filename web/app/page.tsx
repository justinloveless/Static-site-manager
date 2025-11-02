import Link from "next/link";
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <div className="max-w-2xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-400">
          GitHub Pages Manager
        </p>
        <h1 className="text-4xl font-semibold text-white sm:text-5xl">
          Manage static site assets without leaving your browser.
        </h1>
        <p className="text-lg text-neutral-300">
          Authenticate with Supabase, stage assets in secure storage, and batch commits directly to your GitHub Pages repositories using a dedicated GitHub App installation.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/login"
          className="rounded-md bg-white px-6 py-3 font-medium text-neutral-950 transition hover:bg-neutral-200"
        >
          Sign in to continue
        </Link>
        <Link
          href="https://supabase.com/docs"
          className="rounded-md border border-neutral-700 px-6 py-3 font-medium text-neutral-200 transition hover:border-neutral-500 hover:text-white"
          target="_blank"
        >
          Supabase docs
        </Link>
      </div>
      <p className="text-xs text-neutral-500">
        Requires GitHub App installation with repository contents access.
      </p>
    </main>
  );
}
