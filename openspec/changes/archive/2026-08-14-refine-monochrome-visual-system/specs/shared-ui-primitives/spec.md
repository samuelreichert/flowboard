## ADDED Requirements

### Requirement: Shared transient primitives preserve visual hierarchy
The system SHALL render shared dialogs, menus, selects, popovers, and tooltips using the same theme-aware monochrome surface, border, elevation, hover, selected, and focus treatment.

#### Scenario: User opens comparable transient controls
- **WHEN** a user opens a column menu, dialog select, editor popover, tooltip, or standard dialog
- **THEN** each control uses the shared transient-surface hierarchy appropriate to its elevation level
- **AND** no popup appears visually flatter than the surface that invoked it

#### Scenario: User moves between interaction states
- **WHEN** a user hovers, selects, disables, or keyboard-focuses a shared transient control
- **THEN** the state remains legible through the shared monochrome interaction treatment

### Requirement: Shared compact controls preserve content hierarchy
The system SHALL render shared compact menus and select controls at the control type size while preserving the existing 15px composing and rich-text editing contexts.

#### Scenario: User opens a compact menu beside content
- **WHEN** a user opens a column menu, dropdown, or select beside a card or editor
- **THEN** compact control text uses the shared 13px control size
- **AND** it does not visually overpower the invoking content

#### Scenario: User enters composing or editing content
- **WHEN** a user composes a card or edits rich text
- **THEN** the editable text uses the shared 15px input size
