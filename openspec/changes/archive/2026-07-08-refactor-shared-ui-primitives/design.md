## Context

Flowboard uses React, Base UI primitives, Lucide icons, and component-scoped CSS to build a local-first board experience. Recent UI work added theme tokens and a reusable segmented control, but several other related patterns still duplicate structure and styling across components.

The repeated areas are:

- dialog shell, header, close button, viewport, popup, and action rows
- Base UI select triggers, popups, items, indicators, and labels
- priority badges, tag chips, and compact metadata rows
- contextual editor bubbles for link and image asset actions
- empty states and inline empty helper messages

This is a cross-cutting UI refactor. The goal is to make the existing behavior easier to maintain without changing storage, board state, card state, or user workflows.

## Goals / Non-Goals

**Goals:**

- Introduce small shared UI primitives for the five repeated patterns identified in the proposal.
- Preserve existing accessibility semantics from Base UI Dialog, AlertDialog, Select, Popover, Field, and editor BubbleMenu integrations.
- Preserve current visual behavior, responsive behavior, keyboard behavior, and tests for existing workflows.
- Keep shared primitives narrow enough that component-specific behavior remains readable at each call site.
- Make future styling fixes apply to all related controls by default.

**Non-Goals:**

- Redesign dialogs, cards, editor controls, history cards, tag management, or empty states.
- Change card metadata, completed-work history, board storage, API persistence, or PWA behavior.
- Replace Base UI primitives or introduce a new component library.
- Collapse all dialogs into a single high-level form framework.
- Rewrite app CSS architecture or move to CSS modules.

## Decisions

### Add a `DialogShell` for standard dialogs

Create a shared dialog wrapper that owns the normal `Dialog.Root`, portal, backdrop, viewport, popup, optional header, title, description, and close button structure. The component should support popup variants such as normal and card-sized dialogs through a `className` or `variant` prop, while allowing arbitrary body and footer content.

Use it for standard `Dialog` call sites first: board settings, tag manager, content dialog, column rename, and archived-card detail. Keep `ConfirmDialog` on `AlertDialog` because alert semantics are intentionally different. Keep the discard-confirm branch in `CardDialog` explicit if folding it into the shell would blur alert-like behavior.

Alternative considered: fully generic dialog/form framework. Rejected because card creation/editing has enough local state and conditional behavior that a broad framework would hide important details.

### Add a `DialogSelect` for single-value dialog selects

Create a shared select component for the repeated Base UI Select pattern used by card column, card priority, and completed-column settings. It should own the trigger, value slot, chevron icon, popup, positioner, list, item text, and selected check indicator. Call sites provide options, value, name, label, placeholder/value renderer, and `onValueChange`.

The component should preserve `dialog-input`, `dialog-select__trigger`, and related classes unless styling is intentionally moved to a new shared CSS file. This keeps the visual output stable and avoids repeating the recent dropdown consistency problem.

Alternative considered: expose only lower-level `SelectItem` and `SelectTrigger` helpers. Rejected because the duplicated bug-prone area is the full select composition, not just one subpart.

### Split card metadata into small primitives

Add `PriorityBadge`, `TagChip`, and `CardMetadata` primitives. `PriorityBadge` owns priority label formatting and priority class selection. `TagChip` owns normal and overflow chip rendering. `CardMetadata` owns the row layout and optional leading metadata such as a history created date.

Board cards and history cards should share these primitives while keeping different card shells. The archived-card detail view can reuse `PriorityBadge` and `TagChip` without necessarily using the compact `CardMetadata` row.

Alternative considered: create one shared `CardPreview` component for both board and history cards. Rejected because board cards have drag/drop behavior and history cards open archive details; only metadata rendering should be shared.

### Add an `EditorAssetBubble` for link and image bubbles

Add a shared component used inside each Tiptap `BubbleMenu` branch for link and image asset actions. It should own the edit form layout, URL field, error placement, cancel/apply buttons, display URL, and edit/open/remove action row. Link and image call sites provide labels, current URL, editing state, error text, callbacks, and any form-submit special handling.

The surrounding `BubbleMenu` setup should remain explicit per asset type because link and image visibility conditions differ.

Alternative considered: merge link and image BubbleMenu setup into one generic wrapper. Rejected because Tiptap selection rules differ enough that keeping the menu boundary explicit is easier to verify.

### Add `EmptyState` and `InlineEmptyState`

Add a centered `EmptyState` for panel-level empty moments, such as completed-work history with no cycles. Add a smaller `InlineEmptyState` for messages inside lists, dropdowns, details, and helper sections. This avoids forcing small inline messages into a large empty-state layout.

Alternative considered: one empty component with many layout props. Rejected because two explicit sizes map better to current usage and reduce prop complexity.

## Risks / Trade-offs

- [Risk] A shared dialog wrapper could hide important accessibility differences between normal dialogs and alert dialogs. → Mitigation: keep `ConfirmDialog` and alert-like destructive confirmations separate unless a future design explicitly supports alert semantics.
- [Risk] Shared select value rendering could make special placeholder cases harder to read. → Mitigation: allow a `renderValue` callback and keep options plain.
- [Risk] Extracting metadata could accidentally change card spacing or responsive wrapping. → Mitigation: reuse existing `card__metadata`, `card__priority`, and `card__tag` classes at first.
- [Risk] Editor bubble refactoring could disturb focus, selection, or submit behavior. → Mitigation: keep Tiptap `BubbleMenu` boundaries and editor interaction state unchanged; refactor only repeated presentation markup.
- [Risk] Doing all five refactors in one commit could make review harder. → Mitigation: implement in small commits or task groups, with tests after each high-risk group.

## Migration Plan

1. Add shared primitives without changing call sites.
2. Move one low-risk call site to each primitive and run the relevant tests.
3. Migrate remaining call sites by pattern:
   - dialog selects
   - metadata/chips
   - empty states
   - standard dialog shell
   - editor asset bubbles
4. Remove obsolete duplicated CSS only after every migrated call site is using the shared class names.
5. Run `npm run test:run` and `npm run build`.

Rollback is a normal code revert. No stored board data, app preferences, service worker metadata, or server persistence data needs migration.

## Open Questions

- Should `ContentDialog` become a thin wrapper around `DialogShell`, or should it remain as a specialized prompt dialog that happens to share CSS?
- Should `DialogSelect` live under a generic `components/DialogSelect` path, or under a broader shared form/control namespace if more dialog field primitives are expected?
- Should inline empty messages keep their current component-specific class names during the first pass, then consolidate CSS later, or move immediately to shared empty-state classes?
