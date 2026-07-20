import { render, screen, waitFor } from '@testing-library/react';
import type { Dispatch } from 'react';
import { beforeEach, expect, test, vi } from 'vitest';

import { LocalizationProvider } from '../LocalizationProvider';
import { getMessages } from '../localization';
import { FlowboardToastProvider } from '../components/ToastNotifications';
import type { AppAction } from './appTypes';
import useAuthenticatedBoardSync from './useAuthenticatedBoardSync';
import type { AuthState } from './useAuthSession';

const { useBoardBootstrapQueryMock } = vi.hoisted(() => ({
  useBoardBootstrapQueryMock: vi.fn(),
}));

vi.mock('./useFlowboardQueries', () => ({
  useBoardBootstrapQuery: useBoardBootstrapQueryMock,
}));

const staticAuthState: AuthState = {
  message: null,
  session: null,
  status: 'static',
};
const dispatch = vi.fn() as Dispatch<AppAction>;

const SyncHarness = () => {
  useAuthenticatedBoardSync(
    staticAuthState,
    dispatch,
    getMessages('en').app
  );

  return null;
};

const renderHarness = () =>
  render(
    <LocalizationProvider language="en">
      <FlowboardToastProvider>
        <SyncHarness />
      </FlowboardToastProvider>
    </LocalizationProvider>
  );

beforeEach(() => {
  useBoardBootstrapQueryMock.mockReset();
  useBoardBootstrapQueryMock.mockReturnValue({
    data: undefined,
    isError: false,
    isFetching: false,
    isPending: false,
  });
});

test('reports an unavailable bootstrap board through the shared error toast', async () => {
  useBoardBootstrapQueryMock.mockReturnValue({
    data: undefined,
    isError: true,
    isFetching: false,
    isPending: false,
  });

  renderHarness();

  await waitFor(() =>
    expect(screen.getAllByText('Board unavailable')).not.toHaveLength(0)
  );
  expect(
    screen.getAllByText(
      'Your cloud board is unavailable. Check your connection and try again.'
    )
  ).not.toHaveLength(0);
});
