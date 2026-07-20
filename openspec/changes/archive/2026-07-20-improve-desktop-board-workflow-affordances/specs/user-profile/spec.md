## MODIFIED Requirements

### Requirement: Account menu presents user identity

The system SHALL present a compact account menu entry point in the sidebar footer for board-visible sessions.

#### Scenario: Signed-in user sees account trigger

- **WHEN** a Supabase-authenticated user views the board
- **THEN** the sidebar footer shows an account trigger with the user's avatar or initials, display name, and email

#### Scenario: User opens account menu

- **WHEN** the user activates the account trigger while authenticated account actions are available
- **THEN** the system opens an account menu with a profile summary row, Settings item, and Log out item

#### Scenario: Profile summary opens profile dialog

- **WHEN** the user activates the profile summary row in the account menu
- **THEN** the system opens the Edit profile dialog directly

#### Scenario: Local mode keeps honest account behavior

- **WHEN** Supabase Auth is not configured and the board is visible in static/local mode
- **THEN** the system keeps Settings reachable from the sidebar footer
- **AND** the system does not present Log out as an available action

#### Scenario: Local mode avoids a detached sparse account menu

- **WHEN** Supabase Auth is not configured and Settings is the only sidebar footer action
- **THEN** activating the sidebar footer either opens Settings directly or opens an anchored menu with local identity context
- **AND** the footer behavior remains accessible in expanded and collapsed sidebar states
