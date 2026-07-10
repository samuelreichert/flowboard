# structured-board-persistence Specification

## Purpose
Defines the structured relational persistence model for authenticated Flowboard data across SQLite development and Supabase Postgres production.

## Requirements
### Requirement: Board data is stored in structured relational records
The system SHALL persist authenticated Flowboard data as structured relational records instead of a single board-state payload.

#### Scenario: User creates a default board
- **WHEN** an authenticated user starts using Flowboard without existing app data
- **THEN** the system creates structured records for the user's default project, board, columns, cards, tags, and board metadata as needed

#### Scenario: Board is reloaded
- **WHEN** an authenticated user reloads Flowboard after editing a board
- **THEN** the system reconstructs the board from structured persisted records

### Requirement: Structured persistence preserves current board features
The system SHALL preserve existing board behavior through the structured persistence model.

#### Scenario: Rich board content is saved
- **WHEN** an authenticated user saves columns, cards, rich card content, priorities, tags, background, active work-cycle metadata, or completed work history
- **THEN** the saved data remains available after reload through authenticated persistence

#### Scenario: Tag context is saved
- **WHEN** an authenticated user assigns multiple tags to a card
- **THEN** the system persists the board-scoped tag definitions and card-tag assignments

#### Scenario: Completed history is saved
- **WHEN** an authenticated user completes work and archives cards into history
- **THEN** the system persists completed work-cycle metadata and readonly archived card snapshots

### Requirement: Persistence records are scoped to an owner
The system SHALL associate every authenticated project, board, column, card, tag, and history record with an owner directly or through an owner-scoped parent.

#### Scenario: User-owned board records are queried
- **WHEN** the system loads board records for an authenticated user
- **THEN** only records owned by that user or reachable through that user's owned parent records are included

#### Scenario: New board records are created
- **WHEN** an authenticated user creates project or board data
- **THEN** the system stores ownership so later reads and writes can be scoped to that user

### Requirement: SQLite local schema mirrors the production app model
The system SHALL keep the local SQLite development database shaped around the same Flowboard-owned entities used by production Supabase Postgres.

#### Scenario: Local database is initialized
- **WHEN** the local development database is created
- **THEN** it contains structured app tables for profiles, projects, boards, columns, cards, tags, card-tag assignments, and history-oriented records

#### Scenario: Production database is initialized
- **WHEN** the production Supabase Postgres database is migrated
- **THEN** it contains the corresponding structured app tables needed by the authenticated API

#### Scenario: Provider-specific behavior is required
- **WHEN** a database behavior depends on Postgres-specific features, constraints, extensions, pooling, or Supabase Auth integration
- **THEN** the behavior is validated against a Postgres or Supabase-like database rather than only SQLite

### Requirement: Existing local board data can be imported
The system SHALL provide a safe path to import existing browser or legacy single-payload board data into the authenticated structured model.

#### Scenario: Authenticated user has local board data
- **WHEN** an authenticated user has existing local board data and no structured destination board data
- **THEN** the system can import the local board into the user's default project and board without losing current columns, cards, tags, background, active work-cycle metadata, or history

#### Scenario: Import target already contains data
- **WHEN** the import destination already contains structured board data
- **THEN** the system avoids silently overwriting or duplicating existing authenticated board data
