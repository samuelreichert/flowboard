## MODIFIED Requirements

### Requirement: Server responsibilities are modular
The system SHALL separate server bootstrapping, runtime configuration, HTTP helpers, static SPA serving, Supabase auth verification, authenticated API routing, Prisma data access, and database persistence into focused modules.

#### Scenario: Entrypoint composes modules
- **WHEN** a maintainer opens the server entrypoint
- **THEN** the entrypoint coordinates startup and request delegation without containing board validation, auth verification internals, Prisma query details, or static file serving internals

#### Scenario: Board persistence changes are isolated
- **WHEN** board persistence behavior changes
- **THEN** the persistence logic can be updated in focused Prisma-backed data access modules without changing static asset serving or Vite middleware code

#### Scenario: Auth verification changes are isolated
- **WHEN** Supabase auth verification behavior changes
- **THEN** the auth helper or middleware can be updated without changing board-domain validation or static asset serving code

### Requirement: Server refactor preserves board API contract
The system SHALL replace the anonymous single-board `/api/board` production persistence contract with authenticated board/project API behavior while preserving any legacy local API compatibility only as an explicit local/static development mode.

#### Scenario: Authenticated board is read from API
- **WHEN** an authenticated client requests board data through the production API
- **THEN** the server verifies the user and responds with board data owned by or accessible to that user

#### Scenario: Authenticated board is written to API
- **WHEN** an authenticated client submits a valid board-domain change through the production API
- **THEN** the server verifies ownership, persists the change through Prisma, and responds with the saved result

#### Scenario: Invalid board payload is rejected
- **WHEN** a client submits invalid JSON or invalid board-domain data
- **THEN** the server responds with an error without persisting the payload

#### Scenario: Anonymous production board access is rejected
- **WHEN** a client sends an unauthenticated production API request for durable board data
- **THEN** the server rejects the request without reading or writing user board data

#### Scenario: Legacy local API mode is used
- **WHEN** the app is running in an explicitly supported local/static compatibility mode
- **THEN** any legacy anonymous board persistence behavior is isolated from authenticated production persistence
