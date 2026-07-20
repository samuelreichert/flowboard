## ADDED Requirements

### Requirement: Client has no legacy full-board persistence bridge

The system SHALL keep authenticated board reads and writes on TanStack Query
bootstrap, detail, history, and resource mutation paths without using
complete-board network persistence.

#### Scenario: Authenticated app starts

- **WHEN** the authenticated app initializes its board surface
- **THEN** it hydrates state from the board bootstrap query and related detail
  queries
- **AND** it does not call a legacy complete-board read helper

#### Scenario: Authenticated board changes

- **WHEN** the user creates, edits, moves, deletes, completes, clears, or
  reconfigures board resources
- **THEN** the client submits the matching resource mutation
- **AND** it does not call a legacy complete-board save helper

#### Scenario: Browser storage updates

- **WHEN** in-memory or browser-backed board state is updated after resource
  cache changes
- **THEN** the storage layer does not mirror that update through a full-board
  remote persistence request

## REMOVED Requirements

### Requirement: Client preserves unsurfaced data during legacy full-board saves

**Reason**: The supported authenticated app surface no longer saves complete
board aggregates. Bootstrap intentionally omits rich active-card content and
completed history, and every normal write now has a focused resource mutation.

**Migration**: Use the board bootstrap query for active-board summaries, active
card detail queries for rich active-card content, history queries for completed
work, and resource mutations for all supported writes.
