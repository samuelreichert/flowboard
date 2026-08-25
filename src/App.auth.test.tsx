import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  controller: {
    authState: { message: null, session: null, status: 'signedOut' as const },
    requestMagicLink: vi.fn(),
    requestSocialAuth: vi.fn(),
    resolvedLanguage: 'en',
    resolvedTheme: 'light',
  },
}));

vi.mock('./app/useAppController', () => ({
  default: () => mocks.controller,
}));

vi.mock('./auth/supabase', () => ({
  isSupabaseConfigured: true,
  socialAuthProviders: [],
}));

vi.mock('./app/AppDialogs', () => ({ default: () => null }));
vi.mock('./app/AppSidebar', () => ({ default: () => null }));
vi.mock('./app/AppWorkspace', () => ({ default: () => null }));

import App from './App';

beforeEach(() => {
  mocks.controller.authState = {
    message: null,
    session: null,
    status: 'signedOut',
  };
  window.history.replaceState(
    null,
    '',
    '/board/cards/card-1?focus=title#editor'
  );
});

test('navigates from a successful code callback to its safe internal destination', async () => {
  mocks.controller.authState = {
    message: null,
    session: {
      access_token: 'synthetic-access-token',
      user: { id: 'user-1' },
    },
    status: 'signedIn',
  } as never;
  window.history.replaceState(
    null,
    '',
    '/auth/callback?code=synthetic-pkce-code&next=%2Fboard%2Fcards%2Fcard-1%3Ffocus%3Dtitle%23editor'
  );

  render(<App />);

  await waitFor(() =>
    expect(
      `${window.location.pathname}${window.location.search}${window.location.hash}`
    ).toBe('/board/cards/card-1?focus=title#editor')
  );
});

test('shows a callback failure instead of redirecting an older signed-in session', () => {
  mocks.controller.authState = {
    message: 'Unable to complete sign-in right now.',
    session: {
      access_token: 'existing-access-token',
      user: { id: 'user-1' },
    },
    status: 'signedIn',
  } as never;
  window.history.replaceState(
    null,
    '',
    '/auth/callback?error=access_denied&next=%2Fhistory'
  );

  render(<App />);

  expect(window.location.pathname).toBe('/auth/callback');
  expect(
    screen.getByText('Unable to complete sign-in right now.')
  ).toBeInTheDocument();
});

test('redirects an unauthenticated protected route to the sign-in URL', async () => {
  render(<App />);

  await waitFor(() => expect(window.location.pathname).toBe('/sign-in'));
  expect(window.location.search).toBe(
    '?next=%2Fboard%2Fcards%2Fcard-1%3Ffocus%3Dtitle%23editor'
  );
  expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
});
