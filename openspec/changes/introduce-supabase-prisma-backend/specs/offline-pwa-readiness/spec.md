## MODIFIED Requirements

### Requirement: Local board edits continue offline
The system SHALL allow local/static-mode board edits to continue using browser storage while network access or the optional local board API is unavailable, but authenticated production board edits SHALL NOT be presented as durably saved until the authenticated API confirms persistence.

#### Scenario: User edits in local/static mode while offline
- **WHEN** the app is running in local/static mode and the optional local board API is unavailable
- **THEN** the user can create, edit, move, and delete board content using local browser storage

#### Scenario: Authenticated user edits while production API is unavailable
- **WHEN** an authenticated user attempts to change server-backed board data while the production API is unavailable
- **THEN** the system communicates that durable saving is unavailable instead of treating the edit as safely persisted

### Requirement: Optional API persistence does not block local use
The system SHALL treat the optional local SQLite persistence endpoint as a local/static synchronization target rather than a prerequisite for local editing, while authenticated production persistence SHALL use the authenticated API as the durable data source.

#### Scenario: Local API hydration fails
- **WHEN** the app is running in local/static mode and the optional local board API cannot be reached
- **THEN** the system keeps using the locally stored board without clearing it

#### Scenario: Local API write fails
- **WHEN** the app is running in local/static mode and an optional local board API write fails
- **THEN** the system preserves the local board state and does not block the user from continuing to edit

#### Scenario: Modular server is unavailable in local/static mode
- **WHEN** the modular TypeScript local server is not running in local/static mode
- **THEN** the system continues to support local board editing through browser storage

#### Scenario: Authenticated production data load fails
- **WHEN** the app is running in authenticated production mode and server-backed board data cannot be loaded
- **THEN** the system shows an unavailable or retry state rather than silently falling back to a different durable board source
