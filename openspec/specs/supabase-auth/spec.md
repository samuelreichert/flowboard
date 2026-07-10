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

### Requirement: Server verifies Supabase identity before app data access
The system SHALL verify the Supabase-authenticated user on the server before reading or writing Flowboard-owned data.

#### Scenario: API request has valid credentials
- **WHEN** an API request includes valid Supabase session credentials
- **THEN** the server derives the authenticated Supabase user id before executing app data queries

#### Scenario: API request has missing or invalid credentials
- **WHEN** an API request lacks valid Supabase session credentials
- **THEN** the server rejects the request without reading or writing Flowboard-owned data

### Requirement: App profile is provisioned for authenticated users
The system SHALL maintain a Flowboard-owned profile record keyed by the Supabase user id.

#### Scenario: Authenticated user has no profile
- **WHEN** a verified Supabase user accesses Flowboard for the first time
- **THEN** the system creates the corresponding app profile before creating user-owned board data

#### Scenario: Authenticated user already has a profile
- **WHEN** a verified Supabase user accesses Flowboard after profile creation
- **THEN** the system reuses the existing app profile

### Requirement: Auth failures avoid sensitive disclosure
The system SHALL return authentication and authorization failures without exposing tokens, secrets, database details, or whether unrelated user-owned resources exist.

#### Scenario: Invalid token is rejected
- **WHEN** an API request includes an invalid or expired auth token
- **THEN** the response indicates authentication failure without exposing token validation internals

#### Scenario: User requests another user's resource
- **WHEN** an authenticated user requests a resource they do not own or cannot access
- **THEN** the response does not reveal private details about that resource
