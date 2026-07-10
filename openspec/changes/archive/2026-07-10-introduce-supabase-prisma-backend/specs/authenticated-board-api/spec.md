## ADDED Requirements

### Requirement: Authenticated API serves user board data
The system SHALL expose authenticated API routes for loading and changing user-owned Flowboard data.

#### Scenario: Authenticated user loads their board list
- **WHEN** an authenticated user requests their projects or boards
- **THEN** the API returns only the projects or boards accessible to that user

#### Scenario: Authenticated user loads a board
- **WHEN** an authenticated user requests one of their boards
- **THEN** the API returns the board data needed to render columns, cards, tags, metadata, and history

### Requirement: API mutations enforce ownership
The system SHALL enforce ownership on every authenticated mutation before changing persisted data.

#### Scenario: User updates their own card
- **WHEN** an authenticated user updates a card that belongs to their board
- **THEN** the API persists the change

#### Scenario: User updates another user's card
- **WHEN** an authenticated user attempts to update a card that does not belong to them
- **THEN** the API rejects the change without modifying the card

### Requirement: API validates board-domain payloads
The system SHALL validate incoming board-domain payloads before persisting changes through Prisma.

#### Scenario: Valid board update is submitted
- **WHEN** an authenticated user submits a valid board-domain update for a resource they own
- **THEN** the API persists normalized data and returns a success response

#### Scenario: Invalid board update is submitted
- **WHEN** an authenticated user submits invalid board-domain data
- **THEN** the API rejects the payload without persisting it

### Requirement: API does not trust client-supplied ownership
The system SHALL derive ownership from the verified Supabase user and existing server-side relationships rather than trusting owner identifiers supplied by the client.

#### Scenario: Client submits a different owner id
- **WHEN** an authenticated user submits a payload containing another user's owner id
- **THEN** the API ignores or rejects that owner id and prevents cross-user data access

#### Scenario: Client creates a new board
- **WHEN** an authenticated user creates a project or board
- **THEN** the API assigns ownership from the verified Supabase user id

### Requirement: API exposes durable network state to the client
The system SHALL distinguish authenticated persistence failures from successful saves so the client can show accurate loading and error states.

#### Scenario: Network save fails
- **WHEN** an authenticated board mutation cannot be durably saved
- **THEN** the API or client state reports the failure instead of treating the change as safely persisted

#### Scenario: Authenticated data cannot be loaded
- **WHEN** authenticated board data cannot be loaded because the network or API is unavailable
- **THEN** the client can present a recoverable unavailable state rather than clearing user data
