## MODIFIED Requirements

### Requirement: Board data is stored in structured relational records

The system SHALL persist durable Flowboard board data as structured relational
records instead of browser localStorage or a single board-state payload.

#### Scenario: User creates a default board

- **WHEN** a resolved principal starts using Flowboard without existing app data
- **THEN** the system creates structured records for the principal's default project, board, columns, cards, tags, and board metadata as needed

#### Scenario: Board is reloaded

- **WHEN** a resolved principal reloads Flowboard after editing a board
- **THEN** the system reconstructs the board from structured persisted records

### Requirement: Structured persistence preserves current board features

The system SHALL preserve existing board behavior through the structured
Prisma persistence model in both local SQLite development and production
Supabase Postgres modes.

#### Scenario: Rich board content is saved

- **WHEN** a resolved principal saves columns, cards, rich card content, priorities, tags, background, active work-cycle metadata, or completed work history
- **THEN** the saved data remains available after reload through Prisma-backed persistence

#### Scenario: Tag context is saved

- **WHEN** a resolved principal assigns multiple tags to a card
- **THEN** the system persists the board-scoped tag definitions and card-tag assignments

#### Scenario: Completed history is saved

- **WHEN** a resolved principal completes work and archives cards into history
- **THEN** the system persists completed work-cycle metadata and readonly archived card snapshots

### Requirement: Persistence records are scoped to an owner

The system SHALL associate every durable project, board, column, card, tag, and
history record with an owner directly or through an owner-scoped parent.

#### Scenario: User-owned board records are queried

- **WHEN** the system loads board records for a resolved principal
- **THEN** only records owned by that principal or reachable through that principal's owned parent records are included

#### Scenario: New board records are created

- **WHEN** a resolved principal creates project or board data
- **THEN** the system stores ownership so later reads and writes can be scoped to that principal

### Requirement: Existing local board data can be imported

The system SHALL NOT depend on browser localStorage import as part of normal
durable product persistence.

#### Scenario: Browser localStorage contains legacy board data

- **WHEN** the app loads after the product has moved to Prisma-backed persistence
- **THEN** the system does not treat browser localStorage board keys as a supported durable board source

#### Scenario: Legacy import is needed

- **WHEN** maintainers need to migrate old prototype data
- **THEN** the migration path is handled as an explicit one-time tool or task, not as an automatic runtime fallback
