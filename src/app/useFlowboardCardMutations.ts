import { useMemo, useRef } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createActiveCard,
  deleteActiveCard,
  moveActiveCard,
  updateActiveCard,
  type CardMutationResponse,
  type CreateCardMutationInput,
  type MoveCardMutationInput,
  type UpdateCardMutationInput,
} from '../storage/authenticatedApi';
import {
  CardMutationCoordinator,
  type QueuedCardMutationOperation,
} from './cardMutationCoordinator';
import {
  createCardMutationLifecycle,
  type CardMutationLifecycleContext,
} from './cardMutationLifecycle';
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

type CreateCardMutationRequest = CreateCardMutationVariables & {
  operation: QueuedCardMutationOperation;
};

type UpdateCardMutationRequest = UpdateCardMutationVariables & {
  operation: QueuedCardMutationOperation;
};

type MoveCardMutationRequest = MoveCardMutationVariables & {
  operation: QueuedCardMutationOperation;
};

type DeleteCardMutationRequest = DeleteCardMutationVariables & {
  operation: QueuedCardMutationOperation;
};

export const useFlowboardCardMutations = ({
  accessToken,
  cardMutationCoordinator,
  onMutationError,
  onMutationSuccess,
}: {
  accessToken?: string;
  cardMutationCoordinator?: CardMutationCoordinator;
  onMutationError?: () => void;
  onMutationSuccess?: () => void;
}) => {
  const queryClient = useQueryClient();
  const ownedCoordinatorRef = useRef<CardMutationCoordinator | null>(null);

  if (!ownedCoordinatorRef.current) {
    ownedCoordinatorRef.current = new CardMutationCoordinator();
  }

  const coordinator = cardMutationCoordinator ?? ownedCoordinatorRef.current;
  const lifecycle = createCardMutationLifecycle({
    coordinator,
    onMutationError,
    onMutationSuccess,
    queryClient,
  });

  const createMutation = useMutation<
    CardMutationResponse,
    Error,
    CreateCardMutationRequest,
    CardMutationLifecycleContext
  >({
    mutationFn: ({ operation, createdAt: _createdAt, ...card }) =>
      lifecycle.execute(operation, () => createActiveCard(card, accessToken)),
    onError: (_error, _variables, context) => lifecycle.onError(context),
    onMutate: ({ operation }) => lifecycle.onMutate(operation),
    onSettled: (_data, _error, _variables, context) =>
      lifecycle.onSettled(context),
    onSuccess: (result, _variables, context) =>
      lifecycle.onSuccess(result, context),
  });

  const updateMutation = useMutation<
    CardMutationResponse,
    Error,
    UpdateCardMutationRequest,
    CardMutationLifecycleContext
  >({
    mutationFn: ({ card, cardId, operation }) =>
      lifecycle.execute(operation, () =>
        updateActiveCard(cardId, card, accessToken)
      ),
    onError: (_error, _variables, context) => lifecycle.onError(context),
    onMutate: ({ operation }) => lifecycle.onMutate(operation),
    onSettled: (_data, _error, _variables, context) =>
      lifecycle.onSettled(context),
    onSuccess: (result, _variables, context) =>
      lifecycle.onSuccess(result, context),
  });

  const moveMutation = useMutation<
    CardMutationResponse,
    Error,
    MoveCardMutationRequest,
    CardMutationLifecycleContext
  >({
    mutationFn: ({ cardId, operation, placement }) =>
      lifecycle.execute(operation, () =>
        moveActiveCard(cardId, placement, accessToken)
      ),
    onError: (_error, _variables, context) => lifecycle.onError(context),
    onMutate: ({ operation }) => lifecycle.onMutate(operation),
    onSettled: (_data, _error, _variables, context) =>
      lifecycle.onSettled(context),
    onSuccess: (result, _variables, context) => {
      lifecycle.onSuccess(result, context);
      void queryClient.invalidateQueries({
        exact: true,
        queryKey: queryKeys.board.bootstrap,
      });
    },
  });

  const deleteMutation = useMutation<
    Awaited<ReturnType<typeof deleteActiveCard>>,
    Error,
    DeleteCardMutationRequest,
    CardMutationLifecycleContext
  >({
    mutationFn: ({ cardId, operation }) =>
      lifecycle.execute(operation, () => deleteActiveCard(cardId, accessToken)),
    onError: (_error, _variables, context) => lifecycle.onError(context),
    onMutate: ({ operation }) => lifecycle.onMutate(operation),
    onSettled: (_data, _error, _variables, context) =>
      lifecycle.onSettled(context),
    onSuccess: (result, _variables, context) =>
      lifecycle.onSuccess(result, context),
  });

  return useMemo(
    () => ({
      createCard: (variables: CreateCardMutationVariables) =>
        createMutation.mutate({
          ...variables,
          operation: coordinator.createOperation({
            card: variables,
            cardId: variables.id,
            type: 'create',
          }),
        }),
      deleteCard: (variables: DeleteCardMutationVariables) =>
        deleteMutation.mutate({
          ...variables,
          operation: coordinator.createOperation({
            cardId: variables.cardId,
            type: 'delete',
          }),
        }),
      moveCard: (variables: MoveCardMutationVariables) =>
        moveMutation.mutate({
          ...variables,
          operation: coordinator.createOperation({
            cardId: variables.cardId,
            placement: variables.placement,
            type: 'move',
          }),
        }),
      updateCard: (variables: UpdateCardMutationVariables) =>
        updateMutation.mutate({
          ...variables,
          operation: coordinator.createOperation({
            card: variables.card,
            cardId: variables.cardId,
            type: 'update',
          }),
        }),
    }),
    [
      coordinator,
      createMutation.mutate,
      deleteMutation.mutate,
      moveMutation.mutate,
      updateMutation.mutate,
    ]
  );
};
