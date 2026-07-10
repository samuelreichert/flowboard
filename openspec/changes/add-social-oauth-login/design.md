## Context

Flowboard currently uses Supabase Auth as the identity provider for authenticated sessions, with the client observing Supabase session state and the Node API verifying Supabase access tokens before reading or writing board data. The existing authentication UI is email magic-link oriented. The desired product direction is a single sign-in/sign-up entry point that keeps email as a fallback and adds Google and Apple account options for the website.

Supabase Auth supports OAuth providers through `signInWithOAuth`. After OAuth succeeds, Supabase returns the same kind of session already used by Flowboard, so the board API can remain provider-agnostic. Google is practical to configure and test before launch using local redirect URLs. Apple should be represented in the design, but production reliability depends more heavily on Apple Developer configuration, service identifiers, verified domains, and stable HTTPS redirect URLs.

This change depends on the Supabase Auth foundation introduced by `introduce-supabase-prisma-backend`, but it does not change the database model or server ownership boundary.

## Goals / Non-Goals

**Goals:**

- Present email magic-link, Google, and Apple authentication options from a unified entry point.
- Treat sign-in and sign-up as the same user action from the UI perspective.
- Use Supabase OAuth provider sessions rather than app-owned OAuth token handling.
- Preserve the existing provider-agnostic API flow: client obtains Supabase session, server verifies Supabase access token, Prisma queries remain owner-scoped.
- Allow local development before a production domain exists, especially for email and Google.
- Document the redirect URL and provider setup expectations for local development, future Vercel preview URLs, and production domains.
- Keep Apple support explicit while allowing implementation to gate or message Apple if provider setup is incomplete.

**Non-Goals:**

- Implement app-owned OAuth callback handling, provider token storage, or direct Google/Apple API access.
- Add password-based email signup/login.
- Add account linking, multi-provider identity management UI, passkeys, SAML, teams, or enterprise account controls.
- Change the structured board persistence model or authenticated board API authorization model.
- Guarantee full Apple OAuth validation before a stable HTTPS domain and Apple Developer configuration are available.

## Decisions

### Use one auth screen for sign-in and sign-up

The auth entry point should use sign-in language, with supporting copy that new accounts are created automatically when a supported Supabase flow succeeds. This avoids forcing users to choose between "login" and "signup" before they know whether an account exists.

Alternatives considered:

- Separate login and signup screens: familiar, but unnecessary for magic links and OAuth and likely to create friction.
- Social buttons only: lower email complexity, but removes a useful fallback when provider login fails or a user prefers email.

### Keep email magic links as the fallback

Email magic links should remain available below or alongside the social provider buttons. This supports users without Google/Apple accounts, users whose provider configuration is temporarily unavailable, and development or support scenarios where OAuth is inconvenient.

Alternatives considered:

- Add password login: broader familiarity, but increases account security surface area and is not needed while Supabase Auth can handle passwordless email.
- Remove email after social login exists: simpler UI, but weaker resilience and less inclusive.

### Start OAuth through Supabase client APIs

The client should initiate provider login through Supabase's OAuth API for `google` and `apple`, optionally passing a redirect target derived from the current app origin. Flowboard should not handle provider secrets or exchange OAuth codes itself.

Alternatives considered:

- Custom OAuth server callbacks: gives more control, but duplicates Supabase Auth responsibilities and increases security risk.
- Direct provider SDKs: provider-specific complexity with no benefit for the current backend, which only needs the Supabase user id.

### Backend remains provider-agnostic

The Node API should continue verifying Supabase access tokens and deriving the Supabase user id. It should not branch on whether the session came from email, Google, or Apple.

Alternatives considered:

- Store provider type in app profiles immediately: potentially useful later, but unnecessary for authorization and can be added later if account settings need it.

### Configure providers outside application code

Google and Apple enablement depends on Supabase Auth provider settings and external provider credentials. The app should document required setup and fail gracefully if a provider is not configured, but provider secrets must never be embedded in frontend code.

Alternatives considered:

- Hardcode available providers in the UI: simpler, but confusing when Apple cannot be fully tested until production-like setup exists.
- Read provider availability dynamically from Supabase: attractive, but not necessary for the first iteration and may add extra coupling.

## Risks / Trade-offs

- Apple setup may be blocked before production domain exists -> Keep Apple in the product contract, but document that full validation may wait for stable HTTPS redirect URLs and Apple Developer configuration.
- OAuth redirect URL mismatch can break sign-in -> Document local, Vercel preview, and production redirect URL requirements and include manual testing steps.
- Provider buttons could imply availability before configuration is complete -> Gate buttons by configuration flags or show a clear unavailable message.
- OAuth popup/redirect can lose local app state -> Treat authenticated board state as server-backed and rely on existing post-session load/import behavior.
- Users may not understand signup versus login -> Use one "Sign in" screen with concise copy explaining new accounts are created automatically.
- Provider-specific profile metadata can vary -> Do not depend on provider metadata for authorization; keep the backend based on verified Supabase user id.

## Migration Plan

1. Add configuration shape for enabled social providers and redirect target behavior.
2. Update the auth screen to present Google, Apple, and email magic-link options in one flow.
3. Add client actions that initiate Supabase OAuth for configured providers.
4. Preserve existing Supabase session observation so returning from OAuth loads the authenticated board normally.
5. Add tests for rendered provider options, OAuth initiation, email fallback, and provider failure messaging.
6. Update setup docs for Supabase redirect URLs, Google provider credentials, Apple provider expectations, local development, and future Vercel/production URLs.

Rollback strategy: hide or disable social provider buttons while leaving email magic-link sign-in intact. Because the backend remains provider-agnostic, rollback should not require database or API migration.

## Open Questions

- Should Apple be shown immediately with an unavailable/setup message when not configured, or hidden until the required Apple credentials and redirect URLs are ready?
- Should Vercel preview URLs be configured as allowed redirect URLs before production launch, or should OAuth testing remain local until a stable deployed URL exists?
- Should the auth UI include short explanatory copy that "new accounts are created automatically," or keep the screen visually minimal?
