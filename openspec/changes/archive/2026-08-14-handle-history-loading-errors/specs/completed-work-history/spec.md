## ADDED Requirements

### Requirement: History presents remote data states accurately

The system SHALL distinguish unresolved, failed, empty, and populated completed-history resources and SHALL provide recoverable feedback without replacing previously resolved history.

#### Scenario: History is loading for the first time

- **WHEN** the user opens History before the initial completed-history request resolves
- **THEN** the system displays a loading state for completed history
- **AND** the system does not display the no-completed-work empty state

#### Scenario: History resolves without completed cycles

- **WHEN** the initial completed-history request succeeds with zero completed cycles
- **THEN** the system displays the no-completed-work empty state
- **AND** the system no longer displays the initial loading state

#### Scenario: Initial history request fails

- **WHEN** the initial completed-history request fails without resolved history data
- **THEN** the system displays a recoverable history-unavailable state
- **AND** the system provides an action to retry the completed-history request
- **AND** the system does not describe the failed request as empty history

#### Scenario: Resolved history refresh fails

- **WHEN** completed-history data is already resolved and a background refresh fails
- **THEN** the system keeps the resolved history visible
- **AND** the system displays an inline recoverable refresh failure

#### Scenario: Loading another history page fails

- **WHEN** completed-history cycles are visible and the next-page request fails
- **THEN** the system keeps the visible cycles unchanged
- **AND** the system displays a retry action associated with loading more history

#### Scenario: Archived-card detail is loading

- **WHEN** a user opens an archived card before its detail request resolves
- **THEN** the system displays an archived-card loading state
- **AND** the system does not describe unresolved content as an archived card with no content

#### Scenario: Archived-card detail fails transiently

- **WHEN** an archived-card detail request fails for a reason other than not found
- **THEN** the system displays a recoverable archived-card-unavailable state
- **AND** the system provides an action to retry the detail request

## MODIFIED Requirements

### Requirement: Direct archived routes use history resources

The system SHALL resolve direct archived-card routes from completed-history resources without loading a complete board snapshot and without requiring the requested card to appear in the currently loaded history page.

#### Scenario: User opens direct archived card route

- **WHEN** the user opens `/history/cycles/:cycleId/cards/:cardId` directly
- **THEN** the system loads completed history summaries for the History surface
- **AND** loads the archived-card detail resource using the route cycle and card identifiers
- **AND** does not require the archived card summary to appear in the currently loaded history page before requesting detail
- **AND** opens the matching archived card details after the detail resource resolves

#### Scenario: Direct archived card route target is missing

- **WHEN** the user opens `/history/cycles/:cycleId/cards/:cardId` and the archived-card detail resource returns not found
- **THEN** the system displays completed work history with the existing recoverable missing-archive state
- **AND** it does not open an unrelated archived card

#### Scenario: Direct archived card route is temporarily unavailable

- **WHEN** the user opens `/history/cycles/:cycleId/cards/:cardId` and the archived-card detail request fails for a reason other than not found
- **THEN** the system displays a recoverable archived-card-unavailable state
- **AND** it does not describe the requested card as missing
