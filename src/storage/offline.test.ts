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
        title: 'Offline card',
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

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

test('failed API hydration preserves existing local board storage', async () => {
  const columns = createColumns();
  localStorage.setItem('columnsList', JSON.stringify(columns));
  vi.stubEnv('VITE_BOARD_API_URL', '/api/board');
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

  const { fetchStorage, hydrateStorageFromDatabase } = await import('./index');

  await expect(hydrateStorageFromDatabase()).resolves.toBeNull();
  expect(fetchStorage()).toEqual(columns);
});

test('failed API writes preserve local board changes', async () => {
  const columns = createColumns();
  vi.stubEnv('VITE_BOARD_API_URL', '/api/board');
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ state: null }), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        })
      )
      .mockRejectedValue(new Error('offline'))
  );

  const { fetchStorage, hydrateStorageFromDatabase, updateStorage } =
    await import('./index');

  await hydrateStorageFromDatabase();
  updateStorage(columns);

  await new Promise((resolve) => window.setTimeout(resolve, 0));

  expect(fetchStorage()).toEqual(columns);
});

test('full board state storage preserves work-cycle metadata and history', async () => {
  const state = createBoardState();
  const { fetchBoardState, updateBoardStateStorage } = await import('./index');

  updateBoardStateStorage(state);

  expect(fetchBoardState()).toEqual(state);
});

test('database hydration preserves work-cycle metadata and history', async () => {
  const state = createBoardState();
  vi.stubEnv('VITE_BOARD_API_URL', '/api/board');
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ state }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })
    )
  );

  const { fetchBoardState, hydrateStorageFromDatabase } = await import(
    './index'
  );

  await expect(hydrateStorageFromDatabase()).resolves.toEqual(state);
  expect(fetchBoardState()).toEqual(state);
});
