## ADDED Requirements

### Requirement: Card content converts pasted Markdown into rich content

The system SHALL convert supported plain-text Markdown pasted into an active card content editor into the equivalent rich editor content at the current selection.

#### Scenario: User pastes Flowboard-exported Markdown

- **WHEN** a user copies supported rich card content with Copy Markdown and pastes that plain-text Markdown into an active card content editor
- **THEN** the pasted content is rendered as equivalent rich content rather than literal Markdown syntax
- **AND** headings, emphasis, links, lists, task lists, blockquotes, inline code, code blocks, and supported images retain their supported editor semantics

#### Scenario: Markdown replaces the selected range

- **WHEN** the user pastes supported Markdown while text or rich content is selected in an active card content editor
- **THEN** the parsed rich content replaces the selected range
- **AND** the editor selection moves to the end of the inserted content according to its standard insertion behavior

#### Scenario: Pasted Markdown persists and copies consistently

- **WHEN** a user pastes supported Markdown into a card and saves or copies the card content
- **THEN** the card persists the inserted content through the existing Markdown storage flow
- **AND** Copy Markdown produces semantically equivalent supported Markdown

#### Scenario: Plain text without supported Markdown remains plain text

- **WHEN** a user pastes plain text that does not contain supported Markdown syntax
- **THEN** the editor retains its normal plain-text paste behavior

#### Scenario: Image-file and non-Markdown rich-HTML paste behavior remains intact

- **WHEN** a user pastes image files or clipboard content whose plain text does not contain supported Markdown into a card content editor
- **THEN** the Markdown paste conversion does not intercept that clipboard content
- **AND** the existing image-file and native rich-HTML paste behavior remains available

#### Scenario: Markdown takes priority over accompanying clipboard HTML

- **WHEN** a clipboard item contains supported plain-text Markdown and an accompanying HTML representation, including inline HTML formatting
- **THEN** the editor converts the Markdown into equivalent rich content
- **AND** the HTML representation does not add source-specific paragraph spacing or leave Markdown structural markers literal

#### Scenario: Pasted Markdown preserves URL safety

- **WHEN** pasted Markdown contains an unsupported link or image URL scheme
- **THEN** the editor does not create an active unsafe link or image node from that URL
- **AND** supported URLs continue to render with the existing editor behavior
