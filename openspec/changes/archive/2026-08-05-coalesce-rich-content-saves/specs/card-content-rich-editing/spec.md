## ADDED Requirements

### Requirement: Rich-content autosave coalesces rapid editor changes

The system SHALL update the active editor immediately while coalescing successive rich-content changes behind a short idle window and retaining the latest pending document.

#### Scenario: User types continuously within one idle window

- **WHEN** the user produces multiple rich-content editor transactions without allowing the idle window to expire
- **THEN** the system does not submit a content save during the active typing burst
- **AND** the editor continues to display every local change with its focus and selection preserved
- **AND** the system submits one content save containing the latest document after the idle window expires

#### Scenario: User resumes editing before the idle window expires

- **WHEN** a rich-content save is pending and the user makes another content change before the idle window expires
- **THEN** the system replaces the pending document with the latest content
- **AND** restarts the idle window without submitting the superseded document

#### Scenario: Separate editing bursts reach separate idle windows

- **WHEN** the user completes one editing burst, allows its idle save to be submitted, and later starts another burst
- **THEN** the system submits at most one content save for each completed idle window

### Requirement: Pending rich content flushes when leaving the editing lifecycle

The system SHALL submit the latest pending rich-content document once before the user leaves an existing card's editing lifecycle.

#### Scenario: Focus leaves the content editor

- **WHEN** rich content is pending and focus moves outside the composite content editor
- **THEN** the system immediately submits the latest pending document
- **AND** cancels the pending idle timer

#### Scenario: Focus moves within the content editor

- **WHEN** rich content is pending and focus moves between controls inside the composite content editor
- **THEN** the system keeps the content pending for the current idle window

#### Scenario: User closes the card dialog

- **WHEN** rich content is pending and the card dialog begins closing
- **THEN** the system submits the latest pending document before changing the dialog or route open state

#### Scenario: Page becomes hidden

- **WHEN** rich content is pending and the document visibility state changes to hidden
- **THEN** the system immediately submits the latest pending document through the normal autosave path

#### Scenario: Autosave producer unmounts

- **WHEN** rich content remains pending as the autosave producer unmounts
- **THEN** the system submits the latest pending document during teardown

#### Scenario: Multiple flush signals occur for one pending document

- **WHEN** blur, dialog close, visibility loss, or unmount signals occur after one of those signals has already flushed the pending document
- **THEN** the system does not submit that document again

### Requirement: Non-content card autosave remains immediate

The system SHALL keep existing title, priority, column, and tag save actions immediate while rich content is pending.

#### Scenario: User changes card metadata while content is pending

- **WHEN** a rich-content document is pending and the user changes a non-content card field
- **THEN** the system submits the non-content change through its existing immediate path
- **AND** retains the latest rich-content document until its own idle window or flush trigger
