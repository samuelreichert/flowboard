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

#### Scenario: Authenticated user loads the main board surface

- **WHEN** an authenticated user requests their main board bootstrap
- **THEN** the API returns the board data needed to render columns, active card
  summaries, board tags, metadata, and active work-cycle state
- **AND** rich card content and completed history are loaded only through their
  dedicated detail and history endpoints

#### Scenario: Local development user loads the main board surface

- **WHEN** the app is running with explicitly enabled local development
  principal mode
- **AND** the client requests `GET /api/board/bootstrap`
- **THEN** the API resolves the local development principal
- **AND** returns main board bootstrap data from Prisma SQLite using the same
  response shape as authenticated production requests

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

#### Scenario: Local development principal updates local board resources

- **WHEN** local development principal mode is enabled
- **AND** the client submits a valid resource mutation to a supported
  `/api/board/...` endpoint
- **THEN** the API persists the change through Prisma SQLite under the local
  development owner

### Requirement: API rejects unauthenticated production persistence

The system SHALL reject unauthenticated durable board API requests whenever
local development principal mode is not explicitly enabled.

#### Scenario: Production request omits credentials

- **WHEN** the app is running in production or Postgres-backed mode
- **AND** a request to a supported durable board endpoint has no valid Supabase
  credentials
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

The system SHALL use `/api/projects`, `/api/board/bootstrap`,
`/api/board/cards...`, `/api/board/columns...`, `/api/board/tags...`,
`/api/board/settings`, `/api/board/work-cycle/settings`,
`/api/board/work-cycle/complete`, `/api/board/work-cycles/history...`, and
`/api/board/clear` as the canonical durable board/project API surface.

#### Scenario: Client loads default board locally

- **WHEN** the app runs against local SQLite without Supabase browser config
- **THEN** the client requests `GET /api/board/bootstrap`
- **AND** does not request `/api/boards/default` or a separate
  `/api/local/boards/default` endpoint

#### Scenario: Client loads default board in production

- **WHEN** the app runs with Supabase Auth configured
- **THEN** the client requests `GET /api/board/bootstrap` with Supabase
  credentials
- **AND** uses the same response shape as local development

#### Scenario: Legacy single-board endpoint is requested

- **WHEN** a client requests the old anonymous `/api/board` endpoint
- **THEN** the server does not treat it as a supported durable product API

#### Scenario: Legacy full-board endpoint is requested

- **WHEN** a client requests `GET /api/boards/default`, `GET /api/boards/:id`,
  or `PUT /api/boards/:id`
- **THEN** the server does not treat the request as a supported durable product
  API
- **AND** the request does not read or write board data

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

### Requirement: API accepts active column resource mutations

The system SHALL expose authenticated resource-oriented endpoints for creating,
renaming, moving, and deleting active board columns on the resolved principal's
main board.

#### Scenario: Authenticated user creates an active column

- **WHEN** an authenticated user submits `POST /api/board/columns` with a valid
  title and optional client-generated identifier
- **THEN** the API creates one column in that user's main board
- **AND** returns the created column, ordered column list, and updated board
  version

#### Scenario: Authenticated user renames an active column

- **WHEN** an authenticated user submits `PATCH /api/board/columns/:columnId`
  with a valid title for a column in their main board
- **THEN** the API updates that column's title
- **AND** returns the updated column and updated board version

#### Scenario: Authenticated user moves an active column

- **WHEN** an authenticated user submits
  `PATCH /api/board/columns/:columnId/move` with a valid relative placement
- **THEN** the API reorders that column within the user's main board
- **AND** returns the ordered column list and updated board version

#### Scenario: Authenticated user deletes an active column

- **WHEN** an authenticated user submits `DELETE /api/board/columns/:columnId`
  for a column in their main board
- **THEN** the API deletes that active column and its active cards
- **AND** returns the deleted column identifier, deleted active card
  identifiers, any cleared work-cycle setting, and updated board version

### Requirement: API accepts board tag resource mutations

The system SHALL expose authenticated resource-oriented endpoints for creating,
renaming, and deleting board tags on the resolved principal's main board.

#### Scenario: Authenticated user creates a board tag

- **WHEN** an authenticated user submits `POST /api/board/tags` with a valid
  unique tag name and optional client-generated identifier
- **THEN** the API creates one board tag in that user's main board
- **AND** returns the created tag, ordered tag list, and updated board version

#### Scenario: Authenticated user renames a board tag

- **WHEN** an authenticated user submits `PATCH /api/board/tags/:tagId` with a
  valid unique tag name for a tag in their main board
- **THEN** the API updates that tag's display name
- **AND** returns the updated tag and updated board version

#### Scenario: Authenticated user deletes a board tag

- **WHEN** an authenticated user submits `DELETE /api/board/tags/:tagId` for a
  tag in their main board
- **THEN** the API deletes that board tag and removes its active card
  assignments
- **AND** returns the deleted tag identifier, affected active card identifiers,
  and updated board version

### Requirement: API accepts active card tag assignment mutations

The system SHALL expose authenticated resource-oriented endpoints for assigning
and unassigning one board tag on one active card in the resolved principal's
main board.

#### Scenario: Authenticated user assigns a tag to an active card

- **WHEN** an authenticated user submits
  `PUT /api/board/cards/:cardId/tags/:tagId` for a card and tag in their main
  board
- **THEN** the API creates the active card-tag assignment when it does not
  already exist
- **AND** returns the updated card tag identifiers and updated board version

#### Scenario: Authenticated user unassigns a tag from an active card

- **WHEN** an authenticated user submits
  `DELETE /api/board/cards/:cardId/tags/:tagId` for a card and tag in their main
  board
- **THEN** the API removes that active card-tag assignment when present
- **AND** returns the updated card tag identifiers and updated board version

### Requirement: API accepts board settings mutations

The system SHALL expose an authenticated board settings mutation endpoint for
settings that are part of the current board surface.

#### Scenario: Authenticated user changes board background

- **WHEN** an authenticated user submits `PATCH /api/board/settings` with a
  valid board background value
- **THEN** the API updates that user's main board background
- **AND** returns the updated board settings and updated board version

### Requirement: API accepts work-cycle settings mutations

The system SHALL expose an authenticated work-cycle settings mutation endpoint
for completed-column configuration without completing work.

#### Scenario: Authenticated user changes completed column setting

- **WHEN** an authenticated user submits `PATCH /api/board/work-cycle/settings`
  with a valid column identifier or null completed-column value
- **THEN** the API updates the active work-cycle completed-column setting for
  that user's main board
- **AND** returns the updated active work-cycle settings and updated board
  version

### Requirement: API validates non-card board mutation payloads

The system SHALL validate column, tag, board settings, work-cycle settings, and
card-tag mutation payloads before changing persisted board data.

#### Scenario: Column mutation has invalid title

- **WHEN** a column create or rename request has an empty or duplicate title
- **THEN** the API rejects the request without changing persisted board data

#### Scenario: Tag mutation has invalid name

- **WHEN** a tag create or rename request has an empty or duplicate name
- **THEN** the API rejects the request without changing persisted board data

#### Scenario: Mutation references unavailable board resource

- **WHEN** a column, tag, card-tag, board settings, or work-cycle settings
  mutation references a resource outside the resolved principal's main board
- **THEN** the API treats the referenced resource as invalid or missing
- **AND** does not modify another user's data

#### Scenario: Unauthenticated production board resource mutation is submitted

- **WHEN** local development principal mode is disabled
- **AND** a non-card board resource mutation request has no valid Supabase
  credentials
- **THEN** the API rejects the request without reading or changing board data

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

