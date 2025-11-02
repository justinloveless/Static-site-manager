import { z } from "zod";

import { clientEnv } from "@/lib/env-client";

const shouldValidate = process.env.SKIP_ENV_VALIDATION !== "true";

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  GITHUB_APP_ID: z.string().min(1),
  GITHUB_APP_CLIENT_ID: z.string().min(1),
  GITHUB_APP_CLIENT_SECRET: z.string().min(1),
  GITHUB_APP_WEBHOOK_SECRET: z.string().min(1),
  GITHUB_APP_PRIVATE_KEY: z.string().min(1),
});

function parseEnv<T extends z.ZodTypeAny>(schema: T, values: Record<string, unknown>) {
  const result = schema.safeParse(values);
  if (!result.success) {
    if (shouldValidate) {
      throw new Error(`Invalid environment variables: ${JSON.stringify(result.error.flatten().fieldErrors)}`);
    }
    console.warn(
      "Skipping environment validation errors due to SKIP_ENV_VALIDATION=true",
      result.error.flatten().fieldErrors,
    );
    return values as z.infer<T>;
  }
  return result.data;
}

export const serverEnv = parseEnv(serverSchema, {
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  GITHUB_APP_ID: process.env.GITHUB_APP_ID,
  GITHUB_APP_CLIENT_ID: process.env.GITHUB_APP_CLIENT_ID,
  GITHUB_APP_CLIENT_SECRET: process.env.GITHUB_APP_CLIENT_SECRET,
  GITHUB_APP_WEBHOOK_SECRET: process.env.GITHUB_APP_WEBHOOK_SECRET,
  GITHUB_APP_PRIVATE_KEY: process.env.GITHUB_APP_PRIVATE_KEY,
});

export const env = { ...clientEnv, ...serverEnv };
