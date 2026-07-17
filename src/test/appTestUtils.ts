import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { fetchStorage, updateBoardStateStorage } from '../storage';
import { clearFlowboardQueryCache } from '../app/queryClient';
import type { BoardColumn, BoardState } from '../types';

export const CREATED_AT = '2026-06-03T12:34:56.000Z';

let mockServerBoardState: BoardState;

const jsonResponse = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

const createBootstrapResponse = () => {
  const state = mockServerBoardState;

  return {
    board: {
      background: state.background,
      id: 'test-board',
      title: 'Flowboard',
      version: 1,
    },
    cards: state.columns.flatMap((column) =>
      column.cards.map((card) => ({
        columnId: column.id,
        id: card.id,
        priority: card.priority,
        tagIds: card.tagIds,
        title: card.title,
      }))
    ),
    columns: state.columns.map((column) => ({
      id: column.id,
      title: column.title,
    })),
    tags: state.tags,
    workCycle: state.activeWorkCycle,
  };
};

const findCardDetail = (cardId: string) =>
  mockServerBoardState
    .columns.flatMap((column) => column.cards)
    .find((card) => card.id === cardId);

const mockFlowboardApi = () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.endsWith('/api/board/bootstrap')) {
        return jsonResponse(createBootstrapResponse());
      }

      if (url.includes('/api/board/cards/')) {
        const cardId = decodeURIComponent(url.split('/api/board/cards/')[1]);
        const card = findCardDetail(cardId);

        return card
          ? jsonResponse({
              content: card.content,
              createdAt: card.createdAt,
              id: card.id,
              priority: card.priority,
              tagIds: card.tagIds,
              title: card.title,
            })
          : jsonResponse({ error: 'Card not found.' }, { status: 404 });
      }

      if (url.endsWith('/api/boards/default')) {
        return jsonResponse({
          board: {
            id: 'test-board',
            title: 'Flowboard',
            updatedAt: CREATED_AT,
          },
          state: mockServerBoardState,
        });
      }

      if (url.includes('/api/boards/') && init?.method === 'PUT') {
        const state = JSON.parse(String(init.body)) as BoardState;

        mockServerBoardState = state;
        updateBoardStateStorage(state);

        return jsonResponse({
          board: {
            id: 'test-board',
            title: 'Flowboard',
            updatedAt: CREATED_AT,
          },
          state,
        });
      }

      return jsonResponse({ error: 'Not found.' }, { status: 404 });
    })
  );
};

export const resetAppTestEnvironment = () => {
  window.history.replaceState(null, '', '/');
  localStorage.clear();
  clearFlowboardQueryCache();
  seedBoardState();
  mockFlowboardApi();
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  });
  Object.defineProperty(navigator, 'languages', {
    configurable: true,
    value: ['en-US'],
  });
};

export const addColumn = async (
  user: ReturnType<typeof userEvent.setup>,
  title: string
) => {
  await user.click(screen.getByRole('button', { name: /add another column/i }));
  await user.type(screen.getByLabelText('Column title'), title);
  await user.click(screen.getByRole('button', { name: /add column/i }));
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  );
  await waitFor(() =>
    expect(
      document.querySelector('[data-base-ui-inert]')
    ).not.toBeInTheDocument()
  );
};

export const addCard = async (
  user: ReturnType<typeof userEvent.setup>,
  columnTitle: string,
  title: string,
  content = ''
) => {
  await chooseSelectOption(user, 'Destination column', columnTitle);
  await user.type(
    screen.getByLabelText('New card'),
    content ? `${title}{Enter}${content}` : title
  );
  await user.click(screen.getByRole('button', { name: /add card/i }));
};

export const closeCardDialog = async (
  user: ReturnType<typeof userEvent.setup>
) => {
  await user.click(screen.getByRole('button', { name: /close card/i }));
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  );
  await waitFor(() =>
    expect(
      document.querySelector('[data-base-ui-inert]')
    ).not.toBeInTheDocument()
  );
};

export const pasteText = (element: HTMLElement, text: string) => {
  fireEvent.paste(element, {
    clipboardData: {
      files: [],
      getData: (type: string) => (type === 'text/plain' ? text : ''),
      types: ['text/plain'],
    },
  });
};

export const selectEditorContents = (element: HTMLElement) => {
  const target = element.querySelector('a, p, h1, h2, h3, h4, li') ?? element;
  selectEditorNodeContents(element, target);
};

export const selectEditorNode = (element: HTMLElement, selector: string) => {
  const target = element.querySelector(selector);

  if (!target) {
    throw new Error(`Editor node not found: ${selector}`);
  }

  selectEditorNodeContents(element, target);
};

export const selectEditorNodeContents = (
  element: HTMLElement,
  target: Element
) => {
  element.focus();

  const range = document.createRange();
  range.selectNodeContents(target);

  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
  document.dispatchEvent(new Event('selectionchange'));
  fireEvent.mouseUp(element);
  fireEvent.keyUp(element);
};

export const selectText = (element: HTMLElement) => {
  const range = document.createRange();
  range.selectNodeContents(element);

  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
  document.dispatchEvent(new Event('selectionchange'));
  fireEvent.mouseUp(element);
};

export const getBoardCardButton = (title: string) =>
  screen.getByRole('button', { name: `Open ${title}` });

export const expectCardDialogTitle = (title: string) => {
  const dialog = screen.getByRole('dialog', { name: /card/i });

  expect(
    within(dialog).getByRole('heading', { name: title })
  ).toBeInTheDocument();
};

export const openColumnActions = async (
  _user: ReturnType<typeof userEvent.setup>,
  columnTitle: string
) => {
  fireEvent.mouseDown(
    screen.getByRole('button', { name: `Open ${columnTitle} column actions` }),
    { button: 0 }
  );
};

export const chooseSelectOption = async (
  user: ReturnType<typeof userEvent.setup>,
  label: string,
  option: string
) => {
  const dialog = screen.queryByRole('dialog');
  const scope = dialog ? within(dialog) : screen;

  await user.click(scope.getByRole('combobox', { name: label }));
  await user.click(await screen.findByRole('option', { name: option }));
};

export const openTagManager = async (
  user: ReturnType<typeof userEvent.setup>
) => {
  await user.click(screen.getByRole('button', { name: /manage tags/i }));
  await screen.findByRole('dialog', { name: /manage tags/i });
};

export const openBoardSettings = async (
  user: ReturnType<typeof userEvent.setup>
) => {
  await user.click(
    screen.getByRole('button', { name: /open account menu|abrir menu da conta/i })
  );
  await user.click(
    await screen.findByRole('menuitem', { name: /^settings$|^configurações$/i })
  );
  await screen.findByRole('dialog', { name: /^settings$|^configurações$/i });
};

export const readColumns = () => fetchStorage();

export const createTestBoardState = (
  overrides: Partial<BoardState> = {}
): BoardState => ({
  activeWorkCycle: {
    completedColumnId: null,
    startDate: CREATED_AT,
  },
  background: {
    type: 'color',
    value: '#ffffff',
  },
  columns: [],
  completedWorkCycles: [],
  tags: [],
  ...overrides,
});

export const seedBoardState = (overrides: Partial<BoardState> = {}) => {
  const state = createTestBoardState(overrides);

  mockServerBoardState = state;
  updateBoardStateStorage(state);
};

export const createBoardColumns = (): BoardColumn[] => [
  {
    cards: [
      {
        content: '',
        createdAt: CREATED_AT,
        id: 'first',
        priority: 'medium',
        tagIds: [],
        title: 'First',
      },
      {
        content: '',
        createdAt: CREATED_AT,
        id: 'second',
        priority: 'medium',
        tagIds: [],
        title: 'Second',
      },
      {
        content: '',
        createdAt: CREATED_AT,
        id: 'third',
        priority: 'medium',
        tagIds: [],
        title: 'Third',
      },
    ],
    id: 'todo',
    position: 0,
    title: 'Todo',
  },
  {
    cards: [
      {
        content: '',
        createdAt: CREATED_AT,
        id: 'done',
        priority: 'medium',
        tagIds: [],
        title: 'Done',
      },
    ],
    id: 'complete',
    position: 10,
    title: 'Complete',
  },
];

export const createBoardStateWithHistory = (): BoardState => ({
  activeWorkCycle: {
    completedColumnId: 'complete',
    startDate: CREATED_AT,
  },
  background: {
    type: 'color',
    value: '#ffffff',
  },
  columns: createBoardColumns(),
  completedWorkCycles: [
    {
      cards: [
        {
          archivedAt: CREATED_AT,
          content: 'Archived notes',
          createdAt: CREATED_AT,
          id: 'archived-card',
          priority: 'medium',
          tagIds: [],
          tagSnapshots: [],
          title: 'Archived card',
        },
      ],
      completedColumnId: 'complete',
      completedColumnTitle: 'Complete',
      endDate: CREATED_AT,
      id: 'cycle-1',
      startDate: CREATED_AT,
    },
  ],
  tags: [],
});
