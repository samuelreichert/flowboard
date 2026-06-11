## Why

The local Node server has grown into a single 300+ line module that mixes bootstrapping, SQLite persistence, board validation, API routing, static asset serving, and Vite development middleware. Moving the server to TypeScript and splitting responsibilities now will reduce drift from the typed client code and give future persistence/API work a clearer place to grow.

## What Changes

- Migrate the local server entrypoint from `.mjs` JavaScript to TypeScript with a dedicated server TypeScript configuration that emits runnable Node ESM output.
- Split server responsibilities into focused modules for configuration, HTTP helpers, static SPA serving, board API routing, and SQLite board persistence.
- Extract shared board-state validation and normalization logic into browser-safe TypeScript modules that can be used by both client storage and server API handling.
- Preserve the existing local-first behavior, `/api/board` endpoint shape, SQLite database format, development server behavior, and production static serving behavior.
- Add focused tests or verification coverage for shared board normalization/validation and server API behavior where practical.

## Capabilities

### New Capabilities

- `server-architecture`: Covers the typed and modular structure of the optional local server, including shared board-domain validation and preservation of existing runtime behavior.

### Modified Capabilities

- `offline-pwa-readiness`: Clarifies that the optional `/api/board` SQLite persistence endpoint keeps the same synchronization role while being served by the modular TypeScript server.

## Impact

- Affected code: `server/index.mjs`, new `server/**/*.ts` modules, TypeScript configuration, package scripts, shared board domain modules, and client storage imports.
- Affected APIs: `/api/board` must remain compatible for `GET`, `PUT`, errors, and payload shape.
- Affected systems: local development (`npm run dev`), local production serving (`npm start`), local SQLite persistence, and Vite production build/type-check flow.
- Dependencies: no new runtime dependency is expected; TypeScript and Node types already exist in the project.
