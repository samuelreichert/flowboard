import { describe, expect, test, vi } from 'vitest';
import type { IncomingMessage, ServerResponse } from 'node:http';

import type { PrincipalResolver } from '../auth/principal.js';
import type { FlowboardPrismaClient } from '../db/prismaClient.js';
import { handleAuthenticatedProfileApiRequest } from './authenticatedProfile.js';

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
  url = '/api/profile',
}: {
  body?: string;
  method: string;
  url?: string;
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

const user = {
  avatarUrl: 'https://example.com/provider.png',
  displayName: 'Provider Name',
  email: 'user@example.com',
  id: 'user-1',
  source: 'supabase',
};

const createPrisma = () =>
  ({
    profile: {
      create: vi.fn().mockResolvedValue({
        avatarStoragePath: null,
        avatarUrl: user.avatarUrl,
        displayName: user.displayName,
        id: user.id,
      }),
      findUnique: vi.fn().mockResolvedValue({
        avatarStoragePath: null,
        avatarUrl: null,
        displayName: 'Saved Name',
        id: user.id,
      }),
      update: vi.fn(({ data }) => ({
        avatarStoragePath: data.avatarStoragePath ?? null,
        avatarUrl: data.avatarUrl ?? null,
        displayName: data.displayName ?? 'Saved Name',
        id: user.id,
      })),
    },
  }) as unknown as FlowboardPrismaClient;

describe('handleAuthenticatedProfileApiRequest', () => {
  test('rejects unauthenticated profile requests without sensitive detail', async () => {
    const response = createResponse();
    const handled = await handleAuthenticatedProfileApiRequest(
      createRequest({ method: 'GET' }),
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

  test('returns the current profile for authenticated users', async () => {
    const response = createResponse();
    const handled = await handleAuthenticatedProfileApiRequest(
      createRequest({ method: 'GET' }),
      response,
      createPrisma(),
      {
        resolveRequest: vi.fn().mockResolvedValue(user),
      } satisfies PrincipalResolver
    );

    expect(handled).toBe(true);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      profile: {
        avatarStoragePath: null,
        avatarUrl: 'https://example.com/provider.png',
        displayName: 'Saved Name',
        email: 'user@example.com',
        id: 'user-1',
      },
    });
  });

  test('updates profile display data for authenticated users', async () => {
    const prisma = createPrisma();
    const response = createResponse();
    const handled = await handleAuthenticatedProfileApiRequest(
      createRequest({
        body: JSON.stringify({
          avatarStoragePath: 'avatars/user-1/avatar.png',
          avatarUrl: 'https://example.com/avatar.png',
          displayName: ' Updated Name ',
        }),
        method: 'PUT',
      }),
      response,
      prisma,
      {
        resolveRequest: vi.fn().mockResolvedValue(user),
      } satisfies PrincipalResolver
    );

    expect(handled).toBe(true);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).profile.displayName).toBe('Updated Name');
    expect(prisma.profile.update).toHaveBeenCalledWith({
      data: {
        avatarStoragePath: 'avatars/user-1/avatar.png',
        avatarUrl: 'https://example.com/avatar.png',
        displayName: 'Updated Name',
      },
      where: {
        id: 'user-1',
      },
    });
  });

  test('rejects malformed profile update JSON', async () => {
    const response = createResponse();
    const handled = await handleAuthenticatedProfileApiRequest(
      createRequest({ body: '{not-json', method: 'PUT' }),
      response,
      createPrisma(),
      {
        resolveRequest: vi.fn().mockResolvedValue(user),
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
});
