## ADDED Requirements

### Requirement: App shell provides responsive navigation
The system SHALL present Flowboard inside an app shell with a sidebar navigation region and a main workspace region.

#### Scenario: Desktop sidebar expands and collapses
- **WHEN** the user activates the sidebar toggle on a desktop viewport
- **THEN** the system toggles between an expanded sidebar with labels and a collapsed sidebar with icon-only navigation

#### Scenario: Collapsed sidebar remains usable
- **WHEN** the desktop sidebar is collapsed
- **THEN** the system keeps navigation and app-level controls available through accessible icon controls

#### Scenario: Mobile sidebar uses drawer behavior
- **WHEN** the user opens navigation on a mobile viewport
- **THEN** the system presents sidebar navigation as a collapsible drawer without permanently reducing the board workspace width

### Requirement: Branding is quiet within the app shell
The system SHALL present Flowboard branding as app chrome rather than as the dominant board content.

#### Scenario: Board workspace loads
- **WHEN** the board workspace is displayed
- **THEN** the Flowboard name appears in a quiet sidebar or header treatment while the board content remains the primary focus

### Requirement: Theme preference supports system, light, and dark
The system SHALL allow the user to choose `system`, `light`, or `dark` as an app-level theme preference from the sidebar footer.

#### Scenario: User chooses explicit light theme
- **WHEN** the user selects the light theme preference
- **THEN** the system applies the light theme to the app shell, board workspace, cards, dialogs, menus, popovers, inputs, and editor controls

#### Scenario: User chooses explicit dark theme
- **WHEN** the user selects the dark theme preference
- **THEN** the system applies the dark theme to the app shell, board workspace, cards, dialogs, menus, popovers, inputs, and editor controls

#### Scenario: User chooses system theme
- **WHEN** the user selects the system theme preference
- **THEN** the system resolves the active theme from the operating system or browser color scheme preference

#### Scenario: Theme preference persists
- **WHEN** the user changes the theme preference and reloads the app
- **THEN** the system restores the saved theme preference before rendering the final themed app state

### Requirement: Theme tokens control visual surfaces
The system SHALL use theme-aware visual tokens for primary app surfaces, text, borders, focus rings, hover states, shadows, and status colors.

#### Scenario: Theme changes across existing controls
- **WHEN** the active theme changes
- **THEN** visible app surfaces and controls update without losing contrast or readability

#### Scenario: Dialog and popup surfaces follow theme
- **WHEN** a dialog, menu, popover, select popup, or tooltip is opened
- **THEN** the surface uses the active theme's background, text, border, shadow, hover, and focus treatments

### Requirement: Secondary controls use hover and focus disclosure
The system SHALL make secondary controls visually quiet by default on pointer-capable desktop layouts while preserving access through hover, focus, and touch-safe states.

#### Scenario: Desktop pointer reveals secondary controls
- **WHEN** the user hovers or focuses a card, column, or board region with hidden secondary controls
- **THEN** the system reveals the relevant controls without shifting surrounding layout

#### Scenario: Keyboard focus reveals secondary controls
- **WHEN** keyboard focus enters a card, column, or board region with hidden secondary controls
- **THEN** the system reveals the relevant controls and exposes accessible names for each control

#### Scenario: Touch layouts remain operable
- **WHEN** the app is used on a touch or mobile layout
- **THEN** essential controls remain reachable without requiring hover

### Requirement: Board background customization is not part of the app shell
The system SHALL render the app shell and board workspace from theme tokens rather than user-selected board background images or colors.

#### Scenario: Existing background data is present
- **WHEN** saved board data includes a background image or color value
- **THEN** the system keeps the board usable and renders the app with the active theme background instead of the saved board background

#### Scenario: User looks for appearance controls
- **WHEN** the user opens app-level appearance controls
- **THEN** the system offers theme selection and does not offer board background image or color selection
