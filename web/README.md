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
- `bun run build` ? production build
- `bun run start` ? run production server locally
- `bun run lint` ? lint with ESLint + Next.js config
