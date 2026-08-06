import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { LocalizationProvider } from '../../LocalizationProvider';
import { getMessages } from '../../localization';
import { FlowboardToastProvider } from './index';
import {
  dismissToast,
  notify,
  notifyPersistenceFailure,
} from './toastNotifications';

const renderToasts = (language: 'en' | 'pt-BR' = 'en') =>
  render(
    <LocalizationProvider language={language}>
      <FlowboardToastProvider>
        <main>Flowboard</main>
      </FlowboardToastProvider>
    </LocalizationProvider>
  );

beforeEach(() => {
  vi.useRealTimers();
  vi.stubGlobal('BASE_UI_ANIMATIONS_DISABLED', true);
  act(() => dismissToast());
});

afterEach(() => {
  act(() => dismissToast());
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

test('renders a persistent error with a localized dismiss control', async () => {
  const user = userEvent.setup();
  renderToasts('pt-BR');

  act(() => {
    notify({
      description: 'Verifique sua conexão e tente novamente.',
      id: 'persistent-error',
      persistent: true,
      title: 'Alterações não salvas',
      variant: 'error',
    });
  });

  await waitFor(() =>
    expect(screen.getAllByText('Alterações não salvas')).not.toHaveLength(0)
  );

  fireEvent.keyDown(window, { key: 'F6' });

  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: 'Fechar notificação' })
    ).toBeInTheDocument()
  );

  await user.click(screen.getByRole('button', { name: 'Fechar notificação' }));

  expect(screen.queryAllByText('Alterações não salvas')).toHaveLength(0);
});

test('keeps the persistence failure notification visible', async () => {
  vi.useFakeTimers();
  renderToasts();

  await act(async () => {
    await Promise.resolve();
  });
  act(() => notifyPersistenceFailure(getMessages('en').app));
  await act(async () => {
    await Promise.resolve();
  });

  expect(screen.getAllByText('Changes not saved')).not.toHaveLength(0);
  expect(
    screen.getAllByText(/changes are not durably saved yet/i)
  ).not.toHaveLength(0);

  await act(async () => {
    await vi.advanceTimersByTimeAsync(10_000);
  });
  expect(screen.getAllByText('Changes not saved')).not.toHaveLength(0);
});

test('updates a repeated operation instead of stacking duplicate toasts', async () => {
  renderToasts();

  act(() => {
    notify({
      id: 'board-save',
      title: 'Saving changes',
      variant: 'info',
    });
    notify({
      id: 'board-save',
      title: 'Still saving changes',
      variant: 'info',
    });
  });

  await waitFor(() =>
    expect(
      screen.getByRole('heading', { name: 'Still saving changes' })
    ).toBeInTheDocument()
  );
  expect(
    screen.queryByRole('heading', { name: 'Saving changes' })
  ).not.toBeInTheDocument();
  expect(screen.getAllByRole('heading')).toHaveLength(1);
});

test('automatically dismisses ordinary notifications', async () => {
  vi.useFakeTimers();
  renderToasts();

  act(() => {
    notify({
      id: 'timed-notification',
      title: 'Saving changes',
      variant: 'info',
    });
  });

  await act(async () => {
    await Promise.resolve();
  });

  expect(
    screen.getByRole('heading', { name: 'Saving changes' })
  ).toBeInTheDocument();

  await act(async () => {
    await vi.advanceTimersByTimeAsync(5_000);
  });

  expect(screen.queryByText('Saving changes')).not.toBeInTheDocument();
});
