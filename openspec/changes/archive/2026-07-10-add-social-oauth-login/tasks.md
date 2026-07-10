## 1. Configuration And Auth Helpers

- [x] 1.1 Define the supported social OAuth provider list for Google and Apple with labels, provider ids, and configuration status.
- [x] 1.2 Add client-side helper behavior for starting Supabase OAuth sign-in with the selected provider.
- [x] 1.3 Ensure OAuth sign-in uses an allowed redirect target derived from the current app environment.
- [x] 1.4 Ensure failed OAuth initiation surfaces a non-sensitive user-facing message.

## 2. Unified Auth UI

- [x] 2.1 Update the signed-out auth screen to present one sign-in/sign-up entry point.
- [x] 2.2 Add Google and Apple social sign-in controls that match the existing UI style.
- [x] 2.3 Keep email magic-link sign-in available as a fallback on the same screen.
- [x] 2.4 Add concise copy clarifying that new accounts are created automatically when sign-in succeeds.
- [x] 2.5 Gate or message unavailable providers so Apple does not start an invalid OAuth request before setup is ready.

## 3. Session And Backend Compatibility

- [x] 3.1 Verify returning from Google or Apple OAuth reuses the existing Supabase session observer.
- [x] 3.2 Verify authenticated board loading continues to use the Supabase access token without provider-specific branches.
- [x] 3.3 Confirm the Node API remains provider-agnostic and does not trust provider metadata for authorization.

## 4. Tests

- [x] 4.1 Add tests that the unified auth screen renders social provider options and the email magic-link fallback.
- [x] 4.2 Add tests that selecting Google starts Supabase OAuth with provider `google`.
- [x] 4.3 Add tests that selecting Apple starts Supabase OAuth only when Apple is configured.
- [x] 4.4 Add tests for OAuth initiation failure messaging without exposing internal details.
- [x] 4.5 Run typecheck and the test suite.

## 5. Documentation And Provider Setup

- [x] 5.1 Document local Supabase Auth redirect URLs for OAuth development.
- [x] 5.2 Document Google OAuth setup requirements, including provider credentials, authorized origins, and Supabase callback configuration.
- [x] 5.3 Document Apple OAuth setup requirements, including Apple Developer configuration, provider credentials, and production HTTPS redirect expectations.
- [x] 5.4 Document future Vercel preview and production redirect URL setup.
- [x] 5.5 Add manual verification notes for email magic-link, Google OAuth, Apple OAuth readiness, and authenticated board loading after redirect.
