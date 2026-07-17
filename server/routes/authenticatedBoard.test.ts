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
