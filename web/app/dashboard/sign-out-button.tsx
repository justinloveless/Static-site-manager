"use client";

import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";

import type { Database } from "@/types/database";

export function SignOutButton() {
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    startTransition(() => {
      router.replace("/");
      router.refresh();
    });
  }, [router, startTransition, supabase]);

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "Signing out..." : "Sign out"}
    </button>
  );
}
