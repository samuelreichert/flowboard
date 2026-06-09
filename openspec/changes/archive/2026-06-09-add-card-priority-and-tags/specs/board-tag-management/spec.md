## ADDED Requirements

### Requirement: Board maintains reusable tags

The system SHALL maintain a board-level list of reusable tags independent of individual cards.

#### Scenario: Board loads without tags

- **WHEN** a board state does not include a tag list
- **THEN** the system treats the board as having an empty tag list

#### Scenario: Tag is renamed

- **WHEN** a user renames an existing tag
- **THEN** cards referencing that tag display the new tag name without losing the tag assignment

### Requirement: User can create board tags

The system SHALL allow users to create board tags from the tag manager.

#### Scenario: User creates a unique tag

- **WHEN** a user enters a non-empty unique tag name in the tag manager
- **THEN** the system saves the tag to the board tag list

#### Scenario: User creates a duplicate tag

- **WHEN** a user enters a tag name that already exists, ignoring case
- **THEN** the system rejects the tag and displays a validation error

### Requirement: User can edit board tags

The system SHALL allow users to edit the display name of an existing board tag.

#### Scenario: User saves a valid rename

- **WHEN** a user changes a tag name to a non-empty unique value
- **THEN** the system updates the tag name and preserves its identity

#### Scenario: User clears a tag name

- **WHEN** a user attempts to save an empty tag name
- **THEN** the system rejects the change and keeps the original tag name

### Requirement: User can remove board tags

The system SHALL allow users to remove board tags from the board tag list.

#### Scenario: User removes an unused tag

- **WHEN** a user removes a tag that is not assigned to any card
- **THEN** the tag is removed from the board tag list

#### Scenario: User removes a tag assigned to cards

- **WHEN** a user confirms removal of a tag assigned to one or more cards
- **THEN** the tag is removed from the board tag list and from every card that referenced it

#### Scenario: User cancels removal of an assigned tag

- **WHEN** a user cancels removal of a tag assigned to one or more cards
- **THEN** the tag remains in the board tag list and card assignments remain unchanged
