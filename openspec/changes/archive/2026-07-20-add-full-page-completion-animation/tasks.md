## 1. Completion Acknowledgement State

- [x] 1.1 Rename or replace the `completionPulse` app state with completion acknowledgement state that clearly represents the full-page overlay.
- [x] 1.2 Update completion cleanup timing from the old 900ms pulse to the new overlay duration around 2.5-3 seconds.
- [x] 1.3 Keep board state updates and the work-cycle completion mutation independent from the acknowledgement state.
- [x] 1.4 Preserve cleanup on unmount so completion acknowledgement timers cannot dispatch after teardown.

## 2. Overlay UI

- [x] 2.1 Add a focused completion overlay component for the board workspace.
- [x] 2.2 Render accessible completion text from localization while the overlay is active.
- [x] 2.3 Include a restrained card-stack/checkmark visual that communicates completed work being gathered, archived, and followed by a fresh cycle.
- [x] 2.4 Ensure the overlay covers the board workspace predictably on desktop and mobile without changing board layout underneath.

## 3. Motion And Styling

- [x] 3.1 Implement the full-page overlay animation with CSS keyframes and existing Flowboard theme tokens.
- [x] 3.2 Sequence the motion as board dim/focus, card-gathering or card-stack movement, centered confirmation, and gentle exit.
- [x] 3.3 Add `prefers-reduced-motion: reduce` styling that avoids large transform-heavy motion while preserving visible acknowledgement text.
- [x] 3.4 Verify light and dark themes maintain contrast, readability, and a restrained Flowboard visual tone.

## 4. Legacy Pulse Removal

- [x] 4.1 Remove the old `complete-work-pulse` markup from the board workspace.
- [x] 4.2 Remove the `complete-work-float` keyframes and old pulse CSS.
- [x] 4.3 Remove or rename old pulse-specific action names, props, and types so the code no longer describes the new experience as a pulse.
- [x] 4.4 Confirm no tests or selectors still depend on the legacy small fast floating pulse.

## 5. Verification

- [x] 5.1 Update focused component/app tests to assert that completing work shows the full-page acknowledgement and still archives/removes completed cards.
- [x] 5.2 Add or update reduced-motion coverage where practical.
- [x] 5.3 Run the relevant test suite for workspace completion behavior.
- [x] 5.4 Run visual verification for desktop and mobile board completion states, including overlay active and post-overlay cleanup.
