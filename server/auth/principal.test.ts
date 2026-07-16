import { describe, expect, test, vi } from 'vitest';
import type { IncomingMessage } from 'node:http';

import { createPrincipalResolver, LOCAL_DEV_PRINCIPAL } from './principal.js';
import type { AuthVerifier } from './supabaseAuth.js';

const createRequest = () =>
  ({
    headers: {},
  }) as IncomingMessage;

describe('createPrincipalResolver', () => {
  test('returns the Supabase principal when the bearer token is valid', async () => {
    const user = {
      avatarUrl: null,
      displayName: 'Provider Name',
      email: 'user@example.com',
      id: 'user-1',
    };
    const authVerifier = {
      verifyRequest: vi.fn().mockResolvedValue(user),
    } satisfies AuthVerifier;
    const resolver = createPrincipalResolver(
      { localDevAuthEnabled: true },
      authVerifier
    );

    await expect(resolver.resolveRequest(createRequest())).resolves.toEqual({
      ...user,
      source: 'supabase',
    });
  });

  test('returns the local development principal when enabled and auth is absent', async () => {
    const resolver = createPrincipalResolver({ localDevAuthEnabled: true }, {
      verifyRequest: vi.fn().mockResolvedValue(null),
    } satisfies AuthVerifier);

    await expect(resolver.resolveRequest(createRequest())).resolves.toEqual(
      LOCAL_DEV_PRINCIPAL
    );
  });

  test('rejects unauthenticated production requests when local development auth is disabled', async () => {
    const resolver = createPrincipalResolver({ localDevAuthEnabled: false }, {
      verifyRequest: vi.fn().mockResolvedValue(null),
    } satisfies AuthVerifier);

    await expect(resolver.resolveRequest(createRequest())).resolves.toBeNull();
  });

  test('treats invalid Supabase tokens as unauthenticated when local dev auth is disabled', async () => {
    const authVerifier = {
      verifyRequest: vi.fn().mockResolvedValue(null),
    } satisfies AuthVerifier;
    const resolver = createPrincipalResolver(
      { localDevAuthEnabled: false },
      authVerifier
    );

    await expect(resolver.resolveRequest(createRequest())).resolves.toBeNull();
    expect(authVerifier.verifyRequest).toHaveBeenCalledOnce();
  });
});
