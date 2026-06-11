# server-architecture Specification

## Purpose
TBD - created by archiving change split-and-typescript-server. Update Purpose after archive.
## Requirements
### Requirement: Server is compiled from TypeScript
The system SHALL define the optional local server in TypeScript and emit runnable Node ESM for local development and local production serving.

#### Scenario: Server type-checks
- **WHEN** the project type-check or server type-check command is run
- **THEN** the TypeScript server source is checked with Node runtime types

#### Scenario: Local server starts from emitted output
- **WHEN** the local production server command is run after the required build step
- **THEN** the server starts from emitted JavaScript and listens on the configured local port

### Requirement: Server responsibilities are modular
The system SHALL separate server bootstrapping, runtime configuration, HTTP helpers, static SPA serving, board API routing, and SQLite board persistence into focused modules.

#### Scenario: Entrypoint composes modules
- **WHEN** a maintainer opens the server entrypoint
- **THEN** the entrypoint coordinates startup and request delegation without containing board validation, SQLite SQL statements, or static file serving internals

#### Scenario: Board persistence changes are isolated
- **WHEN** board persistence behavior changes
- **THEN** the persistence logic can be updated in the board repository module without changing static asset serving or Vite middleware code

### Requirement: Board-domain validation is shared
The system SHALL provide browser-safe board-state types, validation, and normalization utilities that are reused by both client storage hydration and server API handling.

#### Scenario: Missing card metadata is normalized consistently
- **WHEN** client storage or the server receives a legacy card without priority or tag metadata
- **THEN** the shared normalization logic assigns the default priority and an empty tag list

#### Scenario: Legacy description content is normalized consistently
- **WHEN** client storage or the server receives a legacy card with `description` instead of `content`
- **THEN** the shared normalization logic maps the description into card content

### Requirement: Server refactor preserves board API contract
The system SHALL preserve the existing `/api/board` endpoint path, supported methods, response shape, JSON content type, and validation failure behavior.

#### Scenario: Board is read from API
- **WHEN** a client sends `GET /api/board`
- **THEN** the server responds with JSON containing `state` as a valid board state or `null`

#### Scenario: Board is written to API
- **WHEN** a client sends `PUT /api/board` with a valid board state payload
- **THEN** the server persists the board state and responds with JSON containing the saved `state`

#### Scenario: Invalid board payload is rejected
- **WHEN** a client sends `PUT /api/board` with invalid JSON or an invalid board state payload
- **THEN** the server responds with a 400 JSON error without persisting the payload

#### Scenario: Unsupported board API method is rejected
- **WHEN** a client sends a request to `/api/board` with a method other than `GET` or `PUT`
- **THEN** the server responds with a 405 JSON error

### Requirement: Server refactor preserves static and development serving
The system SHALL preserve the current local production SPA serving behavior and Vite middleware behavior in development mode.

#### Scenario: Production server falls back to app shell
- **WHEN** a non-API production request does not match an existing static file
- **THEN** the server responds with the production `index.html` app shell

#### Scenario: Development server delegates non-API requests to Vite
- **WHEN** the local development server receives a non-API request
- **THEN** the server delegates the request to Vite middleware
