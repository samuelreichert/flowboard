# Flowboard

Flowboard comes with the ability to:

- create columns
- create cards
- edit and move cards
- remove cards

## Setup

Dependencies:

- Node 24
- npm

Installing packages: `npm install`

### `npm run dev`

Runs the local Node server, the SQLite database and Vite in development mode.
Open the local URL printed in the terminal to view the app.

The page will reload if you make frontend edits.

### `npm run dev:static`

Runs Vite without the local API. This matches the static Vercel deployment:
each visitor's board is saved in their browser storage.

### SQLite storage

When using `npm run dev`, the complete board state is also saved locally in
`data/flowboard.db`: columns, card order, card content and the selected
background. Existing browser storage is migrated automatically when the
database is empty.

To create a backup, stop the server and copy `data/flowboard.db`.

### `npm start`

Serves the production build and the SQLite API locally. To create a build that
connects to that local API, run `npm run build:local` first.

### `npm run test`

Launches the Vitest runner in watch mode.

### `npm run test:run`

Runs the test suite once.

### `npm run build`

Type-checks the app and builds it for production to the `dist` folder.

## Deploying to Vercel

Import the repository in Vercel and deploy it with the included `vercel.json`.
Vercel runs `npm run build` and publishes the static `dist` folder.

The hosted portfolio version intentionally uses browser storage only. SQLite
depends on a persistent local filesystem, which Vercel Functions do not
provide. If shared cross-device storage is needed later, connect an
authenticated hosted database API and set `VITE_BOARD_API_URL` at build time.
