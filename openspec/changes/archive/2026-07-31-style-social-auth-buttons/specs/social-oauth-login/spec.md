## ADDED Requirements

### Requirement: Social provider controls present recognizable branding

The system SHALL render Google and Apple social OAuth controls with a provider-specific decorative icon and visually distinct provider treatment while retaining their localized visible labels, accessible button names, availability rules, and sign-in behavior.

#### Scenario: User views the Google sign-in control

- **WHEN** the unified authentication screen renders the Google social provider option
- **THEN** the control displays a multicolor Google mark alongside the localized Google sign-in label
- **AND** the control uses a light surface with a visible border and readable dark foreground

#### Scenario: User views the Apple sign-in control

- **WHEN** the unified authentication screen renders the Apple social provider option
- **THEN** the control displays an Apple mark alongside the localized Apple sign-in label
- **AND** the control uses a black surface with a white foreground

#### Scenario: Provider option is unavailable or opening

- **WHEN** a social provider is disabled by configuration or its OAuth request is opening
- **THEN** the corresponding control retains its provider icon and visual treatment
- **AND** the existing disabled or loading behavior remains available to the user

#### Scenario: User changes the app theme or keyboard-focuses a provider control

- **WHEN** the user views the authentication screen in either supported app theme or focuses an enabled provider control by keyboard
- **THEN** the provider control remains legible against the auth panel
- **AND** it retains the existing Flowboard keyboard focus indicator
