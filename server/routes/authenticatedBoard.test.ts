import { describe, expect, test, vi } from 'vitest';
import type { IncomingMessage, ServerResponse } from 'node:http';

import {
  LOCAL_DEV_PRINCIPAL,
  type PrincipalResolver,
} from '../auth/principal.js';
import type { FlowboardPrismaClient } from '../db/prismaClient.js';
import { handleAuthenticatedBoardApiRequest } from './authenticatedBoard.js';

const createResponse = () => {
  const response = {
    body: '',
    end: vi.fn((body: string) => {
      response.body = body;
    }),
    statusCode: 0,
    writeHead: vi.fn((statusCode: number) => {
      response.statusCode = statusCode;
    }),
  };

  return response as unknown as ServerResponse & {
    body: string;
    statusCode: number;
  };
};

const createRequest = ({
  body,
  method,
  url,
}: {
  body?: string;
  method: string;
  url: string;
}) =>
  ({
    headers: {},
    method,
    url,
    async *[Symbol.asyncIterator]() {
      if (body !== undefined) {
        yield body;
      }
    },
  }) as unknown as IncomingMessage;

const createPrisma = ({
  cardDetail = {
    content: 'Rich details',
    createdAt: new Date('2026-07-02T00:00:00.000Z'),
    id: 'card-1',
    priority: 'high',
    title: 'Explore database strategy',
  },
}: {
  cardDetail?: {
    content: string;
    createdAt: Date;
    id: string;
    priority: string;
    title: string;
  } | null;
} = {}) =>
  ({
    board: {
      create: vi.fn(),
      findFirst: vi.fn().mockResolvedValue({
        backgroundType: 'image',
        backgroundValue: '/flowboard-background.png',
        createdAt: new Date('2026-07-01T00:00:00.000Z'),
        id: 'board-1',
        title: 'Flowboard',
        updatedAt: new Date('2026-07-03T00:00:00.000Z'),
        version: 7,
      }),
      update: vi.fn(),
    },
    boardColumn: {
      deleteMany: vi.fn(),
      findMany: vi.fn().mockResolvedValue([
        { id: 'todo', title: 'Todo' },
        { id: 'done', title: 'Done' },
      ]),
    },
    boardWorkCycle: {
      deleteMany: vi.fn(),
      findUnique: vi.fn().mockResolvedValue({
        completedColumnId: 'done',
        startDate: new Date('2026-07-01T00:00:00.000Z'),
      }),
    },
    card: {
      deleteMany: vi.fn(),
      findFirst: vi.fn().mockResolvedValue(cardDetail),
      findMany: vi.fn().mockResolvedValue([
        {
          columnId: 'todo',
          id: 'card-1',
          priority: 'high',
          title: 'Explore database strategy',
        },
      ]),
    },
    cardTag: {
      deleteMany: vi.fn(),
      findMany: vi.fn().mockResolvedValue([
        {
          cardId: 'card-1',
          tagId: 'tag-1',
        },
      ]),
    },
    completedWorkCycle: {
      deleteMany: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
    },
    completedWorkCycleCard: {
      deleteMany: vi.fn(),
    },
    completedWorkCycleCardTag: {
      deleteMany: vi.fn(),
    },
    profile: {
      create: vi.fn(),
      findUnique: vi.fn().mockResolvedValue({
        avatarStoragePath: null,
        avatarUrl: null,
        displayName: null,
        id: 'user-1',
      }),
      update: vi.fn(),
    },
    project: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
    },
    tag: {
      deleteMany: vi.fn(),
      findMany: vi.fn().mockResolvedValue([
        {
          id: 'tag-1',
          name: 'Architecture',
        },
      ]),
    },
  }) as unknown as FlowboardPrismaClient;

const authenticatedResolver = {
  resolveRequest: vi.fn().mockResolvedValue({
    avatarUrl: null,
    displayName: null,
    email: 'user@example.com',
    id: 'user-1',
    source: 'supabase',
  }),
} satisfies PrincipalResolver;

const boardRecord = {
  backgroundType: 'image',
  backgroundValue: '/flowboard-background.png',
  createdAt: new Date('2026-07-01T00:00:00.000Z'),
  id: 'board-1',
  title: 'Flowboard',
  updatedAt: new Date('2026-07-03T00:00:00.000Z'),
  version: 7,
};

const mutationCard = {
  boardId: 'board-1',
  columnId: 'todo',
  content: 'Card content',
  createdAt: new Date('2026-07-02T00:00:00.000Z'),
  id: 'card-1',
  priority: 'medium',
  sortOrder: 0,
  title: 'Card title',
};

const createMutationPrisma = ({
  card = mutationCard,
  column = { id: 'todo' },
  tags = [{ id: 'tag-1', name: 'Architecture' }],
}: {
  card?: typeof mutationCard | null;
  column?: { id: string } | null;
  tags?: Array<{ id: string; name: string }>;
} = {}) => {
  const prisma = {
    $transaction: vi.fn(async (callback) => callback(prisma)),
    board: {
      create: vi.fn(),
      findFirst: vi.fn().mockResolvedValue(boardRecord),
      update: vi.fn().mockResolvedValue({
        ...boardRecord,
        version: 8,
      }),
    },
    boardColumn: {
      create: vi.fn().mockResolvedValue({
        id: 'doing',
        title: 'Doing',
      }),
      delete: vi.fn().mockResolvedValue({ id: 'done', title: 'Done' }),
      deleteMany: vi.fn(),
      findFirst: vi.fn().mockResolvedValue(column),
      findMany: vi.fn().mockResolvedValue([
        { id: 'todo', title: 'Todo' },
        { id: 'done', title: 'Done' },
      ]),
      update: vi.fn().mockResolvedValue({
        id: 'todo',
        title: 'Updated',
      }),
    },
    boardWorkCycle: {
      deleteMany: vi.fn(),
      findUnique: vi.fn().mockResolvedValue({
        completedColumnId: 'done',
        startDate: new Date('2026-07-01T00:00:00.000Z'),
      }),
      findUniqueOrThrow: vi.fn().mockResolvedValue({
        completedColumnId: 'done',
        startDate: new Date('2026-07-01T00:00:00.000Z'),
      }),
      update: vi.fn().mockResolvedValue({
        completedColumnId: null,
        startDate: new Date('2026-07-01T00:00:00.000Z'),
      }),
      upsert: vi.fn().mockResolvedValue({
        completedColumnId: 'done',
        startDate: new Date('2026-07-01T00:00:00.000Z'),
      }),
    },
    card: {
      create: vi.fn().mockResolvedValue(card ?? mutationCard),
      delete: vi.fn().mockResolvedValue(card ?? mutationCard),
      deleteMany: vi.fn(),
      findFirst: vi.fn().mockResolvedValue(card),
      findMany: vi.fn().mockResolvedValue([{ id: 'card-1' }]),
      update: vi.fn().mockResolvedValue(card ?? mutationCard),
    },
    cardTag: {
      create: vi.fn(),
      createMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      findUnique: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([
        {
          cardId: 'card-1',
          tagId: 'tag-1',
        },
      ]),
    },
    completedWorkCycle: {
      deleteMany: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
    },
    completedWorkCycleCard: {
      deleteMany: vi.fn(),
    },
    completedWorkCycleCardTag: {
      deleteMany: vi.fn(),
    },
    profile: {
      create: vi.fn(),
      findUnique: vi.fn().mockResolvedValue({
        avatarStoragePath: null,
        avatarUrl: null,
        displayName: null,
        id: 'user-1',
      }),
      update: vi.fn(),
    },
    project: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
    },
    tag: {
      create: vi.fn().mockResolvedValue({
        id: 'tag-2',
        name: 'Focus',
      }),
      delete: vi.fn().mockResolvedValue({
        id: 'tag-1',
        name: 'Architecture',
      }),
      deleteMany: vi.fn(),
      findFirst: vi.fn().mockResolvedValue({ id: 'tag-1' }),
      findMany: vi.fn().mockResolvedValue(tags),
      update: vi.fn().mockResolvedValue({
        id: 'tag-1',
        name: 'Updated',
      }),
    },
  } as unknown as FlowboardPrismaClient;

  return prisma;
};

describe('handleAuthenticatedBoardApiRequest', () => {
  test('rejects unauthenticated durable board requests', async () => {
    const response = createResponse();
    const handled = await handleAuthenticatedBoardApiRequest(
      createRequest({ method: 'GET', url: '/api/boards/default' }),
      response,
      createPrisma(),
      {
        resolveRequest: vi.fn().mockResolvedValue(null),
      } satisfies PrincipalResolver
    );

    expect(handled).toBe(true);
    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body)).toEqual({
      error: {
        code: 'unauthenticated',
        message: 'Authentication is required.',
      },
    });
  });

  test('serves lean main board bootstrap for authenticated users', async () => {
    const response = createResponse();
    const handled = await handleAuthenticatedBoardApiRequest(
      createRequest({ method: 'GET', url: '/api/board/bootstrap' }),
      response,
      createPrisma(),
      authenticatedResolver
    );

    expect(handled).toBe(true);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      board: {
        background: {
          type: 'image',
          value: '/flowboard-background.png',
        },
        id: 'board-1',
        title: 'Flowboard',
        version: 7,
      },
      cards: [
        {
          columnId: 'todo',
          id: 'card-1',
          priority: 'high',
          tagIds: ['tag-1'],
          title: 'Explore database strategy',
        },
      ],
      columns: [
        { id: 'todo', title: 'Todo' },
        { id: 'done', title: 'Done' },
      ],
      tags: [{ id: 'tag-1', name: 'Architecture' }],
      workCycle: {
        completedColumnId: 'done',
        startDate: '2026-07-01T00:00:00.000Z',
      },
    });
    expect(JSON.parse(response.body).cards[0]).not.toHaveProperty('content');
  });

  test('serves lean main board bootstrap for the local development principal', async () => {
    const response = createResponse();
    const handled = await handleAuthenticatedBoardApiRequest(
      createRequest({ method: 'GET', url: '/api/board/bootstrap' }),
      response,
      createPrisma(),
      {
        resolveRequest: vi.fn().mockResolvedValue(LOCAL_DEV_PRINCIPAL),
      } satisfies PrincipalResolver
    );

    expect(handled).toBe(true);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).board.id).toBe('board-1');
  });

  test('rejects unauthenticated lean bootstrap requests', async () => {
    const prisma = createPrisma();
    const response = createResponse();
    const handled = await handleAuthenticatedBoardApiRequest(
      createRequest({ method: 'GET', url: '/api/board/bootstrap' }),
      response,
      prisma,
      {
        resolveRequest: vi.fn().mockResolvedValue(null),
      } satisfies PrincipalResolver
    );

    expect(handled).toBe(true);
    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body).error.code).toBe('unauthenticated');
    expect(prisma.board.findFirst).not.toHaveBeenCalled();
  });

  test('serves active card detail for authenticated users', async () => {
    const response = createResponse();
    const handled = await handleAuthenticatedBoardApiRequest(
      createRequest({ method: 'GET', url: '/api/board/cards/card-1' }),
      response,
      createPrisma(),
      authenticatedResolver
    );

    expect(handled).toBe(true);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      content: 'Rich details',
      createdAt: '2026-07-02T00:00:00.000Z',
      id: 'card-1',
      priority: 'high',
      tagIds: ['tag-1'],
      title: 'Explore database strategy',
    });
  });

  test('returns not found for missing or inaccessible active card detail', async () => {
    const response = createResponse();
    const handled = await handleAuthenticatedBoardApiRequest(
      createRequest({ method: 'GET', url: '/api/board/cards/missing-card' }),
      response,
      createPrisma({ cardDetail: null }),
      authenticatedResolver
    );

    expect(handled).toBe(true);
    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body).error.code).toBe('not_found');
  });

  test('creates active cards for authenticated users', async () => {
    const response = createResponse();
    const prisma = createMutationPrisma({ card: null });
    const handled = await handleAuthenticatedBoardApiRequest(
      createRequest({
        body: JSON.stringify({
          columnId: 'todo',
          content: 'Card content',
          id: 'card-1',
          priority: 'medium',
          tagIds: ['tag-1'],
          title: 'Card title',
        }),
        method: 'POST',
        url: '/api/board/cards',
      }),
      response,
      prisma,
      authenticatedResolver
    );

    expect(handled).toBe(true);
    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.body)).toEqual({
      boardVersion: 8,
      card: {
        columnId: 'todo',
        content: 'Card content',
        createdAt: '2026-07-02T00:00:00.000Z',
        id: 'card-1',
        priority: 'medium',
        tagIds: ['tag-1'],
        title: 'Card title',
      },
    });
  });

  test('creates active cards for the local development principal', async () => {
    const response = createResponse();
    const handled = await handleAuthenticatedBoardApiRequest(
      createRequest({
        body: JSON.stringify({
          columnId: 'todo',
          content: 'Card content',
          id: 'card-1',
          priority: 'medium',
          tagIds: ['tag-1'],
          title: 'Card title',
        }),
        method: 'POST',
        url: '/api/board/cards',
      }),
      response,
      createMutationPrisma({ card: null }),
      {
        resolveRequest: vi.fn().mockResolvedValue(LOCAL_DEV_PRINCIPAL),
      } satisfies PrincipalResolver
    );

    expect(handled).toBe(true);
    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.body).card.id).toBe('card-1');
  });

  test('updates active card fields for authenticated users', async () => {
    const response = createResponse();
    const handled = await handleAuthenticatedBoardApiRequest(
      createRequest({
        body: JSON.stringify({
          content: 'Card content',
          priority: 'medium',
          tagIds: ['tag-1'],
          title: 'Card title',
        }),
        method: 'PATCH',
        url: '/api/board/cards/card-1',
      }),
      response,
      createMutationPrisma(),
      authenticatedResolver
    );

    expect(handled).toBe(true);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).boardVersion).toBe(8);
    expect(JSON.parse(response.body).card.id).toBe('card-1');
  });

  test('moves active cards for authenticated users', async () => {
    const response = createResponse();
    const handled = await handleAuthenticatedBoardApiRequest(
      createRequest({
        body: JSON.stringify({
          afterCardId: null,
          beforeCardId: null,
          columnId: 'todo',
        }),
        method: 'PATCH',
        url: '/api/board/cards/card-1/move',
      }),
      response,
      createMutationPrisma(),
      authenticatedResolver
    );

    expect(handled).toBe(true);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).boardVersion).toBe(8);
    expect(JSON.parse(response.body).card.columnId).toBe('todo');
  });

  test('deletes active cards for authenticated users', async () => {
    const response = createResponse();
    const handled = await handleAuthenticatedBoardApiRequest(
      createRequest({
        method: 'DELETE',
        url: '/api/board/cards/card-1',
      }),
      response,
      createMutationPrisma(),
      authenticatedResolver
    );

    expect(handled).toBe(true);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      boardVersion: 8,
      cardId: 'card-1',
      columnId: 'todo',
    });
  });

  test('mutates columns, tags, settings, and card-tag assignments for authenticated users', async () => {
    const successRequests = [
      {
        body: JSON.stringify({ id: 'doing', title: 'Doing' }),
        expectedStatus: 201,
        method: 'POST',
        url: '/api/board/columns',
      },
      {
        body: JSON.stringify({ title: 'Updated' }),
        expectedStatus: 200,
        method: 'PATCH',
        url: '/api/board/columns/todo',
      },
      {
        body: JSON.stringify({ afterColumnId: null, beforeColumnId: 'todo' }),
        expectedStatus: 200,
        method: 'PATCH',
        url: '/api/board/columns/done/move',
      },
      {
        expectedStatus: 200,
        method: 'DELETE',
        url: '/api/board/columns/done',
      },
      {
        body: JSON.stringify({ id: 'tag-2', name: 'Focus' }),
        expectedStatus: 201,
        method: 'POST',
        url: '/api/board/tags',
      },
      {
        body: JSON.stringify({ name: 'Updated' }),
        expectedStatus: 200,
        method: 'PATCH',
        url: '/api/board/tags/tag-1',
      },
      {
        expectedStatus: 200,
        method: 'DELETE',
        url: '/api/board/tags/tag-1',
      },
      {
        expectedStatus: 200,
        method: 'PUT',
        url: '/api/board/cards/card-1/tags/tag-1',
      },
      {
        body: JSON.stringify({
          background: { type: 'color', value: '#ffffff' },
        }),
        expectedStatus: 200,
        method: 'PATCH',
        url: '/api/board/settings',
      },
      {
        body: JSON.stringify({ completedColumnId: 'done' }),
        expectedStatus: 200,
        method: 'PATCH',
        url: '/api/board/work-cycle/settings',
      },
    ];

    for (const request of successRequests) {
      const response = createResponse();
      const handled = await handleAuthenticatedBoardApiRequest(
        createRequest(request),
        response,
        createMutationPrisma(),
        authenticatedResolver
      );

      expect(handled).toBe(true);
      expect(response.statusCode).toBe(request.expectedStatus);
    }
  });

  test('unassigns active card tags for authenticated users', async () => {
    const response = createResponse();
    const prisma = createMutationPrisma();

    vi.mocked(prisma.cardTag.findUnique).mockResolvedValue({
      cardId: 'card-1',
      createdAt: new Date('2026-07-02T00:00:00.000Z'),
      tagId: 'tag-1',
    });

    const handled = await handleAuthenticatedBoardApiRequest(
      createRequest({
        method: 'DELETE',
        url: '/api/board/cards/card-1/tags/tag-1',
      }),
      response,
      prisma,
      authenticatedResolver
    );

    expect(handled).toBe(true);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).card.id).toBe('card-1');
  });

  test('rejects unauthenticated active card mutations', async () => {
    const prisma = createMutationPrisma({ card: null });
    const response = createResponse();
    const handled = await handleAuthenticatedBoardApiRequest(
      createRequest({
        body: JSON.stringify({
          columnId: 'todo',
          content: '',
          id: 'card-1',
          priority: 'medium',
          tagIds: [],
          title: 'Card title',
        }),
        method: 'POST',
        url: '/api/board/cards',
      }),
      response,
      prisma,
      {
        resolveRequest: vi.fn().mockResolvedValue(null),
      } satisfies PrincipalResolver
    );

    expect(handled).toBe(true);
    expect(response.statusCode).toBe(401);
    expect(prisma.board.findFirst).not.toHaveBeenCalled();
  });

  test('rejects invalid active card mutation payloads', async () => {
    const invalidRequests = [
      {
        body: '{not-json',
        method: 'POST',
        url: '/api/board/cards',
      },
      {
        body: JSON.stringify({
          columnId: 'todo',
          content: '',
          id: 'card-1',
          priority: 'medium',
          tagIds: [],
          title: '',
        }),
        method: 'POST',
        url: '/api/board/cards',
      },
      {
        body: JSON.stringify({
          content: '',
          priority: 'urgent',
          tagIds: [],
          title: 'Card title',
        }),
        method: 'PATCH',
        url: '/api/board/cards/card-1',
      },
      {
        body: JSON.stringify({
          afterCardId: 'second',
          beforeCardId: 'first',
          columnId: 'todo',
        }),
        method: 'PATCH',
        url: '/api/board/cards/card-1/move',
      },
    ];

    for (const request of invalidRequests) {
      const response = createResponse();
      const handled = await handleAuthenticatedBoardApiRequest(
        createRequest(request),
        response,
        createMutationPrisma(),
        authenticatedResolver
      );

      expect(handled).toBe(true);
      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).error.code).toBe('bad_request');
    }
  });

  test('rejects invalid non-card board mutation payloads', async () => {
    const invalidRequests = [
      {
        body: '{not-json',
        method: 'POST',
        url: '/api/board/columns',
      },
      {
        body: JSON.stringify({ id: 'doing', title: '' }),
        method: 'POST',
        url: '/api/board/columns',
      },
      {
        body: JSON.stringify({ afterColumnId: 'done', beforeColumnId: 'todo' }),
        method: 'PATCH',
        url: '/api/board/columns/done/move',
      },
      {
        body: JSON.stringify({ id: 'tag-2', name: '' }),
        method: 'POST',
        url: '/api/board/tags',
      },
      {
        body: JSON.stringify({ background: { type: 'video', value: 'x' } }),
        method: 'PATCH',
        url: '/api/board/settings',
      },
      {
        body: JSON.stringify({ completedColumnId: '' }),
        method: 'PATCH',
        url: '/api/board/work-cycle/settings',
      },
    ];

    for (const request of invalidRequests) {
      const response = createResponse();
      const handled = await handleAuthenticatedBoardApiRequest(
        createRequest(request),
        response,
        createMutationPrisma(),
        authenticatedResolver
      );

      expect(handled).toBe(true);
      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).error.code).toBe('bad_request');
    }
  });

  test('returns not found for unavailable card mutation resources', async () => {
    const cases = [
      {
        body: JSON.stringify({
          columnId: 'missing-column',
          content: '',
          id: 'card-1',
          priority: 'medium',
          tagIds: [],
          title: 'Card title',
        }),
        prisma: createMutationPrisma({ card: null, column: null }),
        url: '/api/board/cards',
      },
      {
        body: JSON.stringify({
          columnId: 'todo',
          content: '',
          id: 'card-1',
          priority: 'medium',
          tagIds: ['missing-tag'],
          title: 'Card title',
        }),
        prisma: createMutationPrisma({ card: null, tags: [] }),
        url: '/api/board/cards',
      },
      {
        body: JSON.stringify({
          content: '',
          priority: 'medium',
          tagIds: [],
          title: 'Card title',
        }),
        method: 'PATCH',
        prisma: createMutationPrisma({ card: null }),
        url: '/api/board/cards/missing-card',
      },
    ];

    for (const item of cases) {
      const response = createResponse();
      const handled = await handleAuthenticatedBoardApiRequest(
        createRequest({
          body: item.body,
          method: item.method ?? 'POST',
          url: item.url,
        }),
        response,
        item.prisma,
        authenticatedResolver
      );

      expect(handled).toBe(true);
      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body).error.code).toBe('not_found');
    }
  });

  test('rejects malformed authenticated board mutations', async () => {
    const response = createResponse();
    const handled = await handleAuthenticatedBoardApiRequest(
      createRequest({
        body: '{not-json',
        method: 'PUT',
        url: '/api/boards/board-1',
      }),
      response,
      createPrisma(),
      {
        resolveRequest: vi.fn().mockResolvedValue({
          avatarUrl: null,
          displayName: null,
          email: 'user@example.com',
          id: 'user-1',
          source: 'supabase',
        }),
      } satisfies PrincipalResolver
    );

    expect(handled).toBe(true);
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({
      error: {
        code: 'bad_request',
        message: 'Invalid JSON payload.',
      },
    });
  });

  test('accepts a resolved local development principal before validating board mutations', async () => {
    const response = createResponse();
    const handled = await handleAuthenticatedBoardApiRequest(
      createRequest({
        body: '{not-json',
        method: 'PUT',
        url: '/api/boards/board-1',
      }),
      response,
      createPrisma(),
      {
        resolveRequest: vi.fn().mockResolvedValue(LOCAL_DEV_PRINCIPAL),
      } satisfies PrincipalResolver
    );

    expect(handled).toBe(true);
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).error.message).toBe(
      'Invalid JSON payload.'
    );
  });
});
