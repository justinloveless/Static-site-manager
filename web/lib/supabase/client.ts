import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';

import { clientEnv } from '@/lib/env-client';
import type { Database } from '@/types/database';

let client: SupabaseClient<Database> | null = null;

export function getSupabaseBrowserClient() {
  if (!client) {
    client = createBrowserClient<Database>(
      clientEnv.NEXT_PUBLIC_SUPABASE_URL,
      clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      },
    );
  }
  return client;
}
