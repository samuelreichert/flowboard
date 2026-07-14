# Flowboard

Flowboard is a focused local-first workflow board for organizing columns, cards, priorities, tags, rich notes, and theme-aware app workspaces.

![Flowboard latest app shell with workflow columns, cards, priorities, and theme controls](public/flowboard-screenshot-latest.jpg)

## UI History

- First version: [background-focused board](public/flowboard-screenshot-v1-background.png)
- Second version: [dark app-shell board](public/flowboard-screenshot-v2-app-shell.jpg)
- Latest version: [light app-shell board](public/flowboard-screenshot-latest.jpg)

## Features

- Create, rename, reorder, and remove workflow columns.
- Create, edit, move, and delete cards.
- Add rich card content with Markdown-friendly formatting, links, task lists, code blocks, lists, blockquotes, alignment, and images.
- Assign Low, Medium, or High priority to cards.
- Create reusable board tags and assign them to cards.
- Use a responsive app shell with a collapsible sidebar, board actions, and system/light/dark theme controls.
- Save boards locally in the browser, with optional local SQLite persistence for development and self-hosted local runs.
- Load the production app shell offline after the PWA service worker has cached it.

## Setup

Dependencies:

- Node 24
- npm

Install packages:

```bash
npm install
```

Copy the example environment file when you want to run the authenticated
backend path:

```bash
cp .env.example .env
```

The app supports two persistence modes:

- Local/static mode uses browser storage and the legacy optional SQLite mirror.
- Authenticated mode uses Supabase Auth, the Node API, Prisma, and structured
  database tables.

### `npm run dev`

Runs the local Node server, the SQLite database, and Vite in development mode. Open the local URL printed in the terminal to view the app.

The complete board state is saved to browser storage first and mirrored to the local SQLite API at `/api/board` when that API is available.

When Supabase browser environment values are configured, the app shows a
Supabase magic-link sign-in flow and loads authenticated board data from
`/api/boards/default`. Authenticated saves are sent to `/api/boards/:id`.

### `npm run dev:static`

Runs Vite without the local API. This matches the static Vercel deployment: each visitor's board is saved in their browser storage.

### `npm start`

Compiles the local TypeScript server, then serves the production build and the SQLite API locally. To create a production app build that connects to that local API, run:

```bash
npm run build:local
```

### `npm run test`

Launches the Vitest runner in watch mode.

### `npm run test:run`

Runs the test suite once.

### `npm run build`

Type-checks the app and local TypeScript server, emits the compiled server to `dist-server`, and builds the production app to `dist`.

## Database and Auth Setup

Flowboard uses Supabase Auth for production identity and Prisma for app-owned
data. Prisma owns Flowboard tables such as profiles, projects, boards, columns,
cards, tags, card-tag assignments, active work cycles, and completed work
history. Prisma does not manage Supabase's internal `auth` schema.

Generate Prisma clients:

```bash
npm run db:generate
```

Local SQLite development uses:

```bash
PRISMA_PROVIDER=sqlite
DATABASE_URL=file:./data/flowboard.local.db
```

Run local schema generation and migration commands:

```bash
npm run db:generate:sqlite
npm run db:migrate:sqlite
npm run db:studio:sqlite
```

Production Supabase Postgres uses:

```bash
PRISMA_PROVIDER=postgresql
DATABASE_URL=postgresql://...
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_GOOGLE_OAUTH_ENABLED=true
VITE_SUPABASE_APPLE_OAUTH_ENABLED=false
VITE_SUPABASE_AVATAR_BUCKET=flowboard-profile-avatars
```

Apply production migrations with:

```bash
npm run db:deploy:postgres
```

The browser `VITE_*` Supabase values are public client configuration. Keep
database URLs, service-role keys, and any privileged Supabase secrets server-side
only.

### Profile Avatar Storage

Flowboard stores profile avatar files in Supabase Storage and saves the public
URL plus object path on the app-owned profile record. The default bucket is:

```text
flowboard-profile-avatars
```

You can override it for a deployment with:

```text
VITE_SUPABASE_AVATAR_BUCKET=your-avatar-bucket
```

Create the bucket as a public Supabase Storage bucket so uploaded avatars can be
displayed through the public URL returned by the Supabase client. Avatar object
paths use this convention:

```text
<supabase-user-id>/avatar-<unique-id>.<extension>
```

Client-side validation accepts PNG, JPG, WebP, and GIF images up to 5 MB. When a
user replaces or removes an uploaded avatar, Flowboard clears the saved profile
reference and attempts to remove the previous object from the configured bucket.

### Social OAuth Setup

Flowboard uses one sign-in screen for new and returning users. Email magic links
remain available as the fallback, and social sign-in starts Supabase OAuth for
configured providers.

Public provider flags:

```bash
VITE_SUPABASE_GOOGLE_OAUTH_ENABLED=true
VITE_SUPABASE_APPLE_OAUTH_ENABLED=false
```

Google is enabled by default unless `VITE_SUPABASE_GOOGLE_OAUTH_ENABLED=false`.
Apple stays disabled until `VITE_SUPABASE_APPLE_OAUTH_ENABLED=true` because
Apple setup usually needs an Apple Developer account, service identifier,
provider secret, and stable HTTPS redirect URLs.

In Supabase Dashboard, configure Auth URL settings before testing OAuth:

```text
http://127.0.0.1:5173
http://localhost:5173
```

Add future deployed URLs before testing OAuth on Vercel or production:

```text
https://your-project.vercel.app
https://your-production-domain.com
```

Google OAuth setup:

- Create a Google OAuth web client in Google Cloud / Google Auth Platform.
- Add local and deployed app origins, such as `http://127.0.0.1:5173`.
- Add the Supabase Auth callback URL as an authorized redirect URI:
  `https://your-project-ref.supabase.co/auth/v1/callback`.
- Enable the Google provider in Supabase Auth and enter the Google client ID
  and client secret.

Apple OAuth setup:

- Configure Sign in with Apple in an Apple Developer account.
- Create the required service identifier and provider secret for web OAuth.
- Add the Supabase Auth callback URL:
  `https://your-project-ref.supabase.co/auth/v1/callback`.
- Plan to validate Apple with a stable HTTPS app URL. Local development can keep
  the Apple button disabled until these production-style URLs are ready.

Manual verification checklist:

- Email: request a magic link and confirm the app recognizes the returned
  Supabase session.
- Google: click "Continue with Google", complete provider consent, return to
  Flowboard, and confirm the authenticated board loads.
- Apple: when enabled, click "Continue with Apple", complete provider consent,
  return to Flowboard, and confirm the authenticated board loads.
- Board data: after any successful sign-in method, create or edit a card and
  confirm authenticated persistence works after refresh.

## Storage

Flowboard is local-first. Browser storage is the source of truth for interactive editing, so the board remains usable even when the optional API is unavailable.

When using `npm run dev` or `npm start` with a local API build, the complete board state is also saved locally in `data/flowboard.db`: columns, card order, card content, priorities, and tags. Existing browser storage is migrated automatically when the database is empty.

To create a backup, stop the server and copy:

```text
data/flowboard.db
```

Authenticated persistence is different: after sign-in, durable board data is
loaded from the authenticated API and saved through Prisma-backed structured
tables. Existing browser board data is imported into the first empty
authenticated board; if the authenticated board already contains data, the app
does not silently overwrite it.

## Offline PWA Behavior

The production build includes a web app manifest and service worker. After the app has loaded successfully once, the service worker caches the app shell and bundled assets so Flowboard can reopen offline.

Offline editing continues through browser storage. If `VITE_BOARD_API_URL` points at a local SQLite API and that API is unavailable, Flowboard keeps the local board intact and does not block edits.

For authenticated production use, the PWA promise is app-shell availability.
Authenticated board edits are only durably saved after the authenticated API
confirms persistence.

## Deploying to Vercel

Import the repository in Vercel and deploy it with the included `vercel.json`. Vercel runs `npm run build` and publishes the static `dist` folder.

The hosted portfolio version intentionally uses browser storage only. SQLite depends on a persistent local filesystem, which Vercel Functions do not provide. If shared cross-device storage is needed later, connect an authenticated hosted database API and set `VITE_BOARD_API_URL` at build time.

For the authenticated production backend, deploy a Node API runtime with
Supabase Auth verification, Prisma, and Supabase Postgres. Set
`VITE_FLOWBOARD_API_URL` if the browser should call an API origin other than the
current site origin.
