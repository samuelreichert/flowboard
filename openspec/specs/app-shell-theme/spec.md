# app-shell-theme Specification

## Purpose
Defines the responsive app shell theme system, including semantic color tokens, priority colors, and shared control typography.

## Requirements
### Requirement: Theme colors use a maintainable OKLCH token baseline
The system SHALL define app theme colors through a small semantic CSS custom property set backed by OKLCH color values where practical.

#### Scenario: Component styles consume semantic tokens
- **WHEN** component CSS defines app surfaces, text, borders, hover states, focus rings, shadows, editor popups, tooltips, or status colors
- **THEN** the CSS uses semantic theme tokens rather than hardcoded one-off color literals

#### Scenario: Theme tokens have one authoritative declaration
- **WHEN** the app renders in light or dark theme
- **THEN** theme tokens are defined by the root light token set and dark-theme override rather than duplicated in both root and app container scopes

#### Scenario: Repeated white surfaces are reduced
- **WHEN** the theme token set represents white or near-white light-theme surfaces
- **THEN** repeated identical values are collapsed into the smallest practical set of semantic roles without losing meaningful role separation

### Requirement: Priority colors follow semantic severity
The system SHALL represent card priority colors consistently as low green, medium yellow, and high red in both light and dark themes.

#### Scenario: User views priority chips
- **WHEN** cards display low, medium, and high priority chips
- **THEN** low uses a green treatment, medium uses a yellow treatment, and high uses a red treatment

#### Scenario: Theme changes with priority chips visible
- **WHEN** the active theme changes between light and dark
- **THEN** priority chip colors preserve the low-green, medium-yellow, high-red mapping while remaining readable

### Requirement: Ordinary inputs share typography
The system SHALL render ordinary inputs, textareas, select triggers, tag entry fields, and editor URL fields with the same font family and font weight.

#### Scenario: User compares form controls
- **WHEN** dialogs, select controls, tag entry fields, and editor URL popovers are displayed
- **THEN** ordinary editable controls use matching font family and weight while allowing size to vary by control context

#### Scenario: User edits a card title
- **WHEN** the card title is edited inline
- **THEN** the title field may retain its larger display text sizing and weight because it represents the card title rather than an ordinary form field
