# Segwitz Knowledge Base

Production-style Next.js 14 knowledge base with **Supabase** (Auth, Postgres, Storage) and **Tailwind CSS**.

## Prerequisites

- Node.js 18+
- A Supabase project (`NEXT_PUBLIC_*` keys from Dashboard → Settings → API)

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon (public) key |
| `NEXT_PUBLIC_SITE_URL` | Recommended on Vercel | Canonical URL for metadata and OAuth (`https://your-app.vercel.app`) |

Copy `.env.example` → `.env.local` and fill in values.

## Quick start

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
npm run dev
```

The dev server listens on **`http://localhost:3000`**.

### If you see ERR_CONNECTION_REFUSED on localhost:3000

Nothing is listening on that port until you run `npm run dev`. If the port is already taken, either stop the other process or run:

```bash
PORT=3001 npm run dev
```

Then open `http://localhost:3001`.

### Styles look wrong

1. Confirm `app/layout.tsx` imports `./globals.css`.
2. Stop dev, delete `.next`: `rm -rf .next`, restart `npm run dev`, hard-refresh (`Cmd+Shift+R`).

## Database & Storage

Apply SQL migrations (Supabase CLI linked to your project):

```bash
supabase db push
```

Or run files in `supabase/migrations/` in order in the Supabase SQL editor.

Ensure a **Storage bucket** named `documents` exists (migration should create policies; verify in Dashboard → Storage).

## Auth routes

- **`/login`** — email & password sign-in
- **`/signup`** — new account (profiles row is created by DB trigger; role defaults to member)
- **`/auth/callback`** — OAuth / email link code exchange (configured in Supabase Auth URL settings)

Add `http://localhost:3000/auth/callback` (and your production URL callback) under **Authentication → URL Configuration** in Supabase.

## Document upload

Admins and managers can **Upload document** from `/documents/new`. Files are stored in the `documents` bucket; metadata lives in the `documents` table (see `lib/storage/document-storage.ts` and server actions in `app/(dashboard)/documents/actions.ts`).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server on port **3000** |
| `npm run build` | Production build — must pass before Vercel deploy |
| `npm run start` | Run production build on port **3000** |
| `npm run lint` | ESLint |

## Deploy on Vercel

1. Push the repo to GitHub.
2. Import the project in Vercel.
3. **Required:** In **Project → Settings → Environment Variables**, add (for **Production** and **Preview** at minimum):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
   Use the same values as in your Supabase project (**Settings → API**). Redeploy after saving.
4. Set **`NEXT_PUBLIC_SITE_URL`** to `https://your-deployment.vercel.app` (or custom domain).
5. In Supabase → **Authentication → URL Configuration**, add your Vercel URL and `https://your-app.vercel.app/auth/callback` to redirect URLs.

If you see **`500`** / **`MIDDLEWARE_INVOCATION_FAILED`**, the usual cause is missing Supabase env vars on Vercel. Middleware runs on every request and needs those keys. After setting them, trigger a new deployment.

## Tech stack

Next.js App Router · Supabase SSR (`@supabase/ssr`) · Tailwind CSS · TypeScript

## License

Private — internal use only.
