## 1. Dependencies And Configuration

- [x] 1.1 Add Prisma, Prisma client, Supabase auth/client dependencies, and any required runtime adapters.
- [x] 1.2 Add environment configuration for local SQLite, Supabase Postgres, Supabase project URL, and Supabase auth keys without exposing secrets to the client incorrectly.
- [x] 1.3 Define the Prisma schema workflow for SQLite local development and Supabase Postgres production, including how provider-specific migrations are generated and applied.
- [x] 1.4 Add npm scripts for Prisma generation, local SQLite migration/reset, production migration deployment, and database inspection.
- [x] 1.5 Document the local SQLite and production Supabase/Postgres setup expectations in development notes.

## 2. Structured Data Model

- [x] 2.1 Create Prisma models for profiles, projects, boards, board columns, cards, tags, and card-tag assignments.
- [x] 2.2 Create Prisma models for active board work-cycle settings, completed work cycles, archived card snapshots, and archived tag context.
- [x] 2.3 Use portable app-generated identifiers and scalar field choices that work across SQLite local development and Postgres production.
- [x] 2.4 Add ownership fields and relationships so every project, board, and child record is scoped to a Supabase user directly or through an owned parent.
- [x] 2.5 Add ordering, timestamps, and update/version fields needed for stable board rendering and future collaboration/search extension points.
- [x] 2.6 Generate and verify initial local SQLite and production Postgres migration artifacts according to the chosen Prisma workflow.

## 3. Server Auth Boundary

- [x] 3.1 Add a server auth helper that verifies Supabase session credentials and returns the authenticated user id.
- [x] 3.2 Add app profile provisioning keyed by the Supabase user id.
- [x] 3.3 Centralize unauthenticated, unauthorized, validation, and internal error JSON responses.
- [x] 3.4 Ensure auth errors do not expose tokens, secrets, database details, or private resource existence.
- [x] 3.5 Add tests for valid auth, missing auth, invalid auth, and profile provisioning behavior.

## 4. Prisma Persistence Services

- [x] 4.1 Add a Prisma client module with safe lifecycle handling for the Node server runtime.
- [x] 4.2 Implement owner-scoped project and board data access services.
- [x] 4.3 Implement structured board load logic that reconstructs the current board state from relational records.
- [x] 4.4 Implement structured board mutation logic for columns, cards, card order, rich content, priorities, tags, board background, and work-cycle metadata.
- [x] 4.5 Implement completed work persistence using structured history records and readonly archived card snapshots.
- [x] 4.6 Add cross-user access tests proving one authenticated user cannot read or mutate another user's records.
- [x] 4.7 Add round-trip persistence tests covering current board features through the structured model.

## 5. Authenticated API Routes

- [x] 5.1 Replace or isolate the anonymous production `/api/board` contract with authenticated project/board API routes.
- [x] 5.2 Add routes for loading a user's projects or default project/board.
- [x] 5.3 Add routes for loading one authenticated board with columns, cards, tags, metadata, and history.
- [x] 5.4 Add routes or mutations for creating and updating project, board, column, card, tag, and work-cycle data.
- [x] 5.5 Validate all incoming board-domain payloads before writing through Prisma.
- [x] 5.6 Derive ownership from the verified Supabase user rather than trusting client-supplied owner ids.
- [x] 5.7 Preserve any legacy anonymous board API only as an explicit local/static compatibility mode if still needed.

## 6. Client Auth And Data Flow

- [x] 6.1 Add Supabase client setup for browser sign-in, sign-out, and session state.
- [x] 6.2 Add authenticated app states for signed out, loading, loaded, network unavailable, unauthorized, and empty-board scenarios.
- [x] 6.3 Update board hydration to load authenticated server-backed board data after login.
- [x] 6.4 Update board writes to call authenticated API routes and surface durable-save failures.
- [x] 6.5 Keep browser storage limited to local/static mode, transient UI state, app-shell behavior, or explicit import staging for authenticated users.
- [x] 6.6 Ensure the authenticated PWA communicates network persistence requirements instead of implying offline edits are durably saved.

## 7. Legacy Data Import

- [x] 7.1 Add a mapper from the existing browser or legacy single-payload board state into structured project, board, column, card, tag, and history records.
- [x] 7.2 Add an import flow for authenticated users with local board data and no structured destination data.
- [x] 7.3 Prevent silent overwrite or duplication when the authenticated destination already contains structured data.
- [x] 7.4 Add tests proving imported data preserves columns, cards, rich content, priorities, tags, background, active work cycle, and completed history.

## 8. Verification, Security, And Documentation

- [x] 8.1 Run typecheck and the full test suite after backend and client changes.
- [x] 8.2 Add focused tests for malformed payloads, unauthenticated requests, unauthorized cross-user access, and failed persistence.
- [x] 8.3 Verify local SQLite development setup from a clean database.
- [ ] 8.4 Verify production-like Postgres/Supabase migration and API behavior in a configured test or staging environment.
- [x] 8.5 Update README setup, storage, PWA, deployment, and security/authentication notes.
- [x] 8.6 Record any remaining decisions about RLS, local Postgres verification, default project visibility, and import prompting before marking the change complete.
