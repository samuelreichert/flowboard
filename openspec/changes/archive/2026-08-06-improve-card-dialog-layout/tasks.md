## 1. Shared dialog sizing

- [x] 1.1 Add compact, default, and wide size support to `DialogShell`, with default as the standard 600px size.
- [x] 1.2 Define the shared responsive width tokens and migrate standard shell dialogs away from one-off width overrides.
- [x] 1.3 Keep confirmation and focused prompt dialogs on the explicit compact 480px width, including `ConfirmDialog`.
- [x] 1.4 Add unit coverage for the dialog size classes and responsive width contracts.

## 2. Card dialog actions and layout

- [x] 2.1 Add the reusable `DialogShell` header-actions slot and render the card dialog's accessible ellipsis actions menu there.
- [x] 2.2 Move Delete card into the header actions menu as a danger action and preserve the existing confirmation flow.
- [x] 2.3 Remove the sticky delete footer and place card autosave error feedback in the card dialog body.
- [x] 2.4 Apply the wide dialog variant to the editable card dialog and replace its one-off width rule.
- [x] 2.5 Reorganize card metadata into desktop two-column column/priority controls with a full-width tags row and a mobile single-column fallback.
- [x] 2.6 Reduce the editor's initial minimum height and verify it remains in the dialog's sole scrolling surface.

## 3. Verification

- [x] 3.1 Update card-dialog tests for header-menu deletion, confirmation gating, absent sticky footer, and visible save errors.
- [x] 3.2 Add or update responsive visual/e2e coverage for compact, default, and wide dialog widths and card-editor desktop/mobile layouts.
- [x] 3.3 Run typecheck, relevant component tests, and visual checks for empty, focused, long-content, open-menu, desktop, and mobile states.
