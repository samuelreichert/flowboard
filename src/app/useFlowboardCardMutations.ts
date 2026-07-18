import { useMemo } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createActiveCard,
  deleteActiveCard,
  moveActiveCard,
  updateActiveCard,
  type ActiveCardDetailResponse,
  type BoardBootstrapResponse,
  type CardMutationResponse,
  type CreateCardMutationInput,
  type MoveCardMutationInput,
  type UpdateCardMutationInput,
} from '../storage/authenticatedApi';
import {
  moveBootstrapCard,
  removeBootstrapCard,
  toCardDetail,
  upsertBootstrapCard,
} from './flowboardMutationCache';
import { queryKeys } from './queryKeys';

export type CreateCardMutationVariables = CreateCardMutationInput & {
  createdAt: string;
};

export type UpdateCardMutationVariables = {
  card: UpdateCardMutationInput;
  cardId: string;
};

export type MoveCardMutationVariables = {
  cardId: string;
  placement: MoveCardMutationInput;
};

export type DeleteCardMutationVariables = {
  cardId: string;
};

type MutationContext = {
  previousBootstrap?: BoardBootstrapResponse;
  previousCardDetail?: ActiveCardDetailResponse;
};

export const useFlowboardCardMutations = ({
  accessToken,
  onMutationError,
  onMutationSuccess,
}: {
  accessToken?: string;
  onMutationError?: () => void;
  onMutationSuccess?: () => void;
}) => {
  const queryClient = useQueryClient();

  const createMutation = useMutation<
    CardMutationResponse,
    Error,
    CreateCardMutationVariables,
    MutationContext
  >({
    mutationFn: ({ createdAt: _createdAt, ...card }) =>
      createActiveCard(card, accessToken),
    onError: (_error, variables, context) => {
      onMutationError?.();
      queryClient.setQueryData(
        queryKeys.board.bootstrap,
        context?.previousBootstrap
      );
      queryClient.setQueryData(
        queryKeys.board.card(variables.id),
        context?.previousCardDetail
      );
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.board.bootstrap });
      await queryClient.cancelQueries({
        queryKey: queryKeys.board.card(variables.id),
      });

      const previousBootstrap =
        queryClient.getQueryData<BoardBootstrapResponse>(
          queryKeys.board.bootstrap
        );
      const previousCardDetail =
        queryClient.getQueryData<ActiveCardDetailResponse>(
          queryKeys.board.card(variables.id)
        );
      const optimisticCard = {
        ...variables,
        createdAt: variables.createdAt,
      };

      queryClient.setQueryData(queryKeys.board.bootstrap, (current) =>
        upsertBootstrapCard(
          current as BoardBootstrapResponse | undefined,
          optimisticCard
        )
      );
      queryClient.setQueryData(
        queryKeys.board.card(variables.id),
        toCardDetail(optimisticCard)
      );

      return { previousBootstrap, previousCardDetail };
    },
    onSuccess: (result) => {
      onMutationSuccess?.();
      queryClient.setQueryData(queryKeys.board.bootstrap, (current) =>
        upsertBootstrapCard(
          current as BoardBootstrapResponse | undefined,
          result.card,
          result.boardVersion
        )
      );
      queryClient.setQueryData(
        queryKeys.board.card(result.card.id),
        toCardDetail(result.card)
      );
    },
  });

  const updateMutation = useMutation<
    CardMutationResponse,
    Error,
    UpdateCardMutationVariables,
    MutationContext
  >({
    mutationFn: ({ card, cardId }) => updateActiveCard(cardId, card, accessToken),
    onError: (_error, variables, context) => {
      onMutationError?.();
      queryClient.setQueryData(
        queryKeys.board.bootstrap,
        context?.previousBootstrap
      );
      queryClient.setQueryData(
        queryKeys.board.card(variables.cardId),
        context?.previousCardDetail
      );
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.board.bootstrap });
      await queryClient.cancelQueries({
        queryKey: queryKeys.board.card(variables.cardId),
      });

      const previousBootstrap =
        queryClient.getQueryData<BoardBootstrapResponse>(
          queryKeys.board.bootstrap
        );
      const previousCardDetail =
        queryClient.getQueryData<ActiveCardDetailResponse>(
          queryKeys.board.card(variables.cardId)
        );

      queryClient.setQueryData(queryKeys.board.bootstrap, (current) => {
        const bootstrap = current as BoardBootstrapResponse | undefined;
        const existing = bootstrap?.cards.find(
          (card) => card.id === variables.cardId
        );

        if (!existing) {
          return bootstrap;
        }

        return upsertBootstrapCard(bootstrap, {
          ...variables.card,
          columnId: existing.columnId,
          createdAt: previousCardDetail?.createdAt ?? new Date().toISOString(),
          id: variables.cardId,
        });
      });

      if (previousCardDetail) {
        queryClient.setQueryData(queryKeys.board.card(variables.cardId), {
          ...previousCardDetail,
          ...variables.card,
        });
      }

      return { previousBootstrap, previousCardDetail };
    },
    onSuccess: (result) => {
      onMutationSuccess?.();
      queryClient.setQueryData(queryKeys.board.bootstrap, (current) =>
        upsertBootstrapCard(
          current as BoardBootstrapResponse | undefined,
          result.card,
          result.boardVersion
        )
      );
      queryClient.setQueryData(
        queryKeys.board.card(result.card.id),
        toCardDetail(result.card)
      );
    },
  });

  const moveMutation = useMutation<
    CardMutationResponse,
    Error,
    MoveCardMutationVariables,
    MutationContext
  >({
    mutationFn: ({ cardId, placement }) =>
      moveActiveCard(cardId, placement, accessToken),
    onError: (_error, variables, context) => {
      onMutationError?.();
      queryClient.setQueryData(
        queryKeys.board.bootstrap,
        context?.previousBootstrap
      );
      queryClient.setQueryData(
        queryKeys.board.card(variables.cardId),
        context?.previousCardDetail
      );
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.board.bootstrap });
      await queryClient.cancelQueries({
        queryKey: queryKeys.board.card(variables.cardId),
      });

      const previousBootstrap =
        queryClient.getQueryData<BoardBootstrapResponse>(
          queryKeys.board.bootstrap
        );
      const previousCardDetail =
        queryClient.getQueryData<ActiveCardDetailResponse>(
          queryKeys.board.card(variables.cardId)
        );

      queryClient.setQueryData(queryKeys.board.bootstrap, (current) =>
        moveBootstrapCard(current as BoardBootstrapResponse | undefined, variables)
      );

      return { previousBootstrap, previousCardDetail };
    },
    onSuccess: (result) => {
      onMutationSuccess?.();
      queryClient.setQueryData(queryKeys.board.bootstrap, (current) =>
        upsertBootstrapCard(
          moveBootstrapCard(current as BoardBootstrapResponse | undefined, {
            cardId: result.card.id,
            placement: { columnId: result.card.columnId },
          }),
          result.card,
          result.boardVersion
        )
      );
      queryClient.setQueryData(
        queryKeys.board.card(result.card.id),
        toCardDetail(result.card)
      );
      void queryClient.invalidateQueries({
        exact: true,
        queryKey: queryKeys.board.bootstrap,
      });
    },
  });

  const deleteMutation = useMutation<
    Awaited<ReturnType<typeof deleteActiveCard>>,
    Error,
    DeleteCardMutationVariables,
    MutationContext
  >({
    mutationFn: ({ cardId }) => deleteActiveCard(cardId, accessToken),
    onError: (_error, variables, context) => {
      onMutationError?.();
      queryClient.setQueryData(
        queryKeys.board.bootstrap,
        context?.previousBootstrap
      );
      queryClient.setQueryData(
        queryKeys.board.card(variables.cardId),
        context?.previousCardDetail
      );
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.board.bootstrap });
      await queryClient.cancelQueries({
        queryKey: queryKeys.board.card(variables.cardId),
      });

      const previousBootstrap =
        queryClient.getQueryData<BoardBootstrapResponse>(
          queryKeys.board.bootstrap
        );
      const previousCardDetail =
        queryClient.getQueryData<ActiveCardDetailResponse>(
          queryKeys.board.card(variables.cardId)
        );

      queryClient.setQueryData(queryKeys.board.bootstrap, (current) =>
        removeBootstrapCard(
          current as BoardBootstrapResponse | undefined,
          variables.cardId
        )
      );
      queryClient.removeQueries({
        exact: true,
        queryKey: queryKeys.board.card(variables.cardId),
      });

      return { previousBootstrap, previousCardDetail };
    },
    onSuccess: (result) => {
      onMutationSuccess?.();
      queryClient.setQueryData(queryKeys.board.bootstrap, (current) =>
        removeBootstrapCard(
          current as BoardBootstrapResponse | undefined,
          result.cardId,
          result.boardVersion
        )
      );
      queryClient.removeQueries({
        exact: true,
        queryKey: queryKeys.board.card(result.cardId),
      });
    },
  });

  return useMemo(
    () => ({
      createCard: createMutation.mutate,
      deleteCard: deleteMutation.mutate,
      moveCard: moveMutation.mutate,
      updateCard: updateMutation.mutate,
    }),
    [
      createMutation.mutate,
      deleteMutation.mutate,
      moveMutation.mutate,
      updateMutation.mutate,
    ]
  );
};
