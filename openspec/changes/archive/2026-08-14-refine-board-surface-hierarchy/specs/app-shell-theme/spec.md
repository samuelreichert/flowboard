## ADDED Requirements

### Requirement: App shell uses restrained surface hierarchy
The system SHALL distinguish navigation, workspace, work-item, and overlay layers with the active theme's semantic surface and elevation tokens. The sidebar SHALL remain a softer navigation rail beside a near-white light-theme workspace, and any workspace boundary SHALL be applied once at the shell level.

#### Scenario: User views the light app shell
- **WHEN** the app displays in light theme
- **THEN** the sidebar is visually distinct as a muted neutral navigation rail without a persistent enclosing border
- **AND** the workspace reads as the primary near-white content canvas
- **AND** the workspace has one restrained boundary and soft shadow that establishes depth below cards
- **AND** cards are more elevated than the shell boundary while board lanes remain flat
- **AND** the sidebar and the app canvas surrounding the workspace use the same neutral background token

#### Scenario: User changes to dark theme
- **WHEN** the app displays in dark theme
- **THEN** the sidebar, workspace, card, and overlay layers preserve their relative hierarchy
- **AND** essential text, controls, focus indicators, and structural boundaries remain readable

### Requirement: Comparable icon-only actions use circular geometry
The system SHALL render comparable icon-only action controls with shared circular geometry, neutral resting and hover treatments, and the existing visible keyboard-focus treatment. Controls with text SHALL retain text-action geometry.

#### Scenario: User compares icon-only actions on desktop
- **WHEN** comparable icon-only actions appear in the sidebar, column headers, cards, or toolbar regions
- **THEN** they use the shared circular visual geometry
- **AND** their icons remain centered without inheriting text-button padding
- **AND** keyboard focus is visible within the control boundary without extending beyond a compact header layout

#### Scenario: User uses an icon-only action on touch layout
- **WHEN** an icon-only action is displayed at the mobile breakpoint
- **THEN** its interactive target is at least 44 by 44 CSS pixels
- **AND** the circular visual treatment and accessible name remain available
