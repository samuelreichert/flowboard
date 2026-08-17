## 1. Centralize Telemetry URL Privacy

- [x] 1.1 Add a pure shared telemetry privacy helper that suppresses parameterized `/auth/callback` events, strips query strings and fragments from other event URLs, preserves unrelated event fields, and fails closed on malformed URLs.
- [x] 1.2 Add unit tests for PKCE codes, legacy token fragments, provider/error parameters, ordinary routes, preserved event fields, and malformed URLs.
- [x] 1.3 Pass the same privacy helper to the `beforeSend` prop of both Vercel Web Analytics and Speed Insights at the app root.
- [x] 1.4 Add an integration regression test proving a synthetic credential-bearing callback is not sent by either collector while an ordinary route still produces a sanitized event.

## 2. Move Browser Authentication to PKCE

- [x] 2.1 Configure the Supabase browser client with `auth.flowType: 'pkce'` while retaining the existing session persistence and callback detection behavior.
- [x] 2.2 Update Supabase client and auth-session tests to assert PKCE configuration, authorization-code exchange behavior, safe `next` destination preservation, and non-sensitive callback failures.
- [x] 2.3 Update authentication setup documentation with PKCE callback expectations and any required Supabase email-template or redirect configuration.
- [x] 2.4 Preserve an older valid session while ensuring explicit provider errors and unconsumed PKCE codes present a generic callback failure, with signed-in and signed-out regression coverage.

## 3. Verify Security and Deployment Behavior

- [x] 3.1 Run lint, typecheck, and the complete automated test suite; resolve any regression caused by the auth or telemetry changes.
- [x] 3.2 Verify configured OAuth and email magic-link sign-in locally, including successful navigation to the preserved safe internal destination.
- [ ] 3.3 Verify in a Vercel preview that callback requests contain no credential-bearing Analytics or Speed Insights payload while normal measurements still succeed without CSP violations.
- [ ] 3.4 Review whether historical Vercel analytics data retained callback URLs from before the fix and document any required operational cleanup outside the codebase.
