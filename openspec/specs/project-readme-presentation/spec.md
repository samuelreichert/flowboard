# project-readme-presentation Specification

## Purpose
TBD - created by archiving change improve-project-readiness-and-pwa. Update Purpose after archive.
## Requirements
### Requirement: README presents current Flowboard capabilities
The project README SHALL describe current Flowboard capabilities, including columns, cards, rich card content, priorities, tags, board backgrounds, local browser storage, and optional SQLite persistence.

#### Scenario: Reader reviews project capabilities
- **WHEN** a reader opens the README
- **THEN** the README describes the app's current board, card, metadata, and storage capabilities

### Requirement: README includes a product screenshot
The project README SHALL include a screenshot that shows the actual Flowboard interface.

#### Scenario: Reader previews the app visually
- **WHEN** a reader opens the README on GitHub
- **THEN** the README displays a screenshot of Flowboard with representative columns and cards

### Requirement: README documents offline and deployment behavior
The project README SHALL document how the app behaves in static browser-storage mode, local SQLite mode, and offline/PWA mode.

#### Scenario: Developer chooses a run mode
- **WHEN** a developer reads setup and deployment guidance
- **THEN** the README explains which commands use browser storage only and which commands use the local SQLite API

#### Scenario: User evaluates offline support
- **WHEN** a reader looks for offline behavior
- **THEN** the README explains what works offline and any limitations of API sync or remote image backgrounds

