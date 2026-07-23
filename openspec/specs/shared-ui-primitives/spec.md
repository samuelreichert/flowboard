## Purpose

Define shared UI primitives for repeated Flowboard interface patterns so dialogs, selects, card metadata, editor asset bubbles, and empty states stay consistent while preserving existing workflows.

## Requirements

### Requirement: Nested standard dialogs preserve parent context

The system SHALL preserve an open parent standard dialog while a child standard dialog is active and SHALL return focus to the originating parent control when the child closes.

#### Scenario: User cancels a nested dialog

- **WHEN** a user dismisses a child standard dialog through its close control, Escape key, or outside press
- **THEN** the parent dialog remains open
- **AND** focus returns to the parent control that opened the child dialog

#### Scenario: User saves from a nested dialog

- **WHEN** a user saves valid data from a child standard dialog
- **THEN** the child dialog closes
- **AND** the parent dialog remains open with the updated child data visible

### Requirement: Shared primitives preserve existing user workflows

The system SHALL refactor repeated UI patterns into shared primitives without changing the observable workflows for board settings, card editing, tag management, completed-work history, content dialogs, column renaming, or editor link and image actions.

#### Scenario: User completes existing dialog workflows after refactor

- **WHEN** a user opens, interacts with, and closes board settings, card edit/create, tag management, content, column rename, or archived-card dialogs
- **THEN** each workflow remains available with the same saved outcomes and validation behavior as before the refactor

#### Scenario: User edits editor links and images after refactor

- **WHEN** a user inspects, edits, opens, applies, cancels, or removes a contextual link or image action in the card content editor
- **THEN** the editor content changes only according to the selected action and preserves the existing URL validation behavior

### Requirement: Dialog composition is reusable and accessible

The system SHALL provide a reusable standard dialog composition for non-alert Flowboard dialogs while preserving Base UI dialog semantics, focus behavior, visible titles, optional descriptions, close affordances, action affordances, and responsive popup sizing.

#### Scenario: Standard dialog renders through shared shell

- **WHEN** a standard Flowboard dialog is rendered through the shared dialog composition
- **THEN** it exposes a dialog title, optional description, themed backdrop, viewport, popup surface, close affordance when applicable, and caller-provided body/actions

#### Scenario: Card detail dialog uses consistent non-alert dialog composition

- **WHEN** the card detail dialog is rendered
- **THEN** its close affordance and popup surface match the standard non-alert dialog treatment
- **AND** card-level actions remain discoverable without requiring users to scroll past the editor

#### Scenario: Dialog actions stay visible when content scrolls

- **WHEN** a non-alert dialog contains enough body content to scroll
- **THEN** primary or destructive dialog-level actions remain consistently reachable through the dialog composition
- **AND** the action area does not cover editable content without spacing compensation

#### Scenario: Alert dialogs remain semantically separate

- **WHEN** a destructive confirmation requires alert-dialog semantics
- **THEN** the system uses alert dialog semantics rather than the standard dialog composition

### Requirement: Dialog select controls share one implementation

The system SHALL provide a reusable single-value dialog select primitive for repeated Base UI select controls, including trigger styling, selected value rendering, popup positioning, item rendering, selected indicators, labels, and empty or placeholder handling.

#### Scenario: User changes a dialog select value

- **WHEN** a user changes column, priority, or completed-column values from a dialog select
- **THEN** the select uses the shared visual and accessibility treatment and dispatches the same value changes as the previous implementation

#### Scenario: Dialog select styling changes once

- **WHEN** the shared dialog select trigger, popup, item, focus, hover, or selected state styling is updated
- **THEN** all migrated dialog select controls receive the same treatment without separate per-control CSS changes

### Requirement: Card metadata display is reusable

The system SHALL provide reusable priority badge, tag chip, and card metadata row primitives for board cards, completed-work history cards, and archived-card details without changing priority labels, tag labels, overflow counts, or metadata visibility.

#### Scenario: Board card metadata renders through shared primitives

- **WHEN** a board card displays priority and tags
- **THEN** the priority badge, visible tags, and overflow tag count match the previous board-card rendering

#### Scenario: History card metadata renders through shared primitives

- **WHEN** a completed-work history card displays created date, priority, and tags
- **THEN** the metadata row preserves the history-specific created date and matches the previous priority and tag rendering

### Requirement: Editor asset bubbles share presentation

The system SHALL provide a reusable editor asset bubble presentation for contextual link and image actions while keeping each asset type's Tiptap BubbleMenu visibility rules and editor command callbacks explicit.

#### Scenario: Link and image bubbles share action layout

- **WHEN** a contextual link or selected image bubble is shown
- **THEN** the bubble uses a shared URL display, edit form, validation error, cancel/apply, edit/open/remove action layout, and z-index treatment

#### Scenario: Asset-specific behavior remains explicit

- **WHEN** the editor decides whether to show a link bubble or image bubble
- **THEN** each asset type keeps its own visibility condition and command callbacks

### Requirement: Empty states share consistent treatments

The system SHALL provide reusable empty-state primitives for centered panel empty states and compact inline empty messages while preserving the current text, icon usage where applicable, and placement of each empty state.

#### Scenario: Panel-level empty state renders consistently

- **WHEN** completed-work history has no completed cycles
- **THEN** the user sees a centered empty-state treatment with the same message and icon meaning as before

#### Scenario: Inline empty message renders consistently

- **WHEN** a list, dropdown, detail area, or helper section has no available items
- **THEN** the user sees a compact inline empty message in the same location as before
