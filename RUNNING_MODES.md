# Flowboard Running Modes

This file is the source of truth for Flowboard runtime and persistence modes.
When changing auth, database, deployment, or local development behavior, update
this matrix first so future humans and AI agents know which mode to use.

## Recommended Defaults

| Situation                                          | Use this mode                          | Why                                                                                      |
| -------------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------- |
| Everyday local app work                            | Local Prisma SQLite mode               | Local board data is durable without auth and does not use browser storage as a database. |
| Local work on authenticated board/profile behavior | Local authenticated Prisma SQLite mode | Exercises Supabase session handling and the same structured tables used by production.   |
| Production authenticated app                       | Supabase Auth with Prisma Postgres     | This is the durable, cross-device, multi-user path.                                      |
| Static UI-only checks                              | `npm run dev:static`                   | Useful for frontend rendering only; board data is in memory and is not durable.          |

## Running Modes

| Mode                                      | Command / host                                          | Auth                                                           | Board persistence                                                                                                                                                                                                        | DB configuration                                                                                                           | Client env                                                                                                                                                     | Server env                                                                                                            | Notes                                                                                     |
| ----------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Local Prisma SQLite                       | `npm run dev`                                           | Local development principal when Supabase browser env is empty | Prisma structured tables read through bootstrap/card-detail/history/detail resources; card, column, tag, card-tag, board settings, work-cycle settings, work completion, and clear board save through resource mutations | `PRISMA_PROVIDER=sqlite`; `DATABASE_URL=file:./data/flowboard.local.db`                                                    | Leave `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_FLOWBOARD_API_URL` empty                                                                 | Optional `PORT`; defaults to Prisma SQLite when `PRISMA_PROVIDER` is unset                                            | This is the default local mode. Use this for normal development.                          |
| Local production build with Prisma SQLite | `npm run build:local`, then `npm start`                 | Local development principal only with explicit server flag     | Prisma structured tables read through bootstrap/card-detail/history/detail resources; card, column, tag, card-tag, board settings, work-cycle settings, work completion, and clear board save through resource mutations | `PRISMA_PROVIDER=sqlite`; `DATABASE_URL=file:./data/flowboard.local.db`                                                    | Leave Supabase browser env empty for no-auth local mode                                                                                                        | `FLOWBOARD_LOCAL_DEV_AUTH=true`; optional `PORT`                                                                      | Use this to test a production bundle against the local Node API.                          |
| Local authenticated Prisma SQLite         | `npm run dev` with Supabase env configured              | Supabase Auth                                                  | Authenticated reads use bootstrap/card-detail/history/detail resources; card, column, tag, card-tag, board settings, work-cycle settings, work completion, and clear board save through resource mutations               | `PRISMA_PROVIDER=sqlite`; `DATABASE_URL=file:./data/flowboard.local.db`                                                    | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`; optional OAuth flags; optional `VITE_SUPABASE_AVATAR_BUCKET`                                             | `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`; `PRISMA_PROVIDER=sqlite`; `DATABASE_URL`                                  | Best mode for local auth, profile, avatar, and structured board work.                     |
| Local authenticated Prisma Postgres       | `npm run dev` with Supabase and Postgres env configured | Supabase Auth                                                  | Authenticated reads use bootstrap/card-detail/history/detail resources; card, column, tag, card-tag, board settings, work-cycle settings, work completion, and clear board save through resource mutations               | `PRISMA_PROVIDER=postgresql`; `DATABASE_URL=postgresql://...`; `DIRECT_URL=postgresql://...` for Prisma migration commands | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`; optional OAuth flags; optional `VITE_SUPABASE_AVATAR_BUCKET`                                             | `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`; `PRISMA_PROVIDER=postgresql`; `DATABASE_URL`                              | Use when reproducing production DB behavior locally.                                      |
| Production authenticated app              | Vercel app shell plus same-origin Node API Function     | Supabase Auth                                                  | Authenticated reads use bootstrap/card-detail/history/detail resources; card, column, tag, card-tag, board settings, work-cycle settings, work completion, and clear board save through resource mutations               | Supabase Postgres via Prisma                                                                                               | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, OAuth flags, `VITE_SUPABASE_AVATAR_BUCKET`; leave `VITE_FLOWBOARD_API_URL` empty for the same-origin API | `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `PRISMA_PROVIDER=postgresql`, `DATABASE_URL`; `DIRECT_URL` for migrations | The Vercel Function is discovered from `api/[...path].ts`; deploy and migrate separately. |
| Static UI-only dev                        | `npm run dev:static`                                    | None by default                                                | In-memory only                                                                                                                                                                                                           | None                                                                                                                       | Leave API/auth env empty                                                                                                                                       | None                                                                                                                  | This mode is not a DB mode. Refreshing the page loses board data.                         |

## Database Modes

| DB mode                       | Data shape                                                                                  | Used by                                                                                   | Configuration                                                                                                                                | Durable across devices?           | Current status                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | -------------------------------------------------------------- |
| Prisma SQLite structured DB   | Profiles, projects, boards, columns, cards, tags, active work cycles, completed work cycles | Default local development, local production build, local authenticated development, tests | `PRISMA_PROVIDER=sqlite`; `DATABASE_URL=file:./data/flowboard.local.db`                                                                      | Only on that local machine/server | Preferred local DB mode.                                       |
| Prisma Postgres structured DB | Same structured schema as Prisma SQLite                                                     | Production authenticated app and production-like local testing                            | `PRISMA_PROVIDER=postgresql`; `DATABASE_URL=postgresql://...`; `DIRECT_URL=postgresql://...` for migrations                                  | Yes, when hosted                  | Preferred production DB mode.                                  |
| Supabase Auth / Storage       | Supabase-managed auth users and optional avatar files                                       | Authenticated modes                                                                       | `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, OAuth flags, `VITE_SUPABASE_AVATAR_BUCKET` | Yes, when hosted                  | Supabase Auth owns identity; Prisma owns Flowboard app tables. |
| Browser memory                | Board state only for the current page session                                               | React UI state before and after API hydration                                             | No env required                                                                                                                              | No                                | Not durable; this is not a database.                           |
| Browser `localStorage`        | Theme preference only                                                                       | Theme selection                                                                           | No env required                                                                                                                              | Per browser                       | Board data must not be stored here.                            |

## Selection Rules

- Local no-auth board data must use Prisma SQLite through the local Node API.
- Production board data must use Prisma Postgres, normally Supabase Postgres.
- Supabase is enabled in the browser only when both `VITE_SUPABASE_URL` and
  `VITE_SUPABASE_PUBLISHABLE_KEY` are present.
- Without Supabase browser config, `npm run dev` uses the local no-auth Prisma
  path by calling the same bootstrap, card-detail, completed-history,
  archived-card detail, resource-mutation, and clear-board command
  endpoints as production.
- The local development principal is enabled only when `PRISMA_PROVIDER=sqlite`
  and either the server is running with `--dev` or
  `FLOWBOARD_LOCAL_DEV_AUTH=true` is set.
- The local development principal is never enabled for
  `PRISMA_PROVIDER=postgresql`; unauthenticated durable board requests must be
  rejected in Postgres and production modes.
- `VITE_FLOWBOARD_API_URL` controls the base URL for authenticated and local API
  calls. Leave it empty when the API is served from the same origin.
- `PRISMA_PROVIDER=sqlite` selects the local Prisma SQLite schema/client.
  `PRISMA_PROVIDER=postgresql` selects the production Postgres schema/client.
- On a fresh SQLite checkout, run `npm run db:migrate:sqlite` before `npm run
dev`; it creates the local SQLite file and applies the tracked migrations.
- Do not add a browser-storage board fallback. If the API is unavailable,
  surface that persistence is unavailable instead of writing board data to
  localStorage.

## Is localStorage Still Used?

Not for board data.

Flowboard may still use browser `localStorage` for non-database UI preferences,
currently `flowboardThemePreference`. Board data must be stored in Prisma-backed
databases only: SQLite locally and Supabase Postgres in production.
