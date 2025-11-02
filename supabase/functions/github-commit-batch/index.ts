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

type RequestPayload = {
  batchId: string;
  dryRun?: boolean;
};

type JsonResponse = {
  status: "accepted" | "error";
  message?: string;
  batchId?: string;
  details?: unknown;
};

function json(body: JsonResponse, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json",
    },
    ...init,
  });
}

async function assertGitHubAppInstallation(installationId: number) {
  const appOctokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: Number(env.GITHUB_APP_ID),
      privateKey: env.GITHUB_APP_PRIVATE_KEY,
    },
  });

  const { data } = await appOctokit.rest.apps.getInstallation({
    installation_id: installationId,
  });

  return data;
}

async function loadBatch(batchId: string) {
  const { data, error } = await supabase
    .from("change_batches")
    .select(
      "id, site_id, state, commit_message, metadata, site:sites(repo_full_name, github_installation_id, default_branch)",
    )
    .eq("id", batchId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Batch not found");
  }

  return data;
}

async function markBatchState(batchId: string, state: string, detail?: Record<string, unknown>) {
  const payload: Record<string, unknown> = { state };
  if (detail) {
    payload.metadata = detail;
  }

  const { error } = await supabase
    .from("change_batches")
    .update(payload)
    .eq("id", batchId);

  if (error) {
    throw error;
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return json({ status: "error", message: "Method not allowed" }, { status: 405 });
  }

  let payload: RequestPayload;

  try {
    payload = await req.json();
  } catch (error) {
    return json({ status: "error", message: "Invalid JSON payload", details: String(error) }, { status: 400 });
  }

  if (!payload.batchId) {
    return json({ status: "error", message: "Missing batchId" }, { status: 400 });
  }

  try {
    const batch = await loadBatch(payload.batchId);

    if (batch.state !== "open") {
      return json(
        {
          status: "error",
          message: `Batch is not open (current state: ${batch.state})`,
          batchId: payload.batchId,
        },
        { status: 409 },
      );
    }

    await markBatchState(payload.batchId, "committing");

    await assertGitHubAppInstallation(batch.site.github_installation_id);

    // TODO: gather staged assets, construct git tree, create commit and push using GitHub API
    // Placeholder to show intended response contract

    if (payload.dryRun) {
      await markBatchState(payload.batchId, "open");
      return json({ status: "accepted", message: "Dry run acknowledged", batchId: payload.batchId });
    }

    await markBatchState(payload.batchId, "complete");

    return json({ status: "accepted", batchId: payload.batchId });
  } catch (error) {
    console.error("commit-batch failure", error);
    try {
      await markBatchState(payload.batchId, "failed", { error: String(error) });
    } catch (updateError) {
      console.error("failed to update batch state", updateError);
    }
    return json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unexpected error",
        batchId: payload.batchId,
        details: error,
      },
      { status: 500 },
    );
  }
});
