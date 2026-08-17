## Why

Flowboard currently mounts Vercel Analytics and Speed Insights while Supabase authentication callbacks can still contain live access, refresh, or authorization credentials in the browser URL. The validated security review demonstrated that the analytics client can transmit those credentials before Supabase removes them, so callback cleanup and telemetry redaction need to become explicit product requirements.

## What Changes

- Use Supabase's PKCE browser flow instead of the implicit grant flow.
- Prevent observability collectors from sending authentication callback query parameters or URL fragments.
- Delay or suppress callback telemetry until Supabase has consumed the callback and the browser URL is clean.
- Share one telemetry privacy control between Web Analytics and Speed Insights so future route or auth-flow changes keep the same protection.
- Add focused unit and browser-level regression coverage for callback credentials, ordinary navigation analytics, and safe post-auth routing.
- Document the callback privacy invariant and preview verification steps.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `supabase-auth`: Require a code-exchange authentication flow and removal of callback credentials before unrelated client integrations can observe the URL.
- `vercel-observability`: Require centralized URL redaction and suppression of measurements while authentication callbacks contain sensitive parameters.

## Impact

- Affected frontend code includes `src/auth/supabase.ts`, auth callback/session initialization, `src/main.tsx`, and a new shared telemetry privacy helper or wrapper.
- Existing Vercel Analytics and Speed Insights dependencies remain in use, but their initialization and `beforeSend` behavior change.
- Supabase redirect handling changes from implicit tokens in the fragment to PKCE authorization-code exchange; allowed redirect destinations and backend bearer-token verification remain unchanged.
- Tests and deployment documentation gain explicit credential-leak regression and preview-network validation steps.
