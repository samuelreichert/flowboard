import { beforeEach, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const signInWithOAuth = vi.fn();
  const createClient = vi.fn(() => ({
    auth: {
      signInWithOAuth,
    },
  }));

  return {
    createClient,
    signInWithOAuth,
  };
});

vi.mock('@supabase/supabase-js', () => ({
  createClient: mocks.createClient,
}));

const resetAuthEnv = () => {
  Object.assign(import.meta.env, {
    VITE_SUPABASE_APPLE_OAUTH_ENABLED: '',
    VITE_SUPABASE_GOOGLE_OAUTH_ENABLED: '',
    VITE_SUPABASE_PUBLISHABLE_KEY: 'publishable-key',
    VITE_SUPABASE_URL: 'https://flowboard.supabase.co',
  });
};

const loadSupabaseAuth = async () => {
  vi.resetModules();
  mocks.createClient.mockClear();
  mocks.signInWithOAuth.mockReset();

  return import('./supabase');
};

beforeEach(() => {
  resetAuthEnv();
});

test('defines Google and Apple social auth providers with configuration status', async () => {
  const { socialAuthProviders } = await loadSupabaseAuth();

  expect(socialAuthProviders).toEqual([
    expect.objectContaining({
      enabled: true,
      id: 'google',
      label: 'Google',
    }),
    expect.objectContaining({
      enabled: false,
      id: 'apple',
      label: 'Apple',
    }),
  ]);
});

test('starts Google OAuth through Supabase with the current app origin', async () => {
  const { signInWithSocialProvider, socialAuthProviders } =
    await loadSupabaseAuth();
  const googleProvider = socialAuthProviders.find(
    (provider) => provider.id === 'google'
  );

  expect(googleProvider).toBeDefined();
  await signInWithSocialProvider(googleProvider!);

  expect(mocks.signInWithOAuth).toHaveBeenCalledWith({
    options: {
      redirectTo: window.location.origin,
    },
    provider: 'google',
  });
});

test('does not start Apple OAuth until Apple is configured', async () => {
  const { signInWithSocialProvider, socialAuthProviders } =
    await loadSupabaseAuth();
  const appleProvider = socialAuthProviders.find(
    (provider) => provider.id === 'apple'
  );

  expect(appleProvider).toBeDefined();
  const result = await signInWithSocialProvider(appleProvider!);

  expect(result.error).toBeInstanceOf(Error);
  expect(mocks.signInWithOAuth).not.toHaveBeenCalled();
});

test('starts Apple OAuth when Apple is configured', async () => {
  import.meta.env.VITE_SUPABASE_APPLE_OAUTH_ENABLED = 'true';

  const { signInWithSocialProvider, socialAuthProviders } =
    await loadSupabaseAuth();
  const appleProvider = socialAuthProviders.find(
    (provider) => provider.id === 'apple'
  );

  expect(appleProvider).toBeDefined();
  await signInWithSocialProvider(appleProvider!);

  expect(mocks.signInWithOAuth).toHaveBeenCalledWith({
    options: {
      redirectTo: window.location.origin,
    },
    provider: 'apple',
  });
});
