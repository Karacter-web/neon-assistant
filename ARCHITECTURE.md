# Karacter AI architecture

## Current foundation

- **Web:** Vite, React, TypeScript, Tailwind CSS, and a small original component/style system. The application is a single-page client with protected workspace routes.
- **Identity and data authority:** Supabase Auth, PostgreSQL, and (in a later milestone) private Supabase Storage. The browser uses only the project's public URL and publishable/anon key. Service-role credentials must remain server-side.
- **Auth lifecycle:** Supabase session persistence and URL callback detection are enabled in the typed browser client. Email/password and Google/GitHub OAuth are delegated to Supabase Auth; app routes require a live session.
- **Schema:** versioned SQL migrations. Foundation tables are `profiles`, `conversations`, `messages`, `attachments`, and `user_preferences`. Owner policies use `auth.uid()`; browser message inserts are restricted to user-role messages. Server-side assistant writes are reserved for later trusted API functions.
- **Secure integrations:** planned for Supabase Edge Functions, with provider-specific adapters behind stable interfaces. No AI, search, OCR, document processor, or voice provider is currently configured or called.

## Security boundaries

- Never put a Supabase service-role key, AI key, Deepgram key, or ElevenLabs key into browser code or any `VITE_*` setting.
- Client-created conversations are scoped by `user_id` and RLS. Message and attachment records bind to both a conversation and its owner.
- Uploaded content and retrieved web pages must be treated as untrusted input. Future model instructions and tool authorization must remain application-controlled.
- The initial SQL has not been applied. Inspect the target project's existing schema and storage policies before applying; no Supabase project connection is available in this repository.

## Integration decisions and open gates

1. **Lovable AI Gateway:** preferred, but external access, credentials, model identifiers, streaming, and tool-call support have not been independently verified. Keep an adapter boundary; do not silently substitute providers.
2. **Voice:** Deepgram is preferred, ElevenLabs secondary. Verify official protocol/auth and Gateway compatibility before implementation. Use short-lived credentials or a secure application-managed voice pipeline; never expose permanent keys.
3. **Documents/OCR and web search:** select replaceable services only after supported APIs, data handling, and credentials are verified. Preserve provenance for every cited source.
4. **Deployment:** frontend and Edge Functions need a configured existing Supabase project and approved hosting/runtime setup. No project ID, URL, keys, or linked CLI configuration is present.

See `DEVELOPMENT_STATUS.md` for implemented scope and verification state.
