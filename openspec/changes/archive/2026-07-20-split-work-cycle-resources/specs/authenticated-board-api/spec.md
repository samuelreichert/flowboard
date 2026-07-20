## ADDED Requirements

### Requirement: API accepts work-cycle completion command

The system SHALL expose an authenticated work-cycle completion command endpoint
that archives the resolved principal's configured completed column without
accepting or saving a full board aggregate.

#### Scenario: Authenticated user completes work with completed cards

- **WHEN** an authenticated user submits `POST /api/board/work-cycle/complete`
  and their main board has a configured completed column containing active cards
- **THEN** the API archives those active cards into one completed work cycle
- **AND** removes those cards from the active board
- **AND** starts the next active work cycle using the completion timestamp
- **AND** returns the updated active work-cycle state, deleted active card
  identifiers, archived work-cycle summary, and updated board version

#### Scenario: Local development user completes work

- **WHEN** local development principal mode is explicitly enabled
- **AND** the client submits `POST /api/board/work-cycle/complete`
- **THEN** the API completes work under the local development owner using the
  same response shape as authenticated production requests

#### Scenario: Completion command has no configured completed column

- **WHEN** a resolved principal submits `POST /api/board/work-cycle/complete`
  without a configured completed column
- **THEN** the API rejects the command without archiving cards, deleting active
  cards, starting a new cycle, or incrementing board version

#### Scenario: Completion command has no completed cards

- **WHEN** a resolved principal submits `POST /api/board/work-cycle/complete`
  and the configured completed column contains no active cards
- **THEN** the API rejects the command without creating an empty history entry
  or incrementing board version

### Requirement: API serves completed history summaries

The system SHALL expose an authenticated completed-history endpoint that returns
bounded completed work-cycle summaries for the resolved principal's main board.

#### Scenario: Authenticated user loads completed history summaries

- **WHEN** an authenticated user requests `GET /api/board/work-cycles/history`
- **THEN** the API returns completed work-cycle metadata and archived card
  summaries scoped to that user's main board
- **AND** archived card summaries include identifiers, title, created and
  archived timestamps, priority, tag identifiers, tag snapshots, and content
  availability
- **AND** the response excludes archived rich card content, active board
  columns, active card summaries, project data, and owner identifiers

#### Scenario: Completed history request uses pagination

- **WHEN** a resolved principal requests completed history summaries with a
  valid bounded limit and optional cursor
- **THEN** the API returns cycles in deterministic newest-first order
- **AND** includes pagination metadata indicating whether more history is
  available

#### Scenario: Completed history request is unauthenticated in production

- **WHEN** local development principal mode is disabled
- **AND** a request to `GET /api/board/work-cycles/history` has no valid
  Supabase credentials
- **THEN** the API rejects the request without reading history data

### Requirement: API serves archived card detail on demand

The system SHALL expose an authenticated archived-card detail endpoint that
returns rich archived card content only when an archived card is opened.

#### Scenario: Authenticated user loads archived card detail

- **WHEN** an authenticated user requests
  `GET /api/board/work-cycles/:cycleId/cards/:cardId` for an archived card in
  their main board history
- **THEN** the API returns the archived card identifier, title, rich content,
  created timestamp, archived timestamp, priority, tag identifiers, and tag
  snapshots

#### Scenario: User requests another user's archived card detail

- **WHEN** an authenticated user requests an archived card detail that is not
  reachable from their main board history
- **THEN** the API treats the archived card as missing
- **AND** the response does not reveal whether the cycle or card belongs to
  another user

#### Scenario: Missing archived card detail is requested

- **WHEN** a resolved principal requests archived card detail for a cycle or
  card that is not present in their main board history
- **THEN** the API returns a not-found response without returning board data
