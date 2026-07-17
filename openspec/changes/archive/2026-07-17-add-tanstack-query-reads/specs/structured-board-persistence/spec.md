## MODIFIED Requirements

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
