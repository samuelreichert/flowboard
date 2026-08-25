import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, vi } from 'vitest';

import App from '../../App';
import { flowboardQueryClient } from '../../app/queryClient';
import { queryKeys } from '../../app/queryKeys';
import { COMPLETED_HISTORY_PAGE_LIMIT } from '../../app/useFlowboardQueries';
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
  createTestBoardState,
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

const jsonResponse = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

const createDeferredResponse = () => {
  let resolve!: (response: Response) => void;
  const promise = new Promise<Response>((nextResolve) => {
    resolve = nextResolve;
  });

  return { promise, resolve };
};

const createHistoryResponse = (
  state = createBoardStateWithHistory(),
  nextCursor: string | null = null
) => ({
  cycles: state.completedWorkCycles.map((cycle) => ({
    ...cycle,
    cards: cycle.cards.map(({ content: _content, ...card }) => card),
  })),
  pageInfo: {
    hasMore: Boolean(nextCursor),
    nextCursor,
  },
});

const interceptFlowboardFetch = (
  handler: (
    input: RequestInfo | URL,
    init?: RequestInit
  ) => Promise<Response> | Response | undefined
) => {
  const fallbackFetch = vi.mocked(fetch);
  const fetchMock = vi.fn(
    (input: RequestInfo | URL, init?: RequestInit) =>
      handler(input, init) ?? fallbackFetch(input, init)
  );

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

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

  const copyButton = within(dialog).getByRole('button', {
    name: /copy markdown/i,
  });

  await user.hover(copyButton);
  const tooltip = await screen.findByText('Copy Markdown');
  expect(tooltip.closest('.dialog-viewport')).toBeInTheDocument();

  await user.click(copyButton);

  expect(writeText).toHaveBeenCalledWith(markdown);
  expect(within(dialog).getByRole('status')).toHaveTextContent('Copied');
  await waitFor(() =>
    expect(
      document.querySelector('.history-card-detail__copy-tooltip')
    ).toHaveTextContent('Copied')
  );
  expect(
    within(dialog).queryByRole('button', { name: /copy markdown/i })
  ).toHaveClass('history-card-detail__copy');
});

test('hides archived Markdown copy when the card has no content', async () => {
  const user = userEvent.setup();
  seedBoardState({
    completedWorkCycles: [
      {
        cards: [
          {
            archivedAt: CREATED_AT,
            content: '',
            createdAt: CREATED_AT,
            id: 'archived-empty',
            priority: 'medium',
            tagIds: [],
            tagSnapshots: [],
            title: 'Empty archived card',
          },
        ],
        completedColumnId: 'done',
        completedColumnTitle: 'Done',
        endDate: CREATED_AT,
        id: 'cycle-empty',
        startDate: CREATED_AT,
      },
    ],
  });

  render(<App />);

  await user.click(screen.getByRole('button', { name: /^history$/i }));
  await user.click(screen.getByText('Empty archived card'));
  const dialog = screen.getByRole('dialog', { name: /empty archived card/i });

  expect(
    within(dialog).queryByRole('button', { name: /copy markdown/i })
  ).not.toBeInTheDocument();
});

test('does not announce copied when the archived Markdown clipboard write fails', async () => {
  const user = userEvent.setup();
  const writeText = vi
    .spyOn(navigator.clipboard, 'writeText')
    .mockRejectedValue(new Error('Clipboard unavailable'));
  seedBoardState({
    completedWorkCycles: [
      {
        cards: [
          {
            archivedAt: CREATED_AT,
            content: 'Retry this copy',
            createdAt: CREATED_AT,
            id: 'archived-copy-failure',
            priority: 'medium',
            tagIds: [],
            tagSnapshots: [],
            title: 'Copy failure',
          },
        ],
        completedColumnId: 'done',
        completedColumnTitle: 'Done',
        endDate: CREATED_AT,
        id: 'cycle-copy-failure',
        startDate: CREATED_AT,
      },
    ],
  });

  render(<App />);

  await user.click(screen.getByRole('button', { name: /^history$/i }));
  await user.click(screen.getByText('Copy failure'));
  const dialog = screen.getByRole('dialog', { name: /copy failure/i });
  await user.click(
    within(dialog).getByRole('button', { name: /copy markdown/i })
  );

  await waitFor(() =>
    expect(writeText).toHaveBeenCalledWith('Retry this copy')
  );
  expect(within(dialog).getByRole('status')).toHaveTextContent('');
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

test('shows loading instead of empty history before the first request resolves', async () => {
  const user = userEvent.setup();
  const historyResponse = createDeferredResponse();

  interceptFlowboardFetch((input) => {
    const url = new URL(String(input), 'http://localhost');

    if (url.pathname === '/api/board/work-cycles/history') {
      return historyResponse.promise;
    }
  });

  render(<App />);
  await user.click(screen.getByRole('button', { name: /^history$/i }));

  expect(
    await screen.findByRole('heading', { name: 'Loading history' })
  ).toBeInTheDocument();
  expect(screen.queryByText('No completed work yet')).not.toBeInTheDocument();

  await act(async () => {
    historyResponse.resolve(
      jsonResponse(createHistoryResponse(createTestBoardState()))
    );
    await historyResponse.promise;
  });

  expect(await screen.findByText('No completed work yet')).toBeInTheDocument();
});

test('shows a retryable initial history error without empty copy', async () => {
  const user = userEvent.setup();
  let historyRequestCount = 0;

  interceptFlowboardFetch((input) => {
    const url = new URL(String(input), 'http://localhost');

    if (url.pathname !== '/api/board/work-cycles/history') {
      return;
    }

    historyRequestCount += 1;
    return historyRequestCount === 1
      ? jsonResponse(
          { error: { code: 'unauthorized', message: 'Unavailable' } },
          { status: 403 }
        )
      : jsonResponse(createHistoryResponse(createTestBoardState()));
  });

  render(<App />);
  await user.click(screen.getByRole('button', { name: /^history$/i }));

  expect(
    await screen.findByRole('heading', { name: 'History unavailable' })
  ).toBeInTheDocument();
  expect(screen.queryByText('No completed work yet')).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Retry' }));
  expect(await screen.findByText('No completed work yet')).toBeInTheDocument();
  expect(historyRequestCount).toBe(2);
});

test('preserves cached history and retries a failed background refresh', async () => {
  const user = userEvent.setup();
  seedBoardState(createBoardStateWithHistory());
  let historyRequestCount = 0;

  interceptFlowboardFetch((input) => {
    const url = new URL(String(input), 'http://localhost');

    if (url.pathname !== '/api/board/work-cycles/history') {
      return;
    }

    historyRequestCount += 1;
    if (historyRequestCount === 2) {
      return jsonResponse(
        { error: { code: 'unauthorized', message: 'Unavailable' } },
        { status: 403 }
      );
    }
  });

  render(<App />);
  await user.click(screen.getByRole('button', { name: /^history$/i }));
  expect(await screen.findByText('Archived card')).toBeInTheDocument();

  await act(async () => {
    await flowboardQueryClient.invalidateQueries({
      queryKey: queryKeys.board.history(COMPLETED_HISTORY_PAGE_LIMIT),
    });
  });

  expect(screen.getByText('Archived card')).toBeInTheDocument();
  expect(
    await screen.findByText('History could not be refreshed.')
  ).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Retry' }));
  await waitFor(() =>
    expect(
      screen.queryByText('History could not be refreshed.')
    ).not.toBeInTheDocument()
  );
  expect(screen.getByText('Archived card')).toBeInTheDocument();
});

test('preserves history and retries a failed next page', async () => {
  const user = userEvent.setup();
  const firstState = createBoardStateWithHistory();
  const secondState = createBoardStateWithHistory();

  secondState.completedWorkCycles = secondState.completedWorkCycles.map(
    (cycle) => ({
      ...cycle,
      id: 'cycle-2',
      cards: cycle.cards.map((card) => ({
        ...card,
        id: 'archived-card-2',
        title: 'Second archived card',
      })),
    })
  );
  let historyRequestCount = 0;

  interceptFlowboardFetch((input) => {
    const url = new URL(String(input), 'http://localhost');

    if (url.pathname !== '/api/board/work-cycles/history') {
      return;
    }

    historyRequestCount += 1;
    if (historyRequestCount === 1) {
      return jsonResponse(createHistoryResponse(firstState, 'cursor-2'));
    }

    if (historyRequestCount === 2) {
      return jsonResponse(
        { error: { code: 'unauthorized', message: 'Unavailable' } },
        { status: 403 }
      );
    }

    return jsonResponse(createHistoryResponse(secondState));
  });

  render(<App />);
  await user.click(screen.getByRole('button', { name: /^history$/i }));
  expect(await screen.findByText('Archived card')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Load more' }));

  expect(screen.getByText('Archived card')).toBeInTheDocument();
  expect(
    await screen.findByText('More history could not be loaded.')
  ).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Retry' }));
  expect(await screen.findByText('Second archived card')).toBeInTheDocument();
  expect(screen.getByText('Archived card')).toBeInTheDocument();
});

test('shows archived detail loading without treating content as empty', async () => {
  const user = userEvent.setup();
  const state = createBoardStateWithHistory();
  const detailResponse = createDeferredResponse();

  seedBoardState(state);
  interceptFlowboardFetch((input) => {
    const url = new URL(String(input), 'http://localhost');

    if (url.pathname === '/api/board/work-cycles/cycle-1/cards/archived-card') {
      return detailResponse.promise;
    }
  });

  render(<App />);
  await user.click(screen.getByRole('button', { name: /^history$/i }));
  await user.click(await screen.findByText('Archived card'));

  const dialog = await screen.findByRole('dialog', { name: 'Archived card' });
  expect(
    within(dialog).getByText('Fetching the archived card details...')
  ).toBeInTheDocument();
  expect(
    within(dialog).queryByText('This archived card has no content.')
  ).not.toBeInTheDocument();

  await act(async () => {
    detailResponse.resolve(jsonResponse(state.completedWorkCycles[0].cards[0]));
    await detailResponse.promise;
  });
  expect(await within(dialog).findByText('Archived notes')).toBeInTheDocument();
});

test('retries archived detail failures without describing the card as missing', async () => {
  const user = userEvent.setup();
  const state = createBoardStateWithHistory();
  let detailRequestCount = 0;

  seedBoardState(state);
  interceptFlowboardFetch((input) => {
    const url = new URL(String(input), 'http://localhost');

    if (url.pathname !== '/api/board/work-cycles/cycle-1/cards/archived-card') {
      return;
    }

    detailRequestCount += 1;
    return detailRequestCount === 1
      ? jsonResponse(
          { error: { code: 'unauthorized', message: 'Unavailable' } },
          { status: 403 }
        )
      : jsonResponse(state.completedWorkCycles[0].cards[0]);
  });

  render(<App />);
  await user.click(screen.getByRole('button', { name: /^history$/i }));
  await user.click(await screen.findByText('Archived card'));

  const dialog = await screen.findByRole('dialog', { name: 'Archived card' });
  expect(
    await within(dialog).findByText(
      'This archived card could not be loaded. Try again.'
    )
  ).toBeInTheDocument();
  expect(
    screen.queryByText('Archived card not found.')
  ).not.toBeInTheDocument();

  await user.click(within(dialog).getByRole('button', { name: 'Retry' }));
  expect(await within(dialog).findByText('Archived notes')).toBeInTheDocument();
  expect(detailRequestCount).toBe(2);
});

test('loads a direct archived route without a summary in the first page', async () => {
  const state = createBoardStateWithHistory();

  seedBoardState(state);
  window.history.replaceState(
    null,
    '',
    '/history/cycles/cycle-1/cards/archived-card'
  );
  interceptFlowboardFetch((input) => {
    const url = new URL(String(input), 'http://localhost');

    if (url.pathname === '/api/board/work-cycles/history') {
      return jsonResponse({
        cycles: [],
        pageInfo: { hasMore: true, nextCursor: 'older-page' },
      });
    }
  });

  render(<App />);

  const dialog = await screen.findByRole('dialog', { name: 'Archived card' });
  expect(await within(dialog).findByText('Archived notes')).toBeInTheDocument();
});

test('closes a direct archived route while detail is still loading', async () => {
  const user = userEvent.setup();
  const state = createBoardStateWithHistory();
  const detailResponse = createDeferredResponse();

  seedBoardState(state);
  window.history.replaceState(
    null,
    '',
    '/history/cycles/cycle-1/cards/archived-card'
  );
  interceptFlowboardFetch((input) => {
    const url = new URL(String(input), 'http://localhost');

    if (url.pathname === '/api/board/work-cycles/cycle-1/cards/archived-card') {
      return detailResponse.promise;
    }
  });

  render(<App />);

  expect(
    await screen.findByRole('dialog', { name: 'Archived card' })
  ).toBeInTheDocument();
  expect(
    screen.getByText('Fetching the archived card details...')
  ).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Close archived card' }));
  await waitFor(() => expect(window.location.pathname).toBe('/history'));
});
