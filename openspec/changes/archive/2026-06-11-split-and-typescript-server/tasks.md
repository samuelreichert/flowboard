## 1. Shared Board Domain

- [x] 1.1 Create browser-safe shared board modules for board types, constants, validation, and normalization.
- [x] 1.2 Move card metadata defaults, legacy `description` migration, missing content migration, tag filtering, date validation, background URL validation, and board-state checks into the shared modules.
- [x] 1.3 Update client storage to import shared board-domain utilities while preserving localStorage hydration, API sync, and migration behavior.
- [x] 1.4 Add or update tests for shared normalization and validation, including legacy cards, missing priority/tag metadata, invalid board payloads, and safe background image URLs.

## 2. Server TypeScript Build

- [x] 2.1 Add a dedicated server TypeScript configuration using Node ESM settings, Node runtime types, strict checking, and emitted output.
- [x] 2.2 Decide and wire the server development runtime path, preserving the existing `npm run dev` behavior with Vite middleware and `/api/board`.
- [x] 2.3 Update package scripts so local production serving runs the emitted TypeScript server output.
- [x] 2.4 Ensure generated server output and TypeScript build metadata are ignored or kept out of source review as appropriate.

## 3. Modular Server Split

- [x] 3.1 Replace the monolithic server entrypoint with a TypeScript bootstrap module that only resolves configuration, composes handlers, and starts listening.
- [x] 3.2 Extract runtime configuration for root directory, database path, port, development mode, and static distribution path.
- [x] 3.3 Extract JSON response and request-body helpers, including the existing request size limit and response headers.
- [x] 3.4 Extract SQLite board repository setup, schema initialization, board read, and board upsert behavior without changing the database table format.
- [x] 3.5 Extract `/api/board` routing for `GET`, `PUT`, invalid JSON, invalid board state, and unsupported methods.
- [x] 3.6 Extract production static SPA serving with the existing content types, file safety check, and app-shell fallback behavior.
- [x] 3.7 Preserve development Vite middleware delegation for non-API requests.

## 4. Compatibility Verification

- [x] 4.1 Verify `npm run typecheck` covers the app and server TypeScript sources or add a separate server type-check command and run it.
- [x] 4.2 Run the test suite and confirm storage/normalization behavior remains compatible.
- [x] 4.3 Build the production app and server output successfully.
- [x] 4.4 Smoke test `GET /api/board`, valid `PUT /api/board`, invalid JSON, invalid board payload, unsupported method handling, and non-API SPA fallback.
- [x] 4.5 Smoke test development serving to confirm Vite handles non-API requests while the server handles `/api/board`.
- [x] 4.6 Confirm local-first behavior remains intact when the optional API is unavailable.

## 5. Documentation Review

- [x] 5.1 Update README setup or storage notes if package scripts, build steps, or local server behavior become different for users.
- [x] 5.2 Review the staged diff to confirm the change is limited to server TypeScript migration, modularization, shared board-domain logic, tests, and any necessary docs.
