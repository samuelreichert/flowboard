## ADDED Requirements

### Requirement: Cards have priority

The system SHALL store a priority value for every card using exactly one of Low, Medium, or High.

#### Scenario: Existing card receives default priority

- **WHEN** a board containing cards without priority metadata is loaded
- **THEN** each card is treated as Medium priority

#### Scenario: User changes card priority

- **WHEN** a user opens a card and selects a different priority
- **THEN** the card priority is saved and remains visible after the card is closed and reopened

### Requirement: Cards display priority

The system SHALL make each card's priority visible from the board without requiring the card dialog to be opened.

#### Scenario: Card appears on board

- **WHEN** a card is rendered in a column
- **THEN** the card displays its current priority in a compact, scannable form

### Requirement: Cards can have multiple tags

The system SHALL allow a card to reference zero or more board tags.

#### Scenario: User assigns tags to a card

- **WHEN** a user selects multiple tags in the card dialog
- **THEN** all selected tags are saved on the card

#### Scenario: User removes a tag from a card

- **WHEN** a user deselects a selected tag in the card dialog
- **THEN** that tag is removed from the card without removing the board tag itself

### Requirement: Card dialog can create and select tags inline

The system SHALL provide an inline tag creation flow at the end of the card dialog tag dropdown.

#### Scenario: User creates a tag from the dropdown

- **WHEN** a user activates the create tag option, types a unique tag name, and presses Enter
- **THEN** the system creates the board tag and selects it for the current card

#### Scenario: User enters a duplicate tag name

- **WHEN** a user attempts to create a tag with the same name as an existing tag, ignoring case
- **THEN** the system prevents the duplicate tag and keeps the user in the tag creation flow with an error message

### Requirement: Card metadata persists

The system SHALL persist card priority and tag assignments through the existing board persistence flow.

#### Scenario: Board is reloaded

- **WHEN** a user reloads the application after editing card priority or tags
- **THEN** the card retains the saved priority and tag assignments
