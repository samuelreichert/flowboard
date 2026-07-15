## MODIFIED Requirements

### Requirement: README presents current Flowboard capabilities

The project README SHALL describe Flowboard as a Prisma-backed workflow product
with structured persistence, SQLite local development, Supabase Postgres
production persistence, Supabase Auth, rich cards, priorities, tags, work
cycles, completed history, responsive app shell, and theme selection.

#### Scenario: Reader reviews project capabilities

- **WHEN** a reader opens the README
- **THEN** the README describes the app's current board, card, metadata, theme, rich editing, auth, and structured persistence capabilities
- **AND** the README does not describe board localStorage as a product persistence mode
- **AND** the README does not present Flowboard as local-first

### Requirement: README documents offline and deployment behavior

The project README SHALL document local SQLite development, production Supabase
Postgres deployment, and PWA app-shell behavior without promising offline
board-data durability.

#### Scenario: Developer chooses a run mode

- **WHEN** a developer reads setup and deployment guidance
- **THEN** the README explains that local development uses Prisma SQLite
- **AND** production uses Supabase Auth with Prisma-backed Supabase Postgres

#### Scenario: User evaluates offline support

- **WHEN** a reader looks for offline behavior
- **THEN** the README explains that the service worker caches the app shell
- **AND** durable board saves require the Prisma API
