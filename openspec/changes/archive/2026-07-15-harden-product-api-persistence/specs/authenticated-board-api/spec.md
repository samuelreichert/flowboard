## MODIFIED Requirements

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

## ADDED Requirements

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
