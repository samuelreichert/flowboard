## Context

Flowboard is a Vite React app with a local-first board model. Browser storage is always available as the primary client-side persistence layer, and `npm run dev` / `npm start` can additionally persist the full board state through a local `/api/board` SQLite endpoint. The previous card metadata change consolidated top-right board actions into a Base UI `Menu`, added tags and priorities, and left follow-up Base UI alignment work.

The current board actions trigger uses an ellipsis icon plus "Board" label. This works, but it blends two mental models: generic overflow and board settings. The README is also minimal relative to the current app, and there is no PR workflow checking whether documentation stays current. PWA support is not configured in `vite.config.ts`, so the app does not yet precache its shell and assets for offline use.

## Goals / Non-Goals

**Goals:**

- Make the top-right board action affordance feel intentional, compact, and accessible.
- Continue migrating eligible custom interactions toward Base UI primitives listed in the audit.
- Improve the README with current capabilities, storage guidance, and a real screenshot.
- Add a PR-time README freshness check that flags missing documentation updates without silently rewriting project docs.
- Add PWA support for the static app shell and bundled assets.
- Preserve local-first behavior so users can continue editing when the optional SQLite API is unavailable.

**Non-Goals:**

- Add multi-user sync, hosted database storage, authentication, or cross-device persistence.
- Replace TipTap, Atlaskit drag-and-drop, or the existing board data model.
- Make remote image backgrounds available offline unless the user has already loaded or embedded them.
- Auto-merge AI-generated README edits without review.

## Decisions

### Use a settings/tools affordance for board actions

Replace the ellipsis-plus-label trigger with an icon-only board settings trigger, using a lucide icon such as `Settings2` or `SlidersHorizontal`. Keep the accessible name as "Open board actions" or "Open board settings" and add a tooltip so the icon remains discoverable.

Rationale: the menu contains board-level settings and management actions, not arbitrary overflow. An icon-only trigger also reduces header weight and aligns with the user's preference for a cleaner top-right menu.

Alternative considered: keep ellipsis and remove the label. This is compact, but it still communicates "miscellaneous overflow" rather than "board tools."

### Match Base UI primitives to interaction type

Use Base UI `Popover` for the background picker, Base UI `Select` for single-choice column and priority controls, Base UI `Field` / `Field.Control` for practical form fields and validation errors, and Base UI `Toolbar` / `Toolbar.Button` for editor formatting controls. Keep true command lists as Base UI `Menu`.

Rationale: this follows the Base UI alignment audit from exploration and keeps interaction semantics specific. It avoids stretching `Menu` into picker, select, form, and toolbar roles.

Alternative considered: only restyle existing controls. That would be faster but would leave custom keyboard, focus, and accessibility behavior in places where Base UI already provides the primitive.

### Skip README review automation for this change

The initial exploration considered a pull request README freshness check, but the user explicitly removed that item from implementation scope. Keep the spec notes as future context, but do not add workflow files or automation in this change.

Rationale: keeping the current change focused avoids adding CI configuration before the desired provider and failure mode are chosen.

Alternative considered: add a GitHub Actions workflow now. This was skipped per user request.

### Generate one durable product screenshot for the README

Create a seeded, representative board state and capture the app at a desktop viewport. Store the screenshot under `public/` and reference it near the top of the README.

Rationale: GitHub readers should see the actual product interface: columns, cards, priorities, tags, rich content, background, and the top-right board settings affordance.

Alternative considered: use the existing `public/flowboard-background.png`. That asset is visually polished but does not show the app.

### Add PWA support with precached app shell and explicit API behavior

Use `vite-plugin-pwa` in the Vite build to generate a manifest and service worker. Precache static app assets and icons, register the service worker from the React entry point, and document install/offline behavior. For the optional `/api/board` endpoint, keep localStorage writes as the offline source of truth and add retry/reconnect handling only if implementation discovers the current fire-and-forget writes can drop local changes after reconnection.

Rationale: Flowboard's local-first client model already supports offline editing. The missing piece is reliable loading of the app shell and assets while offline. API synchronization should not block local use.

Alternative considered: runtime-cache `/api/board` responses. This risks confusing stale server state with local client state. Since localStorage already stores the board, API caching should be avoided or narrowly scoped.

## Risks / Trade-offs

- README review automation remains unspecced -> revisit provider, secret names, and blocking behavior before adding a workflow.
- PWA service workers can make stale builds confusing -> use a predictable update mode and include tests/manual verification for rebuild refresh behavior.
- Base UI migration can alter accessible names and break existing tests -> update tests around user-visible behavior, not implementation internals.
- Remote custom background URLs will not be guaranteed offline -> keep bundled backgrounds offline-ready and document the remote-image limitation.
- SQLite API writes can fail while offline -> keep localStorage authoritative in the client and avoid clearing or overwriting it with unavailable API state.

## Migration Plan

1. Update UI affordances and Base UI primitives while keeping existing labels and workflows available.
2. Add README screenshot and documentation updates after the UI reaches its final visual state.
3. Add PWA manifest, icons, service worker registration, and offline build behavior.
4. Verify with tests, production build, and a manual offline smoke test.

Rollback is low-risk for UI and README changes. PWA rollback requires removing service worker registration/plugin configuration and, for already-installed browsers, ensuring the old service worker no longer controls the page.

## Open Questions

- Which exact icon should become the board actions trigger: `Settings2`, `SlidersHorizontal`, or another lucide icon?
- If README automation is revisited later, should it fail the PR or post a non-blocking warning?
- If README automation is revisited later, which AI provider and secret name should it use?
