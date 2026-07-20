## ADDED Requirements

### Requirement: Client mutates clear board through TanStack Query

The system SHALL use a TanStack Query mutation for confirmed clear-board
actions.

#### Scenario: User confirms clear board

- **WHEN** the user confirms clear board
- **THEN** the client submits a clear-board command mutation
- **AND** replaces board bootstrap columns with an empty list
- **AND** merges the returned active work-cycle state and board version into the
  board bootstrap cache
- **AND** removes or invalidates active-card detail caches for deleted cards
- **AND** does not submit a legacy full-board save for clear board

#### Scenario: Clear-board mutation fails after optimistic update

- **WHEN** a clear-board mutation fails after the client has updated cache
  optimistically
- **THEN** the client restores the previous bootstrap cache snapshot
- **AND** restores or invalidates affected active-card detail cache snapshots
- **AND** exposes the existing unsaved or unavailable persistence state instead
  of treating the clear as durably saved

#### Scenario: Clear-board mutation succeeds after optimistic update

- **WHEN** a clear-board mutation succeeds
- **THEN** the client merges the returned empty active-board resources and board
  version into affected query caches
- **AND** invalidates only exact affected queries when a refetch is needed for
  correctness

### Requirement: Client no longer needs legacy safety snapshots for clear board

The system SHALL stop using complete-board safety snapshots for normal
clear-board actions once the clear-board resource command is available.

#### Scenario: Clear board follows summary bootstrap

- **WHEN** the authenticated board is loaded from lean bootstrap summaries and
  the user clears the board
- **THEN** the client submits the clear-board command without first loading a
  complete legacy board snapshot
- **AND** does not submit placeholder rich card content or empty history as a
  full-board save
