import { z } from 'zod';

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SITE_ASSETS_BUCKET: z.string().min(1),
  MAX_ASSET_SIZE_BYTES: z.preprocess((val) => {
    if (typeof val === 'string') {
      return Number.parseInt(val, 10);
    }
    if (typeof val === 'number') {
      return val;
    }
    return val;
  }, z.number().int().positive()),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  GITHUB_APP_ID: z.string().min(1),
  GITHUB_APP_CLIENT_ID: z.string().min(1),
  GITHUB_APP_CLIENT_SECRET: z.string().min(1),
  GITHUB_APP_WEBHOOK_SECRET: z.string().min(1),
  GITHUB_APP_PRIVATE_KEY: z.string().min(1),
});

const shouldValidate = process.env.SKIP_ENV_VALIDATION !== 'true';

function parseEnv<T extends z.ZodTypeAny>(schema: T, values: Record<string, any>) {
  const result = schema.safeParse(values);
  if (!result.success) {
    if (shouldValidate) {
      throw new Error(`Invalid environment variables: ${result.error.flatten().fieldErrors}`);
    }
    console.warn('Skipping environment validation errors due to SKIP_ENV_VALIDATION=true', result.error.flatten().fieldErrors);
    return values as z.infer<T>;
  }
  return result.data;
}

export const clientEnv = parseEnv(clientSchema, {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SITE_ASSETS_BUCKET: process.env.SITE_ASSETS_BUCKET,
  MAX_ASSET_SIZE_BYTES: process.env.MAX_ASSET_SIZE_BYTES,
});

export const serverEnv = parseEnv(serverSchema, {
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  GITHUB_APP_ID: process.env.GITHUB_APP_ID,
  GITHUB_APP_CLIENT_ID: process.env.GITHUB_APP_CLIENT_ID,
  GITHUB_APP_CLIENT_SECRET: process.env.GITHUB_APP_CLIENT_SECRET,
  GITHUB_APP_WEBHOOK_SECRET: process.env.GITHUB_APP_WEBHOOK_SECRET,
  GITHUB_APP_PRIVATE_KEY: process.env.GITHUB_APP_PRIVATE_KEY,
});

export const env = { ...clientEnv, ...serverEnv };
