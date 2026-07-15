## MODIFIED Requirements

### Requirement: App shell is available offline

The system SHALL cache the production app shell and bundled static assets so
Flowboard can load its shell offline after installation or first successful
load.

#### Scenario: User reloads after app shell is cached

- **WHEN** the user has previously loaded the production app and then loses network access
- **THEN** the system loads the Flowboard application shell from cache
- **AND** the system does not imply that board changes can be durably saved without the Prisma API

### Requirement: Local board edits continue offline

The system SHALL NOT require browser localStorage board editing as an offline
durability feature.

#### Scenario: Durable API is unavailable

- **WHEN** the Prisma API cannot be reached
- **THEN** the system communicates that durable saving is unavailable
- **AND** the system does not treat browser localStorage as a board database

### Requirement: Optional API persistence does not block local use

The system SHALL treat the Prisma API as the durable source for board data in
both local SQLite development and production modes.

#### Scenario: Local API hydration fails

- **WHEN** the app is running against local SQLite and the Prisma API cannot be reached
- **THEN** the system shows a recoverable unavailable state rather than loading board data from browser localStorage

#### Scenario: Local API write fails

- **WHEN** the app is running against local SQLite and a Prisma API write fails
- **THEN** the system reports that durable saving is unavailable instead of persisting board data to browser localStorage

#### Scenario: Production data load fails

- **WHEN** the app is running in production mode and server-backed board data cannot be loaded
- **THEN** the system shows an unavailable or retry state rather than silently falling back to a different durable board source
