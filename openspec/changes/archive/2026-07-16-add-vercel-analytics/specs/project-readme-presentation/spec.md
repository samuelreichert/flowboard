## MODIFIED Requirements

### Requirement: README documents offline and deployment behavior
The project README SHALL document how the app behaves in static browser-storage mode, local SQLite mode, offline/PWA mode, and Vercel analytics-enabled deployment mode.

#### Scenario: Developer chooses a run mode
- **WHEN** a developer reads setup and deployment guidance
- **THEN** the README explains which commands use browser storage only and which commands use the local SQLite API

#### Scenario: User evaluates offline support
- **WHEN** a reader looks for offline behavior
- **THEN** the README explains what works offline and any limitations of API sync

#### Scenario: Developer enables Vercel analytics
- **WHEN** a developer prepares a Vercel deployment
- **THEN** the README documents that Web Analytics and Speed Insights must be enabled in the Vercel project
- **AND** the README describes the post-deployment validation checks for CSP, analytics requests, page views, and vitals
