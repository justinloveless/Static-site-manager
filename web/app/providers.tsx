"use client";

import { SessionContextProvider } from "@supabase/auth-helpers-react";
import type { Session } from "@supabase/supabase-js";
import { useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type ProvidersProps = {
  children: React.ReactNode;
  initialSession?: Session | null;
};

export function Providers({ children, initialSession = null }: ProvidersProps) {
  const [supabaseClient] = useState(() => getSupabaseBrowserClient());

  return (
    <SessionContextProvider supabaseClient={supabaseClient} initialSession={initialSession}>
      {children}
    </SessionContextProvider>
  );
}
