# app-shell-theme Specification

## Purpose

Defines the responsive app shell theme system, including semantic color tokens, priority colors, and shared control typography.
## Requirements
### Requirement: Theme colors use a maintainable OKLCH token baseline

The system SHALL define light and dark app themes through a small semantic CSS custom-property set backed by neutral OKLCH color values where practical. The set SHALL have distinct roles for canvas, base surface, raised surface, overlay, foreground, muted foreground, borders, interactive states, focus, solid-control foreground, and elevation.

#### Scenario: Component styles consume semantic tokens

- **WHEN** component CSS defines app surfaces, text, borders, hover states, focus rings, shadows, editor popups, tooltips, priority treatments, or status colors
- **THEN** the CSS uses semantic theme tokens rather than hardcoded one-off color literals

#### Scenario: Theme tokens have one authoritative declaration

- **WHEN** the app renders in light or dark theme
- **THEN** theme tokens are defined by the root light token set and dark-theme override rather than duplicated in both root and app container scopes

#### Scenario: Surface roles remain distinct

- **WHEN** the theme token set represents the workspace, cards, and transient surfaces
- **THEN** each role has a meaningful neutral separation through fill, border, and/or elevation
- **AND** repeated identical values are collapsed only when the roles do not require visual separation

### Requirement: Priority colors follow semantic severity

The system SHALL represent card priority through explicit localized labels and a monochrome severity hierarchy in both light and dark themes.

#### Scenario: User views priority chips

- **WHEN** cards display low, medium, and high priority chips
- **THEN** every chip includes its priority label
- **AND** low uses a subdued neutral treatment, medium uses a distinct neutral outline or fill, and high uses the strongest neutral treatment

#### Scenario: Theme changes with priority chips visible

- **WHEN** the active theme changes between light and dark
- **THEN** priority chips preserve their ordered monochrome hierarchy while remaining readable

### Requirement: Ordinary inputs share typography

The system SHALL render ordinary inputs, textareas, select triggers, tag entry fields, and editor URL fields with the same font family and font weight.

#### Scenario: User compares form controls

- **WHEN** dialogs, select controls, tag entry fields, and editor URL popovers are displayed
- **THEN** ordinary editable controls use matching font family and weight while allowing size to vary by control context

#### Scenario: User edits a card title

- **WHEN** the card title is edited inline
- **THEN** the title field may retain its larger display text sizing and weight because it represents the card title rather than an ordinary form field

### Requirement: Sidebar compact controls share interaction geometry

The system SHALL render comparable sidebar controls with a consistent compact target, corner radius, hover treatment, and keyboard-focus treatment while preserving expanded account identity content.

#### Scenario: User compares collapsed sidebar controls

- **WHEN** the desktop sidebar is collapsed
- **THEN** the sidebar toggle, icon-only navigation controls, and account trigger use the same compact interaction geometry
- **AND** the avatar fits within that target without appearing larger than adjacent controls

#### Scenario: User hovers or focuses a sidebar control

- **WHEN** the user hovers or keyboard-focuses a sidebar toggle, navigation item, or account trigger
- **THEN** the control uses the shared sidebar hover or focus treatment
- **AND** the active navigation state remains visually distinct from hover

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

### Requirement: Branding is quiet within the app shell

The system SHALL present Flowboard branding as app chrome rather than as the dominant board content.

#### Scenario: Board workspace loads

- **WHEN** the board workspace is displayed
- **THEN** the Flowboard name appears in a quiet sidebar or header treatment while the board content remains the primary focus

### Requirement: Settings dialog consolidates app and board settings

The system SHALL expose Settings from the sidebar account menu and group app appearance controls, language controls, and board-specific controls in a single Settings dialog.

#### Scenario: User opens Settings from account menu

- **WHEN** the user activates Settings in the account menu
- **THEN** the system opens a Settings dialog
- **AND** the dialog includes an Appearance section for theme preference
- **AND** the dialog includes a language preference control
- **AND** the dialog includes a Board section for completed-column selection and clear-board access

#### Scenario: Board settings nav item is removed

- **WHEN** the sidebar navigation is displayed
- **THEN** the system presents workspace navigation without a Board settings nav item
- **AND** board settings remain reachable from the Settings dialog

#### Scenario: Completed work needs board configuration

- **WHEN** the user tries to complete work without a completed column configured
- **THEN** the system directs the user to Settings where the Board section provides completed-column selection

### Requirement: Theme preference supports system, light, and dark

The system SHALL allow the user to choose `system`, `light`, or `dark` as an app-level theme preference from the Settings dialog.

#### Scenario: Theme options are grouped horizontally

- **WHEN** the Settings dialog displays Appearance controls
- **THEN** the system presents `system`, `light`, and `dark` as a horizontal segmented control

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

The system SHALL use theme-aware monochrome tokens for primary app surfaces, text, borders, hover states, shadows, and non-destructive status presentation. The system SHALL use the shared ink-blue token for focus rings and selection.

#### Scenario: Theme changes across existing controls

- **WHEN** the active theme changes
- **THEN** visible app surfaces and controls update without losing contrast, readability, or hierarchy

#### Scenario: Dialog and popup surfaces follow theme

- **WHEN** a dialog, menu, popover, select popup, or tooltip is opened
- **THEN** the surface uses the active theme's neutral background, text, border, shadow, hover, and focus treatments
- **AND** it is visually elevated above the invoking surface

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
