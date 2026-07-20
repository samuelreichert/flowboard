import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, vi } from 'vitest';

import App from '../App';
import '../components/HistoryView';
import {
  CREATED_AT,
  addCard,
  addColumn,
  chooseSelectOption,
  closeCardDialog,
  createBoardColumns,
  createBoardStateWithHistory,
  expectCardDialogTitle,
  getBoardCardButton,
  openBoardSettings,
  openColumnActions,
  openTagManager,
  pasteText,
  readColumns,
  resetAppTestEnvironment,
  seedBoardState,
  selectEditorContents,
  selectEditorNode,
  selectText,
} from '../test/appTestUtils';

beforeEach(resetAppTestEnvironment);

test('opens route-owned management surfaces and closes them to board', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole('button', { name: /manage tags/i }));
  expect(window.location.pathname).toBe('/tags');
  expect(screen.getByRole('dialog', { name: /manage tags/i })).toHaveClass(
    'dialog-popup--route-management'
  );

  await user.click(screen.getByRole('button', { name: /close tag manager/i }));
  expect(window.location.pathname).toBe('/board');

  await user.click(screen.getByRole('button', { name: /^settings$/i }));
  expect(window.location.pathname).toBe('/settings');
  expect(screen.getByRole('dialog', { name: /^settings$/i })).toHaveClass(
    'dialog-popup--route-management'
  );

  await user.click(screen.getByRole('button', { name: /close settings/i }));
  expect(window.location.pathname).toBe('/board');
});

test('directly loads tags, settings, history, and unknown routes', async () => {
  window.history.replaceState(null, '', '/tags');
  const { unmount } = render(<App />);

  expect(
    screen.getByRole('dialog', { name: /manage tags/i })
  ).toBeInTheDocument();
  unmount();

  window.history.replaceState(null, '', '/settings');
  const settingsRender = render(<App />);
  expect(
    screen.getByRole('dialog', { name: /^settings$/i })
  ).toBeInTheDocument();
  settingsRender.unmount();

  window.history.replaceState(null, '', '/history');
  const historyRender = render(<App />);
  expect(screen.getByRole('heading', { name: /history/i })).toBeInTheDocument();
  historyRender.unmount();

  window.history.replaceState(null, '', '/nope');
  render(<App />);
  expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: /that page is off the board/i })
  ).toBeInTheDocument();
  expect(screen.getByText('/nope')).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /view history/i })
  ).toBeInTheDocument();
});

test('directly opens and closes an active card route', async () => {
  const user = userEvent.setup();
  seedBoardState({ columns: createBoardColumns() });
  window.history.replaceState(null, '', '/board/cards/first');

  render(<App />);

  expectCardDialogTitle('First');
  await user.click(screen.getByRole('button', { name: /close card/i }));
  expect(window.location.pathname).toBe('/board');
});

test('shows missing state for an unresolved active card route', async () => {
  seedBoardState({ columns: createBoardColumns() });
  window.history.replaceState(null, '', '/board/cards/missing-card');

  render(<App />);

  expect(await screen.findByText('Card not found.')).toBeInTheDocument();
  expect(
    screen.queryByRole('dialog', { name: /card/i })
  ).not.toBeInTheDocument();
});

test('directly opens and closes an archived card route', async () => {
  const user = userEvent.setup();
  seedBoardState(createBoardStateWithHistory());
  window.history.replaceState(
    null,
    '',
    '/history/cycles/cycle-1/cards/archived-card'
  );

  render(<App />);

  expect(
    await screen.findByRole('dialog', { name: /archived card/i })
  ).toBeInTheDocument();
  await user.click(
    screen.getByRole('button', { name: /close archived card/i })
  );
  expect(window.location.pathname).toBe('/history');
});

test('shows missing state for an unresolved archived card route', async () => {
  seedBoardState(createBoardStateWithHistory());
  window.history.replaceState(
    null,
    '',
    '/history/cycles/cycle-1/cards/missing-card'
  );

  render(<App />);

  expect(
    await screen.findByText('Archived card not found.')
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('dialog', { name: /archived card/i })
  ).not.toBeInTheDocument();
});
