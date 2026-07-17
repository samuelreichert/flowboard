## 1. Repository Read Models

- [x] 1.1 Define lean TypeScript DTOs for board bootstrap, card summaries, tags, work-cycle state, and active card detail.
- [x] 1.2 Add a Prisma-backed repository method that loads or creates the resolved principal's main board and returns bootstrap data without completed history or rich card content.
- [x] 1.3 Add a Prisma-backed repository method that loads rich active-card detail scoped to the resolved principal's main board.
- [x] 1.4 Add repository tests proving bootstrap omits rich card content and completed history while preserving column and card order.
- [x] 1.5 Add repository tests proving card detail returns content for owned cards and returns missing for inaccessible cards.

## 2. API Routes

- [x] 2.1 Add authenticated route handling for `GET /api/board/bootstrap` using the existing principal resolver.
- [x] 2.2 Add authenticated route handling for `GET /api/board/cards/:cardId` using the existing principal resolver.
- [x] 2.3 Ensure unauthenticated production requests to the new endpoints are rejected without reading board data.
- [x] 2.4 Keep existing `/api/projects`, `/api/boards/default`, `/api/boards/:id`, and `PUT /api/boards/:id` behavior unchanged.
- [x] 2.5 Add route tests for authenticated, local-development, missing-card, and cross-owner card-detail scenarios.

## 3. Client Read Path

- [x] 3.1 Add client API wrapper functions for `GET /api/board/bootstrap` and `GET /api/board/cards/:cardId`.
- [x] 3.2 Keep existing full-board hydration active and document why summary-only bootstrap must not feed legacy full-board writes yet.
- [x] 3.3 Add conversion utilities or types that make the bootstrap/card-detail response shapes ready for the upcoming TanStack Query read path without changing normal hydration.
- [x] 3.4 Preserve local SQLite no-auth development behavior by serving the new bootstrap endpoint through the same principal and repository path.
- [x] 3.5 Add client tests covering the new API wrapper response parsing.

## 4. Verification

- [x] 4.1 Run the relevant server route and repository tests.
- [x] 4.2 Run the relevant React tests for board hydration and card opening.
- [x] 4.3 Run the project typecheck.
- [x] 4.4 Manually inspect the new bootstrap response shape and confirm it excludes rich card content, completed history, project data, owner identifiers, and unused timestamps.
- [x] 4.5 Document any intentional compatibility behavior left for later PRs.
