## Context

Flowboard already has the core pieces of the target product architecture:
Supabase Auth, a Node API, Prisma clients for SQLite and Postgres, structured
board tables, and owner-scoped board persistence. The remaining conceptual
roughness is at the boundary between local development and production.

The local environment should remain pleasant: a developer can run the app
against SQLite without configuring Supabase. But this should be implemented as
a server-side development principal, not as a separate `/api/local/*` endpoint
family and not as browser localStorage persistence.

## Goals / Non-Goals

**Goals:**

- Make the durable board API endpoint shape the same in local development and
  production.
- Keep SQLite as the local development database through Prisma.
- Require Supabase Auth for production durable board access.
- Provide an explicit local development principal for no-auth SQLite runs.
- Remove board localStorage persistence and legacy single-payload API concepts
  from current product docs/specs.
- Keep PWA app-shell caching without promising offline-durable board editing.

**Non-Goals:**

- Add realtime collaboration, sharing, teams, billing, or RLS enforcement.
- Replace Supabase Auth for production identity.
- Remove local SQLite development.
- Remove localStorage for non-database UI preferences such as theme.
- Design a data migration from old browser localStorage data.

## Endpoint Direction

The product API should have one durable board surface:

```text
GET /api/projects
GET /api/boards/default
GET /api/boards/:id
PUT /api/boards/:id
GET /api/profile
PUT /api/profile
```

Local development and production should differ by principal resolution, not by
endpoint name.

```text
                        ┌──────────────────────┐
Browser board client ──▶│ /api/boards/default  │
                        └──────────┬───────────┘
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │ Resolve principal    │
                        └──────┬────────┬──────┘
                               │        │
                  local SQLite │        │ Supabase configured /
                  dev mode     │        │ production mode
                               ▼        ▼
                   ┌─────────────┐  ┌──────────────┐
                   │ Dev user id │  │ Supabase user │
                   └──────┬──────┘  └──────┬───────┘
                          ▼                ▼
                        Prisma structured persistence
```

This avoids teaching the client that local persistence is a different product
API. It also makes accidental production exposure easier to test: when local dev
principal mode is disabled, unauthenticated durable board requests must fail.

## Principal Resolution

Introduce a focused server abstraction, for example `createPrincipalResolver`,
with behavior equivalent to:

1. If a request has valid Supabase credentials, return the verified Supabase
   user principal.
2. Else, if explicit local development principal mode is enabled, return the
   fixed local development principal.
3. Else, return unauthenticated.

Local development principal mode should be gated narrowly. Reasonable gates:

- `PRISMA_PROVIDER=sqlite`
- and either `--dev` or an explicit environment variable such as
  `FLOWBOARD_LOCAL_DEV_AUTH=true`
- and not when `PRISMA_PROVIDER=postgresql`

The exact gate can be decided during implementation, but the important property
is that production/Postgres modes cannot silently enable unauthenticated board
access.

## Client Data Flow

The client should use one board API module for durable board operations. It can
attach a bearer token when a Supabase session exists, but it should not switch
to `/api/local/*` when signed out.

For no-auth local SQLite development:

- the client calls `/api/boards/default`
- the server resolves the local development principal
- Prisma reads/writes the local SQLite records

For production:

- the client calls the same endpoint
- the server requires a valid Supabase principal
- Prisma reads/writes Supabase Postgres records scoped to that user

## Persistence Model

Durable board state should only come from Prisma-backed structured records.
Browser memory is acceptable as transient UI state after hydration. Browser
localStorage may remain for UI preferences such as theme, but not for board
columns, cards, tags, active work cycles, or completed work history.

## Documentation Model

README and running-mode docs should use product language:

- "Prisma-backed persistence"
- "SQLite local development"
- "Supabase Postgres production"
- "Supabase Auth production identity"

They should avoid describing Flowboard as local-first or browser-storage based.

## Risks

- A local development principal can become a production vulnerability if enabled
  too broadly. Mitigate with narrow gating and tests proving Postgres/production
  unauthenticated requests are rejected.
- Removing local endpoint names may require careful client state handling so
  signed-out local development still loads smoothly.
- Existing tests may encode localStorage seeding assumptions. Mitigate by
  replacing them with in-memory test helpers or API-backed fixtures.

## Open Questions

- Should local development principal mode be enabled by default for
  `npm run dev`, or require an explicit `FLOWBOARD_LOCAL_DEV_AUTH=true` flag?
- Should `npm start` with SQLite also allow the local development principal, or
  should no-auth local mode be development-only?
- Should profile endpoints also support the local development principal, or
  should local no-auth mode expose settings without profile editing?
