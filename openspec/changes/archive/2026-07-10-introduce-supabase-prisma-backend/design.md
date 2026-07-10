## Context

Flowboard currently stores the interactive board in browser storage and optionally mirrors the entire `BoardState` JSON payload to a local SQLite table through anonymous `GET /api/board` and `PUT /api/board` calls. This works well for a local-first prototype, but authenticated production use needs user identity, ownership boundaries, structured queries, migrations, and a database shape that can support projects, AI/search, and future collaboration.

The selected direction is Supabase-owned authentication, Supabase Postgres in production, Prisma for Flowboard-owned app data, and SQLite for local development. Supabase Auth owns identity and sessions; Flowboard owns profiles, projects, boards, cards, tags, history, API authorization, validation, and user experience.

## Goals / Non-Goals

**Goals:**

- Use Supabase Auth for registration, login, password recovery, session identity, and future OAuth provider support.
- Use Prisma as the server-side app data layer for Flowboard-owned tables.
- Keep SQLite available for local development while shaping the local schema around the production Postgres model.
- Replace the single payload mirror with structured relational persistence for projects, boards, columns, cards, tags, work-cycle metadata, and completed history.
- Make the Node API the authorization boundary: it verifies the Supabase user and scopes every Prisma read/write by that user.
- Preserve PWA installability and app-shell caching while making authenticated production data server-backed.
- Leave clear extension points for AI/search and collaboration without implementing them now.

**Non-Goals:**

- Implement AI search, embeddings, semantic indexing, realtime collaboration, comments, sharing, teams, billing, SAML, or enterprise audit trails.
- Make offline editing a production durability promise for authenticated users.
- Make Prisma manage Supabase's `auth` schema.
- Rely on SQLite to prove Postgres-specific behavior such as production indexes, pooling, Supabase Auth integration, RLS, or Postgres extensions.
- Preserve the anonymous single-board `GET /api/board` and `PUT /api/board` endpoint as the authenticated production API contract.

## Decisions

### Supabase Auth owns identity; Prisma owns app data

Supabase Auth will handle user registration, login, password reset, session refresh, and future OAuth providers. Prisma will not model or migrate Supabase's internal auth tables. Flowboard will create an app-owned `Profile` row keyed by the Supabase user UUID after the first authenticated request or sign-in bootstrap.

Alternatives considered:

- App-owned auth and sessions: more portable, but it makes Flowboard responsible for password reset, email verification, refresh-token/session security, OAuth linking, and more high-risk security details.
- Direct Supabase client access for all data: faster to build with RLS, but less aligned with the desired Node API and Prisma layer.

### The Node API is the primary authorization boundary

Authenticated client requests will include Supabase session credentials. The Node API will verify the Supabase user before reaching Prisma, derive the current user id, and scope every query/mutation by owner or membership fields. The server must never trust client-supplied owner ids.

RLS can be added later as defense-in-depth for production Postgres, but this proposal does not require full RLS correctness for the first implementation because Prisma direct database connections can bypass the RLS expectations developers may associate with Supabase client APIs.

Alternatives considered:

- Database-first authorization with RLS only: powerful, but it is easier to misconfigure when a server-side Prisma connection is also present.
- Client-enforced ownership: unacceptable because a malicious client can alter requests.

### Use a structured relational board model

The database should model Flowboard as personal projects containing boards, boards containing ordered columns and cards, tags belonging to boards, and card-tag assignments linking cards to tags. Work-cycle metadata and completed history should be structured rather than hidden inside a single board payload.

Initial model shape:

- `Profile`: app-owned profile keyed by Supabase user id.
- `Project`: personal project/workspace owned by one user.
- `Board`: board owned by one user, optionally grouped under a project.
- `BoardColumn`: ordered columns within a board.
- `Card`: ordered cards within a column, with title, rich content, priority, timestamps, and metadata needed by future search.
- `Tag`: board-scoped tag definitions.
- `CardTag`: many-to-many card/tag assignment.
- `BoardWorkCycle`: active work-cycle settings for a board, including start date and completed column.
- `CompletedWorkCycle`: archived cycle metadata.
- `CompletedWorkCycleCard`: readonly archived card snapshots.
- `CompletedWorkCycleCardTag`: archived tag snapshots or references for history display.

Use app-generated string IDs so SQLite and Postgres can share the same identifier strategy. Prefer portable scalar columns for core state. Use text for rich card content and avoid Postgres-only field types in the local SQLite model unless the production-only behavior is explicitly isolated.

Alternatives considered:

- Keep one JSON payload per board: simpler migration, but poor for ownership, search, collaboration, and partial updates.
- Fully normalize every rich content detail: too much schema churn for editor content that is naturally document-like.

### SQLite remains local, but Postgres is canonical for production behavior

Prisma migrations are provider-specific, so SQLite local development and Postgres production cannot be treated as one identical migration stream. The implementation should use a canonical app model with provider-specific Prisma schema/migration handling, or another explicit workflow that keeps SQLite and Postgres shapes intentionally aligned.

The local SQLite database should be a convenience for development and tests, not the final authority on production database behavior. Any behavior involving Supabase Auth, connection pooling, Postgres constraints/indexes, extensions, or RLS must be validated against a Postgres/Supabase-like environment.

Alternatives considered:

- Use Postgres for all local development: more faithful to production but heavier for the current app.
- Use SQLite only everywhere: simplest operationally, but weak fit for Supabase Auth, future collaboration, and production integrations.

### Authenticated production data is server-backed

After login, the app should load durable data from the authenticated API and save through the authenticated API. Browser storage may remain useful for anonymous/static/local mode, transient UI state, app-shell caching, or an explicit legacy import path, but it should not be the source of truth for authenticated production boards.

Existing browser data should be importable into a user's first default project/board so current users do not lose work when moving into authenticated persistence.

Alternatives considered:

- Keep localStorage authoritative and sync opportunistically: preserves offline editing but complicates conflict handling, account switching, and production consistency.
- Drop browser storage with no import: simpler, but unnecessarily risks user data loss.

## Risks / Trade-offs

- Prisma provider drift between SQLite and Postgres -> Keep the model portable, document provider-specific differences, and include at least one Postgres validation path before production rollout.
- Supabase Auth token verification latency or outage -> Centralize auth verification, define clear unauthenticated/error responses, and avoid scattering token logic through handlers.
- Prisma queries accidentally omit owner scoping -> Encapsulate data access in services/repositories and add tests that attempt cross-user reads and writes.
- Legacy board import may duplicate or corrupt user data -> Make import explicit/idempotent and only run when the destination default board is empty or when the user confirms import.
- Structured schema migration may miss fields currently embedded in `BoardState` -> Map every current board feature into the model and add round-trip tests for columns, cards, rich content, priorities, tags, background, active work cycle, and history.
- PWA expectations may be confused by authenticated network requirements -> Distinguish app-shell offline availability from cloud data availability in UI states and README docs.
- Future collaboration may require different write granularity -> Use structured rows and timestamps now, but avoid overbuilding collaboration semantics until the product direction is confirmed.

## Migration Plan

1. Add Prisma schema and local SQLite development workflow for the structured app model.
2. Add Supabase/Postgres configuration and production database workflow without wiring client behavior yet.
3. Introduce Supabase Auth verification in the server and profile provisioning for authenticated users.
4. Build authenticated project/board API routes backed by Prisma with owner-scoped queries.
5. Add a legacy import path from current browser board state or existing single-payload SQLite state into the structured model.
6. Update the client to load/save authenticated board data through the new API and show unauthenticated, loading, network error, and empty states.
7. Keep or isolate static/local anonymous storage behavior as a non-production convenience.
8. Validate with unit/integration tests, including cross-user authorization tests and structured persistence round trips.
9. Update README and deployment docs with Supabase, Prisma, SQLite, and PWA behavior.

Rollback strategy: keep the existing static/local storage behavior available until the authenticated path is verified. If production rollout fails, disable authenticated persistence routing and redeploy the previous static/local mode while preserving database migrations for investigation.

## Open Questions

- Local development defaults to SQLite for now. Postgres/Supabase verification remains a required production-readiness step because Prisma migration engine execution and a real Supabase project were not available in this worktree.
- The first authenticated load automatically imports browser board data only when the authenticated destination board is empty. If authenticated data already exists, local data is not silently imported over it.
- Projects are present in the data model, but the first UI iteration keeps the product feeling like a single personal board by creating a default personal project behind the scenes.
- RLS is deferred until after the Node API authorization boundary is stable. The server currently treats verified Supabase user id plus owner-scoped Prisma queries as the primary authorization boundary.
