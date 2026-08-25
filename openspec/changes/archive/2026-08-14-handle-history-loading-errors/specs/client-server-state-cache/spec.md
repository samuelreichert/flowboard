## MODIFIED Requirements

### Requirement: Client reads completed history through query cache

The system SHALL load completed work-cycle history through TanStack Query instead of loading a full board snapshot and SHALL derive its primary presentation from resolved query data rather than a normalized empty collection.

#### Scenario: User opens History

- **WHEN** the user opens the History view
- **THEN** the client requests completed history summaries with a stable history query key
- **AND** renders completed work-cycle groups from the history summary cache
- **AND** does not request `/api/boards/default` solely to display History

#### Scenario: Initial history query is unresolved

- **WHEN** the history query has no resolved data and its initial request is pending
- **THEN** the client exposes an initial loading state
- **AND** does not normalize the unresolved resource into a successful empty collection

#### Scenario: Initial history query fails

- **WHEN** the history query has no resolved data and reaches an error state
- **THEN** the client exposes a retryable initial error state
- **AND** a retry action refetches the history query

#### Scenario: History query resolves empty

- **WHEN** the history query successfully resolves with zero completed cycles
- **THEN** the client exposes a confirmed empty state

#### Scenario: Cached history refetches

- **WHEN** resolved history query data exists and a background refetch is pending or fails
- **THEN** the client preserves the resolved data as the primary state
- **AND** exposes background progress or failure separately from the primary state

#### Scenario: User loads more completed history

- **WHEN** the completed history summary response indicates more cycles are available
- **THEN** the client can request the next history page using the returned cursor
- **AND** merges the next page without duplicating existing cycles

#### Scenario: Next history page fails

- **WHEN** a next-page history request fails after one or more pages are resolved
- **THEN** the client preserves all resolved pages
- **AND** exposes a next-page error that can retry the same pagination operation

### Requirement: Client hydrates archived card details on demand

The system SHALL load rich archived-card content through an archived-card detail query when an archived card is opened or directly addressed by route identifiers, and SHALL distinguish pending, not-found, and transient failure states.

#### Scenario: User opens archived card

- **WHEN** the user opens an archived card from History
- **THEN** the client requests archived-card detail with a stable key containing the cycle identifier and archived card identifier
- **AND** the archived-card dialog can render summary metadata while rich content is loading
- **AND** unresolved rich content is represented as loading rather than empty content
- **AND** the dialog fills rich content from the archived-card detail query when it resolves

#### Scenario: User opens direct archived card route

- **WHEN** the user opens `/history/cycles/:cycleId/cards/:cardId` directly
- **THEN** the client requests archived-card detail with a stable key containing the route cycle and card identifiers
- **AND** the detail request does not depend on the requested summary being present in the currently loaded history page
- **AND** the client renders the complete archived card returned by the detail query

#### Scenario: Archived card detail is missing

- **WHEN** the archived-card detail query returns not found for the requested cycle or card
- **THEN** the client uses the existing missing archived-card route behavior without revealing whether the card belongs to another user
- **AND** the client does not automatically classify other failure statuses as missing

#### Scenario: Archived card detail fails transiently

- **WHEN** the archived-card detail query fails for a reason other than not found
- **THEN** the client exposes a retryable archived-card detail error
- **AND** retry refetches the detail query using the same stable key
