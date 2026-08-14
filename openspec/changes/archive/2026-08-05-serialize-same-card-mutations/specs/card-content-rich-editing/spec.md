## ADDED Requirements

### Requirement: Rich content keeps the latest local edit while saves settle

The system SHALL keep the newest locally emitted rich card content visible and
pending while earlier saves for the same card succeed or fail.

#### Scenario: Earlier content save succeeds

- **WHEN** an earlier content mutation succeeds while a newer local content
  mutation for the same card is pending
- **THEN** the editor continues to show the newer local content
- **AND** the older response does not replace that content in the active-card
  detail cache

#### Scenario: Earlier content save fails

- **WHEN** an earlier content mutation fails while a newer local content
  mutation for the same card is pending
- **THEN** the client presents the existing persistence failure state
- **AND** the newer local content remains visible and pending for its ordered
  save attempt

#### Scenario: Content saves are serialized without coalescing

- **WHEN** multiple content mutations have already been submitted for one card
- **THEN** the client sends them in submission order with at most one in flight
- **AND** this ordering behavior does not debounce or discard a submitted
  content mutation
