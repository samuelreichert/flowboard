# app-routing Specification

## Purpose
Defines Flowboard's canonical client routing, route-owned destinations, direct card links, and recoverable missing-route behavior.

## Requirements
### Requirement: App exposes canonical routes for primary destinations
The system SHALL expose canonical client routes for Flowboard's primary app destinations.

#### Scenario: User opens the board route
- **WHEN** the user opens `/board`
- **THEN** the system displays the active board workspace
- **AND** the sidebar indicates Board as the current destination

#### Scenario: User opens the history route
- **WHEN** the user opens `/history`
- **THEN** the system displays completed work history
- **AND** the sidebar indicates History as the current destination

#### Scenario: User opens the tags route
- **WHEN** the user opens `/tags`
- **THEN** the system displays the board workspace with the tag manager open

#### Scenario: User opens the settings route
- **WHEN** the user opens `/settings`
- **THEN** the system displays the board workspace with board settings open

#### Scenario: User opens the root route
- **WHEN** the user opens `/`
- **THEN** the system resolves the destination to the board route

### Requirement: Navigation updates browser history
The system SHALL use browser navigation for route-addressable destinations instead of local-only page or dialog state.

#### Scenario: User selects a sidebar destination
- **WHEN** the user selects Board, History, Tags, or Board settings from the sidebar
- **THEN** the browser URL updates to that destination's canonical route
- **AND** the visible app state matches the route

#### Scenario: User uses browser back after opening a route-owned dialog
- **WHEN** the user opens Tags, Board settings, an active card, or an archived card through navigation and then activates browser Back
- **THEN** the route-owned dialog closes
- **AND** the app displays the previous route destination

#### Scenario: User reloads a route-owned dialog
- **WHEN** the user reloads the browser while a route-owned dialog route is active
- **THEN** the system restores the same route-owned dialog after required state loads

### Requirement: Active cards have direct routes
The system SHALL expose a direct route for each active board card using that card's stable ID.

#### Scenario: User opens an active card route
- **WHEN** the user opens `/board/cards/:cardId` for a card on the active board
- **THEN** the system displays the board workspace
- **AND** the system opens that card's detail dialog

#### Scenario: User closes an active card route
- **WHEN** the user closes the active card detail dialog opened from `/board/cards/:cardId`
- **THEN** the system navigates to `/board`

#### Scenario: Active card route target is missing
- **WHEN** the user opens `/board/cards/:cardId` and no active card with that ID exists after board data loads
- **THEN** the system displays the board workspace with a recoverable missing-card state
- **AND** the system does not open an unrelated card
- **AND** the system does not search completed work history for an archived snapshot with the same card ID

### Requirement: Archived cards have direct routes
The system SHALL expose a direct route for each archived card snapshot using its completed work-cycle ID and archived card ID.

#### Scenario: User opens an archived card route
- **WHEN** the user opens `/history/cycles/:cycleId/cards/:cardId` for an archived card in that completed work cycle
- **THEN** the system displays completed work history
- **AND** the system opens that archived card's readonly detail dialog

#### Scenario: User closes an archived card route
- **WHEN** the user closes the archived card detail dialog opened from `/history/cycles/:cycleId/cards/:cardId`
- **THEN** the system navigates to `/history`

#### Scenario: Archived card route target is missing
- **WHEN** the user opens `/history/cycles/:cycleId/cards/:cardId` and the cycle or archived card cannot be found after board data loads
- **THEN** the system displays completed work history with a recoverable missing-archive state
- **AND** the system does not open an unrelated archived card

### Requirement: Unknown routes are recoverable
The system SHALL handle unknown client routes without leaving the app blank.

#### Scenario: User opens an unknown route
- **WHEN** the user opens a path that does not match a known Flowboard route
- **THEN** the system displays a recoverable not-found state
- **AND** the user can navigate back to the board route

### Requirement: Direct route loads work in hosted and local app shells
The system SHALL support direct browser loads of nested app routes in supported deployment modes.

#### Scenario: User loads nested route from production hosting
- **WHEN** the user directly loads a nested client route in production hosting
- **THEN** the host serves the Flowboard app shell
- **AND** the client resolves the requested route

#### Scenario: User loads nested route from local development server
- **WHEN** the user directly loads a nested client route in local development
- **THEN** the server serves the Flowboard app shell
- **AND** the client resolves the requested route

### Requirement: Route-owned management surfaces adapt to viewport size
The system SHALL present route-owned tag management and board settings surfaces in a form that fits the current viewport.

#### Scenario: User opens tags on a large screen
- **WHEN** the user opens `/tags` on a large screen
- **THEN** the system presents tag management as a dialog over the board workspace

#### Scenario: User opens tags on mobile
- **WHEN** the user opens `/tags` on a mobile viewport
- **THEN** the system presents tag management as a full-page surface

#### Scenario: User opens board settings on a large screen
- **WHEN** the user opens `/settings` on a large screen
- **THEN** the system presents board settings as a dialog over the board workspace

#### Scenario: User opens board settings on mobile
- **WHEN** the user opens `/settings` on a mobile viewport
- **THEN** the system presents board settings as a full-page surface
