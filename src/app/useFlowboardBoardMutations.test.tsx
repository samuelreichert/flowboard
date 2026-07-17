import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { createFlowboardQueryClient } from './queryClient';
import { queryKeys } from './queryKeys';
import { useFlowboardBoardMutations } from './useFlowboardBoardMutations';
import type {
  ActiveCardDetailResponse,
  BoardBootstrapResponse,
} from '../storage/authenticatedApi';
import {
  assignActiveCardTag,
  createActiveColumn,
  createBoardTag,
  deleteActiveColumn,
  deleteBoardTag,
  updateBoardSettings,
  updateWorkCycleSettings,
} from '../storage/authenticatedApi';

vi.mock('../storage/authenticatedApi', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../storage/authenticatedApi')>();

  return {
    ...actual,
    assignActiveCardTag: vi.fn(),
    createActiveColumn: vi.fn(),
    createBoardTag: vi.fn(),
    deleteActiveColumn: vi.fn(),
    deleteBoardTag: vi.fn(),
    updateBoardSettings: vi.fn(),
    updateWorkCycleSettings: vi.fn(),
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
      tagIds: ['tag-1'],
      title: 'First',
    },
  ],
  columns: [
    { id: 'todo', title: 'Todo' },
    { id: 'done', title: 'Done' },
  ],
  tags: [{ id: 'tag-1', name: 'Existing' }],
  workCycle: {
    completedColumnId: 'done',
    startDate: '2026-07-17T10:00:00.000Z',
  },
};

describe('useFlowboardBoardMutations', () => {
  beforeEach(() => {
    vi.mocked(assignActiveCardTag).mockReset();
    vi.mocked(createActiveColumn).mockReset();
    vi.mocked(createBoardTag).mockReset();
    vi.mocked(deleteActiveColumn).mockReset();
    vi.mocked(deleteBoardTag).mockReset();
    vi.mocked(updateBoardSettings).mockReset();
    vi.mocked(updateWorkCycleSettings).mockReset();
  });

  test('updates bootstrap cache for column, tag, card-tag, and settings mutations', async () => {
    const queryClient = createFlowboardQueryClient();
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const detail: ActiveCardDetailResponse = {
      content: '',
      createdAt: '2026-07-17T10:00:00.000Z',
      id: 'card-1',
      priority: 'medium',
      tagIds: ['tag-1'],
      title: 'First',
    };

    queryClient.setQueryData(queryKeys.board.bootstrap, bootstrap);
    queryClient.setQueryData(queryKeys.board.card('card-1'), detail);
    vi.mocked(createActiveColumn).mockResolvedValue({
      boardVersion: 2,
      column: { id: 'doing', title: 'Doing' },
      columns: [...bootstrap.columns, { id: 'doing', title: 'Doing' }],
    });
    vi.mocked(deleteActiveColumn).mockResolvedValue({
      boardVersion: 3,
      cardIds: [],
      columnId: 'doing',
      columns: bootstrap.columns,
      workCycle: bootstrap.workCycle,
    });
    vi.mocked(createBoardTag).mockResolvedValue({
      boardVersion: 4,
      tag: { id: 'tag-2', name: 'Focus' },
      tags: [...bootstrap.tags, { id: 'tag-2', name: 'Focus' }],
    });
    vi.mocked(deleteBoardTag).mockResolvedValue({
      affectedCardIds: ['card-1'],
      boardVersion: 5,
      tagId: 'tag-1',
      tags: [{ id: 'tag-2', name: 'Focus' }],
    });
    vi.mocked(assignActiveCardTag).mockResolvedValue({
      boardVersion: 6,
      card: {
        ...bootstrap.cards[0],
        tagIds: ['tag-2'],
      },
    });
    vi.mocked(updateBoardSettings).mockResolvedValue({
      board: {
        background: { type: 'image', value: '/next.png' },
        version: 7,
      },
    });
    vi.mocked(updateWorkCycleSettings).mockResolvedValue({
      boardVersion: 8,
      workCycle: { ...bootstrap.workCycle, completedColumnId: null },
    });

    const { result } = renderHook(
      () => useFlowboardBoardMutations({ accessToken: 'token-1' }),
      { wrapper }
    );

    act(() => result.current.createColumn({ id: 'doing', title: 'Doing' }));
    await waitFor(() =>
      expect(
        queryClient
          .getQueryData<BoardBootstrapResponse>(queryKeys.board.bootstrap)
          ?.columns.some((column) => column.id === 'doing')
      ).toBe(true)
    );

    act(() => result.current.deleteColumn({ columnId: 'doing' }));
    await waitFor(() =>
      expect(
        queryClient
          .getQueryData<BoardBootstrapResponse>(queryKeys.board.bootstrap)
          ?.columns.some((column) => column.id === 'doing')
      ).toBe(false)
    );

    act(() => result.current.createTag({ id: 'tag-2', name: 'Focus' }));
    await waitFor(() =>
      expect(
        queryClient
          .getQueryData<BoardBootstrapResponse>(queryKeys.board.bootstrap)
          ?.tags.some((tag) => tag.id === 'tag-2')
      ).toBe(true)
    );

    act(() => result.current.deleteTag({ tagId: 'tag-1' }));
    await waitFor(() =>
      expect(
        queryClient
          .getQueryData<BoardBootstrapResponse>(queryKeys.board.bootstrap)
          ?.cards[0].tagIds
      ).not.toContain('tag-1')
    );

    act(() =>
      result.current.assignCardTag({ cardId: 'card-1', tagId: 'tag-2' })
    );
    await waitFor(() =>
      expect(
        queryClient.getQueryData<ActiveCardDetailResponse>(
          queryKeys.board.card('card-1')
        )?.tagIds
      ).toEqual(['tag-2'])
    );

    act(() =>
      result.current.updateBoardSettings({
        background: { type: 'image', value: '/next.png' },
      })
    );
    await waitFor(() =>
      expect(
        queryClient.getQueryData<BoardBootstrapResponse>(
          queryKeys.board.bootstrap
        )?.board.background
      ).toEqual({ type: 'image', value: '/next.png' })
    );

    act(() =>
      result.current.updateWorkCycleSettings({ completedColumnId: null })
    );
    await waitFor(() =>
      expect(
        queryClient.getQueryData<BoardBootstrapResponse>(
          queryKeys.board.bootstrap
        )?.workCycle.completedColumnId
      ).toBeNull()
    );
  });

  test('rolls back optimistic bootstrap cache when a mutation fails', async () => {
    const queryClient = createFlowboardQueryClient();
    const onMutationError = vi.fn();
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    queryClient.setQueryData(queryKeys.board.bootstrap, bootstrap);
    vi.mocked(createActiveColumn).mockRejectedValue(new Error('Nope'));

    const { result } = renderHook(
      () =>
        useFlowboardBoardMutations({
          accessToken: 'token-1',
          onMutationError,
        }),
      { wrapper }
    );

    act(() => result.current.createColumn({ id: 'doing', title: 'Doing' }));
    await waitFor(() => expect(onMutationError).toHaveBeenCalled());
    expect(
      queryClient.getQueryData<BoardBootstrapResponse>(
        queryKeys.board.bootstrap
      )
    ).toEqual(bootstrap);
  });
});
