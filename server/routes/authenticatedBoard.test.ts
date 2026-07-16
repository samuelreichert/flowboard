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

const createPrisma = () =>
  ({
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
  }) as unknown as FlowboardPrismaClient;

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
