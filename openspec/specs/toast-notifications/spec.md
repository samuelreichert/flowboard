## Purpose

Define the shared, accessible application-level toast notification surface for Flowboard and the persistence feedback that uses it.

## Requirements

### Requirement: Flowboard provides a shared Base UI Toast notification surface

The system SHALL provide one Flowboard-owned, application-level toast notification surface composed with the `@base-ui/react/toast` primitives already locked for the project.

#### Scenario: Application notification is requested

- **WHEN** an application-level feature reports a notification
- **THEN** the notification renders through the shared toast viewport rather than a feature-owned fixed-position status element
- **AND** the viewport is rendered outside clipping application layout containers

#### Scenario: Multiple notifications are active

- **WHEN** more than one distinct notification is active
- **THEN** the viewport presents them in a consistent visual stack
- **AND** a repeated notification for the same logical operation updates or replaces its existing toast rather than adding a duplicate

### Requirement: Toasts communicate severity with Flowboard-consistent presentation

The system SHALL support `info`, `success`, `warning`, and `error` toast variants with a concise localized title, optional concise description, non-color severity cue, and accessible dismiss control.

#### Scenario: Error notification is rendered

- **WHEN** the system reports an error notification
- **THEN** the toast uses the Flowboard danger treatment and an error severity cue
- **AND** it includes a localized control for dismissing the notification

#### Scenario: Theme changes while a toast is visible

- **WHEN** a user changes between Flowboard light and dark themes while a toast is visible
- **THEN** the toast updates to the active theme's surface, text, border, focus, and severity-token treatment

### Requirement: Toast duration matches notification importance

The system SHALL automatically dismiss ordinary info, success, and warning toasts after a shared short duration and SHALL keep error toasts visible until the user dismisses them.

#### Scenario: Informational toast expires

- **WHEN** an info toast reaches the configured shared duration
- **THEN** the system dismisses it without requiring user action

#### Scenario: Persistence error is shown

- **WHEN** a persistence or board-availability error is reported
- **THEN** the system shows an error toast
- **AND** the error toast remains visible until the user dismisses it

### Requirement: Toast interaction is accessible and motion-safe

The system SHALL preserve Base UI Toast's accessible notification behavior, SHALL not move focus when a toast appears, and SHALL expose toast dismissal through a keyboard-accessible control. The system SHALL respect the user's reduced-motion preference.

#### Scenario: Keyboard user encounters a toast

- **WHEN** a toast is visible and a keyboard user navigates to the toast viewport
- **THEN** the toast message and its dismiss control are available without focus being moved automatically from the user's current task

#### Scenario: Reduced motion is requested

- **WHEN** the user's environment requests reduced motion
- **THEN** toast entrance, exit, and stack rearrangement avoid nonessential motion

### Requirement: Persistence feedback uses the shared toast surface

The system SHALL use shared toasts for application-level authenticated-board persistence status and failure feedback, and SHALL remove the current standalone lower-right persistence-status element.

#### Scenario: Background board save starts and succeeds

- **WHEN** an authenticated board save starts and then succeeds
- **THEN** the system presents at most one transient saving status for that operation
- **AND** it clears that transient status on success without displaying a routine saved confirmation

#### Scenario: Board or card mutation cannot be persisted

- **WHEN** an authenticated board save, card mutation, or board mutation fails
- **THEN** the system displays the localized durable-save failure through a persistent error toast

#### Scenario: Board data cannot be loaded

- **WHEN** the authenticated board bootstrap or complete-board fetch fails
- **THEN** the system displays the localized board-unavailable message through a persistent error toast

### Requirement: Contextual feedback remains in context

The system SHALL retain form validation, profile-save errors, auth-screen sign-in feedback, and completed-work acknowledgement in their existing contextual surfaces rather than converting them to global toasts.

#### Scenario: Sign-in link request completes

- **WHEN** a signed-out user requests a magic sign-in link
- **THEN** the result remains visible in the sign-in interface
- **AND** the system does not create a global toast for that result

#### Scenario: Dialog field validation fails

- **WHEN** a user submits invalid form data within a Flowboard dialog or editor control
- **THEN** the validation message remains associated with its relevant field
- **AND** the system does not replace that field-level feedback with a toast
