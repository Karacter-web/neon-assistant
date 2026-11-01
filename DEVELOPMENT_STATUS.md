# Development status

Last updated: 2026-11-01

## Milestones

| Milestone | Status | Notes |
| --- | --- | --- |
| 1 — Foundation | Implemented; Supabase auth pending | React/Vite shell, auth wiring, responsive design, conversation CRUD calls, initial SQL migration, docs, and automated checks are in place. The read-only endpoint check returned HTTP 401 despite a non-expired anon-role JWT whose project reference matches the configured URL. |
| 2 — Core AI | Not started | Lovable Gateway compatibility must be verified before an adapter is selected. |
| 3 — Document intelligence | Not started | Private Storage policies, parsers/OCR, and contextual retrieval remain to implement. |
| 4 — Web intelligence | Not started | Search provider, citations, research orchestration, reasoning configuration, and server time remain to implement. |
| 5 — Live voice | Not started | Deepgram and ElevenLabs official capabilities and secure credential flow remain to verify and implement. |
| 6 — Production readiness | Not started | RLS isolation, integration tests, rate limiting, deployment, and security review remain. |

## Implemented in this increment

- Original responsive Karacter AI identity, dark/light theme, sign-in screen, workspace shell, mobile navigation, and explicit unavailable/soon states.
- Supabase browser client guarded by required public configuration; auth session lifecycle, email/password registration and login, password reset request/completion, Google/GitHub OAuth redirects, and callback route.
- Typed Supabase database shapes, conversation list/create/rename/delete client operations, initial schema migration, and owner-oriented RLS policies.
- `.env.example`, ignored local environment files, setup README, and this status/architecture documentation.
- Vitest coverage for the unconfigured auth state, conversation-service validation, and no-credentials behavior.
- A read-only Supabase connectivity diagnostic (`npm run check:supabase`) that does not print key values and blocks recognized service-role/secret keys.

## Verification matrix

| Area | State |
| --- | --- |
| Repository audit | Verified: initial workspace had only README and MIT license. |
| Type-check | Passed through `npm run typecheck` (included in the verified pipeline). |
| Unit tests | Passed: 3 test files, 4 tests. |
| Production build | Passed with route-level code splitting; no chunk-size warning. |
| Dependency audit | Passed: `npm audit --omit=dev` reported 0 vulnerabilities; initial install audit also reported 0 vulnerabilities. |
| Git whitespace check | Passed: `git diff --check` exited 0. |
| Supabase endpoint | Reached the configured REST endpoint, but received HTTP 401; no schema or row data was read. `.env.local` was absent; recognized variables were found in `.env`. The JWT reports `role=anon`, matching project reference, and not expired, but was still rejected. |
| Supabase auth/OAuth/email verification | Not end-to-end tested; the REST gateway rejected the configured key. Dashboard redirect/provider settings are not available for verification. |
| Migration SQL | Written but not applied or tested; review against the existing project schema before applying. |
| RLS user isolation | Policies present but not validated against live users/database. |
| AI, document/OCR, image, search/research, voice | Not implemented; no claims of operation. |

## Blockers / required configuration

- Re-copy the current anon/publishable key from the same Supabase project and retry. The local JWT role/reference/expiry checks look consistent, but HTTP 401 may indicate a stale or invalid signing key/token or a gateway/API-key configuration issue. The diagnostic never prints the URL or key value.
- Review the migration against the project before applying it. Configure allowed redirect URLs for localhost, Codespaces, and deployment.
- AI, OCR, search, Deepgram, and ElevenLabs credentials are not present. Verify official provider integration docs and Gateway external access before implementation.
- Provider-specific official documentation verification remains outstanding because a webpage-fetch capability is unavailable. Shell verification was completed through the workspace task runner.

## Architectural decisions

- Use Vite + React/TypeScript for this empty repository; use Supabase Edge Functions as the recommended secure integration runtime.
- No new Supabase project, replacement backend, mock provider, or secret has been introduced.
- Conversation generation, document upload/processing, search/research, and voice UI controls remain unavailable until real server-side integrations are implemented.
