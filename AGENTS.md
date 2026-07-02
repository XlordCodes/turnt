# AGENTS.md

## Project Overview

Next.js 16 (App Router) for "Turnt" — Chennai Gen-Z IRL hangout community. Single-page app expanding into full-stack with auth + event management. React 19, TypeScript configured but components are `.jsx`, pages are `.js`.

## Commands

- `npm run dev` — dev server on localhost:3000
- `npm run build` — production build
- `npm run lint` — ESLint (next/core-web-vitals + typescript presets); no path arg, runs on entire project
- No test suite exists
- No `npm run typecheck` — use `npx tsc --noEmit` if needed

## File Conventions

- Components: `app/components/*.jsx` (not `.tsx`); all are `'use client'` except `app/page.js`
- Pages: `app/page.js`, `app/login/page.js`, `app/eventbooking/page.js`, `app/admin/page.js` (plain `.js`)
- Admin page is a **Server Component** (auth check + role check on server, renders `AdminUI.jsx` client component)
- CSS: `app/styles/*.css` — being phased out for Tailwind v4 utility classes
- Path alias: `@/*` maps to project root
- **Do not shorten program files for brevity when generating code**

## Styling & Animations

- `app/layout.js` loads fonts via `<link>` tags (Google Fonts + cdnfonts) — not `next/font`
- Tailwind CSS v4 via `@tailwindcss/postcss` plugin. Transition all components to Tailwind utilities, phase out plain CSS files
- Animations: framer-motion in Hero, custom requestAnimationFrame in Navbar

## Backend (Supabase)

- Client: `lib/supabaseClient.js` exports a single `supabase` instance
- Server (admin page only): `createServerClient` from `@supabase/ssr` with `SUPABASE_SERVICE_ROLE_KEY`
- Middleware: `middleware.js` (plain `.js`) protects `/admin` routes — requires auth, redirects to `/login`
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `.env*` files are gitignored. No `.env.example` exists yet — create one when adding new backend services
- Migration: `001_init_migration.sql` at project root (not in a `supabase/migrations/` folder)
- Supabase RPC: `add_event_interest(p_event_id)` used in UpcomingEvents for server-side user_id insertion
- Tables: `profiles` (RLS enabled), `events` (RLS enabled), `event_interests` (RLS enabled)

## Auth Flow

- Phase 1: Email + Password only (no magic links)
- Phase 2: Google OAuth (planned)
- Required profile fields: Full Name, Username, WhatsApp Number (mandatory), Instagram Handle (optional)
- Middleware redirects unauthenticated users from `/admin` to `/login`
- Admin role check happens server-side in `app/admin/page.js` via `profiles.role`

## Events & Payments

- Events: Name, Description, Reg Link (Razorpay), Date/Time, Venue, Ticket Price
- "Interested" feature: bookmarks events; status stays "Interested" even after booking
- Razorpay test key hardcoded in `EventBookingPage.jsx` line 612 — production requires backend order creation
- No API routes exist yet (`app/api/` does not exist)

## Security Notes (see AUDIT.md for full report)

- Admin route is server-protected (middleware + Server Component role check)
- `profiles` UPDATE policy lacks `WITH CHECK` — users can self-promote to admin (CRITICAL, unfixed)
- `events` INSERT/UPDATE/DELETE have no admin-only RLS policies (CRITICAL, unfixed)
- `select('*')` on events exposes `reg_link` in client — use explicit column lists
- `.env.local` is gitignored but verify it was never force-committed

## Gotchas

- Remote images allowed only from `images.unsplash.com` and `images.pexels.com` (in `next.config.ts`)
- ESLint config uses flat config format (`eslint.config.mjs`)
- tsconfig has `strict: true` and `noEmit: true`
- `package-lock.json` is gitignored — run `npm install` to regenerate if needed
- `ui-ux-pro-max/` directory is gitignored — do not reference or create files there
