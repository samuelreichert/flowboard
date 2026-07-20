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
import './index';
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
} from '../../test/appTestUtils';

beforeEach(resetAppTestEnvironment);

test('completes work after confirmation and moves done cards to history', async () => {
  const user = userEvent.setup();
  const { container } = render(<App />);
  const fetchMock = vi.mocked(fetch);

  await addColumn(user, 'Todo');
  await addColumn(user, 'Done');
  await addCard(user, 'Done', 'Ship it', 'Release the new Flowboard build.');
  await openBoardSettings(user);
  await chooseSelectOption(user, 'Completed column', 'Done');
  await user.click(screen.getByRole('button', { name: /^done$/i }));

  await user.click(screen.getByRole('button', { name: /complete work/i }));
  expect(
    screen.getByText(/archive 1 card from Done and start a new work cycle/i)
  ).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /cancel/i }));
  expect(
    readColumns().find((column) => column.title === 'Done')?.cards
  ).toHaveLength(1);

  await user.click(screen.getByRole('button', { name: /complete work/i }));
  await user.click(screen.getByRole('button', { name: /^complete work$/i }));

  expect(screen.getByText('Work completed')).toBeInTheDocument();
  expect(screen.getByText('New cycle is ready')).toBeInTheDocument();
  expect(container.querySelector('.completion-overlay')).toBeInTheDocument();
  expect(
    fetchMock.mock.calls.some(
      ([url]) => String(url) === '/api/board/work-cycle/complete'
    )
  ).toBe(true);
  expect(
    fetchMock.mock.calls.some(
      ([url, init]) =>
        String(url).includes('/api/boards/') && init?.method === 'PUT'
    )
  ).toBe(false);
  expect(
    readColumns().find((column) => column.title === 'Done')?.cards
  ).toEqual([]);
  expect(fetchBoardState().completedWorkCycles[0].cards[0].title).toBe(
    'Ship it'
  );

  await user.click(screen.getByRole('button', { name: /^history$/i }));
  expect(await screen.findByText('Ship it')).toBeInTheDocument();
  await user.click(screen.getByText('Ship it'));
  expect(
    await screen.findByText('Release the new Flowboard build.')
  ).toBeInTheDocument();
});

test('history follows tag renames and falls back to archived tag snapshots after delete', async () => {
  const user = userEvent.setup();
  seedBoardState({
    activeWorkCycle: {
      completedColumnId: 'done',
      startDate: CREATED_AT,
    },
    columns: [
      {
        cards: [
          {
            content: '',
            createdAt: CREATED_AT,
            id: 'card-1',
            priority: 'medium',
            tagIds: ['tag-1'],
            title: 'Tagged card',
          },
        ],
        id: 'done',
        position: 0,
        title: 'Done',
      },
    ],
    tags: [{ id: 'tag-1', name: 'Launch' }],
  });

  render(<App />);

  await user.click(screen.getByRole('button', { name: /complete work/i }));
  await user.click(screen.getByRole('button', { name: /^complete work$/i }));
  await user.click(screen.getByRole('button', { name: /^history$/i }));

  expect(screen.getByText('Launch')).toBeInTheDocument();

  await openTagManager(user);
  await user.click(screen.getByRole('button', { name: /rename launch tag/i }));
  await user.clear(screen.getByLabelText('Edit Launch tag'));
  await user.type(screen.getByLabelText('Edit Launch tag'), 'Customer');
  await user.click(screen.getByLabelText('New tag'));
  await user.click(screen.getByRole('button', { name: /close tag manager/i }));
  await user.click(screen.getByRole('button', { name: /^history$/i }));

  expect(screen.getByText('Customer')).toBeInTheDocument();

  await openTagManager(user);
  await user.click(
    screen.getByRole('button', { name: /remove customer tag/i })
  );
  await user.click(screen.getByRole('button', { name: /close tag manager/i }));
  await user.click(screen.getByRole('button', { name: /^history$/i }));

  expect(screen.getByText('Launch')).toBeInTheDocument();
});

test('opens archived cards with metadata, rich content, and Markdown copy', async () => {
  const user = userEvent.setup();
  const writeText = vi
    .spyOn(navigator.clipboard, 'writeText')
    .mockResolvedValue(undefined);
  const markdown = '# Release Notes\n\n- `Ship` the update';
  seedBoardState({
    completedWorkCycles: [
      {
        cards: [
          {
            archivedAt: CREATED_AT,
            content: markdown,
            createdAt: CREATED_AT,
            id: 'archived-1',
            priority: 'high',
            tagIds: ['tag-1'],
            tagSnapshots: [{ id: 'tag-1', name: 'Launch' }],
            title: 'Archived release',
          },
        ],
        completedColumnId: 'done',
        completedColumnTitle: 'Done',
        endDate: CREATED_AT,
        id: 'cycle-1',
        startDate: CREATED_AT,
      },
    ],
    tags: [{ id: 'tag-1', name: 'Launch' }],
  });

  render(<App />);

  await user.click(screen.getByRole('button', { name: /^history$/i }));
  await user.click(screen.getByText('Archived release'));
  const dialog = screen.getByRole('dialog', { name: /archived release/i });

  expect(within(dialog).getByText(/^Created \d/i)).toBeInTheDocument();
  expect(within(dialog).getByText(/^Archived \d/i)).toBeInTheDocument();
  expect(within(dialog).getByText('Priority')).toBeInTheDocument();
  expect(within(dialog).getByText('Tags')).toBeInTheDocument();
  expect(within(dialog).getByText('High')).toBeInTheDocument();
  expect(within(dialog).getByText('Launch')).toBeInTheDocument();
  expect(
    await within(dialog).findByRole('heading', {
      level: 1,
      name: 'Release Notes',
    })
  ).toBeInTheDocument();
  expect(within(dialog).getByText('Ship')).toBeInTheDocument();

  await user.click(
    within(dialog).getByRole('button', { name: /copy markdown/i })
  );

  expect(writeText).toHaveBeenCalledWith(markdown);
  expect(within(dialog).getByText('Copied')).toBeInTheDocument();
});

test('switches completed work history between grid and list layouts', async () => {
  const user = userEvent.setup();
  seedBoardState({
    completedWorkCycles: [
      {
        cards: [
          {
            archivedAt: CREATED_AT,
            content: '',
            createdAt: CREATED_AT,
            id: 'archived-1',
            priority: 'medium',
            tagIds: [],
            tagSnapshots: [],
            title: 'Archived release',
          },
        ],
        completedColumnId: 'done',
        completedColumnTitle: 'Done',
        endDate: CREATED_AT,
        id: 'cycle-1',
        startDate: CREATED_AT,
      },
    ],
  });

  render(<App />);
  const fetchMock = vi.mocked(fetch);

  await user.click(screen.getByRole('button', { name: /^history$/i }));
  expect(
    fetchMock.mock.calls.some(([url]) =>
      String(url).includes('/api/board/work-cycles/history')
    )
  ).toBe(true);
  expect(
    fetchMock.mock.calls.some(([url]) =>
      String(url).endsWith('/api/boards/default')
    )
  ).toBe(false);
  expect(screen.getByRole('button', { name: /grid view/i })).toHaveAttribute(
    'aria-pressed',
    'true'
  );

  await user.click(screen.getByRole('button', { name: /list view/i }));

  expect(screen.getByRole('button', { name: /list view/i })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  expect(screen.getByText('Archived release')).toBeInTheDocument();
  expect(screen.getByText(/^Created \d/i)).toBeInTheDocument();
});
