import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import {
  fetchActiveWorkCycleStorage,
  fetchBackgroundStorage,
  fetchCompletedWorkCyclesStorage,
  fetchStorage,
  fetchTagStorage,
  updateBoardStateStorage,
} from '../storage';
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

const updateMockServerBoardState = (state: BoardState) => {
  mockServerBoardState = state;
  updateBoardStateStorage(state);
};

const mapMockColumns = (
  mapper: (column: BoardColumn) => BoardColumn
) => {
  updateMockServerBoardState({
    ...mockServerBoardState,
    activeWorkCycle: fetchActiveWorkCycleStorage(),
    background: fetchBackgroundStorage(),
    columns: mockServerBoardState.columns.map(mapper),
    completedWorkCycles: fetchCompletedWorkCyclesStorage(),
    tags: fetchTagStorage(),
  });
};

const moveMockCard = (
  cardId: string,
  placement: {
    afterCardId?: string | null;
    beforeCardId?: string | null;
    columnId: string;
  }
) => {
  const sourceColumn = mockServerBoardState.columns.find((column) =>
    column.cards.some((card) => card.id === cardId)
  );
  const card = sourceColumn?.cards.find((item) => item.id === cardId);

  if (!sourceColumn || !card) {
    return;
  }

  const destinationColumn = mockServerBoardState.columns.find(
    (column) => column.id === placement.columnId
  );

  if (!destinationColumn) {
    return;
  }

  const destinationCards = destinationColumn.cards.filter(
    (item) => item.id !== cardId
  );
  const placementCardId = placement.beforeCardId ?? placement.afterCardId;
  const targetIndex = placementCardId
    ? destinationCards.findIndex((item) => item.id === placementCardId)
    : destinationCards.length;
  const insertAt =
    targetIndex === -1
      ? destinationCards.length
      : placement.afterCardId
        ? targetIndex + 1
        : targetIndex;
  const nextDestinationCards = [...destinationCards];

  nextDestinationCards.splice(insertAt, 0, card);
  mapMockColumns((column) => {
    if (column.id === sourceColumn.id && column.id === destinationColumn.id) {
      return { ...column, cards: nextDestinationCards };
    }

    if (column.id === sourceColumn.id) {
      return {
        ...column,
        cards: column.cards.filter((item) => item.id !== cardId),
      };
    }

    if (column.id === destinationColumn.id) {
      return { ...column, cards: nextDestinationCards };
    }

    return column;
  });
};

const moveMockColumn = (
  columnId: string,
  placement: {
    afterColumnId?: string | null;
    beforeColumnId?: string | null;
  }
) => {
  const column = mockServerBoardState.columns.find(
    (item) => item.id === columnId
  );

  if (!column) {
    return;
  }

  const remainingColumns = mockServerBoardState.columns.filter(
    (item) => item.id !== columnId
  );
  const placementColumnId = placement.beforeColumnId ?? placement.afterColumnId;
  const targetIndex = placementColumnId
    ? remainingColumns.findIndex((item) => item.id === placementColumnId)
    : remainingColumns.length;
  const insertAt =
    targetIndex === -1
      ? remainingColumns.length
      : placement.afterColumnId
        ? targetIndex + 1
        : targetIndex;
  const nextColumns = [...remainingColumns];

  nextColumns.splice(insertAt, 0, column);
  updateMockServerBoardState({
    ...mockServerBoardState,
    columns: nextColumns.map((item, index) => ({
      ...item,
      position: index * 10,
    })),
  });
};

const toColumnSummaries = () =>
  mockServerBoardState.columns.map((column) => ({
    id: column.id,
    title: column.title,
  }));

const toTagSummaries = () => mockServerBoardState.tags;

const mockFlowboardApi = () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.endsWith('/api/board/bootstrap')) {
        return jsonResponse(createBootstrapResponse());
      }

      if (url.endsWith('/api/board/cards') && init?.method === 'POST') {
        const card = JSON.parse(String(init.body));
        const createdAt = CREATED_AT;

        mapMockColumns((column) =>
          column.id === card.columnId
            ? {
                ...column,
                cards: [
                  ...column.cards,
                  {
                    content: card.content,
                    createdAt,
                    id: card.id,
                    priority: card.priority,
                    tagIds: card.tagIds,
                    title: card.title,
                  },
                ],
              }
            : column
        );

        return jsonResponse(
          {
            boardVersion: 2,
            card: {
              ...card,
              createdAt,
            },
          },
          { status: 201 }
        );
      }

      if (url.endsWith('/api/board/columns') && init?.method === 'POST') {
        const column = JSON.parse(String(init.body));

        updateMockServerBoardState({
          ...mockServerBoardState,
          columns: [
            ...mockServerBoardState.columns,
            {
              cards: [],
              id: column.id,
              position: mockServerBoardState.columns.length * 10,
              title: column.title,
            },
          ],
        });

        return jsonResponse(
          {
            boardVersion: 2,
            column,
            columns: toColumnSummaries(),
          },
          { status: 201 }
        );
      }

      if (url.includes('/api/board/columns/') && url.endsWith('/move')) {
        const columnId = decodeURIComponent(
          url.split('/api/board/columns/')[1].replace('/move', '')
        );
        const placement = JSON.parse(String(init?.body));

        moveMockColumn(columnId, placement);

        return jsonResponse({
          boardVersion: 2,
          column: toColumnSummaries().find((column) => column.id === columnId),
          columns: toColumnSummaries(),
        });
      }

      if (url.includes('/api/board/columns/')) {
        const columnId = decodeURIComponent(url.split('/api/board/columns/')[1]);

        if (init?.method === 'PATCH') {
          const patch = JSON.parse(String(init.body));

          updateMockServerBoardState({
            ...mockServerBoardState,
            columns: mockServerBoardState.columns.map((column) =>
              column.id === columnId ? { ...column, title: patch.title } : column
            ),
          });

          return jsonResponse({
            boardVersion: 2,
            column: toColumnSummaries().find((column) => column.id === columnId),
            columns: toColumnSummaries(),
          });
        }

        if (init?.method === 'DELETE') {
          const deletedColumn = mockServerBoardState.columns.find(
            (column) => column.id === columnId
          );
          const cardIds = deletedColumn?.cards.map((card) => card.id) ?? [];
          const activeWorkCycle =
            mockServerBoardState.activeWorkCycle.completedColumnId === columnId
              ? {
                  ...mockServerBoardState.activeWorkCycle,
                  completedColumnId: null,
                }
              : mockServerBoardState.activeWorkCycle;

          updateMockServerBoardState({
            ...mockServerBoardState,
            activeWorkCycle,
            columns: mockServerBoardState.columns.filter(
              (column) => column.id !== columnId
            ),
          });

          return jsonResponse({
            boardVersion: 2,
            cardIds,
            columnId,
            columns: toColumnSummaries(),
            workCycle: activeWorkCycle,
          });
        }
      }

      if (url.endsWith('/api/board/tags') && init?.method === 'POST') {
        const tag = JSON.parse(String(init.body));

        updateMockServerBoardState({
          ...mockServerBoardState,
          tags: [...mockServerBoardState.tags, tag],
        });

        return jsonResponse(
          {
            boardVersion: 2,
            tag,
            tags: toTagSummaries(),
          },
          { status: 201 }
        );
      }

      if (url.includes('/api/board/tags/')) {
        const tagId = decodeURIComponent(url.split('/api/board/tags/')[1]);

        if (init?.method === 'PATCH') {
          const patch = JSON.parse(String(init.body));

          updateMockServerBoardState({
            ...mockServerBoardState,
            tags: mockServerBoardState.tags.map((tag) =>
              tag.id === tagId ? { ...tag, name: patch.name } : tag
            ),
          });

          return jsonResponse({
            boardVersion: 2,
            tag: toTagSummaries().find((tag) => tag.id === tagId),
            tags: toTagSummaries(),
          });
        }

        if (init?.method === 'DELETE') {
          const affectedCardIds = mockServerBoardState.columns.flatMap(
            (column) =>
              column.cards
                .filter((card) => card.tagIds.includes(tagId))
                .map((card) => card.id)
          );

          updateMockServerBoardState({
            ...mockServerBoardState,
            columns: mockServerBoardState.columns.map((column) => ({
              ...column,
              cards: column.cards.map((card) => ({
                ...card,
                tagIds: card.tagIds.filter((item) => item !== tagId),
              })),
            })),
            tags: mockServerBoardState.tags.filter((tag) => tag.id !== tagId),
          });

          return jsonResponse({
            affectedCardIds,
            boardVersion: 2,
            tagId,
            tags: toTagSummaries(),
          });
        }
      }

      if (url.includes('/api/board/cards/') && url.endsWith('/move')) {
        const cardId = decodeURIComponent(
          url.split('/api/board/cards/')[1].replace('/move', '')
        );
        const placement = JSON.parse(String(init?.body));

        moveMockCard(cardId, placement);

        const card = findCardDetail(cardId);

        return card
          ? jsonResponse({
              boardVersion: 2,
              card: {
                columnId: placement.columnId,
                content: card.content,
                createdAt: card.createdAt,
                id: card.id,
                priority: card.priority,
                tagIds: card.tagIds,
                title: card.title,
              },
            })
          : jsonResponse({ error: 'Card not found.' }, { status: 404 });
      }

      if (url.includes('/api/board/cards/') && url.includes('/tags/')) {
        const [cardIdPart, tagIdPart] = url
          .split('/api/board/cards/')[1]
          .split('/tags/');
        const cardId = decodeURIComponent(cardIdPart);
        const tagId = decodeURIComponent(tagIdPart);
        const assigned = init?.method === 'PUT';

        mapMockColumns((column) => ({
          ...column,
          cards: column.cards.map((card) => {
            if (card.id !== cardId) {
              return card;
            }

            return {
              ...card,
              tagIds: assigned
                ? [...new Set([...card.tagIds, tagId])]
                : card.tagIds.filter((item) => item !== tagId),
            };
          }),
        }));

        const card = findCardDetail(cardId);

        return card
          ? jsonResponse({
              boardVersion: 2,
              card: {
                columnId:
                  mockServerBoardState.columns.find((column) =>
                    column.cards.some((item) => item.id === card.id)
                  )?.id ?? '',
                id: card.id,
                priority: card.priority,
                tagIds: card.tagIds,
                title: card.title,
              },
            })
          : jsonResponse({ error: 'Card not found.' }, { status: 404 });
      }

      if (url.includes('/api/board/cards/')) {
        const cardId = decodeURIComponent(url.split('/api/board/cards/')[1]);

        if (init?.method === 'PATCH') {
          const patch = JSON.parse(String(init.body));

          mapMockColumns((column) => ({
            ...column,
            cards: column.cards.map((card) =>
              card.id === cardId ? { ...card, ...patch } : card
            ),
          }));

          const card = findCardDetail(cardId);

          return card
            ? jsonResponse({
                boardVersion: 2,
                card: {
                  columnId:
                    mockServerBoardState.columns.find((column) =>
                      column.cards.some((item) => item.id === card.id)
                    )?.id ?? '',
                  content: card.content,
                  createdAt: card.createdAt,
                  id: card.id,
                  priority: card.priority,
                  tagIds: card.tagIds,
                  title: card.title,
                },
              })
            : jsonResponse({ error: 'Card not found.' }, { status: 404 });
        }

        if (init?.method === 'DELETE') {
          const columnId =
            mockServerBoardState.columns.find((column) =>
              column.cards.some((card) => card.id === cardId)
            )?.id ?? '';

          mapMockColumns((column) => ({
            ...column,
            cards: column.cards.filter((card) => card.id !== cardId),
          }));

          return jsonResponse({
            boardVersion: 2,
            cardId,
            columnId,
          });
        }

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

      if (url.endsWith('/api/board/settings') && init?.method === 'PATCH') {
        const settings = JSON.parse(String(init.body));

        updateMockServerBoardState({
          ...mockServerBoardState,
          background: settings.background,
        });

        return jsonResponse({
          board: {
            background: settings.background,
            version: 2,
          },
        });
      }

      if (
        url.endsWith('/api/board/work-cycle/settings') &&
        init?.method === 'PATCH'
      ) {
        const settings = JSON.parse(String(init.body));
        const activeWorkCycle = {
          ...mockServerBoardState.activeWorkCycle,
          completedColumnId: settings.completedColumnId,
        };

        updateMockServerBoardState({
          ...mockServerBoardState,
          activeWorkCycle,
        });

        return jsonResponse({
          boardVersion: 2,
          workCycle: activeWorkCycle,
        });
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

        updateMockServerBoardState(state);

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
