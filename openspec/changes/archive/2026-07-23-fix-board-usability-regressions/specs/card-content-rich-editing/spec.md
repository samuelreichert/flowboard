## ADDED Requirements

### Requirement: Rich text entry preserves focus during local synchronization
The system SHALL preserve the active rich-text editor focus and selection while locally originated content changes are synchronized through card autosave.

#### Scenario: User types multiple characters
- **WHEN** the user types successive characters in an active card content editor
- **THEN** the editor retains focus after each local content update
- **AND** the entered text accumulates in the active editor and persisted card content

#### Scenario: User creates a paragraph
- **WHEN** the user presses Enter in an active card content editor
- **THEN** the editor inserts a paragraph break according to its existing Tiptap behavior
- **AND** focus remains in the editor for continued text entry

#### Scenario: Editor receives distinct external content
- **WHEN** an open editor receives content that differs from its locally emitted canonical content
- **THEN** the editor updates to the external content without recursively emitting another local autosave update

### Requirement: Paragraph formatting uses an editable-text icon
The system SHALL use the Lucide `TextCursorInput` icon for the regular paragraph formatting option and trigger.

#### Scenario: User views regular paragraph formatting
- **WHEN** the editor selection is a regular paragraph
- **THEN** the paragraph formatting trigger displays `TextCursorInput`
- **AND** the paragraph option remains accessible by its localized paragraph label
