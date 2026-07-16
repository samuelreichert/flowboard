import { beforeEach, expect, test, vi } from 'vitest';

import type { BoardColumn, BoardState } from '../types';

const CREATED_AT = '2026-06-03T12:34:56.000Z';

const createColumns = (): BoardColumn[] => [
  {
    cards: [
      {
        content: 'Local notes',
        createdAt: CREATED_AT,
        id: 'card-1',
        priority: 'medium',
        tagIds: [],
        title: 'Database card',
      },
    ],
    id: 'todo',
    position: 0,
    title: 'Todo',
  },
];

const createBoardState = (): BoardState => ({
  activeWorkCycle: {
    completedColumnId: 'done',
    startDate: '2026-06-01T09:00:00.000Z',
  },
  background: {
    type: 'color',
    value: '#ffffff',
  },
  columns: [
    ...createColumns(),
    {
      cards: [],
      id: 'done',
      position: 10,
      title: 'Done',
    },
  ],
  completedWorkCycles: [
    {
      cards: [
        {
          archivedAt: '2026-06-14T09:00:00.000Z',
          content: 'Archived notes',
          createdAt: CREATED_AT,
          id: 'archived-card',
          priority: 'medium',
          tagIds: ['tag-1'],
          tagSnapshots: [{ id: 'tag-1', name: 'Launch' }],
          title: 'Archived card',
        },
      ],
      completedColumnId: 'done',
      completedColumnTitle: 'Done',
      endDate: '2026-06-14T09:00:00.000Z',
      id: 'cycle-1',
      startDate: '2026-06-01T09:00:00.000Z',
    },
  ],
  tags: [{ id: 'tag-1', name: 'Launch' }],
});

const createBoardResponse = (state: BoardState) =>
  new Response(
    JSON.stringify({
      board: {
        id: 'local-board',
        title: 'Flowboard',
        updatedAt: '2026-06-15T09:00:00.000Z',
      },
      state,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    }
  );

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

test('failed API hydration does not read legacy local board storage', async () => {
  const columns = createColumns();
  localStorage.setItem('columnsList', JSON.stringify(columns));
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

  const { fetchStorage, hydrateStorageFromDatabase } = await import('./index');

  await expect(hydrateStorageFromDatabase()).resolves.toBeNull();
  expect(fetchStorage()).toEqual([]);
});

test('local database hydration preserves work-cycle metadata and history', async () => {
  const state = createBoardState();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(createBoardResponse(state)));

  const { fetchBoardState, hydrateStorageFromDatabase } =
    await import('./index');

  await expect(hydrateStorageFromDatabase()).resolves.toEqual(state);
  expect(fetchBoardState()).toEqual(state);
});

test('local database writes use the canonical Prisma board API', async () => {
  const state = createBoardState();
  const savedState = {
    ...state,
    activeWorkCycle: {
      ...state.activeWorkCycle,
      completedColumnId: null,
    },
    columns: createColumns(),
  };
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(createBoardResponse(state))
    .mockResolvedValue(createBoardResponse(savedState));
  vi.stubGlobal('fetch', fetchMock);

  const { hydrateStorageFromDatabase, updateStorage } = await import('./index');

  await hydrateStorageFromDatabase();
  updateStorage(createColumns());

  await new Promise((resolve) => window.setTimeout(resolve, 0));

  expect(fetchMock).toHaveBeenLastCalledWith('/api/boards/local-board', {
    body: JSON.stringify(savedState),
    headers: { 'Content-Type': 'application/json' },
    method: 'PUT',
  });
});

test('local column storage normalizes reordered board order', async () => {
  const { fetchStorage, updateStorage } = await import('./index');

  updateStorage([
    {
      cards: [],
      id: 'done',
      position: 20,
      title: 'Done',
    },
    {
      cards: [],
      id: 'todo',
      position: 0,
      title: 'Todo',
    },
    {
      cards: [],
      id: 'progress',
      position: 10,
      title: 'In Progress',
    },
  ]);

  expect(fetchStorage().map((column) => column.id)).toEqual([
    'todo',
    'progress',
    'done',
  ]);
  expect(fetchStorage().map((column) => column.position)).toEqual([0, 10, 20]);
});

test('full board state storage is in memory without localStorage board writes', async () => {
  const state = createBoardState();
  const { fetchBoardState, updateBoardStateStorage } = await import('./index');

  updateBoardStateStorage(state);

  expect(fetchBoardState()).toEqual(state);
  expect(localStorage.getItem('columnsList')).toBeNull();
});
