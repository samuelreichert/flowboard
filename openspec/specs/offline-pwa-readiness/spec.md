# offline-pwa-readiness Specification

## Purpose

TBD - created by archiving change improve-project-readiness-and-pwa. Update Purpose after archive.

## Requirements

### Requirement: App shell is available offline

The system SHALL cache the production app shell and bundled static assets so Flowboard can load offline after installation or first successful load.

#### Scenario: User reloads after app shell is cached

- **WHEN** the user has previously loaded the production app and then loses network access
- **THEN** the system loads the Flowboard application shell from cache

### Requirement: Board storage is not browser-offline durable

The system SHALL NOT use browser localStorage as a durable board database when the Prisma API is unavailable.

#### Scenario: Local Prisma API is unavailable

- **WHEN** the app is running in local SQLite mode and the board API cannot be reached
- **THEN** the system reports that durable board persistence is unavailable
- **AND** the system does not load board data from browser localStorage

#### Scenario: Authenticated user edits while production API is unavailable

- **WHEN** an authenticated user attempts to change server-backed board data while the production API is unavailable
- **THEN** the system communicates that durable saving is unavailable instead of treating the edit as safely persisted

### Requirement: Prisma API persistence owns durable board data

The system SHALL use the canonical board API backed by Prisma as the durable source for local SQLite and production Postgres board data.

#### Scenario: Local API hydration fails

- **WHEN** the app is running in local SQLite mode and the canonical board API cannot be reached
- **THEN** the system shows an unavailable or retry state rather than silently falling back to a different durable board source

#### Scenario: Local API write fails

- **WHEN** the app is running in local SQLite mode and a canonical board API write fails
- **THEN** the system reports that durable saving is unavailable instead of persisting board data to browser localStorage

#### Scenario: Static UI-only mode is used

- **WHEN** the app is running without the Prisma API
- **THEN** any board state is treated as in-memory UI state only

#### Scenario: Authenticated production data load fails

- **WHEN** the app is running in authenticated production mode and server-backed board data cannot be loaded
- **THEN** the system shows an unavailable or retry state rather than silently falling back to a different durable board source

### Requirement: PWA metadata supports installation

The system SHALL provide web app manifest metadata and install icons suitable for browser PWA installation.

#### Scenario: Browser inspects PWA metadata

- **WHEN** a browser loads the production app
- **THEN** the app exposes a manifest with Flowboard name, description, theme color, and required icons
