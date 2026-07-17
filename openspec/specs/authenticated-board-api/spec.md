# authenticated-board-api Specification

## Purpose

Defines authenticated Flowboard API behavior for user-owned projects, boards, and durable persistence states.

## Requirements

### Requirement: Authenticated API serves user board data

The system SHALL expose canonical durable API routes for loading and changing
Flowboard board data, using the same route shape in local development and
production.

#### Scenario: Authenticated user loads their board list

- **WHEN** an authenticated user requests their projects or boards
- **THEN** the API returns only the projects or boards accessible to that user

#### Scenario: Authenticated user loads a board

- **WHEN** an authenticated user requests one of their boards
- **THEN** the API returns the board data needed to render columns, cards, tags, metadata, and history

#### Scenario: Local development user loads a board

- **WHEN** the app is running with explicitly enabled local development principal mode
- **AND** the client requests `/api/boards/default`
- **THEN** the API resolves the local development principal
- **AND** returns board data from Prisma SQLite using the canonical board response shape

### Requirement: API mutations enforce ownership

The system SHALL enforce ownership on every durable mutation before changing
persisted data, regardless of whether the principal comes from Supabase Auth or
explicit local development mode.

#### Scenario: User updates their own card

- **WHEN** an authenticated user updates a card that belongs to their board
- **THEN** the API persists the change

#### Scenario: User updates another user's card

- **WHEN** an authenticated user attempts to update a card that does not belong to them
- **THEN** the API rejects the change without modifying the card

#### Scenario: Local development principal updates local board

- **WHEN** local development principal mode is enabled
- **AND** the client submits a valid update to `/api/boards/:id`
- **THEN** the API persists the change through Prisma SQLite under the local development owner

### Requirement: API rejects unauthenticated production persistence

The system SHALL reject unauthenticated durable board API requests whenever
local development principal mode is not explicitly enabled.

#### Scenario: Production request omits credentials

- **WHEN** the app is running in production or Postgres-backed mode
- **AND** a request to `/api/boards/default` has no valid Supabase credentials
- **THEN** the API rejects the request without reading or writing board data

#### Scenario: Local development bypass is disabled

- **WHEN** local development principal mode is disabled
- **AND** a request to a durable board endpoint has no valid Supabase credentials
- **THEN** the API rejects the request without falling back to a local owner

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

### Requirement: Durable board endpoints are canonical

The system SHALL use `/api/projects`, `/api/boards/default`, and
`/api/boards/:id` as the canonical durable board/project API surface.

#### Scenario: Client loads default board locally

- **WHEN** the app runs against local SQLite without Supabase browser config
- **THEN** the client requests `/api/boards/default`
- **AND** does not request a separate `/api/local/boards/default` endpoint

#### Scenario: Client loads default board in production

- **WHEN** the app runs with Supabase Auth configured
- **THEN** the client requests `/api/boards/default` with Supabase credentials
- **AND** uses the same response shape as local development

#### Scenario: Legacy single-board endpoint is requested

- **WHEN** a client requests the old anonymous `/api/board` endpoint
- **THEN** the server does not treat it as a supported durable product API

### Requirement: API serves lean main board bootstrap

The system SHALL expose an authenticated main-board bootstrap endpoint that
returns only the active board data needed to render the current board surface.

#### Scenario: Authenticated user loads main board bootstrap

- **WHEN** an authenticated user requests `GET /api/board/bootstrap`
- **THEN** the API returns that user's main board metadata, columns, active card
  summaries, board tags, and active work-cycle state
- **AND** active card summaries include card identifiers, column identifiers,
  titles, priorities, and assigned tag identifiers
- **AND** the response excludes rich card content, completed work history,
  owner identifiers, project data, and unused timestamps

#### Scenario: Local development user loads main board bootstrap

- **WHEN** the app is running with explicitly enabled local development
  principal mode
- **AND** the client requests `GET /api/board/bootstrap`
- **THEN** the API resolves the local development principal
- **AND** returns bootstrap data from Prisma SQLite using the same response
  shape as authenticated production requests

#### Scenario: Unauthenticated production bootstrap request is rejected

- **WHEN** local development principal mode is disabled
- **AND** a request to `GET /api/board/bootstrap` has no valid Supabase
  credentials
- **THEN** the API rejects the request without reading board data

### Requirement: API serves active card detail on demand

The system SHALL expose an authenticated active-card detail endpoint that returns
rich card content only when a card detail view is requested.

#### Scenario: Authenticated user loads active card detail

- **WHEN** an authenticated user requests `GET /api/board/cards/:cardId` for a
  card in their main board
- **THEN** the API returns the card identifier, title, rich content, priority,
  created timestamp, and assigned tag identifiers

#### Scenario: User requests another user's active card detail

- **WHEN** an authenticated user requests `GET /api/board/cards/:cardId` for a
  card outside their accessible main board
- **THEN** the API treats the card as missing
- **AND** the response does not reveal whether the identifier belongs to another
  user

#### Scenario: Missing active card detail is requested

- **WHEN** a resolved principal requests `GET /api/board/cards/:cardId` for a
  card that is not present in their main board
- **THEN** the API returns a not-found response without returning board data

### Requirement: API accepts active card resource mutations

The system SHALL expose authenticated resource-oriented endpoints for creating,
updating, moving, and deleting active cards on the resolved principal's main
board.

#### Scenario: Authenticated user creates an active card

- **WHEN** an authenticated user submits `POST /api/board/cards` with a valid
  target column, title, content, priority, and tag identifiers
- **THEN** the API creates one active card in that user's main board
- **AND** returns the created card fields and updated board version

#### Scenario: Authenticated user updates active card fields

- **WHEN** an authenticated user submits `PATCH /api/board/cards/:cardId` for a
  card in their main board with valid title, content, priority, and tag
  identifiers
- **THEN** the API updates that card's editable fields
- **AND** returns the updated card fields and updated board version

#### Scenario: Authenticated user moves an active card

- **WHEN** an authenticated user submits
  `PATCH /api/board/cards/:cardId/move` with a target column and relative
  placement
- **THEN** the API moves that card within the user's main board
- **AND** returns the moved card fields and updated board version

#### Scenario: Authenticated user deletes an active card

- **WHEN** an authenticated user submits `DELETE /api/board/cards/:cardId` for
  a card in their main board
- **THEN** the API deletes that active card and its active tag assignments
- **AND** returns the deleted card identifier, previous column identifier, and
  updated board version

### Requirement: API validates active card mutation payloads

The system SHALL validate card mutation payloads before changing persisted card
data.

#### Scenario: Card mutation has invalid title

- **WHEN** a card create or update request has an empty title
- **THEN** the API rejects the request without changing persisted card data

#### Scenario: Card mutation references unavailable column

- **WHEN** a card create or move request references a column outside the
  resolved principal's main board
- **THEN** the API treats the target as invalid or missing
- **AND** does not create or move the card

#### Scenario: Card mutation references unavailable tags

- **WHEN** a card create or update request includes tag identifiers outside the
  resolved principal's main board
- **THEN** the API rejects the request without changing persisted card data

### Requirement: API hides inaccessible cards during card mutations

The system SHALL scope every card mutation to the resolved principal's main
board and avoid revealing whether identifiers belong to another user.

#### Scenario: User mutates another user's active card

- **WHEN** an authenticated user submits a card mutation for a card that is not
  reachable from their main board
- **THEN** the API treats the card as missing
- **AND** the API does not modify the other user's data

#### Scenario: Unauthenticated production card mutation is submitted

- **WHEN** local development principal mode is disabled
- **AND** a card mutation request has no valid Supabase credentials
- **THEN** the API rejects the request without reading or changing board data

#### Scenario: Local development principal mutates an active card

- **WHEN** local development principal mode is explicitly enabled
- **AND** the client submits a valid active-card mutation
- **THEN** the API persists the card change under the local development owner
  using the same route and response shape as authenticated production requests
