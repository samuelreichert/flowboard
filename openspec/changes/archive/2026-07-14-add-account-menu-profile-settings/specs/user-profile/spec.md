## ADDED Requirements

### Requirement: Account menu presents user identity
The system SHALL present a compact account menu entry point in the sidebar footer for board-visible sessions.

#### Scenario: Signed-in user sees account trigger
- **WHEN** a Supabase-authenticated user views the board
- **THEN** the sidebar footer shows an account trigger with the user's avatar or initials, display name, and email

#### Scenario: User opens account menu
- **WHEN** the user activates the account trigger
- **THEN** the system opens an account menu with a profile summary row, Settings item, and Log out item

#### Scenario: Profile summary opens profile dialog
- **WHEN** the user activates the profile summary row in the account menu
- **THEN** the system opens the Edit profile dialog directly

#### Scenario: Local mode keeps honest account behavior
- **WHEN** Supabase Auth is not configured and the board is visible in static/local mode
- **THEN** the system keeps Settings reachable from the sidebar footer
- **AND** the system does not present Log out as an available action

### Requirement: Profile dialog edits display name and avatar
The system SHALL allow authenticated users to edit their Flowboard-owned display name and avatar without exposing username editing.

#### Scenario: User opens edit profile dialog
- **WHEN** the authenticated user opens Edit profile
- **THEN** the dialog shows the current avatar or initials
- **AND** the dialog shows an editable display name field
- **AND** the dialog shows the user's email as read-only identity context
- **AND** the dialog does not show a username field

#### Scenario: User saves display name
- **WHEN** the user enters a valid display name and saves the profile dialog
- **THEN** the system persists the display name on the Flowboard profile
- **AND** subsequent account trigger, account menu, and profile dialog views show the saved display name

### Requirement: Avatar upload and removal are supported
The system SHALL support user-uploaded profile avatars with validation, preview, and removal fallback.

#### Scenario: User selects valid avatar image
- **WHEN** the user selects a supported image file up to 5 MB in the profile dialog
- **THEN** the system previews the selected image centered inside the circular avatar frame
- **AND** the system saves the avatar when the user saves the profile

#### Scenario: User selects oversized avatar image
- **WHEN** the user selects an avatar image larger than 5 MB
- **THEN** the system rejects the file
- **AND** the system explains that the avatar must be 5 MB or smaller

#### Scenario: User removes avatar
- **WHEN** the user removes the current avatar from the profile dialog
- **THEN** the system clears the Flowboard profile avatar
- **AND** the account trigger, account menu, and profile dialog fall back to initials

### Requirement: Profile display data persists separately from auth sessions
The system SHALL persist Flowboard-owned profile display data independently from the transient authenticated session object.

#### Scenario: User reloads after editing profile
- **WHEN** the user saves profile changes and reloads the app with a valid session
- **THEN** the system loads the saved Flowboard profile display name and avatar instead of reverting to raw provider metadata

#### Scenario: Provider avatar is unavailable
- **WHEN** the authenticated user has no saved avatar and no provider avatar is available
- **THEN** the system displays initials derived from the best available display name or email
