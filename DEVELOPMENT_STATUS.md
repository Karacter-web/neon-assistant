# Development status

Last updated: 2026-11-01

## Milestones

| Milestone | Status | Notes |
| --- | --- | --- |
| 1 — Foundation | Implemented; live validation pending | React/Vite shell, auth wiring, responsive design, conversation CRUD calls, initial SQL migration, docs, and automated checks are in place. Supabase project configuration is still needed for live validation. |
| 2 — Core AI | Not started | Lovable Gateway compatibility must be verified before an adapter is selected. |
| 3 — Document intelligence | Not started | Private Storage policies, parsers/OCR, and contextual retrieval remain to implement. |
| 4 — Web intelligence | Not started | Search provider, citations, research orchestration, reasoning configuration, and server time remain to implement. |
| 5 — Live voice | Not started | Deepgram and ElevenLabs official capabilities and secure credential flow remain to verify and implement. |
| 6 — Production readiness | Not started | RLS isolation, integration tests, rate limiting, deployment, and security review remain. |

## Implemented in this increment

- Original responsive Karacter AI identity, dark/light theme, sign-in screen, workspace shell, mobile navigation, and explicit unavailable/soon states.
- Supabase browser client guarded by required public configuration; auth session lifecycle, email/password registration and login, password reset request/completion, Google/GitHub OAuth redirects, and callback route.
- Typed Supabase database shapes, conversation list/create/rename/delete client operations, initial schema migration, and owner-oriented RLS policies.
- `.env.example`, ignored local `.env` containing empty placeholders, setup README, and this status/architecture documentation.
- Vitest coverage for the unconfigured auth state, conversation-service validation, and no-credentials behavior.

## Verification matrix

| Area | State |
| --- | --- |
| Repository audit | Verified: initial workspace had only README and MIT license. |
| Type-check | Passed through `npm run typecheck` (included in the verified pipeline). |
| Unit tests | Passed: 3 test files, 4 tests. |
| Production build | Passed with route-level code splitting; no chunk-size warning. |
| Dependency audit | Passed: `npm audit --omit=dev` reported 0 vulnerabilities; initial install audit also reported 0 vulnerabilities. |
| Git whitespace check | Passed: `git diff --check` exited 0. |
| Supabase auth/OAuth/email verification | Not end-to-end tested; project URL/anon key and dashboard redirect/provider settings are not available. |
| Migration SQL | Written but not applied or tested; review against the existing project schema before applying. |
| RLS user isolation | Policies present but not validated against live users/database. |
| AI, document/OCR, image, search/research, voice | Not implemented; no claims of operation. |

## Blockers / required configuration

- Existing Supabase project URL and public anon/publishable key are needed for live auth and database validation.
- Review the migration against the project before applying it. Configure allowed redirect URLs for localhost, Codespaces, and deployment.
- AI, OCR, search, Deepgram, and ElevenLabs credentials are not present. Verify official provider integration docs and Gateway external access before implementation.
- Provider-specific official documentation verification remains outstanding because a webpage-fetch capability is unavailable. Shell verification was completed through the workspace task runner.

## Architectural decisions

- Use Vite + React/TypeScript for this empty repository; use Supabase Edge Functions as the recommended secure integration runtime.
- No new Supabase project, replacement backend, mock provider, or secret has been introduced.
- Conversation generation, document upload/processing, search/research, and voice UI controls remain unavailable until real server-side integrations are implemented.
