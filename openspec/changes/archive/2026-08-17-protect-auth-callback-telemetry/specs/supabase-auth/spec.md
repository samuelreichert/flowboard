## ADDED Requirements

### Requirement: Browser authentication uses PKCE

The system SHALL configure Supabase browser authentication to use the PKCE authorization-code flow and SHALL NOT request reusable access or refresh tokens in an authentication callback URL.

#### Scenario: User returns from social OAuth

- **WHEN** a user completes a configured social OAuth sign-in flow
- **THEN** Supabase returns a short-lived authorization code to the allowed Flowboard callback route
- **AND** the browser client exchanges the code using the verifier created when sign-in started
- **AND** reusable access and refresh tokens are not present in the callback URL

#### Scenario: User returns from an email magic link

- **WHEN** a user completes an email magic-link flow supported by the configured Supabase project
- **THEN** the browser client completes the PKCE code exchange on the allowed Flowboard callback route
- **AND** the resulting session follows the existing authenticated app flow

### Requirement: Auth callback credentials are consumed before unrelated integrations can transmit them

The system SHALL prevent authentication callback codes, tokens, provider credentials, and auth error parameters from being transmitted to unrelated browser integrations before or during callback processing.

#### Scenario: Valid callback contains an authorization code

- **WHEN** `/auth/callback` loads with a PKCE authorization code and a safe internal destination
- **THEN** Supabase consumes the code before the app completes callback navigation
- **AND** unrelated browser telemetry does not transmit the code or the callback query string
- **AND** the app navigates to the preserved safe internal destination after recognizing the session

#### Scenario: Legacy or unexpected callback contains token fragments

- **WHEN** `/auth/callback` loads with an access token, refresh token, provider token, or other credential in the URL fragment
- **THEN** the app does not transmit the credential-bearing URL through telemetry
- **AND** the callback is handled or rejected without exposing those credentials

#### Scenario: Callback authentication fails

- **WHEN** Supabase rejects a callback code or the callback contains authentication error details
- **THEN** the app presents a non-sensitive authentication failure state
- **AND** a previously valid session does not suppress that failure state or get invalidated by the failed callback
- **AND** telemetry does not transmit the callback query string or fragment
