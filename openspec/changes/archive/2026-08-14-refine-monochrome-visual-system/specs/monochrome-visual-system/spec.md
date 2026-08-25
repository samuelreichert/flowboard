## ADDED Requirements

### Requirement: Product hierarchy uses a monochrome visual system
The system SHALL use neutral visual tokens for ordinary product hierarchy, including primary actions, hover states, active navigation, surfaces, and borders, in both light and dark themes. The system SHALL reserve ink blue for links, selected states, and focus indicators.

#### Scenario: User views non-semantic emphasis
- **WHEN** a user views a primary action, selected navigation item, selected option, hover state, or keyboard focus state
- **THEN** primary action, hover, and active-navigation emphasis is communicated with monochrome contrast, border, fill, or elevation
- **AND** links, selected states, and keyboard focus use the shared ink-blue interaction accent rather than teal or purple

#### Scenario: User changes theme
- **WHEN** the active theme changes between light and dark
- **THEN** neutral hierarchy and the ink-blue interaction accent remain visually distinct within the active theme

### Requirement: Surface elevation has defined neutral tiers
The system SHALL distinguish canvas, base surface, raised surface, and overlay through named neutral tokens, border treatment, and a limited elevation scale.

#### Scenario: User views the board and cards
- **WHEN** the board workspace renders cards
- **THEN** cards read as raised, movable surfaces above the workspace without relying on a colored fill

#### Scenario: User views the light app shell
- **WHEN** the light theme renders the sidebar beside the workspace
- **THEN** the sidebar uses a discernibly grayer neutral than the workspace
- **AND** the workspace remains almost white while cards preserve their hierarchy through border and elevation

#### Scenario: User opens a transient surface
- **WHEN** a user opens a menu, select popup, popover, tooltip, or dialog
- **THEN** the transient surface has a visibly stronger elevation than the surface that invoked it

### Requirement: Color is reserved for explicit semantics
The system SHALL not require color to understand ordinary hierarchy or card priority, and SHALL reserve non-neutral color for destructive or error feedback.

#### Scenario: User compares card priorities
- **WHEN** cards display low, medium, or high priority
- **THEN** each chip has an explicit localized priority label and a distinguishable monochrome treatment
- **AND** understanding the priority does not depend on a green, yellow, or red color mapping

#### Scenario: User encounters a destructive action
- **WHEN** a control or message communicates deletion, failure, or another destructive/error condition
- **THEN** the system may use a semantic destructive treatment in addition to clear text and iconography

### Requirement: Essential visual states meet accessible contrast
The system SHALL provide WCAG AA contrast for normal-size essential text and the text within solid actionable controls in both active themes.

#### Scenario: User views text and solid controls
- **WHEN** essential body text, muted instructional text, or a solid primary control is rendered in light or dark theme
- **THEN** its foreground and background pairing has a contrast ratio of at least 4.5:1

#### Scenario: User navigates by keyboard
- **WHEN** a keyboard-focusable control receives focus
- **THEN** its focus indicator remains visually distinguishable from adjacent neutral borders and surfaces

### Requirement: Card hover feedback remains spatially stable
The system SHALL communicate card hover through neutral border and elevation changes without translating or scaling the card.

#### Scenario: User scans cards with a pointer
- **WHEN** a pointer enters or leaves a card
- **THEN** the card keeps its layout position and dimensions
- **AND** hover feedback is limited to the shared border and elevation treatment

#### Scenario: User drags a card
- **WHEN** a card enters the drag lifecycle
- **THEN** the system may use transform feedback to communicate active manipulation
