## ADDED Requirements

### Requirement: Unified authentication entry point
The system SHALL present a single authentication entry point for both new and returning users that supports configured social OAuth providers and email magic-link sign-in.

#### Scenario: User opens auth screen while signed out
- **WHEN** Supabase Auth is configured and the user has no active session
- **THEN** the app presents one authentication screen
- **AND** the screen includes email magic-link sign-in
- **AND** the screen includes configured social provider options

#### Scenario: New user chooses an auth method
- **WHEN** a new user completes any supported authentication flow
- **THEN** the app treats the completed flow as account creation and sign-in
- **AND** the user does not need to choose a separate signup screen first

### Requirement: Email magic-link remains available
The system SHALL keep email magic-link sign-in available when social OAuth providers are added.

#### Scenario: User requests email magic link
- **WHEN** a signed-out user submits a valid email address from the unified auth screen
- **THEN** the app requests a Supabase email magic-link sign-in
- **AND** the app shows whether the request was accepted or failed

#### Scenario: Social provider unavailable
- **WHEN** a social provider is not configured or fails to start
- **THEN** the email magic-link option remains available on the auth screen

### Requirement: Google OAuth can initiate Supabase sign-in
The system SHALL allow a signed-out user to initiate Google sign-in through Supabase Auth when Google OAuth is configured.

#### Scenario: User chooses Google
- **WHEN** a signed-out user selects the Google authentication option
- **THEN** the app starts a Supabase OAuth sign-in request for the Google provider
- **AND** the request uses an allowed redirect target for the current environment

#### Scenario: Google OAuth start fails
- **WHEN** Supabase returns an error while starting Google OAuth
- **THEN** the app shows a non-sensitive failure message
- **AND** the app does not expose provider secrets, tokens, or internal error details

### Requirement: Apple OAuth can initiate Supabase sign-in when configured
The system SHALL allow a signed-out user to initiate Apple sign-in through Supabase Auth when Apple OAuth is configured.

#### Scenario: User chooses Apple
- **WHEN** a signed-out user selects the Apple authentication option and Apple OAuth is configured
- **THEN** the app starts a Supabase OAuth sign-in request for the Apple provider
- **AND** the request uses an allowed redirect target for the current environment

#### Scenario: Apple OAuth not ready
- **WHEN** Apple OAuth is not configured or cannot be supported in the current environment
- **THEN** the app avoids starting an invalid Apple OAuth request
- **AND** the auth screen still offers available authentication methods

### Requirement: OAuth sessions use existing authenticated app flow
The system SHALL treat successful social OAuth sessions the same as other Supabase-authenticated sessions for Flowboard data access.

#### Scenario: User returns from social OAuth
- **WHEN** a user returns to Flowboard with a valid Supabase session from Google or Apple
- **THEN** the app recognizes the user as signed in
- **AND** authenticated board loading uses the Supabase access token already used by other sign-in flows

#### Scenario: Backend receives OAuth-authenticated request
- **WHEN** the Node API receives a request with a valid Supabase access token from a social OAuth session
- **THEN** the server verifies the token through Supabase
- **AND** app data access is scoped by the verified Supabase user id without relying on provider-specific metadata

### Requirement: Social OAuth setup is documented
The system SHALL document the external setup required to use social OAuth providers in local and deployed environments.

#### Scenario: Developer configures Google OAuth
- **WHEN** a developer follows the setup documentation for Google OAuth
- **THEN** the documentation identifies the need for Google OAuth credentials, Supabase provider settings, authorized app origins, and Supabase callback redirect configuration

#### Scenario: Developer configures Apple OAuth
- **WHEN** a developer follows the setup documentation for Apple OAuth
- **THEN** the documentation identifies the need for Apple Developer configuration, provider credentials, Supabase provider settings, and stable HTTPS redirect URLs for production validation

#### Scenario: Developer configures redirect URLs before launch
- **WHEN** the app is still being developed without a production domain
- **THEN** the documentation identifies local redirect URLs that can be used for development
- **AND** the documentation identifies that Vercel and production domain redirect URLs must be added before deployed OAuth use
