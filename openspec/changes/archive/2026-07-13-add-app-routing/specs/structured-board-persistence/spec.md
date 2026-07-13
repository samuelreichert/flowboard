## ADDED Requirements

### Requirement: Persisted board records support route target resolution

The system SHALL resolve route-addressed active cards and archived card snapshots from the authenticated user's persisted board state.

#### Scenario: Authenticated user opens an active card route

- **WHEN** an authenticated user opens an active card route for a card in their loaded board
- **THEN** the system resolves the card from that user's persisted board data
- **AND** the system opens the matching active card details

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
