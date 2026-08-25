## Why

History currently treats unresolved query data as a confirmed empty collection, so users briefly see “No completed work yet” while history is still loading. History and archived-card failures are also conflated with empty or missing states, leaving users without accurate feedback or a retry path.

## What Changes

- Introduce a shared remote-data state model that distinguishes unresolved loading, initial error, confirmed empty, and resolved content states while preserving cached data during background work.
- Provide reusable accessible loading and recoverable error treatments based on Flowboard's existing empty-state primitives.
- Apply the shared state behavior to the completed-history collection, lazy History surface, pagination, and archived-card detail loading.
- Preserve HTTP failure classification so archived-card `not found` responses remain distinct from transient network or server failures.
- Add localized English and Brazilian Portuguese loading/error/retry copy and coverage for initial, cached, paginated, and archived-detail request states.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `completed-work-history`: Define observable loading, empty, retryable error, pagination-error, and archived-detail behavior for History.
- `client-server-state-cache`: Define how query state and cached data drive History presentation and retry behavior.
- `shared-ui-primitives`: Extend shared state treatments beyond empty content to accessible loading and recoverable error presentation.

## Impact

- Affects History workspace composition, completed-history queries, archived-card detail queries/dialogs, shared state primitives, localization catalogs, and their tests.
- Introduces a shared client-side remote-data state derivation helper and status-aware API request error representation.
- Does not change authenticated endpoint routes or successful response payloads and introduces no breaking API or dependency changes.
