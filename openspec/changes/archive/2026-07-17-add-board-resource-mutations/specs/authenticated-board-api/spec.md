## ADDED Requirements

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
