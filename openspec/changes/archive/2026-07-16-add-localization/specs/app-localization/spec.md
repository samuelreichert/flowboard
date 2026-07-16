## ADDED Requirements

### Requirement: App supports English and Brazilian Portuguese UI localization

The system SHALL provide localized Flowboard-owned UI text for English and Brazilian Portuguese.

#### Scenario: User views the app in English

- **WHEN** the resolved app language is `en`
- **THEN** Flowboard-owned navigation labels, headings, buttons, dialogs, empty states, validation messages, auth copy, priority labels, date labels, and status messages render in English

#### Scenario: User views the app in Brazilian Portuguese

- **WHEN** the resolved app language is `pt-BR`
- **THEN** Flowboard-owned navigation labels, headings, buttons, dialogs, empty states, validation messages, auth copy, priority labels, date labels, and status messages render in Brazilian Portuguese

#### Scenario: User-generated content is displayed

- **WHEN** cards, card content, columns, tags, profile names, emails, or route-path values are shown
- **THEN** the system displays those user-generated values exactly as stored
- **AND** the system does not translate or rewrite user-generated content

### Requirement: Language defaults to browser language

The system SHALL resolve the initial app language from the browser language when no manual language preference has been saved.

#### Scenario: Browser language is Brazilian Portuguese

- **WHEN** no saved language preference exists
- **AND** the browser language list includes `pt-BR`
- **THEN** the resolved app language is `pt-BR`

#### Scenario: Browser language is another Portuguese locale

- **WHEN** no saved language preference exists
- **AND** the browser language list includes a Portuguese locale other than `pt-BR`
- **THEN** the resolved app language is `pt-BR`
- **AND** the app treats Brazilian Portuguese as the MVP Portuguese catalog for that browser locale

#### Scenario: Browser language is unsupported

- **WHEN** no saved language preference exists
- **AND** the browser language list does not include a supported language
- **THEN** the resolved app language is `en`

#### Scenario: Browser language is unavailable

- **WHEN** no saved language preference exists
- **AND** browser language APIs are unavailable
- **THEN** the resolved app language is `en`

### Requirement: Language preference is locally persisted

The system SHALL store the language preference locally in browser storage for the MVP.

#### Scenario: User chooses English manually

- **WHEN** the user selects English in Settings
- **THEN** the app immediately resolves to `en`
- **AND** the system stores the language preference locally

#### Scenario: User chooses Brazilian Portuguese manually

- **WHEN** the user selects Português (Brasil) in Settings
- **THEN** the app immediately resolves to `pt-BR`
- **AND** the system stores the language preference locally

#### Scenario: User chooses browser language

- **WHEN** the user selects the browser-language option in Settings
- **THEN** the app resolves the active language from the browser language list
- **AND** the system stores the `system` language preference locally

#### Scenario: User reloads after selecting a language

- **WHEN** a valid saved language preference exists
- **AND** the user reloads the app
- **THEN** the system restores the saved language preference before rendering the final localized app state

#### Scenario: Saved language preference is invalid

- **WHEN** the saved language preference is not one of `system`, `en`, or `pt-BR`
- **THEN** the system ignores the invalid value
- **AND** the app resolves language using the default browser-language behavior

#### Scenario: User is signed in

- **WHEN** an authenticated user changes language preference
- **THEN** the preference remains local to the current browser
- **AND** the system does not write language preference to profile, board state, or authenticated APIs

### Requirement: Settings exposes language switching

The system SHALL expose language preference controls from the Settings dialog.

#### Scenario: User opens Settings

- **WHEN** the user opens the Settings dialog
- **THEN** the dialog includes a language preference control
- **AND** the control offers automatic browser language, English, and Português (Brasil)
- **AND** the automatic browser-language option shows the currently resolved language

#### Scenario: User changes language from Settings

- **WHEN** the user changes the language preference from Settings
- **THEN** visible Flowboard-owned UI text updates to the newly resolved language without requiring a page reload

#### Scenario: Settings is route-owned

- **WHEN** the user opens `/settings` directly
- **THEN** the Settings dialog opens with the language preference control available
- **AND** changing language preserves the existing route-owned Settings behavior

### Requirement: Document and formatters use resolved language

The system SHALL apply the resolved app language to document metadata and locale-aware formatting.

#### Scenario: Resolved language changes

- **WHEN** the resolved app language changes
- **THEN** the system updates the document root `lang` attribute to the resolved language

#### Scenario: Date or time labels render

- **WHEN** Flowboard-owned date or time labels are displayed
- **THEN** the labels are formatted using the resolved app language

#### Scenario: Count-based labels render

- **WHEN** Flowboard-owned count-based labels are displayed
- **THEN** singular and plural forms are correct for the resolved app language
