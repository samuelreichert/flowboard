## ADDED Requirements

### Requirement: API accepts clear-board command

The system SHALL expose an authenticated clear-board command endpoint that
clears the resolved principal's active board without accepting or saving a full
board aggregate.

#### Scenario: Authenticated user clears active board

- **WHEN** an authenticated user submits `POST /api/board/clear`
- **THEN** the API deletes that user's active board columns, active cards, and
  active card-tag assignments
- **AND** normalizes the active work-cycle state for the empty active board
- **AND** returns empty columns, deleted active card identifiers, the updated
  active work-cycle state, and updated board version

#### Scenario: Local development user clears active board

- **WHEN** local development principal mode is explicitly enabled
- **AND** the client submits `POST /api/board/clear`
- **THEN** the API clears the local development owner's active board using the
  same route and response shape as authenticated production requests

#### Scenario: Clear-board command preserves unrelated board data

- **WHEN** a resolved principal submits `POST /api/board/clear`
- **THEN** the API does not delete board tags, board background, completed work
  history, project data, owner data, or profile data

#### Scenario: Empty active board is cleared

- **WHEN** a resolved principal submits `POST /api/board/clear` and their active
  board has no columns or active cards
- **THEN** the API returns a successful empty active-board response
- **AND** does not create columns or delete unrelated board data

#### Scenario: Unauthenticated production clear-board command is submitted

- **WHEN** local development principal mode is disabled
- **AND** a request to `POST /api/board/clear` has no valid Supabase
  credentials
- **THEN** the API rejects the request without reading or changing board data

### Requirement: API validates clear-board command scope

The system SHALL derive clear-board ownership and target board identity from the
resolved principal rather than trusting client-supplied board data.

#### Scenario: Client submits board data with clear-board command

- **WHEN** a client submits `POST /api/board/clear` with a board identifier,
  owner identifier, columns, cards, tags, or history in the request body
- **THEN** the API ignores or rejects the client-supplied board data
- **AND** scopes the clear operation only to the resolved principal's main board

#### Scenario: User attempts to clear another user's board

- **WHEN** an authenticated user submits a clear-board command with identifiers
  associated with another user's board
- **THEN** the API does not modify the other user's data
