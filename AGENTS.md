@/Users/sreichert/.codex/RTK.md

# Project Rules

## Git Commits

- Do not create one large commit containing all pending changes unless the user explicitly asks for a single squash-style commit.
- Prefer small commits organized by logical chunks, such as dependencies, data model changes, UI behavior, styling, tests, or follow-up fixes.
- Before committing, review the staged diff and split unrelated changes into separate commits.

## UI/UX Consistency

- Before finishing UI changes, compare related controls across the app for matching interaction patterns, sizing, spacing, icons, placeholder behavior, dialog header alignment, and dropdown visual treatment.
- When one control is intended as the reference pattern, update comparable controls to match it or document why the difference is intentional.
