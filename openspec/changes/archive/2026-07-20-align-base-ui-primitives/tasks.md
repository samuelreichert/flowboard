## 1. Shared account and segmented controls

- [x] 1.1 Replace account-menu native role-wired buttons and divider with Base UI `Menu.Item` and `Menu.Separator` while preserving profile, Settings, and Log out actions.
- [x] 1.2 Refactor the shared `SegmentedControl` to controlled Base UI `ToggleGroup` and `Toggle` items, preserving the generic value API and non-empty selection behavior.
- [x] 1.3 Update shared segmented-control styles for Base UI pressed, disabled, focus, desktop-collapsed, and mobile-expanded states.
- [x] 1.4 Add or update account-menu, theme, and history-layout interaction tests for keyboard-operable menu and exclusive segmented selection semantics.

## 2. Shared accessible tag multi-select

- [x] 2.1 Define and implement a reusable `TagMultiSelect` API around controlled `Select.Root multiple`, including trigger summary, popup/list/item/indicator composition, positioning, and empty state.
- [x] 2.2 Move inline tag-name entry and validation into the shared tag multi-select without treating creation controls as selectable tag options.
- [x] 2.3 Migrate composer tag selection to the shared control and preserve selected-tag reset after successful card creation.
- [x] 2.4 Migrate active-card tag selection to the shared control and derive existing card-tag assignment/unassignment mutations from the changed selected IDs.
- [ ] 2.5 Add focused tests for multi-select keyboard selection, deselection, inline creation and immediate selection, Escape/outside dismissal, and existing persistence behavior.

## 3. Editor tooltips and practical field composition

- [x] 3.1 Replace `ToolbarHint` with reusable Base UI tooltip composition that uses the editor portal target and supports hover and focus disclosure.
- [x] 3.2 Preserve tooltip discoverability for disabled editor toolbar controls with an appropriate trigger wrapper.
- [x] 3.3 Migrate profile display name and magic-link email to Base UI field label/control/error or description composition while preserving controlled state and native validation.
- [x] 3.4 Render the composer textarea through Base UI field composition while preserving multiline input, Cmd/Ctrl+Enter submission, error linkage, focus behavior, and responsive sizing.
- [x] 3.5 Keep avatar file selection native and preserve existing profile save/error behavior.
- [x] 3.6 Update editor tooltip, auth, profile, and composer tests for the retained accessible names and validation behavior.

## 4. Modal mobile navigation drawer

- [x] 4.1 Extract reusable sidebar content so desktop static navigation and mobile drawer navigation share actions, labels, and account/footer behavior without duplicate visible landmarks.
- [x] 4.2 Implement a controlled modal Base UI drawer for mobile navigation with trigger, portal, backdrop, viewport, popup, visible or screen-reader title, and close control.
- [x] 4.3 Connect drawer open state and route/navigation actions to the existing mobile-sidebar reducer behavior; remove the custom backdrop button and obsolete CSS-only dismissal path.
- [x] 4.4 Update responsive CSS for drawer motion, theme treatment, compact sidebar controls, and viewport edge clipping without changing desktop collapse behavior.
- [x] 4.5 Add or update mobile navigation tests for trigger focus restoration, Escape, outside dismissal, close control, navigation dismissal, and desktop sidebar regression coverage.

## 5. Verification and stacked delivery

- [x] 5.1 Run focused unit and integration tests for account menu, tags, segmented controls, editor toolbar, profile/auth/composer fields, and app-shell navigation.
- [x] 5.2 Run `rtk npm run typecheck`, `rtk npm run test:run`, and `rtk npx react-doctor@latest --verbose --scope changed`.
- [ ] 5.3 Verify desktop and mobile light/dark views for segmented controls, tag popup open/focused/long-content states, tooltip positioning, and modal drawer focus/dismissal behavior.
- [x] 5.4 Open the implementation PR against the dependency-update PR, then retarget or rebase it after that parent PR merges.
