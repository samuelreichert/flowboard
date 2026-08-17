import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';

import { getMessages } from '../localization';

const mocks = vi.hoisted(() => {
  const getSession = vi.fn();
  const authStateChange = {
    callback: null as null | ((event: string, session: unknown) => void),
  };
  const onAuthStateChange = vi.fn(
    (callback: (event: string, session: unknown) => void) => {
      authStateChange.callback = callback;

      return {
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      };
    }
  );

  return {
    authStateChange,
    getSession,
    onAuthStateChange,
    signInWithOtp: vi.fn(),
    signOut: vi.fn(),
  };
});

vi.mock('../auth/supabase', () => ({
  getOAuthRedirectTo: vi.fn(),
  isSupabaseConfigured: true,
  signInWithSocialProvider: vi.fn(),
  supabase: {
    auth: {
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
      signInWithOtp: mocks.signInWithOtp,
      signOut: mocks.signOut,
    },
  },
}));

vi.mock('./queryClient', () => ({
  clearFlowboardQueryCache: vi.fn(),
}));

import useAuthSession from './useAuthSession';

const messages = getMessages('en').app.auth;

beforeEach(() => {
  mocks.getSession.mockReset();
  mocks.onAuthStateChange.mockClear();
  mocks.authStateChange.callback = null;
  window.history.replaceState(
    null,
    '',
    '/auth/callback?code=synthetic-pkce-code&next=%2Fhistory'
  );
});

test('recognizes the session produced by callback authorization-code exchange', async () => {
  const session = {
    access_token: 'synthetic-access-token',
    user: { id: 'user-1' },
  };
  mocks.getSession.mockImplementation(async () => {
    window.history.replaceState(null, '', '/auth/callback?next=%2Fhistory');

    return {
      data: { session },
      error: null,
    };
  });

  const { result } = renderHook(() => useAuthSession(messages));

  await waitFor(() => expect(result.current.authState.status).toBe('signedIn'));

  expect(mocks.getSession).toHaveBeenCalledOnce();
  expect(result.current.authState).toEqual({
    message: null,
    session,
    status: 'signedIn',
  });
});

test('shows a non-sensitive message for provider callback failures', async () => {
  window.history.replaceState(
    null,
    '',
    '/auth/callback?error=access_denied&error_description=synthetic-provider-secret'
  );
  mocks.getSession.mockResolvedValue({
    data: { session: null },
    error: null,
  });

  const { result } = renderHook(() => useAuthSession(messages));

  await waitFor(() =>
    expect(result.current.authState.status).toBe('signedOut')
  );

  expect(result.current.authState).toEqual({
    message: 'Unable to complete sign-in right now.',
    session: null,
    status: 'signedOut',
  });
  expect(result.current.authState.message).not.toMatch(
    /access_denied|error_description|secret/i
  );
});

test('shows provider callback failures even when an older session remains valid', async () => {
  const session = {
    access_token: 'existing-access-token',
    user: { id: 'user-1' },
  };
  window.history.replaceState(
    null,
    '',
    '/auth/callback?error=access_denied&error_description=synthetic-provider-secret'
  );
  mocks.getSession.mockResolvedValue({
    data: { session },
    error: null,
  });

  const { result } = renderHook(() => useAuthSession(messages));

  await waitFor(() =>
    expect(result.current.authState.message).toBe(
      'Unable to complete sign-in right now.'
    )
  );

  expect(result.current.authState).toEqual({
    message: 'Unable to complete sign-in right now.',
    session,
    status: 'signedIn',
  });
});

test('shows a callback failure when a PKCE code remains unconsumed', async () => {
  mocks.getSession.mockResolvedValue({
    data: { session: null },
    error: null,
  });

  const { result } = renderHook(() => useAuthSession(messages));

  await waitFor(() =>
    expect(result.current.authState.status).toBe('signedOut')
  );

  expect(result.current.authState).toEqual({
    message: 'Unable to complete sign-in right now.',
    session: null,
    status: 'signedOut',
  });
});

test('keeps an older session while reporting an unconsumed PKCE code', async () => {
  const session = {
    access_token: 'existing-access-token',
    user: { id: 'user-1' },
  };
  mocks.getSession.mockResolvedValue({
    data: { session },
    error: null,
  });

  const { result } = renderHook(() => useAuthSession(messages));

  await waitFor(() =>
    expect(result.current.authState.message).toBe(
      'Unable to complete sign-in right now.'
    )
  );

  expect(result.current.authState).toEqual({
    message: 'Unable to complete sign-in right now.',
    session,
    status: 'signedIn',
  });
});

test('does not let auth events hide a provider callback failure', async () => {
  const session = {
    access_token: 'existing-access-token',
    user: { id: 'user-1' },
  };
  window.history.replaceState(
    null,
    '',
    '/auth/callback?error=access_denied&error_description=synthetic-provider-secret'
  );
  mocks.getSession.mockResolvedValue({
    data: { session },
    error: null,
  });

  const { result } = renderHook(() => useAuthSession(messages));

  await waitFor(() => expect(mocks.authStateChange.callback).not.toBeNull());
  act(() => mocks.authStateChange.callback?.('SIGNED_IN', session));

  expect(result.current.authState).toEqual({
    message: 'Unable to complete sign-in right now.',
    session,
    status: 'signedIn',
  });
});

test('does not expose callback exchange errors returned by Supabase', async () => {
  mocks.getSession.mockResolvedValue({
    data: { session: null },
    error: new Error(
      'synthetic raw error containing code=secret&provider_token=secret'
    ),
  });

  const { result } = renderHook(() => useAuthSession(messages));

  await waitFor(() =>
    expect(result.current.authState.status).toBe('signedOut')
  );

  expect(result.current.authState.message).toBe(
    'Unable to complete sign-in right now.'
  );
  expect(result.current.authState.message).not.toMatch(
    /code=|provider_token|secret/i
  );
});
