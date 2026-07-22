import { render, screen, waitFor } from '@testing-library/react';
import type { Dispatch } from 'react';
import { beforeEach, expect, test, vi } from 'vitest';

import { LocalizationProvider } from '../LocalizationProvider';
import { getMessages } from '../localization';
import { FlowboardToastProvider } from '../components/ToastNotifications';
import type { BoardBootstrapResponse } from '../storage/authenticatedApi';
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
const signedInAuthState = {
  message: null,
  session: { access_token: 'access-token' },
  status: 'signedIn',
} as AuthState;
const bootstrap: BoardBootstrapResponse = {
  board: {
    background: { type: 'color', value: '#ffffff' },
    id: 'board-1',
    title: 'Board',
    version: 1,
  },
  cards: [],
  columns: [],
  tags: [],
  workCycle: {
    completedColumnId: null,
    startDate: '2026-07-21T00:00:00.000Z',
  },
};
const dispatch = vi.fn() as Dispatch<AppAction>;

const SyncHarness = ({
  authState = staticAuthState,
}: {
  authState?: AuthState;
}) => {
  const { authenticatedBoardLoading } = useAuthenticatedBoardSync(
    authState,
    dispatch,
    getMessages('en').app
  );

  return (
    <output data-testid="board-loading">
      {String(authenticatedBoardLoading)}
    </output>
  );
};

const renderHarness = (authState?: AuthState) =>
  render(
    <LocalizationProvider language="en">
      <FlowboardToastProvider>
        <SyncHarness authState={authState} />
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

test('unmasks a signed-in board as soon as bootstrap data is available', () => {
  useBoardBootstrapQueryMock.mockReturnValue({
    data: bootstrap,
    isError: false,
    isFetching: true,
    isPending: true,
  });

  renderHarness(signedInAuthState);

  expect(screen.getByTestId('board-loading')).toHaveTextContent('false');
});
