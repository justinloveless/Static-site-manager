import { z } from "zod";

const shouldValidate = process.env.SKIP_ENV_VALIDATION !== "true";

const SITE_ASSETS_BUCKET_DEFAULT = "site-assets";
const MAX_ASSET_SIZE_BYTES_DEFAULT = 10_485_760;

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SITE_ASSETS_BUCKET: z.string().min(1),
  MAX_ASSET_SIZE_BYTES: z.preprocess((val) => {
    if (typeof val === "string") {
      return Number.parseInt(val, 10);
    }
    if (typeof val === "number") {
      return val;
    }
    return val;
  }, z.number().int().positive()),
  NEXT_PUBLIC_BASE_PATH: z.string().optional(),
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

export const clientEnv = parseEnv(clientSchema, {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SITE_ASSETS_BUCKET: process.env.SITE_ASSETS_BUCKET ?? SITE_ASSETS_BUCKET_DEFAULT,
  MAX_ASSET_SIZE_BYTES: process.env.MAX_ASSET_SIZE_BYTES ?? MAX_ASSET_SIZE_BYTES_DEFAULT,
  NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH,
});
