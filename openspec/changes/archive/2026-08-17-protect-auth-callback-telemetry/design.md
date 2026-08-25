## Context

Flowboard creates its browser Supabase client with default auth options, which selects the implicit flow. Successful OAuth and magic-link callbacks can therefore place live access and refresh tokens in `location.hash` while `@supabase/auth-js` performs asynchronous session validation. Vercel Analytics and Speed Insights are mounted globally and currently receive no `beforeSend` control. The security review reproduced the analytics script sending the complete credential-bearing callback URL.

Current Supabase documentation supports browser PKCE through `createClient(..., { auth: { flowType: 'pkce' } })`; the client generates and stores the verifier and exchanges the one-time callback code. Current Vercel Analytics and Speed Insights packages both expose `beforeSend`, which can return a modified event or `null` to suppress it.

The solution must preserve safe internal `next` destinations, normal route analytics, the existing Supabase session lifecycle, and the strict deployment CSP. It must protect both current observability collectors through one source of truth.

## Goals / Non-Goals

**Goals:**

- Prevent OAuth, magic-link, or future auth callback credentials from leaving the browser through telemetry.
- Replace implicit browser tokens with Supabase PKCE authorization-code exchange.
- Apply one fail-closed URL privacy policy to Web Analytics and Speed Insights.
- Preserve ordinary route measurements without query strings or fragments.
- Make callback credential handling directly testable without contacting production analytics.

**Non-Goals:**

- Change server-side bearer-token verification, profile provisioning, or owner-scoped Prisma access.
- Replace Supabase Auth or Vercel observability products.
- Introduce a consent-management or general analytics preference system.
- Inspect or alter Vercel's server-side retention policies.
- Change safe post-auth destination behavior.

## Decisions

### Use Supabase PKCE explicitly

Configure the browser client with `auth.flowType: 'pkce'` and retain URL-session detection so the client performs the code exchange. PKCE prevents long-lived access and refresh tokens from being returned in the callback URL and binds the short-lived code to the browser-held verifier.

Alternative considered: keep implicit flow and rely only on telemetry redaction. Redaction remains necessary, but leaving reusable bearer credentials in the URL creates avoidable exposure to future integrations, browser extensions, screenshots, and diagnostics.

### Centralize a fail-closed telemetry `beforeSend` policy

Create one pure telemetry privacy helper and pass the same function to both `<Analytics>` and `<SpeedInsights>`. The helper will parse `event.url`, return `null` when an `/auth/callback` event still has a query string or fragment, and otherwise return the event with both `search` and `hash` removed. Parsing failure also returns `null`.

The helper will preserve all event fields other than the canonicalized URL and use a small structural generic type so it is compatible with both Vercel packages without duplicating policy or depending on one collector's private implementation.

Alternative considered: maintain a denylist of credential parameter names. A denylist is easy to bypass when providers add new parameters, error payloads, or nested redirect values. Removing all query and fragment data gives Flowboard's path-oriented analytics the safer default.

### Suppress the credential-bearing callback measurement instead of coordinating render timing

The first pageview on `/auth/callback` will be discarded while the callback still contains parameters. After Supabase completes exchange and URL cleanup, subsequent navigation remains measurable through ordinary route tracking. This makes the security control synchronous at the telemetry boundary and avoids coupling collector rendering to auth-hook timing or relying on effect order.

Alternative considered: render telemetry only after auth initialization reports completion. That reduces exposure but is fragile because global imports, other scripts, or future refactors can run before the readiness state changes. `beforeSend` remains the final boundary even when initialization order changes.

### Present callback failures without invalidating an older session

Treat explicit provider errors and PKCE codes that remain in the callback URL after Supabase initialization as failed callback attempts. Supabase intentionally preserves an older valid session when a new callback exchange fails, so the callback route will present the generic failure before applying its normal signed-in redirect. The preserved session remains available after the user leaves the failed callback route.

Alternative considered: sign the user out whenever a callback fails. That would make the failure visible but would unnecessarily invalidate an unrelated, previously authenticated session and diverge from Supabase's session-preservation behavior.

### Test the policy at pure-function and browser boundaries

Unit tests will cover callback codes, legacy implicit fragments, provider error parameters, malformed URLs, and ordinary routes. A browser-oriented integration test will load a synthetic callback and assert that neither collector receives credential-bearing data, while a normal route still produces a sanitized event. Tests will use synthetic values only.

## Risks / Trade-offs

- [PKCE can expose setup assumptions in existing Supabase email templates or redirect configuration] → Verify OAuth and magic-link flows locally and in a Vercel preview; document any required Supabase template or redirect updates.
- [Suppressing the initial callback pageview reduces authentication-funnel analytics] → Accept the missing sensitive pageview; measure the safe destination after callback completion instead.
- [Removing all query parameters reduces analytics detail] → Flowboard routing is path-oriented, and confidentiality takes priority over query-level telemetry.
- [A future collector may not call `beforeSend`] → Keep the callback test collector-agnostic and require every new telemetry integration to use the shared privacy helper.
- [Malformed or unexpected event URLs lose telemetry] → Fail closed and cover the behavior with an explicit test so it is intentional.

## Migration Plan

1. Add the shared telemetry privacy helper and unit tests.
2. Configure both Vercel collectors with the helper and add callback integration coverage.
3. Switch the Supabase browser client to PKCE and update auth-flow tests.
4. Verify email magic-link and configured OAuth providers in local authenticated mode.
5. Deploy to a Vercel preview, confirm no credential-bearing analytics request is emitted, and confirm normal analytics and Speed Insights delivery.
6. Roll back by reverting the release if callback exchange fails; do not roll back only the telemetry privacy helper while credential-bearing callbacks remain possible.

## Open Questions

- Does Vercel retain historical callback URLs from before this fix, requiring a separate operational data-retention review?
