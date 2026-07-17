## ADDED Requirements

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
