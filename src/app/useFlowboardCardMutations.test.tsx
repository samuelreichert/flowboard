import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { createFlowboardQueryClient } from './queryClient';
import { queryKeys } from './queryKeys';
import { useFlowboardCardMutations } from './useFlowboardCardMutations';
import type { BoardBootstrapResponse } from '../storage/authenticatedApi';
import {
  createActiveCard,
  deleteActiveCard,
  moveActiveCard,
  updateActiveCard,
} from '../storage/authenticatedApi';

vi.mock('../storage/authenticatedApi', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../storage/authenticatedApi')>();

  return {
    ...actual,
    createActiveCard: vi.fn(),
    deleteActiveCard: vi.fn(),
    moveActiveCard: vi.fn(),
    updateActiveCard: vi.fn(),
  };
});

const bootstrap: BoardBootstrapResponse = {
  board: {
    background: { type: 'color', value: '#ffffff' },
    id: 'board-1',
    title: 'Flowboard',
    version: 1,
  },
  cards: [
    {
      columnId: 'todo',
      id: 'card-1',
      priority: 'medium',
      tagIds: [],
      title: 'First',
    },
    {
      columnId: 'todo',
      id: 'card-2',
      priority: 'medium',
      tagIds: [],
      title: 'Second',
    },
  ],
  columns: [
    { id: 'todo', title: 'Todo' },
    { id: 'done', title: 'Done' },
  ],
  tags: [],
  workCycle: {
    completedColumnId: null,
    startDate: '2026-07-17T10:00:00.000Z',
  },
};

describe('useFlowboardCardMutations', () => {
  beforeEach(() => {
    vi.mocked(createActiveCard).mockReset();
    vi.mocked(updateActiveCard).mockReset();
    vi.mocked(moveActiveCard).mockReset();
    vi.mocked(deleteActiveCard).mockReset();
  });

  test('optimistically creates, updates, moves, and deletes card cache entries', async () => {
    const queryClient = createFlowboardQueryClient();
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    queryClient.setQueryData(queryKeys.board.bootstrap, bootstrap);
    vi.mocked(createActiveCard).mockResolvedValue({
      boardVersion: 2,
      card: {
        columnId: 'todo',
        content: 'Created content',
        createdAt: '2026-07-17T11:00:00.000Z',
        id: 'card-3',
        priority: 'high',
        tagIds: [],
        title: 'Created',
      },
    });
    vi.mocked(updateActiveCard).mockResolvedValue({
      boardVersion: 3,
      card: {
        columnId: 'todo',
        content: 'Created content',
        createdAt: '2026-07-17T11:00:00.000Z',
        id: 'card-3',
        priority: 'low',
        tagIds: [],
        title: 'Updated',
      },
    });
    vi.mocked(moveActiveCard).mockResolvedValue({
      boardVersion: 4,
      card: {
        columnId: 'done',
        content: 'Created content',
        createdAt: '2026-07-17T11:00:00.000Z',
        id: 'card-3',
        priority: 'low',
        tagIds: [],
        title: 'Updated',
      },
    });
    vi.mocked(deleteActiveCard).mockResolvedValue({
      boardVersion: 5,
      cardId: 'card-3',
      columnId: 'done',
    });

    const { result } = renderHook(
      () => useFlowboardCardMutations({ accessToken: 'token-1' }),
      { wrapper }
    );

    act(() =>
      result.current.createCard({
        columnId: 'todo',
        content: 'Created content',
        createdAt: '2026-07-17T11:00:00.000Z',
        id: 'card-3',
        priority: 'high',
        tagIds: [],
        title: 'Created',
      })
    );
    await waitFor(() =>
      expect(
        queryClient
          .getQueryData<BoardBootstrapResponse>(queryKeys.board.bootstrap)
          ?.cards.find((card) => card.id === 'card-3')?.title
      ).toBe('Created')
    );

    act(() =>
      result.current.updateCard({
        card: { priority: 'low', title: 'Updated' },
        cardId: 'card-3',
      })
    );
    await waitFor(() =>
      expect(
        queryClient
          .getQueryData<BoardBootstrapResponse>(queryKeys.board.bootstrap)
          ?.cards.find((card) => card.id === 'card-3')?.priority
      ).toBe('low')
    );

    act(() =>
      result.current.moveCard({
        cardId: 'card-3',
        placement: {
          afterCardId: null,
          beforeCardId: null,
          columnId: 'done',
        },
      })
    );
    await waitFor(() =>
      expect(
        queryClient
          .getQueryData<BoardBootstrapResponse>(queryKeys.board.bootstrap)
          ?.cards.find((card) => card.id === 'card-3')?.columnId
      ).toBe('done')
    );

    act(() => result.current.deleteCard({ cardId: 'card-3' }));
    await waitFor(() =>
      expect(
        queryClient
          .getQueryData<BoardBootstrapResponse>(queryKeys.board.bootstrap)
          ?.cards.some((card) => card.id === 'card-3')
      ).toBe(false)
    );
  });

  test('rolls back optimistic cache changes when a mutation fails', async () => {
    const queryClient = createFlowboardQueryClient();
    const onMutationError = vi.fn();
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    queryClient.setQueryData(queryKeys.board.bootstrap, bootstrap);
    vi.mocked(updateActiveCard).mockRejectedValue(new Error('Nope'));

    const { result } = renderHook(
      () =>
        useFlowboardCardMutations({
          accessToken: 'token-1',
          onMutationError,
        }),
      { wrapper }
    );

    act(() =>
      result.current.updateCard({
        card: { title: 'Optimistic' },
        cardId: 'card-1',
      })
    );
    await waitFor(() => expect(onMutationError).toHaveBeenCalled());
    expect(
      queryClient.getQueryData<BoardBootstrapResponse>(
        queryKeys.board.bootstrap
      )
    ).toEqual(bootstrap);
  });
});
