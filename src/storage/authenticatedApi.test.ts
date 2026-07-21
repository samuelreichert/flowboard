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
  const fetchMock = vi
    .fn()
    .mockImplementation(() => createJsonResponse(payload));

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
  const fetchMock = vi
    .fn()
    .mockImplementation(() => createJsonResponse(payload));

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
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(createJsonResponse({}, 500))
  );

  const { fetchBoardBootstrap } = await import('./authenticatedApi');

  await expect(fetchBoardBootstrap()).rejects.toThrow(
    'Unable to load board bootstrap data.'
  );
});

test('createActiveCard posts to the card collection endpoint', async () => {
  const payload = {
    boardVersion: 2,
    card: {
      columnId: 'todo',
      content: 'Content',
      createdAt: '2026-07-17T10:00:00.000Z',
      id: 'card-1',
      priority: 'medium',
      tagIds: [],
      title: 'Card title',
    },
  };
  const fetchMock = vi
    .fn()
    .mockImplementation(() => createJsonResponse(payload));

  vi.stubGlobal('fetch', fetchMock);

  const { createActiveCard } = await import('./authenticatedApi');

  await expect(
    createActiveCard(
      {
        columnId: 'todo',
        content: 'Content',
        id: 'card-1',
        priority: 'medium',
        tagIds: [],
        title: 'Card title',
      },
      'token-1'
    )
  ).resolves.toEqual(payload);
  expect(fetchMock).toHaveBeenCalledWith('/api/board/cards', {
    body: JSON.stringify({
      columnId: 'todo',
      content: 'Content',
      id: 'card-1',
      priority: 'medium',
      tagIds: [],
      title: 'Card title',
    }),
    headers: {
      Authorization: 'Bearer token-1',
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });
});

test('updateActiveCard patches encoded card endpoint with partial payload', async () => {
  const payload = {
    boardVersion: 2,
    card: {
      columnId: 'todo',
      content: 'Existing content',
      createdAt: '2026-07-17T10:00:00.000Z',
      id: 'card/1',
      priority: 'high',
      tagIds: [],
      title: 'Updated title',
    },
  };
  const fetchMock = vi
    .fn()
    .mockImplementation(() => createJsonResponse(payload));

  vi.stubGlobal('fetch', fetchMock);

  const { updateActiveCard } = await import('./authenticatedApi');

  await expect(
    updateActiveCard('card/1', { title: 'Updated title' }, 'token-1')
  ).resolves.toEqual(payload);
  expect(fetchMock).toHaveBeenCalledWith('/api/board/cards/card%2F1', {
    body: JSON.stringify({ title: 'Updated title' }),
    headers: {
      Authorization: 'Bearer token-1',
      'Content-Type': 'application/json',
    },
    method: 'PATCH',
  });
});

test('moveActiveCard patches encoded move endpoint', async () => {
  const payload = {
    boardVersion: 2,
    card: {
      columnId: 'done',
      content: '',
      createdAt: '2026-07-17T10:00:00.000Z',
      id: 'card/1',
      priority: 'medium',
      tagIds: [],
      title: 'Card title',
    },
  };
  const fetchMock = vi.fn().mockResolvedValue(createJsonResponse(payload));

  vi.stubGlobal('fetch', fetchMock);

  const { moveActiveCard } = await import('./authenticatedApi');

  await expect(
    moveActiveCard(
      'card/1',
      { afterCardId: null, beforeCardId: 'other', columnId: 'done' },
      'token-1'
    )
  ).resolves.toEqual(payload);
  expect(fetchMock).toHaveBeenCalledWith('/api/board/cards/card%2F1/move', {
    body: JSON.stringify({
      afterCardId: null,
      beforeCardId: 'other',
      columnId: 'done',
    }),
    headers: {
      Authorization: 'Bearer token-1',
      'Content-Type': 'application/json',
    },
    method: 'PATCH',
  });
});

test('deleteActiveCard deletes encoded card endpoint', async () => {
  const payload = {
    boardVersion: 2,
    cardId: 'card/1',
    columnId: 'todo',
  };
  const fetchMock = vi.fn().mockResolvedValue(createJsonResponse(payload));

  vi.stubGlobal('fetch', fetchMock);

  const { deleteActiveCard } = await import('./authenticatedApi');

  await expect(deleteActiveCard('card/1', 'token-1')).resolves.toEqual(payload);
  expect(fetchMock).toHaveBeenCalledWith('/api/board/cards/card%2F1', {
    headers: {
      Authorization: 'Bearer token-1',
      'Content-Type': 'application/json',
    },
    method: 'DELETE',
  });
});

test('column mutations call resource endpoints', async () => {
  const payload = {
    boardVersion: 2,
    column: { id: 'doing', title: 'Doing' },
    columns: [{ id: 'doing', title: 'Doing' }],
  };
  const fetchMock = vi
    .fn()
    .mockImplementation(() => createJsonResponse(payload));

  vi.stubGlobal('fetch', fetchMock);

  const {
    createActiveColumn,
    deleteActiveColumn,
    moveActiveColumn,
    updateActiveColumn,
  } = await import('./authenticatedApi');

  await createActiveColumn({ id: 'doing', title: 'Doing' }, 'token-1');
  await updateActiveColumn('doing/1', { title: 'Doing now' }, 'token-1');
  await moveActiveColumn(
    'doing/1',
    { afterColumnId: null, beforeColumnId: 'todo' },
    'token-1'
  );
  await deleteActiveColumn('doing/1', 'token-1');

  expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/board/columns', {
    body: JSON.stringify({ id: 'doing', title: 'Doing' }),
    headers: {
      Authorization: 'Bearer token-1',
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });
  expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/board/columns/doing%2F1', {
    body: JSON.stringify({ title: 'Doing now' }),
    headers: {
      Authorization: 'Bearer token-1',
      'Content-Type': 'application/json',
    },
    method: 'PATCH',
  });
  expect(fetchMock).toHaveBeenNthCalledWith(
    3,
    '/api/board/columns/doing%2F1/move',
    {
      body: JSON.stringify({ afterColumnId: null, beforeColumnId: 'todo' }),
      headers: {
        Authorization: 'Bearer token-1',
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
    }
  );
  expect(fetchMock).toHaveBeenNthCalledWith(4, '/api/board/columns/doing%2F1', {
    headers: {
      Authorization: 'Bearer token-1',
      'Content-Type': 'application/json',
    },
    method: 'DELETE',
  });
});

test('tag and card-tag mutations call resource endpoints', async () => {
  const payload = {
    boardVersion: 2,
    tag: { id: 'tag/1', name: 'Design' },
    tags: [{ id: 'tag/1', name: 'Design' }],
  };
  const fetchMock = vi
    .fn()
    .mockImplementation(() => createJsonResponse(payload));

  vi.stubGlobal('fetch', fetchMock);

  const {
    assignActiveCardTag,
    createBoardTag,
    deleteBoardTag,
    unassignActiveCardTag,
    updateBoardTag,
  } = await import('./authenticatedApi');

  await createBoardTag({ id: 'tag/1', name: 'Design' }, 'token-1');
  await updateBoardTag('tag/1', { name: 'Product' }, 'token-1');
  await deleteBoardTag('tag/1', 'token-1');
  await assignActiveCardTag('card/1', 'tag/1', 'token-1');
  await unassignActiveCardTag('card/1', 'tag/1', 'token-1');

  expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/board/tags', {
    body: JSON.stringify({ id: 'tag/1', name: 'Design' }),
    headers: {
      Authorization: 'Bearer token-1',
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });
  expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/board/tags/tag%2F1', {
    body: JSON.stringify({ name: 'Product' }),
    headers: {
      Authorization: 'Bearer token-1',
      'Content-Type': 'application/json',
    },
    method: 'PATCH',
  });
  expect(fetchMock).toHaveBeenNthCalledWith(3, '/api/board/tags/tag%2F1', {
    headers: {
      Authorization: 'Bearer token-1',
      'Content-Type': 'application/json',
    },
    method: 'DELETE',
  });
  expect(fetchMock).toHaveBeenNthCalledWith(
    4,
    '/api/board/cards/card%2F1/tags/tag%2F1',
    {
      headers: {
        Authorization: 'Bearer token-1',
        'Content-Type': 'application/json',
      },
      method: 'PUT',
    }
  );
  expect(fetchMock).toHaveBeenNthCalledWith(
    5,
    '/api/board/cards/card%2F1/tags/tag%2F1',
    {
      headers: {
        Authorization: 'Bearer token-1',
        'Content-Type': 'application/json',
      },
      method: 'DELETE',
    }
  );
});

test('settings mutations call resource endpoints', async () => {
  const fetchMock = vi.fn().mockImplementation(() => createJsonResponse({}));

  vi.stubGlobal('fetch', fetchMock);

  const { updateBoardSettings, updateWorkCycleSettings } =
    await import('./authenticatedApi');

  await updateBoardSettings(
    { background: { type: 'color', value: '#ffffff' } },
    'token-1'
  );
  await updateWorkCycleSettings({ completedColumnId: null }, 'token-1');

  expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/board/settings', {
    body: JSON.stringify({ background: { type: 'color', value: '#ffffff' } }),
    headers: {
      Authorization: 'Bearer token-1',
      'Content-Type': 'application/json',
    },
    method: 'PATCH',
  });
  expect(fetchMock).toHaveBeenNthCalledWith(
    2,
    '/api/board/work-cycle/settings',
    {
      body: JSON.stringify({ completedColumnId: null }),
      headers: {
        Authorization: 'Bearer token-1',
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
    }
  );
});

test('clearBoard posts to focused clear-board endpoint', async () => {
  const payload = {
    boardVersion: 4,
    cardIds: ['card-1'],
    columns: [],
    workCycle: {
      completedColumnId: null,
      startDate: '2026-07-17T10:00:00.000Z',
    },
  };
  const fetchMock = vi
    .fn()
    .mockImplementation(() => createJsonResponse(payload));

  vi.stubGlobal('fetch', fetchMock);

  const { clearBoard } = await import('./authenticatedApi');

  await expect(clearBoard('token-1')).resolves.toEqual(payload);
  expect(fetchMock).toHaveBeenCalledWith('/api/board/clear', {
    headers: {
      Authorization: 'Bearer token-1',
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });
});

test('work-cycle completion and history helpers call focused endpoints', async () => {
  const completionPayload = {
    boardVersion: 2,
    cardIds: ['card-1'],
    columnId: 'done',
    cycle: {
      cards: [
        {
          archivedAt: '2026-07-18T10:00:00.000Z',
          createdAt: '2026-07-17T10:00:00.000Z',
          id: 'card-1',
          priority: 'medium',
          tagIds: ['tag-1'],
          tagSnapshots: [{ id: 'tag-1', name: 'Backend' }],
          title: 'Done card',
        },
      ],
      completedColumnId: 'done',
      completedColumnTitle: 'Done',
      endDate: '2026-07-18T10:00:00.000Z',
      id: 'cycle-1',
      startDate: '2026-07-17T10:00:00.000Z',
    },
    workCycle: {
      completedColumnId: 'done',
      startDate: '2026-07-18T10:00:00.000Z',
    },
  };
  const historyPayload = {
    cycles: [completionPayload.cycle],
    pageInfo: {
      hasMore: true,
      nextCursor: 'cursor-1',
    },
  };
  const detailPayload = {
    ...completionPayload.cycle.cards[0],
    content: 'Archived content',
  };
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(createJsonResponse(completionPayload))
    .mockResolvedValueOnce(createJsonResponse(historyPayload))
    .mockResolvedValueOnce(createJsonResponse(detailPayload));

  vi.stubGlobal('fetch', fetchMock);

  const { completeWorkCycle, fetchArchivedCardDetail, fetchCompletedHistory } =
    await import('./authenticatedApi');

  await expect(completeWorkCycle('token-1')).resolves.toEqual(
    completionPayload
  );
  await expect(
    fetchCompletedHistory({
      accessToken: 'token-1',
      cursor: 'cursor/1',
      limit: 10,
    })
  ).resolves.toEqual(historyPayload);
  await expect(
    fetchArchivedCardDetail('cycle/1', 'card/1', 'token-1')
  ).resolves.toEqual(detailPayload);

  expect(fetchMock).toHaveBeenNthCalledWith(
    1,
    '/api/board/work-cycle/complete',
    {
      headers: {
        Authorization: 'Bearer token-1',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    }
  );
  expect(fetchMock).toHaveBeenNthCalledWith(
    2,
    '/api/board/work-cycles/history?limit=10&cursor=cursor%2F1',
    {
      headers: {
        Authorization: 'Bearer token-1',
        'Content-Type': 'application/json',
      },
    }
  );
  expect(fetchMock).toHaveBeenNthCalledWith(
    3,
    '/api/board/work-cycles/cycle%2F1/cards/card%2F1',
    {
      headers: {
        Authorization: 'Bearer token-1',
        'Content-Type': 'application/json',
      },
    }
  );
});

test('work-cycle history helpers reject unsuccessful responses', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(createJsonResponse({}, 500))
  );

  const { completeWorkCycle, fetchArchivedCardDetail, fetchCompletedHistory } =
    await import('./authenticatedApi');

  await expect(completeWorkCycle()).rejects.toThrow(
    'Unable to complete work cycle.'
  );
  await expect(fetchCompletedHistory()).rejects.toThrow(
    'Unable to load completed work history.'
  );
  await expect(fetchArchivedCardDetail('cycle-1', 'card-1')).rejects.toThrow(
    'Unable to load archived card detail.'
  );
});

test('clearBoard rejects unsuccessful responses', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(createJsonResponse({}, 500))
  );

  const { clearBoard } = await import('./authenticatedApi');

  await expect(clearBoard()).rejects.toThrow('Unable to clear board.');
});

test('card mutations reject unsuccessful responses', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(createJsonResponse({}, 500))
  );

  const { createActiveCard, deleteActiveCard } =
    await import('./authenticatedApi');

  await expect(
    createActiveCard({
      columnId: 'todo',
      content: '',
      id: 'card-1',
      priority: 'medium',
      tagIds: [],
      title: 'Card title',
    })
  ).rejects.toThrow('Unable to save card data.');
  await expect(deleteActiveCard('card-1')).rejects.toThrow(
    'Unable to delete card data.'
  );
});
