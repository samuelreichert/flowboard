## Context

Flowboard is a local-first React board backed by localStorage with an optional `/api/board` persistence endpoint. The current board state contains `background` and `columns`; cards contain `id`, `title`, `content`, and `createdAt`.

The requested change adds metadata that cuts across the card editor, card preview, storage migration, and API validation. It also changes the header action surface from separate top-right buttons into a menu that can contain more board-level actions.

## Goals / Non-Goals

**Goals:**

- Add a durable card priority field with Low, Medium, and High values.
- Add reusable board-level tags and allow cards to reference multiple tags.
- Support inline tag creation from the card dialog dropdown.
- Add a board-level tag manager for creating, renaming, and removing tags.
- Preserve existing boards through migration and keep old cards usable.
- Keep all data in the existing board payload, localStorage, and optional API flow.

**Non-Goals:**

- Tag colors, tag sorting preferences, tag filtering, and search are out of scope for this change.
- Priority-based sorting or automation is out of scope.
- Collaboration, permissions, and per-user tag vocabularies are out of scope.
- Introducing a new persistence dependency or API route is out of scope.

## Decisions

### Store tags globally on board state

Add `tags: BoardTag[]` to `BoardState`, where each tag has a stable `id` and display `name`. Cards store `tagIds: string[]`.

Rationale: The tag manager implies a board-level vocabulary. Stable IDs let tags be renamed without rewriting every card label reference.

Alternative considered: Store tag names directly on each card. This is simpler but makes rename/remove behavior expensive and ambiguous.

### Add explicit priority to every card

Add `priority: 'low' | 'medium' | 'high'` to `BoardCard`. Existing and legacy cards migrate to `medium`.

Rationale: Medium is the least surprising default because it avoids silently treating all old work as low priority while keeping high priority intentional.

Alternative considered: Leave priority optional and hide it until set. That preserves old payloads but spreads undefined handling through rendering, editing, validation, and tests.

### Allow multiple tags per card

The card dialog tag control should behave like a multi-select dropdown: selected tags can be toggled on and off, and the card stores all selected tag IDs.

Rationale: The user requested "tags" and a dropdown of options. Multiple tags are the conventional mental model and make grouping across workstreams useful.

Alternative considered: Single-select labels. This would simplify the control but would likely feel artificially constrained.

### Create tags inline from the card dialog

The tag dropdown ends with a "Create tag" action. Activating it replaces or expands that row into an input inside the dropdown. Pressing Enter creates the tag, selects it for the current card, and returns the dropdown to selection mode.

Rationale: This keeps card editing uninterrupted and matches the requested interaction.

Alternative considered: Open the board tag manager from the card dialog. That would reuse UI but interrupts the card editing flow and creates nested-dialog complexity.

### Remove deleted tags from cards

When a board tag is removed, delete its ID from every card that references it. If the tag is in use, ask for confirmation before removal.

Rationale: This prevents orphaned tag IDs from accumulating and makes the outcome explicit when tag removal affects cards.

Alternative considered: Keep orphaned IDs and hide missing tags. That avoids bulk card updates but complicates validation and future migration.

### Consolidate header actions into one board menu

Replace the separate top-right background and clear-board buttons with a single board actions menu. The menu contains background selection, tag management, and clear board.

Rationale: This creates a scalable board-level action surface and prevents the header from becoming crowded.

Alternative considered: Add a second top-right "Tags" button. This is quicker but continues the crowding problem the change is meant to address.

## Risks / Trade-offs

- Existing persisted API payloads will lack `tags`, `priority`, and `tagIds` -> Normalize and migrate payloads on read before validation, mirroring existing card content migrations.
- Removing a tag can update many cards -> Keep the operation local and synchronous because the current board size is bounded and already rewritten as a full board payload.
- Inline dropdown creation can become hard to keyboard-test -> Build it with native form/input semantics and add focused tests for Enter-to-create behavior.
- Header menu could hide the background picker too deeply -> Keep the menu label/icon clear and make the background picker accessible from the first menu level.
- Tag manager can become too feature-heavy -> Limit v1 to create, rename, remove, duplicate-name validation, and in-use confirmation.

## Migration Plan

1. Extend shared board types to include `BoardTag`, `priority`, `tagIds`, and `tags`.
2. Update localStorage fetch/migration logic so all loaded cards receive `priority: 'medium'` and `tagIds: []` when missing, and all board states receive `tags: []` when missing.
3. Update server-side normalization and validation with the same defaults so existing SQLite payloads continue to load.
4. Update save paths to persist the expanded board state through existing `updateStorage`, `updateBackgroundStorage`, and API PUT flows.
5. Rollback by leaving migrated data in place; older code would ignore unknown card fields only if its validators permit them, so rollback should be considered best-effort unless paired with data cleanup.

## Open Questions

- Should clearing the board also clear unused board tags, or should tags remain as reusable board vocabulary? Current recommendation: keep tags.
- Should cards display all tags, or cap visible tags with a count when space is tight? Current recommendation: show a small capped list and keep all tags visible in the dialog.
