# Static Site Manager

Web application for managing GitHub Pages static sites with Supabase-backed storage, batching, and GitHub App automation.

## Stack

- [Bun](https://bun.sh/) + Next.js (App Router, TypeScript)
- Supabase (Auth, Postgres, Storage, Edge Functions)
- GitHub App integration for repository access

## Project layout

- `web/` ? Next.js app (marketing site, auth flows, dashboard, upcoming asset tooling)
- `supabase/` ? Database schema, storage policies, Edge Function stubs for GitHub integrations

## Getting started

1. Install dependencies:

   ```bash
   cd web
   bun install
   ```

2. Copy `.env.example` and provide Supabase + GitHub credentials:

   ```bash
   cp .env.example .env.local
   ```

   Required values:

   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - GitHub App configuration (`GITHUB_APP_*`)
   - Optional: `SKIP_ENV_VALIDATION=true` during early development to bypass strict env checks

3. Run the dev server:

   ```bash
   bun dev
   ```

## Supabase

- SQL migrations live in `supabase/migrations/`
- Configure the project with `supabase/config.toml`
- Storage bucket `site-assets` is provisioned with 10?MB max object size and RLS policies matching site membership
- Helpful commands:

  ```bash
  supabase db reset          # Apply migrations locally
  supabase functions serve   # Run Edge Functions locally
  supabase functions deploy github-commit-batch
  ```

## Edge Functions (in progress)

- `github-installation-sync`: validates GitHub App installations and updates Supabase metadata
- `github-commit-batch`: orchestrates staged asset commits via GitHub REST API
- Both functions expect Supabase + GitHub App secrets to be present in the runtime environment

## Next steps

- Implement site onboarding UI (`/sites/new`) to drive GitHub App install flow
- Add asset browser/editor components powered by Supabase Storage and GitHub tree snapshots
- Flesh out Edge Functions to build git trees and push commits
- Add automated tests (unit + integration) and CI pipelines
