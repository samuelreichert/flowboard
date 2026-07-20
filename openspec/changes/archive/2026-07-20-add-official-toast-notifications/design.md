## Context

The authenticated application currently renders `persistenceMessage` directly in `App.tsx` as one fixed lower-right `role="status"` element. That message represents transient saving, failed durable saves, unavailable-board fetches, and errors reported by optimistic board and card mutations. The element is visually neutral regardless of severity, has no close control or queue, and is not available as a shared application primitive.

Flowboard already uses `@base-ui/react` 1.5.0 for dialogs, fields, menus, popovers, selects, toolbars, and buttons. The locked package exports `@base-ui/react/toast`, including a Provider, Portal, Viewport, Root, Content, Title, Description, Action, and Close. It provides the accessibility and interaction foundation needed without adding a separate notification dependency.

## Goals / Non-Goals

**Goals:**

- Establish one Flowboard-owned toast API and visual treatment for app-level feedback.
- Use Base UI Toast for the accessible portal, viewport, stacking, timing, keyboard access, and swipe-dismiss behavior.
- Make persistence failures clearly distinct and remain visible until dismissed.
- Avoid distracting confirmation notifications for normal background saves.
- Preserve existing Flowboard themes, English and Brazilian Portuguese localization, keyboard behavior, and reduced-motion support.

**Non-Goals:**

- Replacing inline form validation, profile-dialog errors, editor URL errors, or sign-in-screen feedback.
- Replacing the completed-work celebration overlay.
- Building a durable notification center, notification history, retry mechanism, server-side notifications, or browser/OS push notifications.
- Changing board persistence, authentication, query-cache, or mutation semantics.

## Decisions

### Compose a Flowboard wrapper from Base UI Toast

The application root will host one `Toast.Provider` and a portalled `Toast.Viewport`. A small Flowboard toast module will own the notification data model, queue/update/dismiss interface, localization-facing defaults, Base UI composition, Lucide severity icons, and CSS variants. Callers will request a semantic notification rather than rendering toast markup or positioning their own status elements.

This preserves a single source of truth for styling, timing, and accessibility while keeping Base UI responsible for toast mechanics.

**Alternatives considered:**

- Retain the raw fixed status element: rejected because it cannot represent severity, stacking, dismissal, or a reusable app contract.
- Add Sonner or another toast package: rejected because Base UI Toast is already locked in the dependency graph and matches the existing primitive strategy.
- Build a custom portal, timer, gesture, and live-region system: rejected because it would duplicate Base UI behavior and add accessibility risk.

### Use semantic variants and a predictable lifespan policy

The wrapper will expose `info`, `success`, `warning`, and `error` variants. Each toast has a concise title, an optional concise description, and a close affordance.

- Informational and success notifications auto-dismiss after a short, shared duration.
- Warning notifications use the shared timed behavior unless a future product workflow explicitly needs a persistent warning.
- Error notifications are persistent until closed, because a failed save or unavailable board can mean recent user work is not durable.
- A repeated update to the same logical operation replaces or updates its existing toast instead of building a duplicate stack.

This makes background work calm by default while ensuring important persistence failures are not lost after a timeout.

### Place the global toast viewport outside the board layout

The viewport will render through Base UI's portal rather than inside the workspace grid or a dialog. It will use a high, documented layer above application content but below any modal interaction that requires precedence. Desktop toasts will stack at the upper-right with safe viewport margins; compact screens will use an edge-safe, full-width presentation with the same reading order and dismissal behavior.

This avoids clipping within the board's `overflow: hidden` workspace and prevents the toast layout from being coupled to the sidebar, board columns, or dialogs.

### Treat persistence feedback as application-level notifications

The current `persistenceMessage` sources will report toast events instead of returning UI text for `App.tsx` to render. The normal save lifecycle may show at most one short-lived saving/info toast and clears it when the mutation succeeds; success does not create a separate “saved” toast. Board bootstrap failure, complete-board load failure, and card/board mutation failure create persistent error notifications. A later successful operation resolves the matching transient status but does not automatically hide an error the user has not acknowledged.

Auth feedback remains inline in `AuthGate`, because it is tied to the email form and the signed-out page. Dialog and field errors remain attached to their relevant inputs, which preserves direct remediation and accessible error association.

### Preserve accessible, low-disruption interaction

The implementation will rely on Base UI Toast live regions and viewport navigation. Toasts will not move focus or trap keyboard navigation; the close control will have a localized accessible name. The CSS will use existing color, radius, shadow, focus, and dark-theme tokens, include non-color severity cues, and disable or reduce motion when the user requests reduced motion.

Toast actions are out of scope for this change. Limiting initial notifications to text and dismissal avoids introducing inaccessible or time-sensitive calls to action.

## Risks / Trade-offs

- [Persistent errors can obscure board content if many failures occur] → Deduplicate failures by logical operation, cap the visible stack, and let the user dismiss each toast.
- [A frequent saving toast can become visual noise] → Use one updateable transient status and never show a “saved” confirmation for routine background persistence.
- [A portal can conflict with dialogs or mobile browser safe areas] → Define a z-index token/contract, verify dialog and mobile states, and use viewport-safe spacing.
- [A generic error can be announced repeatedly to screen-reader users] → Deduplicate repeat errors, use concise localized copy, and let Base UI manage the live region.
- [Base UI Toast API behavior may differ by its locked version] → Implement against the installed 1.5.0 package export and add focused interaction tests before relying on newer APIs.

## Migration Plan

1. Add the Flowboard toast provider, viewport, wrapper API, styling, and localized labels without changing persistence behavior.
2. Migrate persistence and mutation feedback sources to the wrapper and remove the `app__persistence-status` render path and CSS only after the equivalent toast behavior is covered.
3. Verify normal saving, failed save, unavailable board, repeated errors, keyboard dismissal, desktop/mobile positioning, light/dark themes, and reduced motion.
4. Roll back by reverting the UI-only change; no persisted data, server contract, migration, or dependency change is involved.

## Open Questions

- None for the first implementation. This proposal adopts persistent-until-dismissed failed-save notifications, as the safer default for potentially non-durable work.
