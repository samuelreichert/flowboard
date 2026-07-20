## Context

Flowboard currently acknowledges work completion with `completionPulse`, a transient board-local pill rendered by `AppWorkspace` and animated for 900ms in `AppWorkspace.css`. The completion command itself already archives completed cards, updates history, removes active cards, and starts the next work cycle before the animation state is shown.

The new experience should make completion feel intentional and rewarding without changing persistence, server APIs, or the confirmation flow. It also needs to respect Flowboard's quiet product UI: the animation should be polished and full-page, but not noisy or blocking.

## Goals / Non-Goals

**Goals:**

- Replace the small fast pulse with a full-page completion acknowledgement.
- Use a longer, deliberate sequence that visually communicates completed cards being gathered, archived, and followed by a fresh cycle.
- Keep completion persistence independent from animation availability or completion.
- Provide accessible text feedback and reduced-motion behavior.
- Remove obsolete pulse markup, timing, and CSS after the overlay is in place.

**Non-Goals:**

- No changes to completed-work storage, work-cycle APIs, server routes, or query contracts.
- No new animation asset pipeline or external animation dependency.
- No automatic navigation to History after completion.
- No confetti-style celebration or heavy decorative motion that would clash with the app's restrained workspace.

## Decisions

### Use a dedicated completion overlay component

Create a focused component, for example `CompletionOverlay`, rendered by the board workspace when completion acknowledgement state is active. The component owns the overlay structure, accessible status text, visual card-stack motif, and animation classes.

Alternative considered: keep expanding the existing `complete-work-pulse` markup inline in `AppWorkspace`. That would make the board workspace carry too much animation-specific structure and preserve the old pulse mental model.

### Keep animation state separate from completion persistence

Continue to update board state and submit the completion mutation as the source of truth for completing work. After local completion succeeds, set a transient acknowledgement state long enough for the overlay sequence, then clear it on timeout or animation end.

Alternative considered: wait for the animation before applying completion state. That would make the board feel laggy and could imply that animation is part of data durability.

### Build the animation with CSS and existing tokens

Use CSS keyframes and existing theme tokens for the backdrop, success color, shadows, card-stack layers, and text. The sequence should include:

- a page-level dim/focus overlay,
- subtle completed-card gathering/card-stack motion,
- a centered success mark and confirmation copy,
- a gentle exit back to the board.

Alternative considered: import a Lottie success animation. Lottie would offer richer canned motion, but it adds dependency and asset-management weight for a UI moment that can be expressed with app-native CSS.

### Respect reduced motion

Use `prefers-reduced-motion: reduce` to remove or drastically shorten transform-heavy motion while keeping the acknowledgement visible with status text. The reduced-motion path should avoid card travel, scaling, and large fades across the viewport.

Alternative considered: disable the acknowledgement entirely for reduced motion. That would remove useful confirmation text and make the experience less clear.

### Remove the legacy pulse path

Once the overlay is wired, remove `complete-work-pulse`, `complete-work-float`, and the 900ms pulse timing. Rename state only if it improves clarity, such as from `completionPulse` to `completionCelebration` or `completionOverlay`.

Alternative considered: keep the old pulse as fallback. The reduced-motion overlay can provide fallback behavior without preserving two visual systems.

## Risks / Trade-offs

- Full-page motion can feel intrusive if it is too long or too frequent. → Keep the sequence around 2.5-3 seconds, do not block normal persistence, and allow reduced motion.
- Overlay positioning could interfere with dialogs, mobile layout, or sticky app chrome. → Render it within the workspace with fixed or absolute positioning that covers the board view predictably, then verify desktop and mobile viewports.
- Tests that expect the old pulse text/timing may become brittle. → Update tests to assert the new acknowledgement and state cleanup instead of hardcoding animation internals where possible.
- CSS-only animation can be less expressive than a motion asset. → Use layered primitives, easing, and app tokens to get a refined result without new dependencies.

## Migration Plan

1. Add the new overlay component and styles behind the existing completion trigger.
2. Update transient completion acknowledgement state and timeout duration.
3. Remove the old pulse markup, CSS keyframes, and 900ms cleanup.
4. Update tests for completion acknowledgement and reduced-motion behavior where practical.
5. Verify desktop and mobile board views visually after completing work.

Rollback is straightforward: revert the UI component/state/style changes. Since persistence and APIs are unchanged, no data migration or server rollback is required.

## Open Questions

- Final copy can remain `Work completed`, or implementation can add a short supporting line such as `New cycle is ready` if localization coverage is included.
- The visual card count may use the completed-card count available before completion, or stay generic if the implementation avoids carrying count through the transient state.
