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
  test('provisions a profile keyed by the Supabase user id', async () => {
    const upsert = vi.fn().mockResolvedValue(undefined);

    await ensureProfile(
      {
        profile: {
          upsert,
        },
      } as unknown as FlowboardPrismaClient,
      {
        email: 'user@example.com',
        id: 'user-1',
      }
    );

    expect(upsert).toHaveBeenCalledWith({
      create: {
        id: 'user-1',
      },
      update: {},
      where: {
        id: 'user-1',
      },
    });
  });
});
