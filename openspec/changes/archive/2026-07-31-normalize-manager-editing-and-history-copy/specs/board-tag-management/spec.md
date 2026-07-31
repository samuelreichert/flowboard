## ADDED Requirements

### Requirement: Tag manager uses a consistent direct action rail

The system SHALL display direct Rename and Remove icon actions for each
non-editing tag-manager row using the shared manager action-rail treatment.
The actions SHALL have concise action-based accessible names, visible keyboard
focus treatment, and a visual separator between them.

#### Scenario: User accesses tag row actions

- **WHEN** the tag manager lists a tag that is not being edited
- **THEN** Rename and Remove are available as direct icon actions in the row
- **AND** each action remains keyboard reachable and exposes its action name
- **AND** a separator visually distinguishes the actions

### Requirement: Tag manager input limit matches tag persistence

The system SHALL limit tag-manager creation and inline-rename input to the
maximum tag-name length accepted by the tag resource mutation.

#### Scenario: User enters a tag name at the supported limit

- **WHEN** a user enters a unique, non-empty tag name at the supported maximum
  length in the tag manager
- **THEN** the manager permits the value to be submitted to the tag mutation

#### Scenario: User attempts to exceed the supported tag-name limit

- **WHEN** a user enters or pastes more than the supported maximum number of
  characters into a tag-manager name input
- **THEN** the manager does not submit a value longer than the tag mutation
  accepts

## MODIFIED Requirements

### Requirement: User can edit board tags

The system SHALL allow users to edit the display name of an existing board tag
through focused inline editing in the tag manager.

#### Scenario: User starts a tag rename

- **WHEN** a user activates Rename for a tag-manager row
- **THEN** that row replaces its tag summary with a focused name input
- **AND** no tag mutation is sent until the user commits a valid name

#### Scenario: User saves a valid rename

- **WHEN** a user commits a tag name to a non-empty unique value with Enter or
  by moving focus away from a valid inline input
- **THEN** the system updates the tag name and preserves its identity

#### Scenario: User cancels a tag rename

- **WHEN** a user presses Escape while editing a tag name inline
- **THEN** the system restores the original tag name
- **AND** the system does not send a tag rename mutation

#### Scenario: User clears a tag name

- **WHEN** a user attempts to save an empty tag name
- **THEN** the system rejects the change and keeps the original tag name

#### Scenario: User duplicates a tag name

- **WHEN** a user attempts to save a tag name that duplicates another board
  tag, ignoring case
- **THEN** the system rejects the change and keeps the original tag name
