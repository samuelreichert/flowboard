## ADDED Requirements

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
