## ADDED Requirements

### Requirement: Dialogs use semantic, responsive width variants

The system SHALL provide compact, default, and wide dialog width variants.
The default variant SHALL be 600px, compact SHALL be 480px, and wide SHALL be
800px when the viewport allows. Each variant SHALL retain a 24px horizontal
viewport gutter on narrower viewports.

#### Scenario: Standard dialog uses the defined default width

- **WHEN** a dialog does not select a size variant
- **THEN** the dialog uses the 600px default width when the viewport allows
- **AND** it does not exceed the viewport after preserving 24px gutters

#### Scenario: Compact dialog remains focused

- **WHEN** a confirmation or focused single-purpose dialog selects the compact variant
- **THEN** the dialog uses the 480px compact width when the viewport allows
- **AND** it remains responsive on narrower viewports

#### Scenario: Wide dialog supports content editing

- **WHEN** a content-heavy dialog selects the wide variant
- **THEN** the dialog uses the 800px wide width when the viewport allows
- **AND** it remains responsive on narrower viewports

### Requirement: Card editing uses the wide dialog layout

The system SHALL render the editable card dialog using the wide dialog variant
and SHALL present column and priority controls in a two-column metadata layout
above the editor. Tags SHALL occupy a full metadata row. At the mobile
breakpoint, metadata controls SHALL stack into one column.

#### Scenario: User opens a card on desktop

- **WHEN** a user opens an editable card dialog on a viewport wider than the mobile breakpoint
- **THEN** the dialog uses the wide width variant
- **AND** column and priority controls share a metadata row
- **AND** the tags control uses its own full-width row

#### Scenario: User opens a card on mobile

- **WHEN** a user opens an editable card dialog at the mobile breakpoint
- **THEN** the dialog remains within the viewport gutters
- **AND** card metadata controls stack in one column

### Requirement: Card deletion is a protected header action

The system SHALL expose Delete card from an accessible card-header actions menu
and SHALL NOT render it as a persistent card-dialog footer action. Selecting
Delete card SHALL continue to require the existing confirmation before the
card is removed.

#### Scenario: User opens card actions

- **WHEN** a user opens the card dialog header actions menu
- **THEN** the menu exposes Delete card as a danger-styled action
- **AND** the menu trigger and action are keyboard accessible

#### Scenario: User chooses Delete card

- **WHEN** a user selects Delete card from the header actions menu
- **THEN** the system opens the existing delete confirmation dialog
- **AND** the card remains available until deletion is confirmed

#### Scenario: User views an editable card dialog

- **WHEN** a user views an editable card dialog
- **THEN** the dialog does not render a sticky delete footer
- **AND** any card save error remains visible in the dialog body

### Requirement: Card editor uses a single dialog scroll surface

The system SHALL keep card-editor content in the dialog's scrolling content
surface and SHALL NOT introduce a separate scroll container for the editor.
The editor SHALL use a compact initial writing height that leaves room for the
card title and metadata in ordinary desktop viewports.

#### Scenario: User opens an ordinary card

- **WHEN** a user opens a card with ordinary-length content on a desktop viewport
- **THEN** the title, compact metadata, and editor writing area are visible without a persistent action footer
- **AND** the editor does not display an independent scrollbar

#### Scenario: User opens a long card

- **WHEN** a card's content exceeds the available dialog height
- **THEN** the dialog content scrolls as one surface
- **AND** the editor does not create a nested scrolling region
