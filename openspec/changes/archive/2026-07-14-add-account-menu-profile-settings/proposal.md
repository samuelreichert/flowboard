## Why

Flowboard now has authentication and theme controls, but the sidebar footer still treats account identity, sign out, and appearance as separate controls. Consolidating these into an account menu and settings dialog makes the sidebar cleaner, gives signed-in users an obvious profile surface, and creates room for future account and app preferences without crowding primary navigation.

## What Changes

- Add a compact account trigger to the bottom of the sidebar showing the user's avatar or initials, display name, and email.
- Open an account menu from that trigger with a profile summary row, Settings, and Log out.
- Make the profile summary row open an Edit profile dialog where users can update their display name, upload an avatar image up to 5 MB, remove the avatar, and fall back to initials.
- Seed Flowboard profile display name and avatar from Supabase/provider metadata when available, then persist user edits as Flowboard-owned profile data.
- Add a Settings dialog that contains Appearance settings for the existing system/light/dark theme control and Board settings for the existing completed-column and clear-board controls.
- Remove the current Board settings item from the sidebar navigation after those controls move into Settings.
- Keep static/local mode as a development/demo fallback while giving it graceful settings access without pretending a real authenticated account exists.

## Capabilities

### New Capabilities

- `user-profile`: Defines Flowboard-owned profile display data, editable profile behavior, avatar upload/remove behavior, and account menu identity presentation.

### Modified Capabilities

- `app-shell-theme`: Theme selection moves from the sidebar footer into the Settings dialog opened from the account menu, and sidebar navigation loses the Board settings nav item.
- `supabase-auth`: Authenticated sessions seed Flowboard profile fields from Supabase/provider metadata while Supabase Auth remains the identity source for login/session ownership.

## Impact

- Frontend app shell: `src/app/AppSidebar.tsx`, `src/app/AppDialogs.tsx`, `src/app/useAppController.ts`, reducer/state types, and related sidebar/dialog styles.
- Profile UI: new reusable account menu/profile/settings dialog components using existing Base UI, DialogShell, menu, segmented control, and app theme tokens.
- Profile data model and API: Prisma `Profile` fields for display name and avatar metadata, migrations for PostgreSQL and SQLite schemas, profile read/update routes, and authenticated profile service changes.
- Avatar storage: Supabase Storage or an equivalent authenticated upload path for profile images, with 5 MB file validation and removal behavior.
- Specs/tests: app shell/theme behavior, Supabase profile seeding, user-profile behavior, local/static fallback behavior, dialog/menu accessibility, and layout-sensitive sidebar states.
