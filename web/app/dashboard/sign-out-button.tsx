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
      className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:border-neutral-500 hover:text-white disabled:opacity-60"
    >
      {isPending ? "Signing out..." : "Sign out"}
    </button>
  );
}
