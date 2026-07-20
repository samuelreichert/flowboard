## Why

Flowboard currently presents persistence and mutation state through one fixed, unstyled status element in the lower-right corner. It has no shared notification contract, severity treatment, queueing, timeout policy, or user dismissal, so recoverable failures and routine background saving receive the same weak treatment.

Base UI 1.5.0 already includes an accessible Toast primitive. Adopting it now gives the authenticated board a consistent, first-class notification pattern without introducing another UI dependency.

## What Changes

- Introduce a Flowboard toast-notification capability built on `@base-ui/react/toast`.
- Add one application-level toast provider, portal, and viewport with Flowboard-owned styles for info, success, warning, and error messages.
- Define consistent behavior for notification queueing, stacking, timed dismissal, manual dismissal, and reduced-motion rendering.
- Migrate app-level board persistence and card/board mutation feedback from the current fixed status element to toasts.
- Keep failed-save and unavailable-board notices visible until the user dismisses them; do not repeatedly toast successful background saves.
- Preserve contextual form and dialog validation errors, auth-screen feedback, and the completed-work celebration in their existing surfaces rather than routing them through toasts.
- Localize new toast labels and any new message copy in English and Brazilian Portuguese.

## Capabilities

### New Capabilities

- `toast-notifications`: Accessible, Flowboard-styled application notifications and their persistence-feedback integration.

### Modified Capabilities

- None.

## Impact

- Affected UI composition: `src/App.tsx`, app providers, and a new shared toast component or module.
- Affected feedback sources: `src/app/useAuthenticatedBoardSync.ts`, `src/app/useAppController.ts`, and mutation hooks that report board or card persistence failures.
- Affected styling and localization: shared toast CSS, `src/App.css` tokens as needed, and `src/localization.ts`.
- Affected dependencies: uses the already-locked `@base-ui/react` 1.5.0 Toast export; no new package is expected.
- Affected verification: targeted toast behavior and accessibility tests plus app-level persistence-failure coverage.
