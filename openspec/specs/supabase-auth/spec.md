# supabase-auth Specification

## Purpose
Defines Supabase Auth ownership, session verification, and app-profile provisioning for authenticated Flowboard data.

## Requirements
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

### Requirement: Server verifies Supabase identity before app data access
The system SHALL verify the Supabase-authenticated user on the server before reading or writing Flowboard-owned data.

#### Scenario: API request has valid credentials
- **WHEN** an API request includes valid Supabase session credentials
- **THEN** the server derives the authenticated Supabase user id before executing app data queries

#### Scenario: API request has missing or invalid credentials
- **WHEN** an API request lacks valid Supabase session credentials
- **THEN** the server rejects the request without reading or writing Flowboard-owned data

### Requirement: App profile is provisioned for authenticated users
The system SHALL maintain a Flowboard-owned profile record keyed by the Supabase user id and seed missing display fields from Supabase user metadata when available.

#### Scenario: Authenticated user has no profile
- **WHEN** a verified Supabase user accesses Flowboard for the first time
- **THEN** the system creates the corresponding app profile before creating user-owned board data
- **AND** the profile seeds missing display name and avatar values from Supabase/provider metadata when available

#### Scenario: Authenticated user already has a profile
- **WHEN** a verified Supabase user accesses Flowboard after profile creation
- **THEN** the system reuses the existing app profile

#### Scenario: Existing profile has user-edited display data
- **WHEN** a verified Supabase user accesses Flowboard with saved Flowboard profile display data
- **THEN** the system preserves the saved Flowboard profile values
- **AND** the system does not overwrite them with provider metadata

#### Scenario: Provider metadata is incomplete
- **WHEN** a verified Supabase user has no provider display name or avatar metadata
- **THEN** the system still provisions a profile
- **AND** profile display falls back to available email-derived identity where needed

### Requirement: Auth failures avoid sensitive disclosure
The system SHALL return authentication and authorization failures without exposing tokens, secrets, database details, or whether unrelated user-owned resources exist.

#### Scenario: Invalid token is rejected
- **WHEN** an API request includes an invalid or expired auth token
- **THEN** the response indicates authentication failure without exposing token validation internals

#### Scenario: User requests another user's resource
- **WHEN** an authenticated user requests a resource they do not own or cannot access
- **THEN** the response does not reveal private details about that resource
