## MODIFIED Requirements

### Requirement: Structured persistence preserves current board features
The system SHALL preserve existing board behavior through the structured persistence model.

#### Scenario: Rich board content is saved
- **WHEN** an authenticated user saves columns, cards, rich card content, priorities, tags, background, active work-cycle metadata, or completed work history
- **THEN** the saved data remains available after reload through authenticated persistence

#### Scenario: Column order is saved
- **WHEN** an authenticated user reorders board columns
- **THEN** the saved column order remains available after reload through authenticated persistence

#### Scenario: Tag context is saved
- **WHEN** an authenticated user assigns multiple tags to a card
- **THEN** the system persists the board-scoped tag definitions and card-tag assignments

#### Scenario: Completed history is saved
- **WHEN** an authenticated user completes work and archives cards into history
- **THEN** the system persists completed work-cycle metadata and readonly archived card snapshots
