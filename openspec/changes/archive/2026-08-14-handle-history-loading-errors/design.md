## Context

The completed-history infinite query is owned by `AppWorkspace`, which currently flattens missing query data to an empty array before passing it to `HistoryView`. `HistoryView` therefore cannot distinguish an unresolved first request from a successful empty response. Archived-card detail has a similar ambiguity: a summary is converted into a card with empty content while detail is pending, and all detail failures are treated as a missing route.

Flowboard already uses TanStack Query for history and detail resources, reusable centered and inline empty-state primitives, and localized English and Brazilian Portuguese catalogs. The solution needs to reuse those patterns, preserve cached content during refetch and pagination, and keep API ownership protections unchanged.

## Goals / Non-Goals

**Goals:**

- Give collection and detail consumers one shared algorithm for deriving loading, initial error, empty, and content states.
- Prevent unresolved or refreshing data from being presented as confirmed empty content.
- Provide consistent, accessible loading and recoverable error surfaces with localized retry actions.
- Preserve resolved history while background refetch or next-page requests are in progress or fail.
- Distinguish archived-card not-found responses from transient detail failures.
- Allow direct archived-card routes to request detail by their route identifiers without depending on the currently loaded history page.

**Non-Goals:**

- Changing completed-history or archived-card endpoint routes or successful payloads.
- Adding a new global notification system, external dependency, or persistence model.
- Reworking loading/error behavior for every existing Flowboard query in the same change.
- Replacing existing History card layouts with skeleton screens.

## Decisions

### Derive primary state from resolved-data presence

Add a pure shared remote-data state helper. Its primary state follows this precedence:

1. When query data is present, return `empty` or `content` from a caller-provided emptiness check, regardless of background fetching or refetch error flags.
2. When data is absent and the query failed, return `error`.
3. When data is absent and no terminal failure exists, return `loading`.

Background refresh, next-page loading, and next-page failure remain separate flags because they must not replace resolved data. This preserves the important distinction between `undefined` unresolved data and a successfully returned empty collection.

An alternative was to branch directly on `isLoading` and collection length in each component. That retains duplicated precedence rules and makes future query consumers vulnerable to the same false-empty bug, so it is rejected.

### Separate state derivation from state presentation

Keep the algorithm in an app-level TypeScript helper and add a reusable UI state treatment built on the existing `EmptyState`/`InlineEmptyState` styling. The presentation supports a semantic loading status, an error alert, optional icon, and optional retry action in centered and inline contexts.

Feature components supply localized title/body labels and retry callbacks. The shared primitive owns structure, action placement, and accessibility semantics but does not own product-specific copy or TanStack Query objects.

An alternative was a monolithic query boundary component that receives a complete TanStack Query result. That would couple shared presentation to one data library and make pagination/detail variations harder to express, so it is rejected.

### Keep resolved History visible during secondary requests

`AppWorkspace` will stop normalizing absent history data to `[]` and will derive a primary view state before rendering History. A first request uses the centered loading treatment; a first terminal failure uses a centered recoverable error; only resolved empty pages show “No completed work yet.” The lazy History `Suspense` fallback uses the same loading treatment.

When resolved data exists, background refetch does not replace it. A refetch failure adds an inline retryable warning. A next-page request leaves existing cycles visible and updates the load-more control; a next-page failure renders an inline retry action next to pagination controls.

### Model archived-card detail as its own remote resource

The archived-card dialog receives an explicit detail state instead of synthesizing empty content while the detail query is unresolved. When opened from a loaded summary, summary metadata can remain visible while the content area shows loading. When opened directly, the detail query is keyed and enabled from `cycleId` and `cardId` route parameters, so a valid card does not depend on being present in the currently loaded history page.

The detail endpoint already returns the complete archived card, allowing a direct route to populate the dialog after resolution. A 404 produces the existing missing-archive state. Network, rate-limit, authentication, and server failures produce a recoverable unavailable state with Retry and are not described as missing content.

### Preserve response classification in a shared request error

Introduce a shared API request error representation containing HTTP status and, when available, the server error code while retaining a safe fallback message. Completed-history and archived-detail response parsers use the shared response-error factory instead of throwing indistinguishable plain errors.

UI copy remains localized and does not expose raw server messages. A shared query retry predicate can avoid automatic retries for terminal client/not-found responses while retaining bounded retry behavior for transient failures. Manual Retry calls the appropriate query operation (`refetch` or `fetchNextPage`).

An alternative was matching the current English `Error.message` strings. That is brittle, loses status information, and cannot reliably distinguish 404 from 5xx/network failures, so it is rejected.

### Verify transitions, not only final states

Tests will hold request promises unresolved to assert the intermediate loading UI and the absence of empty/no-content copy. Rejected requests will cover initial retry, cached-data preservation, next-page retry, archived-detail 404, and transient archived-detail failure. Existing History layout and direct-route tests remain in place, with localized and accessibility assertions added for the shared state treatment.

## Risks / Trade-offs

- [Risk] A generic state helper could become an overly broad abstraction. → Keep its input/output minimal and adopt it only for History collection and archived detail in this change.
- [Risk] Cached content plus an error warning may appear contradictory. → Phrase the warning as a refresh/load-more failure and retain a nearby Retry action.
- [Risk] Status announcements could repeat during rerenders or automatic retries. → Announce state transitions through stable live regions and avoid remounting resolved content.
- [Risk] Reading an error response body can itself fail. → Always retain the HTTP status and safe fallback message even when structured error parsing fails.
- [Risk] Direct detail fetching changes route resolution order. → Continue loading History for the page surface, key detail by both route identifiers, and rely on the ownership-scoped endpoint's 404 behavior.

## Migration Plan

1. Add and test the shared state derivation, state presentation, and request-error classification utilities.
2. Integrate completed-history initial, background, and pagination states without changing successful data rendering.
3. Integrate archived-card detail and direct-route states, then update route tests.
4. Add localization and responsive/accessibility verification.

No data migration or coordinated server deployment is required. Rollback consists of reverting the client integration and shared utilities; endpoint compatibility is unchanged.

## Open Questions

None. The implementation can choose final component/helper names while preserving the state precedence and behavior defined here.
