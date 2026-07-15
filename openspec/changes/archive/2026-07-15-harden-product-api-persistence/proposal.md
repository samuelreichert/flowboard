## Why

Flowboard is moving from a local-first prototype into a shippable product. The
database direction is now clear: board data must be persisted through Prisma
structured records, using SQLite for local development and Supabase Postgres in
production. The API contract needs the same cleanup.

The current transitional shape risks preserving prototype concepts in the
product surface: browser board storage, local-only endpoint names, and parallel
local-vs-production board APIs. Local SQLite should remain a development
database, but it should not create a separate product API or imply that
localStorage is a supported board database.

## What Changes

- Remove board-data localStorage as a persistence or import source.
- Remove legacy anonymous `/api/board` behavior and avoid replacing it with a
  product-visible `/api/local/*` board API.
- Use one canonical board/project API surface for durable board data:
  `/api/projects`, `/api/boards/default`, and `/api/boards/:id`.
- Introduce an explicit server-side principal resolver:
  - Supabase principal for production and authenticated flows.
  - Local development principal only when the server is explicitly running in
    local SQLite development mode.
- Ensure production and Postgres-like modes reject unauthenticated durable board
  API access.
- Keep SQLite local development on the same Prisma schema/model as production.
- Reframe documentation and OpenSpec requirements around a database-backed
  product, not a local-first app.

## Capabilities

### Modified Capabilities

- `authenticated-board-api`: Defines the canonical durable board API and
  principal requirements across local development and production.
- `server-architecture`: Defines principal resolution and prevents local-dev
  bypass behavior from leaking into production.
- `structured-board-persistence`: Clarifies that structured Prisma persistence
  applies to durable board data generally, not only authenticated production
  boards.
- `offline-pwa-readiness`: Removes browser-storage board editing as a
  requirement and limits offline behavior to app-shell availability.
- `project-readme-presentation`: Aligns README requirements with the
  Prisma-backed product positioning.

## Impact

- Affected server code: request routing, auth/principal resolution, local dev
  identity handling, production auth enforcement, and tests.
- Affected client code: board API client naming, local/production data loading,
  save failure handling, and removal of local endpoint assumptions.
- Affected docs/specs: README, running-mode matrix, storage/PWA language, and
  endpoint guidance.
- Affected tests: endpoint routing tests, no-auth local SQLite tests,
  production unauthenticated rejection tests, and board localStorage regression
  tests.
