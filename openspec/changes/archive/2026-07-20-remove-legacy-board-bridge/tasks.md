## 1. Server API Cleanup

- [x] 1.1 Remove legacy full-board route matching for `GET /api/boards/default`, `GET /api/boards/:id`, and `PUT /api/boards/:id`.
- [x] 1.2 Remove server imports, helpers, and response code that only support complete-board route reads or writes.
- [x] 1.3 Keep structured normalization and any internal seed/setup helpers needed by current Prisma-backed resource routes.
- [x] 1.4 Update server route tests so removed full-board routes are unsupported and do not read or write board data.

## 2. Client Full-Board Bridge Removal

- [x] 2.1 Remove complete-board API helpers from `src/storage/authenticatedApi.ts`.
- [x] 2.2 Remove `remotePersistence` and stop browser/in-memory storage updates from issuing remote full-board saves.
- [x] 2.3 Remove complete-board safety snapshot logic and tests from authenticated sync behavior.
- [x] 2.4 Simplify app controller/sync surfaces so normal flows no longer expose `persistAuthenticatedBoard` or `loadCompleteBoardState`.
- [x] 2.5 Update app test utilities and component tests to mock only bootstrap, detail, history, and resource mutation endpoints.

## 3. Documentation And Spec Alignment

- [x] 3.1 Update `RUNNING_MODES.md` so local and production modes list only bootstrap, detail, history, and resource mutation routes.
- [x] 3.2 Remove stale OpenSpec references that describe `/api/boards/default` or `/api/boards/:id` as supported product API.
- [x] 3.3 Confirm old-card normalization specs remain intact for migration safety.

## 4. Verification

- [x] 4.1 Run focused server/API tests covering removed routes and supported resource routes.
- [x] 4.2 Run focused client tests covering authenticated board startup, mutations, history, and clear board without full-board saves.
- [x] 4.3 Run project validation commands, including typecheck/test coverage appropriate for touched files.
- [x] 4.4 Run `rtk npx react-doctor@latest --verbose --scope changed` before opening the PR and address actionable findings.
- [x] 4.5 Run `openspec validate remove-legacy-board-bridge --strict`.
