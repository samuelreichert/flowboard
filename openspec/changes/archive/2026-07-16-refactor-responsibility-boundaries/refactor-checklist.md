## Refactor Checklist

### Current Safety Net

- `src/App.test.tsx` covers app shell rendering, auth entry, social auth, magic links, routing, sidebar behavior, settings, board CRUD, composer workflows, card dialog behavior, tag management, rich content editor behavior, DnD helpers, column actions, clear board, completed-work flow, and history.
- `src/storage/offline.test.ts` covers failed API hydration, failed API writes, board-state storage, and database hydration metadata preservation.
- `src/board/validation.test.ts` covers stored board normalization, legacy migrations, work-cycle inference, invalid payload rejection, and image URL safety.
- New focused tests should be added beside extracted helpers before production call sites become thinner.

### Destination Modules

- App facade: keep `src/app/useAppController.ts` as a thin composition facade only.
- Auth/session: move Supabase session and sign-in actions under `src/app` or `src/auth` hook ownership.
- Board commands: keep pure column/card commands under `src/board`.
- Tag commands: keep shared tag validation and tag mutations under `src/board`.
- Storage: split local cache, remote persistence, migration, and public facade under `src/storage`.
- Rich editor: split Markdown, extensions, commands, editor hook, interactions hook, viewer, toolbar, and bubble menu modules under `src/components/CardContentEditor`.
- CSS: keep global tokens global; move feature CSS to owning components and shared button/menu CSS to shared primitive ownership.
- Tests: keep `App.test.tsx` as the integration safety net while production boundaries move, then split tests by the extracted owner.
