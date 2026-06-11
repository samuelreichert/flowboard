## Context

Flowboard is already a TypeScript React/Vite app, but the optional local server remains a single JavaScript ESM file. That server owns several unrelated responsibilities: resolving runtime configuration, initializing SQLite, validating and normalizing board state, handling `/api/board`, serving the production SPA, and attaching Vite middleware in development.

The app is local-first. Browser storage remains the interactive source of truth, and the `/api/board` endpoint is an optional synchronization target for local development and self-hosted local runs. The server refactor must preserve that behavior while making future server work easier to place.

## Goals / Non-Goals

**Goals:**

- Compile the local server from TypeScript to runnable Node ESM.
- Keep the server entrypoint small and limited to bootstrapping.
- Split server code by responsibility so persistence, routing, HTTP helpers, configuration, and static serving can grow independently.
- Share board-state types, validation, and normalization between client storage and server API handling where the logic is browser-safe.
- Preserve the existing `/api/board` request/response contract, SQLite table format, Vite development flow, production static serving flow, and local-first failure behavior.
- Keep the change dependency-light; TypeScript and Node types already exist in the project.

**Non-Goals:**

- Introduce a web framework such as Express, Fastify, or Hono.
- Change the SQLite schema or database file format.
- Add authentication, multi-user synchronization, remote hosted persistence, or cross-device storage.
- Change the deployed static Vercel behavior.
- Replace localStorage-first editing with server-first editing.

## Decisions

### Use compiled TypeScript for the server

The server will use a dedicated server TypeScript configuration that emits JavaScript into a build output directory. Package scripts will run the emitted server in normal start mode and either run an emitted server or a lightweight TypeScript execution path in development, as long as `npm run dev`, `npm start`, and local production serving keep their current behavior.

Alternatives considered:

- Keep `.mjs` and only split files. This lowers migration risk but leaves the server outside the typed project, which allows continued drift from shared board types.
- Run `.ts` directly with Node 24 type stripping. This is attractive for simple scripts, but Node type stripping does not type-check and intentionally ignores `tsconfig` transforms. It is less explicit for an application server than compiling.
- Add `tsx` or a similar runtime dependency. This would simplify development execution but is unnecessary unless the compiled workflow becomes too awkward.

### Add a dedicated server tsconfig

The existing `tsconfig.node.json` is tuned for Vite configuration checking with `moduleResolution: "bundler"` and `noEmit: true`. The server needs Node-style ESM resolution and emitted output, so it will use a separate config such as `tsconfig.server.json` with NodeNext module settings, Node types, strict checking, and an output directory excluded from app source.

Alternatives considered:

- Reuse `tsconfig.node.json`. This would blur Vite config checking and server compilation, and the existing `noEmit` setting works against the server runtime need.
- Include server files in `tsconfig.app.json`. This would mix DOM/browser assumptions with Node APIs.

### Centralize board-domain validation and normalization

Board shape checks, card metadata defaults, legacy card normalization, background URL validation, and related constants will move into browser-safe shared TypeScript modules. Client storage and server routes will import the same functions instead of maintaining parallel validators.

Alternatives considered:

- Keep stricter validation on the server and looser validation in client storage. This preserves the current split but increases the chance of surprising rejected API writes after local edits appear valid.
- Introduce a schema library. This could make validation more declarative, but it adds dependency and migration cost that is not needed for the current board shape.

### Keep native Node HTTP and SQLite APIs

The server will continue using `node:http`, Vite middleware in development, and `node:sqlite` for local persistence. The split is about ownership boundaries, not changing the server stack.

Alternatives considered:

- Introduce a routing framework. This would add structure, but the current API surface has one endpoint and does not justify a new runtime abstraction.
- Replace `DatabaseSync`. This would expand scope and is unrelated to the maintainability problem.

### Suggested module boundaries

The implementation should converge toward this shape:

```text
server/
  index.ts
  config.ts
  http/
    json.ts
    static.ts
  db/
    boardRepository.ts
  routes/
    board.ts
src/
  board/
    types.ts
    validation.ts
  storage/
    index.ts
```

`server/index.ts` should compose the modules and listen on the configured host/port. `routes/board.ts` should own method/path behavior. `db/boardRepository.ts` should own SQLite setup and read/write operations. Shared board modules should avoid DOM, React, Vite-only globals, localStorage, and Node-only APIs so they can be imported from both runtime sides.

## Risks / Trade-offs

- TypeScript ESM import paths can be noisy because emitted Node ESM needs resolvable file extensions. → Mitigate with a server tsconfig that matches Node ESM behavior and run typecheck/build early during implementation.
- Moving validation can accidentally loosen or tighten accepted board states. → Mitigate with tests for current valid board state, invalid payloads, legacy `description` card migration, missing card priority/tag metadata, and background URL validation.
- Build scripts can accidentally break `npm run dev` or `npm start`. → Mitigate by verifying both local development and production-server paths after the split.
- Shared modules can accidentally import browser-only or server-only APIs. → Mitigate by keeping shared board modules small, pure, and covered by TypeScript configs for both app and server.
- The refactor may touch many imports for little user-visible change. → Mitigate by preserving behavior and splitting in logical steps that are easy to review.

## Migration Plan

1. Extract shared board types and validation/normalization into browser-safe TypeScript modules while preserving existing behavior.
2. Update client storage to import the shared board-domain functions and constants.
3. Add a dedicated server TypeScript configuration and output path.
4. Split the server into focused TypeScript modules while preserving the current HTTP and SQLite behavior.
5. Update package scripts so development and production local serving use the TypeScript server workflow.
6. Run type-checking, tests, build, and targeted local server smoke checks.

Rollback is straightforward because the change does not alter persistent data format: revert the server TypeScript split and package script changes, then run the existing `.mjs` server.

## Open Questions

- Should `npm run dev` compile the server before running, use Node 24 type stripping for development only, or add a development-only runner if the compiled workflow is clumsy?
- Should `npm run build` include server compilation, or should server compilation be a separate script used by `npm start` and local deployment flows?
- Should server-only validation limits such as max columns, cards, tags, and ID/title lengths become shared client-side limits immediately, or should the first pass preserve the current stricter-server behavior and only remove duplication?
