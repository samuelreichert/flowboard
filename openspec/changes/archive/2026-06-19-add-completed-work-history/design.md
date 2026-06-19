## Context

Flowboard is a local-first React board backed by browser storage, with an optional local SQLite API that persists the complete board state as one JSON payload. The current board state contains background, columns, and board-level tags; cards live inside columns and store title, content, createdAt, priority, and tagIds. There is no completed-work lifecycle state today, and the app currently offers navigation for Board and Tags plus a destructive Clear board action.

This change adds a non-destructive reset flow for personal work cycles. The user chooses which column represents completed work, activates `Complete work` from the board header, and moves that column's cards into a readonly history view grouped by date range. Work cycles are not fixed length; each cycle records the actual start and completion dates.

## Goals / Non-Goals

**Goals:**

- Store active work-cycle metadata and completed-work history in the existing board-state payload.
- Let the user configure the completed column from a general board settings dialog.
- Archive cards from the configured completed column into a dated history group when the user confirms `Complete work`.
- Remove archived cards from the active board while preserving all other columns and active cards.
- Let users complete an empty work cycle after explicit confirmation, creating an empty history group.
- Render a separate readonly History view grouped by work-cycle date range.
- Render archived card details with created date, archived date, labelled priority and tags, readonly rich-text content, and markdown copy.
- Preserve useful tag context in archived cards while letting tag renames flow through history when the tag still exists.
- Migrate existing boards safely, including a convenience inference for a column titled `Done`.

**Non-Goals:**

- Editing archived cards or adding retro notes/comments to archived work.
- Undoing a completed-work action after confirmation.
- Enforcing a fixed sprint length or calendar cadence.
- Adding analytics, exports, search, or filtering to History.
- Creating a separate SQLite table or independent archive API.
- Reworking existing card drag-and-drop, tag management, or rich-content editing behavior.

## Decisions

### Store work-cycle history in the board payload

Extend `BoardState` with an `activeWorkCycle` object and a `completedWorkCycles` array:

```ts
type BoardState = {
  background: BoardBackground;
  columns: BoardColumn[];
  tags: BoardTag[];
  activeWorkCycle: {
    startDate: string;
    completedColumnId: string | null;
  };
  completedWorkCycles: CompletedWorkCycle[];
};
```

Rationale: the app already validates, normalizes, stores, and mirrors a complete board payload. Keeping history in the same payload preserves local-first behavior, keeps optional SQLite persistence simple, and avoids introducing a second persistence model before history needs richer querying.

Alternative considered: store completed work in a separate browser key and SQLite table. That would make history querying cleaner later, but adds consistency and migration complexity now.

### Archive readonly card snapshots

Each completed work cycle stores card snapshots rather than references to active board cards:

```ts
type CompletedWorkCycle = {
  id: string;
  startDate: string;
  endDate: string;
  completedColumnId: string | null;
  completedColumnTitle: string | null;
  cards: ArchivedCard[];
};

type ArchivedCard = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  priority: CardPriority;
  tagIds: string[];
  tagSnapshots: { id: string; name: string }[];
  archivedAt: string;
};
```

Rationale: history should preserve what was delivered when work was completed, even though those cards are removed from the active board. Readonly snapshots make the first version predictable and avoid questions about archived edits syncing back to active cards.

Alternative considered: add `completedAt`, `archivedAt`, and `sprintId` fields to normal cards. That is useful for analytics later, but cards currently live inside columns, and archived cards should no longer be active draggable cards.

### Use same-day cycle boundaries

When work is completed, the completed cycle's `endDate` and the next active cycle's `startDate` use the same completion timestamp or date basis. Display can format these as inclusive date ranges such as `01/06/2026 - 14/06/2026`, with the next cycle beginning `14/06/2026`.

Rationale: the user explicitly wants same-day boundaries rather than advancing the next cycle to the following calendar day. This also avoids timezone-sensitive "next day" calculation surprises.

Alternative considered: make the next cycle start on the following calendar day. That is visually tidy for two-week sprints but inaccurate for ad hoc work cycles completed mid-day.

### Configure completed column in board settings

Add a general board settings dialog that includes a completed-column select. The sidebar `Complete work` action uses this saved column ID. If no completed column is configured, the user must configure one before completing work.

Rationale: completed-column selection is board configuration, not a per-completion choice. A settings dialog keeps the completion confirmation focused on the action about to happen.

Alternative considered: ask for the completed column inline the first time `Complete work` is activated. That is quick initially, but makes the completion command carry setup concerns and gives the setting no obvious future home.

### Keep `Complete work` inside the board context

Expose `Complete work` in the board header, separate from the sidebar `History` navigation item. The command opens a confirmation dialog before archiving cards.

Rationale: completing work acts on the current board, so placing it inside the board keeps the action close to its context while preserving confirmation because it removes cards from the active board.

Alternative considered: keep the action in the sidebar. That made it globally discoverable, but it mixed a contextual board action with navigation and settings.

### Move destructive board reset into settings

Keep board reset/clear out of primary navigation and place it inside the board settings dialog as a danger-zone style action.

Rationale: clearing the board is destructive maintenance, not a regular workflow action. Settings is a better fit now that `Complete work` provides the normal non-destructive reset path.

Alternative considered: keep clear board at the bottom of the sidebar. That reduced accidental prominence, but still left a destructive action in navigation.

### Render archived card details as readonly rich content

Archived card detail dialogs reuse the card content markdown rendering pipeline in readonly mode. The detail surface shows created date with the title, priority on its own labelled row, tags on their own labelled row, rich content, Copy Markdown, and archived date at the bottom.

Rationale: archived cards should be useful for retros and reviews, not just storage records. Rendering the card content like the editor preserves the shape of delivered work while keeping history readonly.

Alternative considered: show archived markdown as plain text. That was simpler, but made completed work harder to scan and less faithful to the active card experience.

### Resolve history tag labels dynamically with snapshot fallback

Archived cards store both tag IDs and tag name snapshots. In History, if a tag ID still exists in the current board tag list, display the current tag name. If the tag was deleted, display the archived snapshot name.

Rationale: tag renames should update history so old work stays aligned with the user's current vocabulary. Deleted tags should remain visible in history so the user can still understand what context existed when the card was delivered.

Alternative considered: always show archived tag names. That maximizes historical fidelity but does not satisfy the desired rename behavior.

## Risks / Trade-offs

- Board payloads grow as history accumulates → Keep v1 scoped to personal local boards and preserve the existing whole-board payload; revisit separate history storage only if payload size becomes a real problem.
- Completed column IDs can become stale if the configured column is deleted → Normalize missing completed-column IDs to `null` and require reconfiguration before completing work.
- Inferring `Done` during migration can be wrong for unusual boards → Treat inference as a convenience only; expose the setting so the user can correct it.
- Date display can be confusing with same-day boundaries → Use clear labels and store full ISO dates/timestamps so formatting can improve without data loss.
- The completion animation could obscure whether data was archived → Run animation only after confirmation and after state has been safely persisted in local state.
- Long tag labels can create unstable chip heights → Keep card chips single-line with ellipsis so board and history cards retain stable visual rhythm.
- Existing validators may reject migrated payloads if every new field is required immediately → Normalize missing fields before validation in both client storage and server API reads.

## Migration Plan

1. Extend shared board types with active work-cycle, completed work-cycle, and archived card types.
2. Update board normalization so missing `activeWorkCycle` defaults to a new object and missing `completedWorkCycles` defaults to an empty array.
3. During migration, infer `completedColumnId` from a column whose title case-insensitively equals `Done` when one exists.
4. Set the initial active work-cycle start date to the oldest `createdAt` among cards in the inferred completed column. If there is no inferred completed column or it has no cards, use the current date.
5. Keep optional SQLite persistence unchanged at the table/API level because the payload remains a single board-state JSON document.
6. Rollback is best-effort: older code may ignore or reject unknown board-state fields depending on validator behavior. No destructive migration of active cards is required until the user confirms a completion action.

## Resolved Product Details

- Board settings includes completed-column configuration and the destructive Clear board action.
- Empty completed-work history groups show a zero-card group with explicit empty copy.
- Completed-column selection is preserved across rename because the column ID remains stable, and cleared only when the selected column is deleted.
