# Static Site Manager ? Web App

Next.js (App Router) frontend for managing Supabase-backed metadata, asset staging, and GitHub commit batches.

## Development

Install dependencies:

```bash
bun install
```

Copy the environment template:

```bash
cp .env.example .env.local
```

Provide Supabase project URL, anon key, service key, and GitHub App credentials in `.env.local`.

Run the dev server:

```bash
bun dev
```

Sign-up and login routes are served at `/login`; authenticated users land on `/dashboard`.

## Directory highlights

- `app/` ? marketing landing page, auth flow, dashboard shell
- `lib/` ? environment parsing and Supabase helpers for server/browser contexts
- `types/database.ts` ? typed Supabase schema mirror used across the app

## Scripts

- `bun run dev` ? start Next.js dev server
- `bun run build` ? produce static export in `out/`
- `bun run start` ? run production server locally (not required for Pages)
- `bun run lint` ? lint with ESLint + Next.js config

## Deploying to GitHub Pages

- Static export is enabled via `next.config.ts` (`output: "export"`, `trailingSlash: true`)
- Set repository secrets before publishing: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Optional repository variables: `NEXT_PUBLIC_BASE_PATH` (use repo name for project Pages), `SITE_ASSETS_BUCKET`, `MAX_ASSET_SIZE_BYTES`
- GitHub Actions workflow `../.github/workflows/deploy-pages.yml` builds with Bun and uploads `out/`; enable Pages with source `GitHub Actions`
