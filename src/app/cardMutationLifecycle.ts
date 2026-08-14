import type { QueryClient } from '@tanstack/react-query';

import type {
  ActiveCardDetailResponse,
  BoardBootstrapResponse,
} from '../storage/authenticatedApi';
import {
  applyCardCacheProjection,
  captureCardCacheProjection,
  CardMutationCoordinator,
  type CardMutationResult,
  type QueuedCardMutationOperation,
} from './cardMutationCoordinator';
import { queryKeys } from './queryKeys';

export type CardMutationLifecycleContext = {
  operation: QueuedCardMutationOperation;
};

const applyProjection = (
  queryClient: QueryClient,
  cardId: string,
  projection: ReturnType<CardMutationCoordinator['begin']>,
  boardVersion?: number
) => {
  if (!projection) {
    return;
  }

  queryClient.setQueryData(queryKeys.board.bootstrap, (current) => {
    const bootstrap = applyCardCacheProjection(
      current as BoardBootstrapResponse | undefined,
      cardId,
      projection
    );

    return bootstrap
      ? {
          ...bootstrap,
          board: {
            ...bootstrap.board,
            version: Math.max(bootstrap.board.version, boardVersion ?? 0),
          },
        }
      : bootstrap;
  });

  if (projection.detail.kind === 'value') {
    queryClient.setQueryData(
      queryKeys.board.card(cardId),
      projection.detail.detail
    );
  } else if (projection.detail.kind === 'remove') {
    queryClient.removeQueries({
      exact: true,
      queryKey: queryKeys.board.card(cardId),
    });
  }
};

export const createCardMutationLifecycle = ({
  coordinator,
  onMutationError,
  onMutationSuccess,
  queryClient,
}: {
  coordinator: CardMutationCoordinator;
  onMutationError?: () => void;
  onMutationSuccess?: () => void;
  queryClient: QueryClient;
}) => ({
  execute: <T>(
    operation: QueuedCardMutationOperation,
    request: () => Promise<T>
  ) => coordinator.execute(operation, request),
  onError: (context?: CardMutationLifecycleContext) => {
    if (!context || !coordinator.isCurrent(context.operation)) {
      return;
    }

    onMutationError?.();
    applyProjection(
      queryClient,
      context.operation.cardId,
      coordinator.settleFailure(context.operation)
    );
  },
  onMutate: async (
    operation: QueuedCardMutationOperation
  ): Promise<CardMutationLifecycleContext> => {
    await queryClient.cancelQueries({ queryKey: queryKeys.board.bootstrap });
    await queryClient.cancelQueries({
      queryKey: queryKeys.board.card(operation.cardId),
    });

    const projection = coordinator.begin(
      operation,
      captureCardCacheProjection(
        queryClient.getQueryData<BoardBootstrapResponse>(
          queryKeys.board.bootstrap
        ),
        queryClient.getQueryData<ActiveCardDetailResponse>(
          queryKeys.board.card(operation.cardId)
        ),
        operation.cardId
      )
    );

    applyProjection(queryClient, operation.cardId, projection);

    return { operation };
  },
  onSettled: (context?: CardMutationLifecycleContext) => {
    if (context) {
      coordinator.release(context.operation);
    }
  },
  onSuccess: (
    result: CardMutationResult,
    context?: CardMutationLifecycleContext
  ) => {
    if (!context || !coordinator.isCurrent(context.operation)) {
      return;
    }

    onMutationSuccess?.();
    applyProjection(
      queryClient,
      context.operation.cardId,
      coordinator.settleSuccess(context.operation, result),
      result.boardVersion
    );
  },
});
