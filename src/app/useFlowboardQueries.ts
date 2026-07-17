import { useQuery } from '@tanstack/react-query';

import {
  fetchActiveCardDetail,
  fetchAuthenticatedProfile,
  fetchBoardBootstrap,
} from '../storage/authenticatedApi';
import { queryKeys } from './queryKeys';

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
