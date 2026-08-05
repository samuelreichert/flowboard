## ADDED Requirements

### Requirement: Coalesced rich content uses existing active-card mutations

The system SHALL hand each flushed rich-content document to the existing authenticated active-card update mutation without changing its API contract, optimistic cache behavior, or persistence feedback.

#### Scenario: Pending content is flushed

- **WHEN** the rich-content autosave producer flushes a pending document
- **THEN** the client submits one existing active-card update mutation containing the latest pending content
- **AND** does not submit a legacy full-board save or use a new content endpoint

#### Scenario: Flushed content mutation succeeds

- **WHEN** a flushed rich-content mutation succeeds
- **THEN** the client applies the returned card and board version through the existing active-card success path

#### Scenario: Flushed content mutation fails

- **WHEN** a flushed rich-content mutation fails
- **THEN** the client applies the existing active-card rollback behavior
- **AND** displays the existing persistent not-durably-saved feedback
- **AND** does not report the pending document as successfully saved
