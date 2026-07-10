@/Users/sreichert/.codex/RTK.md

# Project Rules

## Git Commits

- Do not create one large commit containing all pending changes unless the user explicitly asks for a single squash-style commit.
- Prefer small commits organized by logical chunks, such as dependencies, data model changes, UI behavior, styling, tests, or follow-up fixes.
- Before committing, review the staged diff and split unrelated changes into separate commits.

## UI/UX Consistency

- Before finishing UI changes, compare related controls across the app for matching interaction patterns, sizing, spacing, icons, placeholder behavior, dialog header alignment, and dropdown visual treatment.
- When one control is intended as the reference pattern, update comparable controls to match it or document why the difference is intentional.
- Treat visual references as directional mood and behavior. Implement them through existing Flowboard patterns, tokens, spacing, controls, and accessibility conventions rather than pixel-copying the reference.
- For UI surfaces with sticky or fixed positioning, popovers, growing inputs, responsive behavior, or compact controls, verify the important visual states before calling the work done: empty, focused, disabled, long single-line content, multiline content, desktop and mobile viewports, open popup/dropdown state, bottom or edge clipping, and keyboard path.
- For compact UI controls, separate shared interaction behavior from text chip/pill styling and icon-only round-button styling. Do not let icon-only controls inherit text-chip padding by accident.
- For composer-like UI, verify layout ownership explicitly: width belongs to the input, bottom spacing belongs to the dock, submit placement belongs to the control row, and icon-only buttons keep their own square sizing.
- Prefer adding or updating e2e coverage for layout-sensitive UI. If an e2e or screenshot test breaks, inspect whether the visual change was intentional before updating expectations.
- Do not rely only on typecheck and unit tests for visual UI work when the change involves layout, responsive states, or popup positioning.
