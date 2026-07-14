## MODIFIED Requirements

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
