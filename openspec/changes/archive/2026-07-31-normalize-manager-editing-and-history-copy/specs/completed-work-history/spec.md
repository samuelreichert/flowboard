## MODIFIED Requirements

### Requirement: History displays completed work by work-cycle date range

The system SHALL provide a separate History view that groups completed work by
recorded work-cycle date range.

#### Scenario: User opens history

- **WHEN** the user opens the History view from the sidebar
- **THEN** the system displays completed work-cycle groups using each group's
  start date and end date

#### Scenario: History group contains archived cards

- **WHEN** a completed work-cycle group contains archived cards
- **THEN** the system lists the archived cards in that group with their saved
  title, content availability, priority, and tags

#### Scenario: History group is empty

- **WHEN** a completed work-cycle group contains zero archived cards
- **THEN** the system displays the group without active-board cards

#### Scenario: User opens archived card details

- **WHEN** a user opens an archived card from History
- **THEN** the system displays the archived card snapshot as readonly rich
  content
- **AND** the system displays created date near the title and archived date in
  the detail metadata
- **AND** the system displays priority and tags as separate labelled rows

#### Scenario: User copies archived Markdown

- **WHEN** an archived card with content is open and the user activates its
  Copy Markdown icon from the readonly content surface
- **THEN** the system copies the archived Markdown to the clipboard
- **AND** the action's tooltip changes from Copy Markdown to Copied for a
  short confirmation interval
- **AND** the system announces the successful copy through an accessible status

#### Scenario: Archived card has no content to copy

- **WHEN** an archived card with no content is open
- **THEN** the system does not display a Copy Markdown action

#### Scenario: History card metadata is visually stable

- **WHEN** History or board cards render priority and tag chips with long labels
- **THEN** the chips keep a consistent single-line height and truncate
  overflowing text instead of changing row height
