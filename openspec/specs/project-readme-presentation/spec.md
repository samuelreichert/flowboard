# project-readme-presentation Specification

## Purpose

TBD - created by archiving change improve-project-readiness-and-pwa. Update Purpose after archive.

## Requirements

### Requirement: README presents current Flowboard capabilities

The project README SHALL describe current Flowboard capabilities, including columns, cards, rich card content, priorities, tags, the responsive app shell, theme selection, Prisma-backed persistence, SQLite local development, Supabase Postgres production, and offline app-shell behavior.

#### Scenario: Reader reviews project capabilities

- **WHEN** a reader opens the README
- **THEN** the README describes the app's current board, card, metadata, theme, rich editing, and storage capabilities
- **AND** the README does not advertise board background customization as a current primary feature
- **AND** the README does not describe board localStorage as a product persistence mode
- **AND** the README does not present Flowboard as local-first

### Requirement: README includes a product screenshot

The project README SHALL include a screenshot that shows the latest actual Flowboard interface and SHALL preserve historical screenshots for earlier UI versions.

#### Scenario: Reader previews the current app visually

- **WHEN** a reader opens the README on GitHub
- **THEN** the README displays the latest Flowboard UI screenshot before any historical screenshots

#### Scenario: Reader reviews historical UI screenshots

- **WHEN** a reader looks for earlier visual versions
- **THEN** the README or screenshot assets preserve the first version, second version, and latest UI screenshots with clear labeling or filenames

### Requirement: README documents offline and deployment behavior

The project README SHALL document how the app behaves in local SQLite mode, production Supabase Postgres mode, static UI-only mode, offline/PWA app-shell mode, and Vercel analytics-enabled deployment mode.

#### Scenario: Developer chooses a run mode

- **WHEN** a developer reads setup and deployment guidance
- **THEN** the README points to the running-mode matrix for local SQLite, Supabase Postgres, auth, no-auth, and static UI-only choices

#### Scenario: User evaluates offline support

- **WHEN** a reader looks for offline behavior
- **THEN** the README explains that PWA support is app-shell caching and not offline-durable board editing

#### Scenario: Developer enables Vercel analytics

- **WHEN** a developer prepares a Vercel deployment
- **THEN** the README documents that Web Analytics and Speed Insights must be enabled in the Vercel project
- **AND** the README describes the post-deployment validation checks for CSP, analytics requests, page views, and vitals
