## MODIFIED Requirements

### Requirement: Optional API persistence does not block local use
The system SHALL treat the optional `/api/board` SQLite persistence endpoint as a synchronization target rather than a prerequisite for local editing, regardless of whether the endpoint is served by the modular TypeScript local server.

#### Scenario: API hydration fails
- **WHEN** the app starts and the optional board API cannot be reached
- **THEN** the system keeps using the locally stored board without clearing it

#### Scenario: API write fails
- **WHEN** a board change is made and the optional board API write fails
- **THEN** the system preserves the local board state and does not block the user from continuing to edit

#### Scenario: Modular server is unavailable
- **WHEN** the modular TypeScript local server is not running
- **THEN** the system continues to support local board editing through browser storage
