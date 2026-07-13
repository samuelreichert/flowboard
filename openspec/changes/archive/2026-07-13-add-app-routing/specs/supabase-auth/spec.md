## MODIFIED Requirements

### Requirement: Supabase Auth owns user authentication

The system SHALL use Supabase Auth as the source of user identity for authenticated Flowboard sessions.

#### Scenario: User signs in successfully

- **WHEN** a user completes a supported Supabase Auth sign-in flow
- **THEN** the app recognizes the user as authenticated
- **AND** authenticated API requests can be associated with the Supabase user id

#### Scenario: User is not signed in

- **WHEN** a user opens an authenticated Flowboard route without a valid Supabase session
- **THEN** the app prevents access to authenticated board data
- **AND** the app presents an authentication entry point
- **AND** the app preserves the requested internal route as the intended post-auth destination

## ADDED Requirements

### Requirement: Auth routes preserve intended destinations

The system SHALL provide sign-in and auth callback routes that preserve safe internal app destinations through Supabase sign-in flows.

#### Scenario: Signed-out user opens a protected deep link

- **WHEN** Supabase Auth is configured and a signed-out user opens a protected app route
- **THEN** the app presents the authentication entry point
- **AND** the requested app route remains available as the intended destination after sign-in

#### Scenario: User starts OAuth from a protected route

- **WHEN** a signed-out user starts a configured Supabase OAuth flow from a protected app route
- **THEN** the OAuth request uses an allowed auth callback route
- **AND** the callback route includes the protected app route as a safe internal destination

#### Scenario: User requests a magic link from a protected route

- **WHEN** a signed-out user requests an email magic link from a protected app route
- **THEN** the magic-link request uses an allowed auth callback route
- **AND** the callback route includes the protected app route as a safe internal destination

#### Scenario: Auth callback completes with valid internal destination

- **WHEN** the user returns to `/auth/callback` after successful Supabase authentication and the callback contains a valid internal destination
- **THEN** the app navigates to that destination after the session is recognized

#### Scenario: Auth callback has missing or unsafe destination

- **WHEN** the user returns to `/auth/callback` and the requested destination is missing, external, malformed, or otherwise unsafe
- **THEN** the app navigates to `/board`

#### Scenario: Signed-in user opens sign-in route

- **WHEN** an already signed-in user opens `/sign-in`
- **THEN** the app navigates to the requested safe internal destination when one exists
- **AND** otherwise navigates to `/board`
