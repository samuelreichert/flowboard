## ADDED Requirements

### Requirement: Client mutates active cards through TanStack Query

The system SHALL use TanStack Query mutations for normal active-card create,
update, move, and delete flows.

#### Scenario: User creates a card from the composer

- **WHEN** the user saves a valid card draft from the board composer
- **THEN** the client submits a card create mutation
- **AND** optimistically adds the card summary to the board bootstrap cache
- **AND** does not submit a legacy full-board save for that card creation

#### Scenario: User edits card fields

- **WHEN** the user changes an active card's title, content, priority, or tags
  from the card dialog
- **THEN** the client submits a card update mutation
- **AND** updates the active card detail cache and board bootstrap summary cache
- **AND** does not submit a legacy full-board save for that card edit

#### Scenario: User moves a card

- **WHEN** the user moves an active card by drag/drop or by changing its column
  in the card dialog
- **THEN** the client submits a card move mutation
- **AND** optimistically reorders the card in the board bootstrap cache
- **AND** does not submit a legacy full-board save for that card move

#### Scenario: User deletes a card

- **WHEN** the user deletes an active card
- **THEN** the client submits a card delete mutation
- **AND** optimistically removes the card from the board bootstrap cache
- **AND** removes or invalidates that card's active detail cache
- **AND** does not submit a legacy full-board save for that card deletion

### Requirement: Client rolls back failed active-card mutations

The system SHALL preserve user-visible consistency when an active-card mutation
fails.

#### Scenario: Card mutation fails after optimistic update

- **WHEN** a card create, update, move, or delete mutation fails after the
  client has updated cache optimistically
- **THEN** the client restores the previous bootstrap and card-detail cache
  snapshot for the affected data
- **AND** the client exposes the existing unsaved or unavailable persistence
  state instead of treating the change as durably saved

#### Scenario: Card mutation succeeds after optimistic update

- **WHEN** a card create, update, move, or delete mutation succeeds
- **THEN** the client merges the returned card fields and board version into
  affected query caches
- **AND** the client invalidates only exact affected queries when a refetch is
  needed for correctness
