## MODIFIED Requirements

### Requirement: README presents current Flowboard capabilities
The project README SHALL describe current Flowboard capabilities, including columns, cards, rich card content, priorities, tags, the responsive app shell, theme selection, local browser storage, optional SQLite persistence, and offline app-shell behavior.

#### Scenario: Reader reviews project capabilities
- **WHEN** a reader opens the README
- **THEN** the README describes the app's current board, card, metadata, theme, rich editing, and storage capabilities
- **AND** the README does not advertise board background customization as a current primary feature

### Requirement: README includes a product screenshot
The project README SHALL include a screenshot that shows the latest actual Flowboard interface and SHALL preserve historical screenshots for earlier UI versions.

#### Scenario: Reader previews the current app visually
- **WHEN** a reader opens the README on GitHub
- **THEN** the README displays the latest Flowboard UI screenshot before any historical screenshots

#### Scenario: Reader reviews historical UI screenshots
- **WHEN** a reader looks for earlier visual versions
- **THEN** the README or screenshot assets preserve the first version, second version, and latest UI screenshots with clear labeling or filenames

### Requirement: README documents offline and deployment behavior
The project README SHALL document how the app behaves in static browser-storage mode, local SQLite mode, and offline/PWA mode.

#### Scenario: Developer chooses a run mode
- **WHEN** a developer reads setup and deployment guidance
- **THEN** the README explains which commands use browser storage only and which commands use the local SQLite API

#### Scenario: User evaluates offline support
- **WHEN** a reader looks for offline behavior
- **THEN** the README explains what works offline and any limitations of API sync
