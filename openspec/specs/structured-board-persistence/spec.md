# structured-board-persistence Specification

## Purpose

Defines the structured relational persistence model for durable Flowboard data
across SQLite development and Supabase Postgres production.
## Requirements
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

#### Scenario: Column order is saved

- **WHEN** a resolved principal reorders board columns
- **THEN** the saved column order remains available after reload through Prisma-backed persistence

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

### Requirement: Browser storage is not a supported board database

The system SHALL NOT depend on browser localStorage import as part of normal board persistence behavior.

#### Scenario: Browser localStorage contains legacy board data

- **WHEN** Flowboard starts with Prisma-backed persistence enabled
- **THEN** the system does not treat browser localStorage board keys as a supported durable board source

#### Scenario: Static UI-only mode is used

- **WHEN** Flowboard runs without the Prisma API
- **THEN** any board state is treated as transient in-memory state rather than a supported database mode

### Requirement: Persisted board records support route target resolution

The system SHALL resolve route-addressed active cards and archived card
snapshots from the authenticated user's persisted board data, including
summary-first active card routes whose rich content is loaded separately.

#### Scenario: Authenticated user opens an active card route

- **WHEN** an authenticated user opens an active card route for a card in their
  loaded board bootstrap
- **THEN** the system resolves the card summary from that user's persisted board
  data
- **AND** the system opens the matching active card details after hydrating rich
  content from the active-card detail read model

#### Scenario: Authenticated user opens an archived card route

- **WHEN** an authenticated user opens an archived card route for a completed work-cycle card in their loaded board
- **THEN** the system resolves the completed work cycle and archived card snapshot from that user's persisted board data
- **AND** the system opens the matching archived card details

#### Scenario: Authenticated user opens route for unavailable board data

- **WHEN** an authenticated user opens a route-addressed card or history target before board data has finished loading
- **THEN** the system waits for the board load result before deciding whether the route target exists

#### Scenario: Authenticated user opens another user's route target

- **WHEN** an authenticated user opens a route-addressed card or history target that is not present in their accessible board data
- **THEN** the system treats the target as missing
- **AND** the system does not reveal whether the identifier belongs to another user's board

### Requirement: Route resolution preserves archived snapshot identity

The system SHALL route archived card details to the archived snapshot within its completed work cycle rather than to a mutable active-card record.

#### Scenario: Active card has been archived

- **WHEN** a card has been archived into completed work history
- **THEN** the archived card route opens the readonly archived snapshot
- **AND** the active board route does not recreate or open the removed active card

#### Scenario: Archived card shares an original card identifier

- **WHEN** an archived card snapshot stores an original active card identifier
- **THEN** the archived card route still resolves through the completed work-cycle ID and archived card ID
- **AND** the system does not depend on active-card presence to open the archived snapshot

### Requirement: Structured reads support summary-first board bootstrap

The system SHALL read the main board bootstrap response from structured
Prisma-backed records without requiring full board aggregate reconstruction.

#### Scenario: Bootstrap reads active board summaries

- **WHEN** the system loads main-board bootstrap data for a resolved principal
- **THEN** it reads board metadata, columns, active card summaries, board tags,
  and active work-cycle state from structured records scoped to that principal
- **AND** it does not read completed work history for the bootstrap response
- **AND** it does not include rich card content in active card summaries

#### Scenario: Bootstrap preserves display order

- **WHEN** the system returns columns and active card summaries in the bootstrap
  response
- **THEN** columns are ordered according to persisted column order
- **AND** cards are ordered according to persisted card order within their
  columns

#### Scenario: Bootstrap creates missing main board records

- **WHEN** a resolved principal requests main-board bootstrap data without an
  existing board
- **THEN** the system creates the required structured profile, project, board,
  and active work-cycle records as needed
- **AND** returns an empty-board bootstrap response using the normal lean
  response shape

### Requirement: Structured reads load rich active card detail separately

The system SHALL read rich active card content through a card-detail query scoped
to the resolved principal's main board.

#### Scenario: Active card detail reads rich content

- **WHEN** the system loads active card detail for a resolved principal
- **THEN** it reads the card from structured card records reachable from that
  principal's main board
- **AND** it returns the rich card content, created timestamp, and editable
  metadata

#### Scenario: Active card detail is owner scoped

- **WHEN** the requested card exists but is not reachable from the resolved
  principal's main board
- **THEN** the system does not return the card

### Requirement: Structured persistence supports operation-level active card writes

The system SHALL persist active card create, update, move, and delete operations
with focused relational writes instead of replacing the full board aggregate.

#### Scenario: Active card is created

- **WHEN** a resolved principal creates an active card in a board column they
  own
- **THEN** the system inserts the active card row and active card-tag assignment
  rows required for that card
- **AND** it does not rewrite unrelated columns, cards, tags, work-cycle rows,
  or completed history rows

#### Scenario: Active card fields are updated

- **WHEN** a resolved principal updates an active card's title, content,
  priority, or tag assignments
- **THEN** the system updates that card row and its active card-tag assignment
  rows
- **AND** it does not rewrite unrelated board data

#### Scenario: Active card is moved

- **WHEN** a resolved principal moves an active card within or across columns
  in their main board
- **THEN** the system updates that card's column and ordering information
- **AND** it updates only ordering rows needed to preserve deterministic order
  for the affected column set
- **AND** it does not rewrite unrelated columns, tags, rich card content,
  work-cycle rows, or completed history rows

#### Scenario: Active card is deleted

- **WHEN** a resolved principal deletes an active card from their main board
- **THEN** the system deletes that active card and its active card-tag
  assignment rows
- **AND** it does not delete archived snapshots or unrelated board data

### Requirement: Operation-level card writes update board version

The system SHALL advance the board version when an active-card mutation changes
persisted board state.

#### Scenario: Card mutation succeeds

- **WHEN** an active card create, update, move, or delete operation is committed
- **THEN** the board version increments in the same transaction as the card
  change
- **AND** the API can return the updated version to the client

#### Scenario: Card mutation is rejected

- **WHEN** an active-card mutation fails validation or ownership checks
- **THEN** the board version does not increment

### Requirement: Structured persistence supports operation-level column writes

The system SHALL persist active column create, rename, reorder, and delete
operations with focused relational writes instead of replacing the full board
aggregate.

#### Scenario: Active column is created

- **WHEN** a resolved principal creates a column in their main board
- **THEN** the system inserts the column row and updates only ordering rows
  needed to place the new column
- **AND** it does not rewrite unrelated cards, tags, work-cycle rows, or
  completed history rows

#### Scenario: Active column is renamed

- **WHEN** a resolved principal renames a column in their main board
- **THEN** the system updates that column row
- **AND** it does not rewrite unrelated board data

#### Scenario: Active column is reordered

- **WHEN** a resolved principal moves a column within their main board
- **THEN** the system updates only ordering rows needed to preserve
  deterministic column order
- **AND** it does not rewrite cards, tags, rich card content, work-cycle rows,
  or completed history rows

#### Scenario: Active column is deleted

- **WHEN** a resolved principal deletes a column from their main board
- **THEN** the system deletes that active column, its active cards, and active
  card-tag assignment rows
- **AND** it clears the completed-column setting when it referenced the deleted
  column
- **AND** it does not delete archived snapshots or unrelated board data

### Requirement: Structured persistence supports operation-level tag writes

The system SHALL persist board tag create, rename, delete, assign, and unassign
operations with focused relational writes instead of replacing the full board
aggregate.

#### Scenario: Board tag is created

- **WHEN** a resolved principal creates a tag in their main board
- **THEN** the system inserts the tag row
- **AND** it does not rewrite unrelated columns, cards, work-cycle rows, or
  completed history rows

#### Scenario: Board tag is renamed

- **WHEN** a resolved principal renames a tag in their main board
- **THEN** the system updates that tag row
- **AND** active cards and archived snapshots that reference the tag remain
  associated with the same tag identity

#### Scenario: Board tag is deleted

- **WHEN** a resolved principal deletes a tag from their main board
- **THEN** the system deletes the tag row and active card-tag assignment rows
  for that tag
- **AND** it does not delete active cards, columns, work-cycle rows, or archived
  tag snapshots

#### Scenario: Active card tag assignment changes

- **WHEN** a resolved principal assigns or unassigns one tag on one active card
  in their main board
- **THEN** the system changes only the affected active card-tag assignment row
- **AND** it does not rewrite the card row, unrelated card-tag rows, or
  unrelated board data

### Requirement: Structured persistence supports operation-level board settings writes

The system SHALL persist board background and active work-cycle setting changes
with focused relational writes instead of replacing the full board aggregate.

#### Scenario: Board background is updated

- **WHEN** a resolved principal changes the background of their main board
- **THEN** the system updates the board metadata row
- **AND** it does not rewrite columns, cards, tags, work-cycle history, or rich
  card content

#### Scenario: Completed-column setting is updated

- **WHEN** a resolved principal changes the active work-cycle completed-column
  setting for their main board
- **THEN** the system updates the active work-cycle row
- **AND** it does not complete work, archive cards, or rewrite completed history

### Requirement: Operation-level non-card board writes update board version

The system SHALL advance the board version when a column, tag, board settings,
work-cycle settings, or card-tag assignment mutation changes persisted board
state.

#### Scenario: Non-card board mutation succeeds

- **WHEN** a column, tag, board settings, work-cycle settings, or card-tag
  assignment operation is committed
- **THEN** the board version increments in the same transaction as the change
- **AND** the API can return the updated version to the client

#### Scenario: Non-card board mutation is rejected

- **WHEN** a non-card board mutation fails validation or ownership checks
- **THEN** the board version does not increment
