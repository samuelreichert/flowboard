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
