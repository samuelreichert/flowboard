## 1. Endpoint Contract

- [x] 1.1 Remove any remaining `/api/local/*` board endpoint contract from the
      client and server plan.
- [x] 1.2 Keep `/api/projects`, `/api/boards/default`, and `/api/boards/:id` as
      the canonical durable board endpoints.
- [x] 1.3 Decide and document the exact gate for local development principal
      mode.
- [x] 1.4 Ensure production/Postgres-like modes reject unauthenticated durable
      board endpoint requests.

## 2. Principal Resolution

- [x] 2.1 Introduce a server-side principal resolver that can return either a
      Supabase principal or an explicitly enabled local development principal.
- [x] 2.2 Route board/project APIs through the principal resolver instead of a
      Supabase-only verifier or a separate local route.
- [x] 2.3 Keep profile provisioning and board ownership scoped to the resolved
      principal id.
- [x] 2.4 Add tests for Supabase principal, local development principal,
      unauthenticated production rejection, and invalid token rejection.

## 3. Client Data Flow

- [x] 3.1 Replace local board API client calls with the canonical board API
      calls.
- [x] 3.2 Attach Supabase bearer tokens when a session exists, without changing
      endpoint paths.
- [x] 3.3 Keep board state in memory only between API hydration/save cycles.
- [x] 3.4 Surface API load/save failures as persistence-unavailable states
      rather than falling back to browser board storage.

## 4. Remove Prototype Persistence Concepts

- [x] 4.1 Delete legacy anonymous `/api/board` code and tests if still present.
- [x] 4.2 Remove board localStorage reads/writes and migration tests from current
      runtime behavior.
- [x] 4.3 Keep localStorage limited to non-database UI preferences.
- [x] 4.4 Update app tests to seed board state through API fixtures or explicit
      in-memory helpers, not `columnsList` localStorage.

## 5. Documentation And OpenSpec

- [x] 5.1 Update `RUNNING_MODES.md` to describe canonical endpoints and local
      development principal mode.
- [x] 5.2 Update README language so Flowboard is presented as a Prisma-backed
      product with SQLite local development and Supabase Postgres production.
- [x] 5.3 Update affected OpenSpec specs to remove local-first/browser-storage
      board requirements.
- [x] 5.4 Document that PWA support is app-shell caching, not offline-durable
      board editing.

## 6. Verification

- [x] 6.1 Run typecheck.
- [x] 6.2 Run focused server route/principal tests.
- [x] 6.3 Run focused storage/client board API tests.
- [x] 6.4 Run the broader app test suite or document any environment limitation.
- [ ] 6.5 Smoke test local SQLite development from a clean database.

      Blocked in this isolated worktree because it has no local `node_modules`;
      Node/TypeScript ESM package resolution does not fully use the shared
      checkout dependencies for server startup or generated Prisma runtime
      imports.
