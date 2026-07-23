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

test('guides empty-board setup from the board and composer', async () => {
  const user = userEvent.setup();
  render(<App />);

  expect(screen.getByText('Set up your first column')).toBeInTheDocument();
  expect(
    screen.getByText(
      'Create a column to give the composer somewhere to place new cards.'
    )
  ).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /add column first/i }));
  expect(screen.getByLabelText('Column title')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /close dialog/i }));

  await user.click(
    screen.getByRole('button', { name: /create first column/i })
  );
  expect(screen.getByLabelText('Column title')).toBeInTheDocument();
});

test('renders column creation as a placeholder once columns exist', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');

  const addColumnButton = screen.getByRole('button', {
    name: /add another column/i,
  });

  expect(addColumnButton).toHaveClass('add-column-placeholder');
  expect(addColumnButton.parentElement).toHaveClass('columns-list');
  expect(document.querySelector('.board-toolbar')).not.toBeInTheDocument();
});

test('keeps the add-column affordance reachable after multiple columns', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await addColumn(user, 'Doing');
  await addColumn(user, 'Done');

  const columnsList = document.querySelector('.columns-list');
  const addColumnButton = screen.getByRole('button', {
    name: /add another column/i,
  });

  expect(columnsList).toContainElement(addColumnButton);
  expect(columnsList).not.toHaveClass('columns-list--empty');
});

test('rejects blank and duplicate column titles', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(
    screen.getByRole('button', {
      name: /add another column|create first column/i,
    })
  );
  expect(screen.getByPlaceholderText('Ready for review')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /add column/i }));
  expect(screen.getByText('Enter a column title.')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /close dialog/i }));

  await addColumn(user, 'Todo');
  await user.click(screen.getByRole('button', { name: /add another column/i }));
  await user.type(screen.getByLabelText('Column title'), 'todo');
  await user.click(screen.getByRole('button', { name: /add column/i }));

  expect(screen.getByText('Column titles must be unique.')).toBeInTheDocument();
  expect(readColumns()).toHaveLength(1);
});

test('renames and deletes a column with confirmation', async () => {
  const user = userEvent.setup();
  render(<App />);
  const fetchMock = vi.mocked(fetch);

  fetchMock.mockClear();
  await addColumn(user, 'Todo');
  await waitFor(() =>
    expect(
      fetchMock.mock.calls.some(
        ([url, init]) =>
          String(url).endsWith('/api/board/columns') && init?.method === 'POST'
      )
    ).toBe(true)
  );
  await addCard(user, 'Todo', 'Ship it');
  fetchMock.mockClear();

  await openColumnActions(user, 'Todo');
  await user.click(
    await screen.findByRole('menuitem', { name: /rename column/i })
  );
  const input = screen.getByLabelText('Column title');
  await user.clear(input);
  await user.type(input, 'Ready');
  await waitFor(() => expect(input).toHaveValue('Ready'));
  expect(
    screen.queryByRole('button', { name: /save changes/i })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: /cancel/i })
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /close dialog/i }));
  await waitFor(() =>
    expect(
      fetchMock.mock.calls.some(
        ([url, init]) =>
          String(url).includes('/api/board/columns/') &&
          init?.method === 'PATCH'
      )
    ).toBe(true)
  );

  await openColumnActions(user, 'Ready');
  await user.click(
    await screen.findByRole('menuitem', { name: /delete column/i })
  );
  expect(
    screen.getByText(/permanently delete 1 card in Ready/i)
  ).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /^delete column$/i }));
  await waitFor(() =>
    expect(
      fetchMock.mock.calls.some(
        ([url, init]) =>
          String(url).includes('/api/board/columns/') &&
          init?.method === 'DELETE'
      )
    ).toBe(true)
  );

  expect(readColumns()).toEqual([]);
  expect(
    fetchMock.mock.calls.some(
      ([url, init]) =>
        String(url).includes('/api/boards/') && init?.method === 'PUT'
    )
  ).toBe(false);
});

test('keeps rename column dialog open when the title is blank', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await openColumnActions(user, 'Todo');
  await user.click(
    await screen.findByRole('menuitem', { name: /rename column/i })
  );

  await user.clear(screen.getByLabelText('Column title'));
  await user.keyboard('{Escape}');

  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByText('Enter a column title.')).toBeInTheDocument();
  expect(readColumns()[0].title).toBe('Todo');
});

test('reorders columns from the Manage Columns dialog action hierarchy', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await addColumn(user, 'Doing');
  await addColumn(user, 'Done');

  await user.click(screen.getByRole('button', { name: /manage columns/i }));

  expect(
    screen.queryByRole('button', { name: /move todo to top/i })
  ).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /move todo up/i })).toBeDisabled();

  await user.click(screen.getByRole('button', { name: /move doing up/i }));
  expect(readColumns().map((column) => column.title)).toEqual([
    'Doing',
    'Todo',
    'Done',
  ]);

  await user.click(
    screen.getByRole('button', { name: /more actions for todo/i })
  );
  await user.click(
    await screen.findByRole('menuitem', { name: /move todo to bottom/i })
  );

  expect(readColumns().map((column) => column.title)).toEqual([
    'Doing',
    'Done',
    'Todo',
  ]);
});

test('preserves Manage Columns add, rename, and delete workflows', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await user.click(screen.getByRole('button', { name: /manage columns/i }));

  await user.click(screen.getByRole('button', { name: /^add column$/i }));
  await user.type(screen.getByLabelText('Column title'), 'Review');
  await user.click(screen.getByRole('button', { name: /^add column$/i }));
  await waitFor(() =>
    expect(
      screen.getByRole('dialog', { name: /manage columns/i })
    ).toBeInTheDocument()
  );
  expect(readColumns().map((column) => column.title)).toEqual([
    'Todo',
    'Review',
  ]);

  await user.click(screen.getByRole('button', { name: /rename todo column/i }));
  await user.clear(screen.getByLabelText('Column title'));
  await user.type(screen.getByLabelText('Column title'), 'Ready');
  await user.click(screen.getByRole('button', { name: /close dialog/i }));
  expect(readColumns()[0].title).toBe('Ready');

  await user.click(
    screen.getByRole('button', { name: /more actions for ready/i })
  );
  expect(
    (
      await screen.findByRole('menuitem', { name: /delete ready column/i })
    ).closest('.dialog-viewport')
  ).toBeInTheDocument();
  await user.click(
    screen.getByRole('menuitem', { name: /delete ready column/i })
  );
  expect(
    screen.getByRole('alertdialog', { name: /delete this column/i })
  ).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /^delete column$/i }));

  expect(readColumns().map((column) => column.title)).toEqual(['Review']);
});

test('keeps Manage Columns open when its add-column dialog is dismissed', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await user.click(screen.getByRole('button', { name: /manage columns/i }));

  const managerAddColumn = screen.getByRole('button', {
    name: /^add column$/i,
  });
  await user.click(managerAddColumn);

  expect(
    document.querySelector('.dialog-popup--column-management')
  ).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /close dialog/i }));

  expect(
    screen.getByRole('dialog', { name: /manage columns/i })
  ).toBeInTheDocument();
  expect(managerAddColumn).toHaveFocus();
});
