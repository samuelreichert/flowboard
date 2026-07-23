## Context

The board has recently moved repeated Base UI controls into shared components and restored editor content synchronization after a content-type migration. Those changes preserved data behavior but introduced interaction regressions: the tag trigger infers visual state from DOM shape, an editor `setContent` can run after local autosave, and Add column has a separate parent-dialog lifecycle from Rename column. The desktop column list deliberately hides its scrollbar and has no mouse-wheel bridge.

The project already has semantic color/radius tokens, `DialogShell`, Base UI dialog/select primitives, Tiptap, and focused feature tests. This change is client-only; it must not alter board persistence or server APIs.

## Goals / Non-Goals

**Goals:**

- Make matching sidebar controls share geometry and token-driven interaction states.
- Preserve Manage columns context across both child form flows.
- Make composer tag visual states explicit rather than dependent on Base UI output markup.
- Keep local rich-text edits focused while still accepting genuinely external content updates.
- Give desktop mouse users a visible and direct horizontal-board navigation path.

**Non-Goals:**

- Reordering columns by dragging their board surfaces.
- Changing card/column persistence, autosave cadence, or editor formatting semantics.
- Replacing Base UI, Tiptap, Lucide, or introducing a new dependency.
- Redesigning the mobile navigation drawer or the full editor toolbar.

## Decisions

### Sidebar controls use a sidebar-specific compact-control contract

The sidebar will define one compact target geometry and use existing `--radius-md`, hover, active, and focus tokens for its toggle, icon-only navigation, and collapsed account control. The avatar will fit within that target rather than determine its size. Expanded account content may retain room for identity text, but it will use the same corner radius and interaction colors.

This is preferred to changing the global `.icon-button`, because icon buttons in dialogs and columns intentionally have smaller, context-specific dimensions.

### Add column becomes a nested child dialog

Manage columns remains open while Add column opens, exactly as it already does for Rename column. The separate close/reopen refs and success-only return behavior are removed. The child dialog owns its own open state; closing it restores its Base UI focus return to the manager, while saving updates the list beneath it.

Closing the manager first and reopening it after success was rejected because cancellation and Escape lose the user’s task context.

### Composer tag state is passed as state, not inferred with `:has()`

The composer will pass an explicit empty/selected trigger state through the tag-select composition. The empty state has a fixed square/circular icon target; the selected state uses a text chip with a leading `+` aligned to its label. CSS will not infer selected state from descendant elements, since `Select.Value` is allowed to wrap every trigger value.

### Editor synchronization distinguishes echoed local values from external values

The editor hook will retain canonical content it most recently emitted locally and compare incoming values against that canonical form before calling Tiptap `setContent`. Local autosave echoes therefore do not reconstruct the document or reset focus. A genuinely different incoming value remains eligible for `setContent` with update emission disabled; the implementation will preserve the active selection when the replacement permits it.

Removing all external synchronization was rejected because initial/remote card hydration must still be reflected in an open editor.

### Paragraph style uses `TextCursorInput`

The regular-paragraph option will use Lucide `TextCursorInput` in its trigger and option row. It communicates editable body text without overloading an alignment symbol or relying on the unfamiliar pilcrow glyph.

### Desktop overflow uses both visible track and conditional wheel translation

The columns list will expose a thin native horizontal scrollbar on desktop and keep the mobile scrollbar treatment. A reusable local wheel handler will translate vertical wheel delta into `scrollLeft` only when the pointer is over an overflowing column list, no horizontal delta is already supplied, and the list can consume movement in that direction. It will not consume Ctrl/Meta zoom gestures or wheel events at horizontal boundaries.

The scrollbar alone is insufficient for ordinary wheel-mouse users; unconditional wheel capture was rejected because it would trap normal scrolling.

## Risks / Trade-offs

- [Nested dialogs can expose focus or backdrop layering defects] → Reuse the existing Rename-column nesting pattern and add close, Escape, save, and focus-return tests.
- [External editor updates can race local autosave] → Compare canonical emitted content before replacing editor state and test local multi-keystroke and external-hydration paths separately.
- [Wheel translation can surprise trackpad users] → Preserve native horizontal deltas and only translate vertical mouse-wheel movement when the column list has horizontal overflow and can move.
- [Sidebar visual changes can make mobile controls too small] → Scope compact geometry to desktop/collapsed controls and inspect mobile drawer states separately.

## Migration Plan

1. Ship the client-only changes behind the existing application surface; no migration or API rollout is needed.
2. Run focused interaction tests, typecheck, and desktop/mobile visual verification before release.
3. If an editor synchronization edge case appears, revert only the new canonical comparison while retaining current persisted content; no stored data requires rollback.

## Open Questions

None. `TextCursorInput` is the selected paragraph icon.
