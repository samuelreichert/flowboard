## ADDED Requirements

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
