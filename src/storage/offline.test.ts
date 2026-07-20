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

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

test('local cache updates do not issue full-board network persistence', async () => {
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);

  const {
    updateActiveWorkCycleStorage,
    updateBackgroundStorage,
    updateBoardStateStorage,
    updateCompletedWorkCyclesStorage,
    updateStorage,
    updateTagStorage,
  } = await import('./index');

  const state = createBoardState();

  updateBoardStateStorage(state);
  updateStorage(createColumns());
  updateBackgroundStorage({ type: 'color', value: '#000000' });
  updateTagStorage([{ id: 'tag-2', name: 'Research' }]);
  updateActiveWorkCycleStorage({
    completedColumnId: null,
    startDate: '2026-06-20T09:00:00.000Z',
  });
  updateCompletedWorkCyclesStorage([]);

  expect(fetchMock).not.toHaveBeenCalled();
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
