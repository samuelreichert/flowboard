import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, vi } from 'vitest';

import App from '../../App';
import { fetchBoardState } from '../../storage';
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
  selectEditorContents,
  selectEditorNode,
  selectText,
} from '../../test/appTestUtils';

beforeEach(resetAppTestEnvironment);

test('clears the board only after confirmation', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await openBoardSettings(user);
  await user.click(screen.getByRole('button', { name: /clear board/i }));
  await user.click(screen.getByRole('button', { name: /cancel/i }));
  expect(readColumns()).toHaveLength(1);

  await openBoardSettings(user);
  await user.click(screen.getByRole('button', { name: /clear board/i }));
  await user.click(screen.getByRole('button', { name: /^clear board$/i }));
  expect(readColumns()).toEqual([]);
});

test('clear board lives in settings only when the board can be cleared', async () => {
  const user = userEvent.setup();
  render(<App />);
  const sidebar = screen.getByRole('complementary', {
    name: /flowboard navigation/i,
  });

  expect(
    within(sidebar).queryByRole('button', { name: /clear board/i })
  ).not.toBeInTheDocument();

  await addColumn(user, 'Todo');
  expect(
    within(sidebar).queryByRole('button', { name: /clear board/i })
  ).not.toBeInTheDocument();
  await openBoardSettings(user);
  expect(
    screen.getByRole('button', { name: /clear board/i })
  ).toBeInTheDocument();
});

test('configures completed column and preserves it through rename and delete', async () => {
  const user = userEvent.setup();
  render(<App />);
  const fetchMock = vi.mocked(fetch);

  await addColumn(user, 'Todo');
  await addColumn(user, 'Done');
  fetchMock.mockClear();
  await openBoardSettings(user);
  await chooseSelectOption(user, 'Completed column', 'Done');
  await waitFor(() =>
    expect(
      fetchMock.mock.calls.some(
        ([url, init]) =>
          String(url).endsWith('/api/board/work-cycle/settings') &&
          init?.method === 'PATCH'
      )
    ).toBe(true)
  );
  await user.click(screen.getByRole('button', { name: /^done$/i }));
  const doneColumnId = fetchBoardState().columns.find(
    (column) => column.title === 'Done'
  )?.id;

  expect(fetchBoardState().activeWorkCycle.completedColumnId).toBe(
    doneColumnId
  );

  await openColumnActions(user, 'Done');
  await user.click(
    await screen.findByRole('menuitem', { name: /rename column/i })
  );
  await user.clear(screen.getByLabelText('Column title'));
  await user.type(screen.getByLabelText('Column title'), 'Finished');
  await user.click(screen.getByRole('button', { name: /close dialog/i }));

  expect(fetchBoardState().activeWorkCycle.completedColumnId).toBe(
    doneColumnId
  );
  const renamedColumnTitle =
    fetchBoardState().columns.find((column) => column.id === doneColumnId)
      ?.title ?? 'Finished';

  await openColumnActions(user, renamedColumnTitle);
  await user.click(
    await screen.findByRole('menuitem', { name: /delete column/i })
  );
  await user.click(screen.getByRole('button', { name: /^delete column$/i }));

  expect(fetchBoardState().activeWorkCycle.completedColumnId).toBeNull();
  expect(
    fetchMock.mock.calls.some(
      ([url, init]) => String(url).includes('/api/boards/') && init?.method === 'PUT'
    )
  ).toBe(false);
});

test('disables completing work when no completed column exists', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Unassigned completion card');

  const completeWork = screen.getByRole('button', { name: /complete work/i });

  expect(completeWork).toBeDisabled();
  expect(completeWork).toHaveAttribute(
    'title',
    'Choose a completed column in settings before completing work'
  );
  await user.click(completeWork);
  expect(
    screen.queryByRole('dialog', { name: /^settings$/i })
  ).not.toBeInTheDocument();
});

test('disables completing work when the completed column is empty', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Done');
  await openBoardSettings(user);
  await chooseSelectOption(user, 'Completed column', 'Done');
  await user.click(screen.getByRole('button', { name: /^done$/i }));

  const completeWork = screen.getByRole('button', { name: /complete work/i });
  expect(completeWork).toBeDisabled();
  await user.click(completeWork);
  expect(
    screen.queryByRole('alertdialog', { name: /complete work/i })
  ).not.toBeInTheDocument();
  expect(fetchBoardState().completedWorkCycles).toEqual([]);
  expect(
    screen.queryByText(/completed without archived cards/i)
  ).not.toBeInTheDocument();
});
