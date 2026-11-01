# Karacter AI

Karacter AI is a multimodal conversational workspace under active, milestone-based development. This repository currently contains the responsive application foundation, Supabase authentication wiring, and an initial owner-scoped database migration. AI generation, file processing, search, and live voice are **not implemented yet**; the UI marks these capabilities as unavailable rather than simulating them.

## Requirements

- Node.js 20.19+ or 22.12+ (current Vite requirements)
- npm
- An existing Supabase project for end-to-end authentication and persistence

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` using the project's public URL and publishable/anon key. Never put a service-role key in a `VITE_*` variable.
3. Review `supabase/migrations/20261101000000_initial_schema.sql` against the connected project's current schema before applying it. The project is not linked in this repository, and the migration has **not** been applied.
4. In Supabase Auth URL configuration, allow the local callbacks `http://localhost:5173/auth/callback` and `http://localhost:5173/auth/update-password`, plus the Codespaces/production URLs you use. Google and GitHub sign-in use the providers configured in the Supabase dashboard; configure their Supabase callback URLs there as usual.
5. Start the development server with `npm run dev`.

Keep real project values only in ignored local `.env` or `.env.local` files; never commit them. The diagnostic command prints variable names and status only, not key values.

## Scripts

- `npm run dev` — local Vite server
- `npm run typecheck` — TypeScript project check
- `npm test` — unit tests
- `npm run build` — type-check and production bundle
- `npm run check:supabase` — read-only check that the configured public Supabase key reaches the REST API; prints variable names and visible endpoint names only, never key values

## Current functionality and limits

- Email/password sign-up and sign-in, password reset requests, OAuth redirects, callback handling, and session persistence are wired to Supabase Auth. They require a configured Supabase project and dashboard settings for end-to-end verification.
- The signed-in workspace includes responsive navigation, light/dark theme, conversation list/search, and conversation create/rename/delete calls against the initial schema.
- RLS policies are defined in the migration. They have not been applied or tested against a Supabase instance; inspect the target project's schema first.
- Conversation message entry, AI streaming, attachments/storage, OCR, web research, and voice are future milestones and are not currently operational.

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) and [`DEVELOPMENT_STATUS.md`](./DEVELOPMENT_STATUS.md) for design decisions, integration gates, and verification state.