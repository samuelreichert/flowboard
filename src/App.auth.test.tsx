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

import App from './App';

beforeEach(() => {
  window.history.replaceState(
    null,
    '',
    '/board/cards/card-1?focus=title#editor'
  );
});

test('redirects an unauthenticated protected route to the sign-in URL', async () => {
  render(<App />);

  await waitFor(() =>
    expect(window.location.pathname).toBe('/sign-in')
  );
  expect(window.location.search).toBe(
    '?next=%2Fboard%2Fcards%2Fcard-1%3Ffocus%3Dtitle%23editor'
  );
  expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
});
