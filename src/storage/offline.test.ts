import { beforeEach, expect, test, vi } from 'vitest';

import type { BoardColumn } from '../types';

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
