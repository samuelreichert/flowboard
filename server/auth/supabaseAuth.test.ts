import { describe, expect, test, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

import { ensureProfile } from './profileService.js';
import { createSupabaseAuthVerifier } from './supabaseAuth.js';
import type { FlowboardPrismaClient } from '../db/prismaClient.js';

const createRequest = (authorization?: string) =>
  ({
    headers: authorization ? { authorization } : {},
  }) as never;

describe('createSupabaseAuthVerifier', () => {
  test('returns authenticated user for a valid bearer token', async () => {
    const getUser = vi.fn().mockResolvedValue({
      data: {
        user: {
          email: 'user@example.com',
          id: 'user-1',
          user_metadata: {
            avatar_url: 'https://example.com/avatar.png',
            full_name: 'Example User',
          },
        },
      },
      error: null,
    });
    const verifier = createSupabaseAuthVerifier(
      {
        supabasePublishableKey: 'public-key',
        supabaseUrl: 'https://project.supabase.co',
      },
      {
        auth: { getUser },
      } as unknown as SupabaseClient
    );

    await expect(
      verifier.verifyRequest(createRequest('Bearer valid-token'))
    ).resolves.toEqual({
      avatarUrl: 'https://example.com/avatar.png',
      displayName: 'Example User',
      email: 'user@example.com',
      id: 'user-1',
    });
    expect(getUser).toHaveBeenCalledWith('valid-token');
  });

  test('returns null when auth is missing', async () => {
    const getUser = vi.fn();
    const verifier = createSupabaseAuthVerifier(
      {
        supabasePublishableKey: 'public-key',
        supabaseUrl: 'https://project.supabase.co',
      },
      {
        auth: { getUser },
      } as unknown as SupabaseClient
    );

    await expect(verifier.verifyRequest(createRequest())).resolves.toBeNull();
    expect(getUser).not.toHaveBeenCalled();
  });

  test('returns null when Supabase rejects the token', async () => {
    const getUser = vi.fn().mockResolvedValue({
      data: { user: null },
      error: new Error('invalid token'),
    });
    const verifier = createSupabaseAuthVerifier(
      {
        supabasePublishableKey: 'public-key',
        supabaseUrl: 'https://project.supabase.co',
      },
      {
        auth: { getUser },
      } as unknown as SupabaseClient
    );

    await expect(
      verifier.verifyRequest(createRequest('Bearer invalid-token'))
    ).resolves.toBeNull();
  });

  test('returns null when Supabase is not configured', async () => {
    const verifier = createSupabaseAuthVerifier({
      supabasePublishableKey: null,
      supabaseUrl: null,
    });

    await expect(
      verifier.verifyRequest(createRequest('Bearer valid-token'))
    ).resolves.toBeNull();
  });
});

describe('ensureProfile', () => {
  test('provisions a profile keyed by the Supabase user id and seeds metadata', async () => {
    const create = vi.fn().mockResolvedValue({
      avatarStoragePath: null,
      avatarUrl: 'https://example.com/avatar.png',
      displayName: 'Example User',
      id: 'user-1',
    });
    const findUnique = vi.fn().mockResolvedValue(null);

    await ensureProfile(
      {
        profile: {
          create,
          findUnique,
        },
      } as unknown as FlowboardPrismaClient,
      {
        avatarUrl: 'https://example.com/avatar.png',
        displayName: 'Example User',
        email: 'user@example.com',
        id: 'user-1',
      }
    );

    expect(create).toHaveBeenCalledWith({
      data: {
        avatarUrl: 'https://example.com/avatar.png',
        displayName: 'Example User',
        id: 'user-1',
      },
    });
  });

  test('seeds only missing profile fields without overwriting saved values', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      avatarStoragePath: null,
      avatarUrl: null,
      displayName: 'Saved Name',
      id: 'user-1',
    });
    const update = vi.fn().mockResolvedValue({
      avatarStoragePath: null,
      avatarUrl: 'https://example.com/avatar.png',
      displayName: 'Saved Name',
      id: 'user-1',
    });

    await ensureProfile(
      {
        profile: {
          findUnique,
          update,
        },
      } as unknown as FlowboardPrismaClient,
      {
        avatarUrl: 'https://example.com/avatar.png',
        displayName: 'Provider Name',
        email: 'user@example.com',
        id: 'user-1',
      }
    );

    expect(update).toHaveBeenCalledWith({
      data: {
        avatarUrl: 'https://example.com/avatar.png',
      },
      where: {
        id: 'user-1',
      },
    });
  });
});
