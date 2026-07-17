import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, vi } from 'vitest';

import AuthGate from './AuthGate';
import { shouldRenderAuthGate } from './routeGuards';
import { parseAppRoute } from './routes';
import { resetAppTestEnvironment } from '../test/appTestUtils';

vi.mock('@base-ui/react/button', () => ({
  Button: 'button',
}));

vi.mock('../LocalizationProvider', async () => {
  const localization =
    await vi.importActual<typeof import('../localization')>('../localization');

  return {
    useLocalization: () => ({
      formatDate: (value: string, options?: Intl.DateTimeFormatOptions) =>
        localization.formatDate('en', value, options),
      language: 'en',
      messages: localization.getMessages('en'),
    }),
  };
});

beforeEach(resetAppTestEnvironment);

test('renders unified auth entry with social options and email fallback', () => {
  render(
    <AuthGate
      message={null}
      onMagicLinkRequest={vi.fn()}
      onSocialAuthRequest={vi.fn()}
      status="signedOut"
    />
  );

  expect(
    screen.getByText(/if you are new, flowboard will create one for you/i)
  ).toBeInTheDocument();
  expect(
    document.querySelector<HTMLImageElement>('.auth-panel__brand-icon')?.src
  ).toMatch(/\/icon-light\.svg$/);
  expect(
    screen.getByRole('button', { name: /continue with google/i })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /continue with apple/i })
  ).toBeDisabled();
  expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /send magic link/i })
  ).toBeInTheDocument();
});

test('starts Google social auth from the unified auth entry', async () => {
  const user = userEvent.setup();
  const onSocialAuthRequest = vi.fn().mockResolvedValue(undefined);

  render(
    <AuthGate
      message={null}
      nextDestination="/history"
      onMagicLinkRequest={vi.fn()}
      onSocialAuthRequest={onSocialAuthRequest}
      status="signedOut"
    />
  );

  await user.click(
    screen.getByRole('button', { name: /continue with google/i })
  );

  expect(onSocialAuthRequest).toHaveBeenCalledWith(
    expect.objectContaining({
      enabled: true,
      id: 'google',
      label: 'Google',
    }),
    '/history'
  );
});

test('requests magic link with the preserved auth destination', async () => {
  const user = userEvent.setup();
  const onMagicLinkRequest = vi.fn().mockResolvedValue(undefined);

  render(
    <AuthGate
      message={null}
      nextDestination="/board/cards/card-1"
      onMagicLinkRequest={onMagicLinkRequest}
      onSocialAuthRequest={vi.fn()}
      status="signedOut"
    />
  );

  await user.type(screen.getByLabelText(/^email$/i), 'user@example.com');
  await user.click(screen.getByRole('button', { name: /send magic link/i }));

  expect(onMagicLinkRequest).toHaveBeenCalledWith(
    'user@example.com',
    '/board/cards/card-1'
  );
});

test('keeps Apple social auth gated until configured', async () => {
  const user = userEvent.setup();
  const onSocialAuthRequest = vi.fn().mockResolvedValue(undefined);

  render(
    <AuthGate
      message={null}
      onMagicLinkRequest={vi.fn()}
      onSocialAuthRequest={onSocialAuthRequest}
      status="signedOut"
    />
  );

  await user.click(
    screen.getByRole('button', { name: /continue with apple/i })
  );

  expect(onSocialAuthRequest).not.toHaveBeenCalled();
  expect(
    screen.getByText(/apple sign-in needs apple developer/i)
  ).toBeInTheDocument();
});

test('shows non-sensitive social auth failure messaging', () => {
  render(
    <AuthGate
      message="Unable to start Google sign-in right now."
      onMagicLinkRequest={vi.fn()}
      onSocialAuthRequest={vi.fn()}
      status="signedOut"
    />
  );

  expect(
    screen.getByText('Unable to start Google sign-in right now.')
  ).toBeInTheDocument();
  expect(
    screen.queryByText(/token|secret|client_secret/i)
  ).not.toBeInTheDocument();
});

test('requires the auth gate for every inside-app route when signed out', () => {
  const signedOutRoutes = [
    '/board',
    '/history',
    '/settings',
    '/tags',
    '/board/cards/card-1',
    '/history/cycles/cycle-1/cards/card-1',
    '/unknown-route',
  ];

  for (const path of signedOutRoutes) {
    expect(
      shouldRenderAuthGate({
        authConfigured: true,
        route: parseAppRoute(path),
        status: 'signedOut',
      })
    ).toBe(true);
  }

  expect(
    shouldRenderAuthGate({
      authConfigured: true,
      route: parseAppRoute('/board'),
      status: 'signedIn',
    })
  ).toBe(false);
  expect(
    shouldRenderAuthGate({
      authConfigured: false,
      route: parseAppRoute('/board'),
      status: 'static',
    })
  ).toBe(false);
});
