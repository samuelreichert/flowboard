## Why

The current work-completion feedback is a small, fast pill animation that disappears before the user can enjoy or clearly register the moment. Completing a work cycle is a meaningful, relatively infrequent action, so Flowboard should acknowledge it with a more polished full-page transition while keeping the actual archival behavior independent from animation.

## What Changes

- Replace the existing quick `completionPulse` pill with a full-page completion overlay after the user confirms `Complete work`.
- Animate the completed work moment over a longer, deliberate duration, using Flowboard's existing visual language: subdued backdrop, teal success treatment, card-gathering motion, centered confirmation, and a clean return to the board.
- Preserve completion behavior when animation is disabled, interrupted, or unsupported.
- Add reduced-motion behavior so users who prefer less motion receive an immediate, low-motion acknowledgement.
- Remove the old fast pulse markup, timing, and CSS once the new completion overlay is implemented.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `completed-work-history`: Strengthen the post-confirmation animation requirement from an optional brief pulse to a full-page completion acknowledgement that remains independent from persisted completion behavior.

## Impact

- Affects board completion UI in `src/app/AppWorkspace.tsx`, completion timing/state in `src/app/useBoardActions.ts`, app state types/reducer, localization copy, and related workspace styling.
- May add focused component and test coverage for the completion overlay and reduced-motion fallback.
- Does not change board persistence, work-cycle APIs, storage schema, or completed-history data contracts.
