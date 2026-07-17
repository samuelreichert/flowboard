import { beforeEach, expect, test, vi } from 'vitest';

const createJsonResponse = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
    status,
  });

beforeEach(() => {
  vi.resetModules();
  vi.unstubAllGlobals();
});

test('fetchBoardBootstrap requests the lean bootstrap endpoint', async () => {
  const payload = {
    board: {
      background: { type: 'color', value: '#ffffff' },
      id: 'board-1',
      title: 'Flowboard',
      version: 3,
    },
    cards: [
      {
        columnId: 'todo',
        id: 'card-1',
        priority: 'medium',
        tagIds: ['tag-1'],
        title: 'Card title',
      },
    ],
    columns: [{ id: 'todo', title: 'Todo' }],
    tags: [{ id: 'tag-1', name: 'Backend' }],
    workCycle: {
      completedColumnId: null,
      startDate: '2026-07-17T10:00:00.000Z',
    },
  };
  const fetchMock = vi.fn().mockResolvedValue(createJsonResponse(payload));

  vi.stubGlobal('fetch', fetchMock);

  const { fetchBoardBootstrap } = await import('./authenticatedApi');

  await expect(fetchBoardBootstrap('token-1')).resolves.toEqual(payload);
  expect(fetchMock).toHaveBeenCalledWith('/api/board/bootstrap', {
    headers: {
      Authorization: 'Bearer token-1',
      'Content-Type': 'application/json',
    },
  });
});

test('fetchActiveCardDetail requests encoded active card detail endpoint', async () => {
  const payload = {
    content: 'Rich content',
    createdAt: '2026-07-17T10:00:00.000Z',
    id: 'card/1',
    priority: 'high',
    tagIds: [],
    title: 'Card title',
  };
  const fetchMock = vi.fn().mockResolvedValue(createJsonResponse(payload));

  vi.stubGlobal('fetch', fetchMock);

  const { fetchActiveCardDetail } = await import('./authenticatedApi');

  await expect(fetchActiveCardDetail('card/1', 'token-1')).resolves.toEqual(
    payload
  );
  expect(fetchMock).toHaveBeenCalledWith('/api/board/cards/card%2F1', {
    headers: {
      Authorization: 'Bearer token-1',
      'Content-Type': 'application/json',
    },
  });
});

test('fetchBoardBootstrap rejects unsuccessful bootstrap responses', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(createJsonResponse({}, 500)));

  const { fetchBoardBootstrap } = await import('./authenticatedApi');

  await expect(fetchBoardBootstrap()).rejects.toThrow(
    'Unable to load board bootstrap data.'
  );
});
