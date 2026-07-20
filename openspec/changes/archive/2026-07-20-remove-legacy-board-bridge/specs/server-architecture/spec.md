## MODIFIED Requirements

### Requirement: Server exposes one durable board API contract

The system SHALL provide canonical durable board/project API behavior through
Prisma-backed bootstrap, detail, history, and resource mutation routes and SHALL
NOT expose anonymous local-only or legacy full-board endpoint families as the
product API.

#### Scenario: Authenticated board is read from API

- **WHEN** an authenticated client requests board data through the production API
- **THEN** the server verifies the user and responds with board data owned by or accessible to that user

#### Scenario: Local development board is read from API

- **WHEN** the app is running with SQLite local development principal mode enabled
- **AND** a client requests board data through `GET /api/board/bootstrap`
- **THEN** the server resolves the local development principal and responds
  with bootstrap data scoped to that principal

#### Scenario: Authenticated board is written to API

- **WHEN** an authenticated client submits a valid board-domain resource change
  through the production API
- **THEN** the server verifies ownership, persists the change through Prisma,
  and responds with the saved result

#### Scenario: Invalid board payload is rejected

- **WHEN** a client submits invalid JSON or invalid board-domain data
- **THEN** the server responds with an error without persisting the payload

#### Scenario: Anonymous production board access is rejected

- **WHEN** a client sends an unauthenticated production API request for durable board data
- **THEN** the server rejects the request without reading or writing user board data

#### Scenario: Legacy anonymous board endpoints are not durable API

- **WHEN** a client requests `/api/board` or `/api/local/boards/default`
- **THEN** the server does not treat the request as a supported durable board API contract

#### Scenario: Legacy full-board endpoints are not durable API

- **WHEN** a client requests `GET /api/boards/default`, `GET /api/boards/:id`,
  or `PUT /api/boards/:id`
- **THEN** the server does not treat the request as a supported durable board
  API contract
- **AND** the request does not read or write user board data
