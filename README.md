# Segwitz Knowledge Base

Internal Next.js 14 document library with Supabase (Auth + Postgres + Storage).

## Quick start

```bash
npm install
cp .env.example .env.local
# Paste NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from Supabase Dashboard → Settings → API
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** (Next.js default port).

If styles look wrong after changing CSS: stop the dev server, run `rm -rf .next`, run `npm run dev` again, hard-refresh the browser (`Cmd+Shift+R`).

## Database

Apply migrations (Supabase CLI or Dashboard SQL):

```bash
supabase db push   # when linked to your project
```

Migrations live in `supabase/migrations/`.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server at port **3000** (`PORT=3040 npm run dev` for another port) |
| `npm run build` | Production build (runs Tailwind / PostCSS — must succeed for deploy) |
| `npm run start` | Run production build locally |
| `npm run lint` | ESLint |

## Styling (Tailwind CSS)

- Global styles: `app/globals.css` (`@tailwind base/components/utilities`)
- Root layout imports: `app/layout.tsx` → `import "./globals.css"`
- Config: `tailwind.config.ts`, PostCSS: `postcss.config.mjs`

## Deploy (e.g. GitHub + Vercel)

1. Push this repository to GitHub.
2. Import the repo in Vercel; set the same `NEXT_PUBLIC_*` env vars.
3. Add your Vercel URL to Supabase **Authentication → URL Configuration** (redirect URLs).

## License

Private — internal use only.
