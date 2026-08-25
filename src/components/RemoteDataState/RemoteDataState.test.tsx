import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';

import { InlineRemoteDataState, RemoteDataPanel } from './index';

test('renders an accessible panel loading state', () => {
  render(
    <RemoteDataPanel
      description="Fetching completed work."
      title="Loading history"
      variant="loading"
    />
  );

  expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  expect(screen.getByText('Loading history')).toBeInTheDocument();
});

test('renders a retryable panel error state', async () => {
  const user = userEvent.setup();
  const onRetry = vi.fn();

  render(
    <RemoteDataPanel
      description="History is unavailable."
      onRetry={onRetry}
      retryLabel="Retry"
      title="Unable to load history"
      variant="error"
    />
  );

  expect(screen.getByRole('alert')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Retry' }));
  expect(onRetry).toHaveBeenCalledTimes(1);
});

test('activates Retry from the keyboard', async () => {
  const user = userEvent.setup();
  const onRetry = vi.fn();

  render(
    <RemoteDataPanel
      description="History is unavailable."
      onRetry={onRetry}
      retryLabel="Retry"
      title="Unable to load history"
      variant="error"
    />
  );

  await user.tab();
  expect(screen.getByRole('button', { name: 'Retry' })).toHaveFocus();
  await user.keyboard('{Enter}');
  expect(onRetry).toHaveBeenCalledTimes(1);
});

test('renders inline request state without replacing adjacent content', async () => {
  const user = userEvent.setup();
  const onRetry = vi.fn();

  render(
    <>
      <p>Resolved history</p>
      <InlineRemoteDataState
        onRetry={onRetry}
        retryLabel="Retry"
        variant="error"
      >
        Unable to load more history.
      </InlineRemoteDataState>
    </>
  );

  expect(screen.getByText('Resolved history')).toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Unable to load more history.'
  );
  await user.click(screen.getByRole('button', { name: 'Retry' }));
  expect(onRetry).toHaveBeenCalledTimes(1);
});
