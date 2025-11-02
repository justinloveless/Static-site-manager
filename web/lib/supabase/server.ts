import { cookies } from 'next/headers';
import {
  createServerActionClient,
  createServerComponentClient,
  createServerClient,
  createRouteHandlerClient,
} from '@supabase/auth-helpers-nextjs';

import { env } from '@/lib/env';
import type { Database } from '@/types/database';

export const createServerSupabaseClient = () =>
  createServerComponentClient<Database>({ cookies });

export const createServerActionSupabaseClient = () =>
  createServerActionClient<Database>({ cookies });

export const createRouteHandlerSupabaseClient = () =>
  createRouteHandlerClient<Database>({ cookies });

export const createServiceRoleSupabaseClient = () =>
  createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      headers: new Headers(),
      cookies,
    },
  );
