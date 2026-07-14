## 1. Profile Data Model and API

- [x] 1.1 Add Flowboard profile avatar fields to PostgreSQL and SQLite Prisma schemas and migrations while preserving existing profile rows.
- [x] 1.2 Extend authenticated user verification/profile provisioning to expose provider display metadata and seed missing profile display fields without overwriting saved Flowboard values.
- [x] 1.3 Add profile read/update repository/service functions with validation for display name, avatar reference, and avatar removal.
- [x] 1.4 Add authenticated profile API routes and client API helpers separate from board state APIs.
- [x] 1.5 Add server tests for profile provisioning, metadata seeding, update persistence, and non-sensitive auth failure behavior.

## 2. Avatar Storage

- [x] 2.1 Define Supabase Storage bucket/path conventions and required environment/config documentation for profile avatars.
- [x] 2.2 Implement avatar upload behavior with supported image validation and a 5 MB max size check before persistence.
- [x] 2.3 Implement avatar removal behavior that clears the Flowboard profile avatar and falls back to initials.
- [x] 2.4 Add tests or focused coverage for oversized files, invalid image files, successful avatar save, and avatar removal.

## 3. Profile and Account UI

- [x] 3.1 Add shared profile display helpers for display name fallback, initials fallback, email subtitle, and avatar rendering.
- [x] 3.2 Replace the sidebar footer account/sign-out block with a compact account trigger using existing Flowboard sizing, tokens, and collapsed/mobile behavior.
- [x] 3.3 Add a Base UI account menu with profile summary row, Settings item, and conditional Log out action.
- [x] 3.4 Add an Edit profile dialog with centered circular avatar preview, display name editing, read-only email context, upload/remove controls, cancel/save actions, and no username field.
- [x] 3.5 Wire profile loading/saving state through the app controller without coupling profile persistence to board persistence.

## 4. Settings Consolidation

- [x] 4.1 Replace the standalone Board settings dialog surface with a Settings dialog containing Appearance and Board sections.
- [x] 4.2 Move the existing system/light/dark segmented theme control into the Settings dialog while preserving persistence and system-theme resolution behavior.
- [x] 4.3 Move completed-column selection and clear-board access into the Settings dialog Board section.
- [x] 4.4 Remove the Board settings item from sidebar navigation and update completed-work validation paths to open Settings.
- [x] 4.5 Preserve static/local mode by keeping Settings reachable and omitting unavailable authenticated account actions such as Log out.

## 5. Verification

- [x] 5.1 Run typecheck and relevant unit/server tests for profile, auth, app controller, and theme behavior.
- [x] 5.2 Add or update e2e/layout-sensitive coverage for expanded sidebar, collapsed sidebar, mobile drawer, account menu open state, profile dialog, settings dialog, long name/email, avatar image, initials fallback, light theme, and dark theme.
- [x] 5.3 Manually inspect key visual states for popup positioning, dialog focus behavior, avatar preview fit, disabled/error states, and edge clipping.
- [x] 5.4 Update relevant documentation or setup notes for Supabase avatar storage configuration.
