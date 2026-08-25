## 1. Shared Remote-State Foundation

- [x] 1.1 Add a pure remote-data state derivation helper that distinguishes unresolved loading, initial error, resolved empty, and resolved content while preserving resolved data during secondary requests, with focused unit tests for state precedence.
- [x] 1.2 Add a shared status-aware API request error and response-error parser that preserve HTTP status/server code with safe fallback messages, with tests for structured, unstructured, and unreadable error responses.
- [x] 1.3 Add reusable accessible panel and inline loading/error presentations on top of the existing empty-state primitives, including optional retry actions and component tests for busy, status, and alert semantics.

## 2. Completed-History Collection States

- [x] 2.1 Add English and Brazilian Portuguese History loading, unavailable, refresh-failure, load-more-failure, and retry labels to the shared localization catalogs.
- [x] 2.2 Update History workspace composition to preserve `undefined` unresolved query data, derive the shared primary state, and render the same loading treatment from the lazy History suspense fallback.
- [x] 2.3 Update `HistoryView` to render loading, initial error, confirmed empty, and populated states without showing empty copy before the first request resolves.
- [x] 2.4 Preserve resolved cycles during background refetch and pagination, and add inline retryable refresh/load-more failures wired to `refetch` and `fetchNextPage` respectively.
- [x] 2.5 Add controlled-promise History tests covering initial loading without empty-state flash, resolved empty history, initial failure/retry, cached-data refresh failure, and next-page failure/retry.

## 3. Archived-Card Detail States

- [x] 3.1 Enable archived-card detail queries from cycle/card route identifiers independently of the currently loaded history summary page while retaining stable query keys and ownership-scoped endpoint behavior.
- [x] 3.2 Pass an explicit archived-detail loading/error/content state to the dialog so unresolved content is never rendered as the no-content state and summary metadata remains usable when available.
- [x] 3.3 Classify detail 404 responses as the existing missing-archive route state and render other detail failures as a localized retryable unavailable state without closing or mislabeling the requested card.
- [x] 3.4 Add archived-detail and routing tests for unresolved detail, successful empty content, transient failure/retry, 404 handling, and a valid direct route whose card summary is not in the first history page.

## 4. Verification

- [x] 4.1 Run focused remote-state, API client, History, archived-dialog, routing, and localization tests and resolve regressions.
- [x] 4.2 Run the project typecheck and broader unit test suite.
- [x] 4.3 Verify loading, empty, initial error, background error, pagination error, and archived-detail states at desktop and mobile widths, including keyboard Retry paths, announcements, edge clipping, and consistency with related Flowboard controls.
