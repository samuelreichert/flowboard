## ADDED Requirements

### Requirement: Client serializes mutations for the same active card

The system SHALL run authenticated mutations that primarily target one active
card through a shared serial execution boundary keyed by card identifier while
allowing mutations for different cards to execute concurrently.

#### Scenario: Multiple mutation types target one card

- **WHEN** create, update, move, delete, tag-assignment, or tag-unassignment
  operations are submitted for the same card before earlier operations settle
- **THEN** the client starts at most one request for that card at a time
- **AND** it starts the remaining requests in submission order

#### Scenario: Mutations target different cards

- **WHEN** mutations for two different cards are ready to execute
- **THEN** neither card waits for the other card's serial queue
- **AND** both requests may remain in flight concurrently

#### Scenario: Earlier same-card mutation fails

- **WHEN** an in-flight card mutation fails while later mutations for that card
  are queued
- **THEN** the client exposes the existing persistence failure state
- **AND** the next queued request is allowed to start

### Requirement: Client reconciles ordered card mutation results

The system SHALL derive the visible cached state of an actively mutating card
from its latest confirmed state plus all later pending optimistic operations in
submission order.

#### Scenario: Older success settles after a newer optimistic edit

- **WHEN** a card mutation succeeds while a later optimistic mutation for the
  same card is pending
- **THEN** the client merges the successful operation into confirmed state
- **AND** reapplies the later optimistic operation so the older result does not
  replace newer title, content, priority, tag, or placement state

#### Scenario: Older mutation fails after a newer optimistic edit

- **WHEN** a card mutation fails while a later optimistic mutation for the same
  card is pending
- **THEN** the client removes only the failed operation from the optimistic
  sequence
- **AND** rebuilds the affected card from confirmed state plus the remaining
  pending operations

#### Scenario: One card rolls back while another card changes

- **WHEN** a mutation for one card fails after another card has been changed
- **THEN** rollback updates only the failed card's summary, detail, and placement
- **AND** it preserves the other card's optimistic or confirmed cache state

#### Scenario: Different-card results contain different board versions

- **WHEN** concurrent mutations for different cards settle with board versions
  in an order different from their numeric order
- **THEN** the cached board version remains the greatest version already
  observed
- **AND** an older result cannot decrease it
