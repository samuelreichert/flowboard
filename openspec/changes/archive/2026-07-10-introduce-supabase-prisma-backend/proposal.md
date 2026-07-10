## Why

Flowboard is ready to move from a local-first single-board prototype toward a secure authenticated product where a user's boards, projects, tags, rich card content, and history survive across devices. The current single-row SQLite mirror is useful for development, but it does not provide the structured ownership, authorization, migration, or production database foundation needed for Supabase Auth, Prisma, AI/search, or future collaboration.

## What Changes

- Introduce Supabase-owned authentication for registration, login, session identity, password recovery, and future OAuth provider support.
- Introduce Prisma as the app data access layer for Flowboard-owned tables, with SQLite kept for local development and Supabase Postgres used in production.
- Replace the single `board_state.payload` persistence model with a structured relational model for profiles, projects, boards, columns, cards, tags, card-tag assignments, active work-cycle metadata, and completed work history.
- Move authenticated board persistence behind the Node API, which verifies the Supabase user and enforces app-level ownership checks before Prisma reads or writes data.
- Preserve PWA installability and cached app-shell loading, while treating authenticated board data as server-backed data that requires a network connection for durable production reads and writes.
- Keep room in the data model and API boundaries for future AI/search and collaboration features without implementing those features in this change.
- **BREAKING**: The authenticated production persistence contract will no longer be the anonymous `GET /api/board` and `PUT /api/board` single-board payload mirror.

## Capabilities

### New Capabilities

- `supabase-auth`: Supabase-owned user authentication, session identity, and authenticated API access expectations.
- `structured-board-persistence`: Prisma-managed structured board, project, card, tag, and history persistence across SQLite local development and Supabase Postgres production.
- `authenticated-board-api`: Node API behavior for authenticated board/project CRUD and ownership enforcement.

### Modified Capabilities

- `server-architecture`: The server evolves from an optional local SQLite mirror into an authenticated backend boundary with Prisma persistence and Supabase user verification.
- `offline-pwa-readiness`: PWA app-shell availability remains required, but authenticated production board data is no longer promised to support offline editing as the durable source of truth.

## Impact

- Affected server code: runtime configuration, request routing, auth/session verification helpers, Prisma client setup, database repositories/services, API response helpers, and tests.
- Affected client code: storage/hydration flow, authenticated API calls, loading/error/unauthenticated states, and removal or demotion of localStorage as the authenticated durability layer.
- Affected data systems: Prisma schema, local SQLite database shape, Supabase Postgres schema, migrations, seed/dev data, environment variables, and deployment configuration.
- Affected dependencies: Prisma ORM/client, SQLite and Postgres Prisma providers or schemas, Supabase client/server auth dependencies, and related test tooling.
- Affected docs: README setup, local database instructions, production deployment notes, and security/authentication expectations.
