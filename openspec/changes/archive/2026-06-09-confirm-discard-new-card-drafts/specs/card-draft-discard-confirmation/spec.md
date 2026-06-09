## ADDED Requirements

### Requirement: Empty new-card drafts close without confirmation

The system SHALL close a new-card dialog without confirmation when the draft contains no title text, no content, and no selected tags.

#### Scenario: User presses Escape on an empty new-card draft

- **WHEN** a user opens a new-card dialog and presses Escape before adding title text, content, or selected tags
- **THEN** the system closes the new-card dialog without showing a discard confirmation
- **THEN** the system does not create a card

#### Scenario: User cancels an empty new-card draft

- **WHEN** a user opens a new-card dialog and activates Cancel before adding title text, content, or selected tags
- **THEN** the system closes the new-card dialog without showing a discard confirmation
- **THEN** the system does not create a card

### Requirement: Dirty new-card drafts require discard confirmation

The system SHALL require confirmation before closing a new-card dialog when the draft contains title text, content, or one or more selected tags.

#### Scenario: User attempts to close a draft with title text

- **WHEN** a user enters non-whitespace title text in a new-card dialog and attempts to close the dialog
- **THEN** the system keeps the new-card dialog open
- **THEN** the system shows a discard confirmation

#### Scenario: User attempts to close a draft with content

- **WHEN** a user enters non-whitespace content in a new-card dialog and attempts to close the dialog
- **THEN** the system keeps the new-card dialog open
- **THEN** the system shows a discard confirmation

#### Scenario: User attempts to close a draft with selected tags

- **WHEN** a user selects one or more tags in a new-card dialog and attempts to close the dialog
- **THEN** the system keeps the new-card dialog open
- **THEN** the system shows a discard confirmation

### Requirement: Discard confirmation preserves or discards the draft based on user choice

The system SHALL let the user either continue editing a dirty new-card draft or confirm that the draft should be discarded.

#### Scenario: User cancels discard confirmation

- **WHEN** a dirty new-card draft has triggered the discard confirmation
- **WHEN** the user cancels the discard confirmation
- **THEN** the system closes the discard confirmation
- **THEN** the system keeps the new-card dialog open with the draft values still present

#### Scenario: User confirms draft discard

- **WHEN** a dirty new-card draft has triggered the discard confirmation
- **WHEN** the user confirms the discard action
- **THEN** the system closes the discard confirmation
- **THEN** the system closes the new-card dialog
- **THEN** the system does not create a card

### Requirement: Priority-only new-card drafts do not require discard confirmation

The system SHALL NOT treat a priority-only change as draft content requiring discard confirmation.

#### Scenario: User changes only priority before closing

- **WHEN** a user opens a new-card dialog, changes only the priority, and attempts to close the dialog
- **THEN** the system closes the new-card dialog without showing a discard confirmation
- **THEN** the system does not create a card

### Requirement: Existing card close behavior remains unchanged

The system SHALL preserve existing-card dialog close behavior because existing card edits autosave before the dialog closes.

#### Scenario: User closes an existing card after editing

- **WHEN** a user edits an existing card and closes the card dialog
- **THEN** the system closes the card dialog without showing a discard confirmation
- **THEN** the system keeps the autosaved card changes
