## Context

Flowboard currently has Supabase Auth session handling, authenticated board APIs, and a `Profile` table keyed by Supabase user id. The server calls `ensureProfile` before authenticated board access, but profile rows only store an optional `displayName` and are not exposed to the client as editable user-facing profile data.

The app shell currently shows primary navigation, a Board settings nav item, an account email/sign-out footer block, and the theme segmented control directly in the sidebar footer. The desired direction is to make the sidebar footer a compact account entry point and move account/profile, theme, and board settings into menu/dialog surfaces that follow existing Flowboard UI primitives.

## Goals / Non-Goals

**Goals:**

- Provide a Flowboard-native account menu in the sidebar footer for signed-in users.
- Add editable Flowboard profile fields for display name and avatar while continuing to use Supabase Auth for identity and session ownership.
- Seed profile display values from Supabase/provider metadata when profile data is first created or missing.
- Support avatar upload, preview, removal, and initials fallback with a 5 MB max image size.
- Consolidate app Appearance settings and existing Board settings into one Settings dialog opened from the account menu.
- Preserve static/local mode as a development/demo fallback with honest local behavior.
- Reuse existing Base UI, DialogShell, menu, segmented control, icon-button, and theme token patterns.

**Non-Goals:**

- Add username handles, public profiles, plans, billing, help menus, or personalization beyond the existing theme setting.
- Add an in-app cropper or image editing workflow for avatars.
- Replace Supabase Auth or change supported sign-in providers.
- Remove static/local board mode.
- Introduce broad styling refactors unrelated to the account menu, profile dialog, or settings consolidation.

## Decisions

### Flowboard owns editable profile display data

The server will store user-editable `displayName` and avatar metadata on the Flowboard `Profile` row. Supabase/Auth provider metadata is used as a seed when profile fields are absent, but user edits persist in Flowboard and are not overwritten by later provider metadata.

Alternatives considered:

- Read display name and avatar directly from Supabase metadata every render. This is simpler, but it prevents Flowboard-specific edits from being stable.
- Store profile data only in Supabase user metadata. This couples app presentation to auth-provider mutation behavior and makes local database ownership less clear.

### Account menu is the sidebar footer surface

The sidebar footer will render a compact account trigger with avatar/initials, display name, and email. Opening it shows a Flowboard-styled menu with a profile summary row, Settings, and Log out. The profile summary row opens the Edit profile dialog directly.

Alternatives considered:

- Keep separate footer sections for account, sign out, and theme. This preserves current implementation but keeps the footer cluttered.
- Add Profile as a primary sidebar nav item. Profile is account chrome rather than a workspace destination, so it belongs with account actions.

### Settings dialog contains Appearance and Board sections

The current theme segmented control moves into an Appearance section. The current Board settings dialog content moves into a Board section in the same Settings dialog, including completed-column selection and clear-board entry point. The old Board settings sidebar nav item is removed.

Alternatives considered:

- Keep a standalone Board settings dialog opened from the account menu. This keeps implementation smaller but makes "Settings" fragmented.
- Move board settings to a board header action. This may be useful later, but the current request is to remove settings from the sidebar and consolidate them under Settings.

### Avatar upload uses existing Supabase client capability

For authenticated mode, avatar uploads should use Supabase Storage with authenticated user ownership. The client validates image type and 5 MB max size before upload, previews the centered circular image, and saves the resulting avatar reference on the Flowboard profile. Removing an avatar clears the profile avatar reference and returns UI to initials fallback.

For static/local mode, the app keeps the same account/settings visual shell where practical but does not pretend there is a real authenticated account. Settings remains available; logout is omitted because there is no session to end. Profile editing can be hidden or constrained to local-only display values if implementation chooses to support it without backend persistence.

Alternatives considered:

- Store avatar bytes directly in the database. This avoids object storage setup but bloats profile records and complicates caching.
- Store only provider avatar URLs. This does not support user-uploaded avatars or removal fallback.

### Profile API is separate from board state APIs

Authenticated profile read/update should be exposed through dedicated profile endpoints rather than embedding profile state in board payloads. The board API can continue to focus on board persistence, while the profile API validates profile-specific payloads and avoids accidental coupling between board sync and account settings.

Alternatives considered:

- Include profile in `/api/boards/default`. This reduces request count but mixes unrelated lifecycles and makes profile updates look like board updates.
- Let the client write directly to Supabase from browser state. This bypasses the existing server verification and Prisma-owned app profile model.

## Risks / Trade-offs

- Avatar storage setup may differ between local, preview, and production environments -> Document required bucket/env setup and make missing storage failures visible without breaking board access.
- Provider metadata shapes vary by OAuth provider -> Centralize metadata extraction and fall back to email-derived display names or initials.
- Uploaded images can be large or invalid -> Validate file type and 5 MB limit client-side and server/storage-side where possible.
- Account menu and dialogs are layout-sensitive in collapsed sidebar and mobile drawer states -> Add focused visual/e2e coverage for expanded, collapsed, mobile, menu-open, profile-dialog, settings-dialog, and long-name/email states.
- Moving Board settings can make the completed-column control harder to find -> Use a clear Board section in Settings and preserve existing validation flows that open Settings when a completed column is required.
- Static/local mode has no real account -> Keep UI honest by preserving Settings access while omitting unavailable account actions such as Log out.

## Migration Plan

1. Add profile schema fields for avatar metadata to both PostgreSQL and SQLite Prisma schemas and migrations. Preserve existing profile rows.
2. Extend profile provisioning to seed missing display name/avatar values from Supabase user metadata without overwriting user-edited values.
3. Add authenticated profile read/update behavior and tests.
4. Add avatar upload/remove behavior and required Supabase Storage configuration.
5. Build the account menu, profile dialog, and Settings dialog using existing UI primitives.
6. Move theme and board settings into Settings, remove the Board settings sidebar nav item, and update validation paths that open board settings to open Settings.
7. Verify desktop expanded/collapsed, mobile drawer, menu positioning, dialogs, dark/light themes, avatar states, and static/local fallback.

Rollback can keep new profile columns unused while reverting the UI to the previous sidebar footer and standalone Board settings dialog. Uploaded avatar objects may remain orphaned unless a cleanup task is added.

## Open Questions

- What exact Supabase Storage bucket name and object path convention should be used for profile avatars?
- Should static/local mode include local-only profile editing, or should it expose Settings only with a "Local mode" identity row?
