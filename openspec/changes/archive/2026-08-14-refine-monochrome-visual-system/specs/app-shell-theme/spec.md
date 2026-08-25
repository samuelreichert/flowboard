## MODIFIED Requirements

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

### Requirement: Theme tokens control visual surfaces

The system SHALL use theme-aware monochrome tokens for primary app surfaces, text, borders, hover states, shadows, and non-destructive status presentation. The system SHALL use the shared ink-blue token for focus rings and selection.

#### Scenario: Theme changes across existing controls

- **WHEN** the active theme changes
- **THEN** visible app surfaces and controls update without losing contrast, readability, or hierarchy

#### Scenario: Dialog and popup surfaces follow theme

- **WHEN** a dialog, menu, popover, select popup, or tooltip is opened
- **THEN** the surface uses the active theme's neutral background, text, border, shadow, hover, and focus treatments
- **AND** it is visually elevated above the invoking surface
