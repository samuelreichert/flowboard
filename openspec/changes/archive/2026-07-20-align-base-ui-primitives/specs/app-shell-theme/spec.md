## MODIFIED Requirements

### Requirement: App shell provides responsive navigation
The system SHALL present Flowboard inside an app shell with a sidebar navigation region and a main workspace region.

#### Scenario: Desktop sidebar expands and collapses

- **WHEN** the user activates the sidebar toggle on a desktop viewport
- **THEN** the system toggles between an expanded sidebar with labels and a collapsed sidebar with icon-only navigation

#### Scenario: Collapsed sidebar remains usable

- **WHEN** the desktop sidebar is collapsed
- **THEN** the system keeps navigation and app-level controls available through accessible icon controls

#### Scenario: Mobile sidebar uses modal drawer behavior

- **WHEN** the user opens navigation on a mobile viewport
- **THEN** the system presents sidebar navigation as a modal drawer without permanently reducing the board workspace width
- **AND** focus is contained in the drawer while it is open
- **AND** the user can dismiss it with Escape, its close control, or an outside press
- **AND** focus returns to the navigation opener after dismissal
