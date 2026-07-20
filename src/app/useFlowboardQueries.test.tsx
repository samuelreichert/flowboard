import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  fetchArchivedCardDetail,
  fetchCompletedHistory,
} from '../storage/authenticatedApi';
import type { CompletedHistoryResponse } from '../storage/authenticatedApi';
import { createFlowboardQueryClient } from './queryClient';
import {
  useArchivedCardDetailQuery,
  useCompletedHistoryQuery,
} from './useFlowboardQueries';

vi.mock('../storage/authenticatedApi', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../storage/authenticatedApi')>();

  return {
    ...actual,
    fetchArchivedCardDetail: vi.fn(),
    fetchCompletedHistory: vi.fn(),
  };
});

const createHistoryPage = (
  cycleId: string,
  nextCursor: string | null = null
): CompletedHistoryResponse => ({
  cycles: [
    {
      cards: [
        {
          archivedAt: '2026-07-18T10:00:00.000Z',
          createdAt: '2026-07-17T10:00:00.000Z',
          hasContent: true,
          id: `${cycleId}-card`,
          priority: 'medium',
          tagIds: [],
          tagSnapshots: [],
          title: `${cycleId} card`,
        },
      ],
      completedColumnId: 'done',
      completedColumnTitle: 'Done',
      endDate: '2026-07-18T10:00:00.000Z',
      id: cycleId,
      startDate: '2026-07-17T10:00:00.000Z',
    },
  ],
  pageInfo: {
    hasMore: Boolean(nextCursor),
    nextCursor,
  },
});

describe('useFlowboardQueries', () => {
  beforeEach(() => {
    vi.mocked(fetchArchivedCardDetail).mockReset();
    vi.mocked(fetchCompletedHistory).mockReset();
  });

  test('loads completed history pages with returned cursors', async () => {
    const queryClient = createFlowboardQueryClient();
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    vi.mocked(fetchCompletedHistory)
      .mockResolvedValueOnce(createHistoryPage('cycle-1', 'cursor-2'))
      .mockResolvedValueOnce(createHistoryPage('cycle-2'));

    const { result } = renderHook(
      () =>
        useCompletedHistoryQuery({
          accessToken: 'token-1',
          enabled: true,
          limit: 1,
        }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.data?.pages).toHaveLength(1));
    await act(async () => {
      await result.current.fetchNextPage();
    });
    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));

    expect(fetchCompletedHistory).toHaveBeenNthCalledWith(1, {
      accessToken: 'token-1',
      cursor: null,
      limit: 1,
    });
    expect(fetchCompletedHistory).toHaveBeenNthCalledWith(2, {
      accessToken: 'token-1',
      cursor: 'cursor-2',
      limit: 1,
    });
    expect(result.current.data?.pages.map((page) => page.cycles[0].id)).toEqual(
      ['cycle-1', 'cycle-2']
    );
  });

  test('loads archived-card detail by cycle and card identifiers', async () => {
    const queryClient = createFlowboardQueryClient();
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    vi.mocked(fetchArchivedCardDetail).mockResolvedValue({
      archivedAt: '2026-07-18T10:00:00.000Z',
      content: 'Archived content',
      createdAt: '2026-07-17T10:00:00.000Z',
      id: 'card-1',
      priority: 'high',
      tagIds: [],
      tagSnapshots: [],
      title: 'Archived card',
    });

    const { result } = renderHook(
      () =>
        useArchivedCardDetailQuery({
          accessToken: 'token-1',
          cardId: 'card-1',
          cycleId: 'cycle-1',
        }),
      { wrapper }
    );

    await waitFor(() =>
      expect(result.current.data?.content).toBe('Archived content')
    );
    expect(fetchArchivedCardDetail).toHaveBeenCalledWith(
      'cycle-1',
      'card-1',
      'token-1'
    );
  });
});
