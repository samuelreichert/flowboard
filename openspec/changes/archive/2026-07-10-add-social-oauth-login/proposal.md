## Why

Flowboard's authenticated experience should feel approachable for both new and returning users. Email magic-link sign-in remains a useful fallback, but Google and Apple are the expected primary account options for many users and reduce friction before launch.

## What Changes

- Add a unified sign-in/sign-up entry point that keeps email magic-link authentication and adds configured Supabase OAuth provider options.
- Support Google OAuth as a first social provider for local development and future production deployment.
- Support Apple OAuth as a planned social provider, with implementation able to show or gate the option based on configuration readiness.
- Reuse the existing Supabase session flow so authenticated board API access remains provider-agnostic after sign-in.
- Document provider setup expectations for local development, future Vercel deployment, redirect URLs, and provider credentials.
- No breaking API or database changes are expected.

## Capabilities

### New Capabilities

- `social-oauth-login`: Defines the unified authentication entry point and configured Google/Apple Supabase OAuth behavior.

### Modified Capabilities

- None.

## Impact

- Affected client code: Supabase auth helpers, authentication screen, sign-in actions, auth messaging, and related tests.
- Affected configuration: Supabase Auth provider configuration for Google and Apple, redirect URLs, and future Vercel/production URL setup.
- Affected docs: README or setup notes for Google OAuth, Apple OAuth, local redirect URLs, production redirect URLs, and fallback email sign-in behavior.
- Affected backend behavior: no provider-specific changes expected; the Node API should continue verifying Supabase access tokens and deriving the user id independently of the sign-in provider.
