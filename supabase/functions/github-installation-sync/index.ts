import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.4";
import { Octokit } from "npm:octokit@3";
import { createAppAuth } from "npm:@octokit/auth-app@8";

const REQUIRED_ENV = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GITHUB_APP_ID",
  "GITHUB_APP_PRIVATE_KEY",
];

const env = REQUIRED_ENV.reduce<Record<string, string>>((acc, key) => {
  const value = Deno.env.get(key);
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  acc[key] = value;
  return acc;
}, {});

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

type InstallationSyncPayload = {
  siteId: string;
  installationId: number;
  repoFullName: string;
  defaultBranch: string;
  githubAppSlug: string;
};

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    ...init,
  });
}

async function fetchInstallationToken(installationId: number) {
  const appOctokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: Number(env.GITHUB_APP_ID),
      privateKey: env.GITHUB_APP_PRIVATE_KEY,
      installationId,
    },
  });

  const { data } = await appOctokit.rest.apps.createInstallationAccessToken({
    installation_id: installationId,
  });

  return data;
}

async function updateSiteIntegration(payload: InstallationSyncPayload, token: { token: string; expires_at: string }) {
  const { error } = await supabase
    .from("sites")
    .update({
      github_installation_id: payload.installationId,
      github_app_slug: payload.githubAppSlug,
      repo_full_name: payload.repoFullName,
      default_branch: payload.defaultBranch,
      updated_at: new Date().toISOString(),
      settings: {
        latestInstallationTokenExpiry: token.expires_at,
      },
    })
    .eq("id", payload.siteId);

  if (error) {
    throw error;
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  let payload: InstallationSyncPayload;

  try {
    payload = await req.json();
  } catch (error) {
    return json({ error: "Invalid JSON payload", details: String(error) }, { status: 400 });
  }

  if (!payload?.siteId || !payload?.installationId) {
    return json({ error: "Missing siteId or installationId" }, { status: 400 });
  }

  try {
    const token = await fetchInstallationToken(payload.installationId);

    await updateSiteIntegration(payload, token);

    return json({ ok: true, expiresAt: token.expires_at });
  } catch (error) {
    console.error("installation-sync error", error);
    return json(
      { error: error instanceof Error ? error.message : "Unexpected error", details: error },
      { status: 500 },
    );
  }
});
