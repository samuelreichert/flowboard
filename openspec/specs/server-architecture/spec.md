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

### Requirement: Board-domain validation is shared

The system SHALL provide browser-safe board-state types, validation, and normalization utilities that are reused by both client storage hydration and server API handling.

#### Scenario: Missing card metadata is normalized consistently

- **WHEN** client storage or the server receives a legacy card without priority or tag metadata
- **THEN** the shared normalization logic assigns the default priority and an empty tag list

#### Scenario: Legacy description content is normalized consistently

- **WHEN** client storage or the server receives a legacy card with `description` instead of `content`
- **THEN** the shared normalization logic maps the description into card content

### Requirement: Server exposes one durable board API contract

The system SHALL use `/api/projects`, `/api/boards/default`, and `/api/boards/:id` as the canonical durable board/project API surface for both local SQLite development and production Postgres modes.

#### Scenario: Authenticated board is read from API

- **WHEN** an authenticated client requests board data through the production API
- **THEN** the server verifies the user and responds with board data owned by or accessible to that user

#### Scenario: Local development board is read from API

- **WHEN** the app is running with SQLite local development principal mode enabled
- **AND** a client requests board data through `/api/boards/default`
- **THEN** the server resolves the local development principal and responds with board data scoped to that principal

#### Scenario: Authenticated board is written to API

- **WHEN** an authenticated client submits a valid board-domain change through the production API
- **THEN** the server verifies ownership, persists the change through Prisma, and responds with the saved result

#### Scenario: Invalid board payload is rejected

- **WHEN** a client submits invalid JSON or invalid board-domain data
- **THEN** the server responds with an error without persisting the payload

#### Scenario: Anonymous production board access is rejected

- **WHEN** a client sends an unauthenticated production API request for durable board data
- **THEN** the server rejects the request without reading or writing user board data

#### Scenario: Legacy anonymous board endpoints are not durable API

- **WHEN** a client requests `/api/board` or `/api/local/boards/default`
- **THEN** the server does not treat the request as a supported durable board API contract

### Requirement: Server refactor preserves static and development serving

The system SHALL preserve the current local production SPA serving behavior and Vite middleware behavior in development mode.

#### Scenario: Production server falls back to app shell

- **WHEN** a non-API production request does not match an existing static file
- **THEN** the server responds with the production `index.html` app shell

#### Scenario: Development server delegates non-API requests to Vite

- **WHEN** the local development server receives a non-API request
- **THEN** the server delegates the request to Vite middleware
