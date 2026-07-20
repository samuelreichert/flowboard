## ADDED Requirements

### Requirement: Rich text toolbar groups related controls

The system SHALL visually group rich text toolbar controls so compact icon-first editing remains scannable.

#### Scenario: Toolbar controls are grouped by editing purpose

- **WHEN** the rich text toolbar is rendered
- **THEN** undo and redo, text style, inline formatting, list and alignment, block formatting, insert actions, and copy actions are visually grouped or separated
- **AND** the grouping does not remove existing toolbar commands

#### Scenario: Lower-frequency formatting may move into a compact menu

- **WHEN** the toolbar surface cannot comfortably show all lower-frequency formatting actions
- **THEN** the system may place lower-frequency commands in a compact formatting menu
- **AND** each moved command remains keyboard accessible and exposes an accessible name

#### Scenario: Common formatting remains fast

- **WHEN** the toolbar is rendered on desktop
- **THEN** common text, list, link, and image actions remain directly available or reachable through the existing compact dropdown patterns
