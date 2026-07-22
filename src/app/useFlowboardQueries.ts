import {
  useInfiniteQuery,
  useQuery,
  type InfiniteData,
} from '@tanstack/react-query';

import {
  fetchArchivedCardDetail,
  fetchActiveCardDetail,
  fetchAuthenticatedProfile,
  fetchBoardBootstrap,
  fetchCompletedHistory,
  type CompletedHistoryResponse,
} from '../storage/authenticatedApi';
import { queryKeys } from './queryKeys';

export const COMPLETED_HISTORY_PAGE_LIMIT = 20;

type CompletedHistoryQueryKey = ReturnType<typeof queryKeys.board.history>;

export const useAuthenticatedProfileQuery = (accessToken?: string) =>
  useQuery({
    enabled: Boolean(accessToken),
    queryFn: () => fetchAuthenticatedProfile(accessToken ?? ''),
    queryKey: queryKeys.profile,
  });

export const useBoardBootstrapQuery = ({
  accessToken,
  enabled,
}: {
  accessToken?: string;
  enabled: boolean;
}) =>
  useQuery({
    enabled,
    queryFn: () => fetchBoardBootstrap(accessToken),
    queryKey: queryKeys.board.bootstrap,
  });

export const useActiveCardDetailQuery = (
  cardId: string | null,
  accessToken?: string
) =>
  useQuery({
    enabled: Boolean(cardId),
    queryFn: () => fetchActiveCardDetail(cardId ?? '', accessToken),
    queryKey: cardId
      ? queryKeys.board.card(cardId)
      : [...queryKeys.board.card('pending')],
  });

export const useCompletedHistoryQuery = ({
  accessToken,
  enabled,
  limit = COMPLETED_HISTORY_PAGE_LIMIT,
}: {
  accessToken?: string;
  enabled: boolean;
  limit?: number;
}) =>
  useInfiniteQuery<
    CompletedHistoryResponse,
    Error,
    InfiniteData<CompletedHistoryResponse>,
    CompletedHistoryQueryKey,
    string | null
  >({
    enabled,
    getNextPageParam: (lastPage) => lastPage.pageInfo.nextCursor,
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      fetchCompletedHistory({ accessToken, cursor: pageParam, limit }),
    queryKey: queryKeys.board.history(limit),
  });

export const useArchivedCardDetailQuery = ({
  accessToken,
  cardId,
  cycleId,
  enabled = true,
}: {
  accessToken?: string;
  cardId: string | null;
  cycleId: string | null;
  enabled?: boolean;
}) =>
  useQuery({
    enabled: Boolean(cycleId && cardId && enabled),
    queryFn: () =>
      fetchArchivedCardDetail(cycleId ?? '', cardId ?? '', accessToken),
    queryKey:
      cycleId && cardId
        ? queryKeys.board.archivedCard(cycleId, cardId)
        : queryKeys.board.archivedCard('pending-cycle', 'pending-card'),
  });
