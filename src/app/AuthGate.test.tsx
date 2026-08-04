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
  const googleButton = screen.getByRole('button', {
    name: /continue with google/i,
  });

  expect(googleButton).toBeInTheDocument();
  expect(
    googleButton.querySelector('[data-provider-icon="google"]')
  ).toBeTruthy();
  expect(
    screen.queryByRole('button', { name: /continue with apple/i })
  ).not.toBeInTheDocument();
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

test('keeps the provider icon visible while social auth is opening', async () => {
  const user = userEvent.setup();
  let resolveRequest: (() => void) | undefined;
  const onSocialAuthRequest = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        resolveRequest = resolve;
      })
  );

  render(
    <AuthGate
      message={null}
      onMagicLinkRequest={vi.fn()}
      onSocialAuthRequest={onSocialAuthRequest}
      status="signedOut"
    />
  );

  const googleButton = screen.getByRole('button', {
    name: /continue with google/i,
  });
  await user.click(googleButton);

  expect(googleButton).toHaveTextContent('Opening...');
  expect(googleButton).toBeDisabled();
  expect(
    googleButton.querySelector('[data-provider-icon="google"]')
  ).toBeTruthy();

  resolveRequest?.();
  await waitFor(() =>
    expect(googleButton).toHaveTextContent('Continue with Google')
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

test('does not render Apple social auth until configured', () => {
  const onSocialAuthRequest = vi.fn().mockResolvedValue(undefined);

  render(
    <AuthGate
      message={null}
      onMagicLinkRequest={vi.fn()}
      onSocialAuthRequest={onSocialAuthRequest}
      status="signedOut"
    />
  );

  expect(onSocialAuthRequest).not.toHaveBeenCalled();
  expect(
    screen.queryByRole('button', { name: /continue with apple/i })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByText(/apple sign-in needs apple developer/i)
  ).not.toBeInTheDocument();
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
