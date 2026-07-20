import { useMemo } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';

import {
  assignActiveCardTag,
  completeWorkCycle,
  createActiveColumn,
  createBoardTag,
  deleteActiveColumn,
  deleteBoardTag,
  moveActiveColumn,
  unassignActiveCardTag,
  updateActiveColumn,
  updateBoardSettings,
  updateBoardTag,
  updateWorkCycleSettings,
  type ActiveCardDetailResponse,
  type BoardBootstrapResponse,
  type BoardSettingsMutationInput,
  type CardTagMutationResponse,
  type CompleteWorkCycleMutationResponse,
  type CompletedHistoryResponse,
  type ColumnMutationResponse,
  type CreateColumnMutationInput,
  type CreateTagMutationInput,
  type DeleteColumnMutationResponse,
  type DeleteTagMutationResponse,
  type MoveColumnMutationInput,
  type TagMutationResponse,
  type UpdateColumnMutationInput,
  type UpdateTagMutationInput,
  type WorkCycleSettingsMutationInput,
} from '../storage/authenticatedApi';
import {
  applyCompletedWorkCycleToBootstrap,
  applyDeletedColumn,
  applyDeletedTag,
  mergeCompletedHistoryCycle,
  updateBootstrapBackground,
  updateBootstrapColumns,
  updateBootstrapTags,
  updateBootstrapWorkCycle,
  upsertBootstrapCardSummary,
} from './flowboardMutationCache';
import { queryKeys } from './queryKeys';
import { COMPLETED_HISTORY_PAGE_LIMIT } from './useFlowboardQueries';

export type UpdateColumnMutationVariables = {
  column: UpdateColumnMutationInput;
  columnId: string;
};

export type MoveColumnMutationVariables = {
  columnId: string;
  placement: MoveColumnMutationInput;
};

export type DeleteColumnMutationVariables = {
  columnId: string;
};

export type UpdateTagMutationVariables = {
  tag: UpdateTagMutationInput;
  tagId: string;
};

export type DeleteTagMutationVariables = {
  tagId: string;
};

export type CardTagMutationVariables = {
  cardId: string;
  tagId: string;
};

type MutationContext = {
  previousBootstrap?: BoardBootstrapResponse;
  previousCardDetails?: Array<{
    cardId: string;
    detail?: ActiveCardDetailResponse;
  }>;
  previousHistory?: InfiniteData<CompletedHistoryResponse, string | null>;
};

const reorderColumns = (
  columns: BoardBootstrapResponse['columns'],
  { columnId, placement }: MoveColumnMutationVariables
) => {
  const column = columns.find((item) => item.id === columnId);

  if (!column) {
    return columns;
  }

  const remainingColumns = columns.filter((item) => item.id !== columnId);
  const placementColumnId = placement.beforeColumnId ?? placement.afterColumnId;
  const targetIndex = placementColumnId
    ? remainingColumns.findIndex((item) => item.id === placementColumnId)
    : remainingColumns.length;
  const insertAt =
    targetIndex === -1
      ? remainingColumns.length
      : placement.afterColumnId
        ? targetIndex + 1
        : targetIndex;
  const nextColumns = [...remainingColumns];

  nextColumns.splice(insertAt, 0, column);

  return nextColumns;
};

const updateCardDetailTagIds = (
  detail: ActiveCardDetailResponse | undefined,
  tagIds: string[]
) => (detail ? { ...detail, tagIds } : detail);

export const useFlowboardBoardMutations = ({
  accessToken,
  onMutationError,
  onMutationSuccess,
}: {
  accessToken?: string;
  onMutationError?: () => void;
  onMutationSuccess?: () => void;
}) => {
  const queryClient = useQueryClient();

  const getBootstrap = () =>
    queryClient.getQueryData<BoardBootstrapResponse>(queryKeys.board.bootstrap);
  const getHistory = () =>
    queryClient.getQueryData<
      InfiniteData<CompletedHistoryResponse, string | null>
    >(queryKeys.board.history(COMPLETED_HISTORY_PAGE_LIMIT));

  const restoreContext = (context?: MutationContext) => {
    queryClient.setQueryData(
      queryKeys.board.bootstrap,
      context?.previousBootstrap
    );
    queryClient.setQueryData(
      queryKeys.board.history(COMPLETED_HISTORY_PAGE_LIMIT),
      context?.previousHistory
    );

    for (const item of context?.previousCardDetails ?? []) {
      queryClient.setQueryData(queryKeys.board.card(item.cardId), item.detail);
    }
  };

  const createColumnMutation = useMutation<
    ColumnMutationResponse,
    Error,
    CreateColumnMutationInput,
    MutationContext
  >({
    mutationFn: (column) => createActiveColumn(column, accessToken),
    onError: (_error, _variables, context) => {
      onMutationError?.();
      restoreContext(context);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.board.bootstrap });
      const previousBootstrap = getBootstrap();

      queryClient.setQueryData(queryKeys.board.bootstrap, (current) => {
        const bootstrap = current as BoardBootstrapResponse | undefined;

        return bootstrap
          ? {
              ...bootstrap,
              columns: [
                ...bootstrap.columns,
                { id: variables.id, title: variables.title },
              ],
            }
          : bootstrap;
      });

      return { previousBootstrap };
    },
    onSuccess: (result) => {
      onMutationSuccess?.();
      queryClient.setQueryData(queryKeys.board.bootstrap, (current) =>
        updateBootstrapColumns(
          current as BoardBootstrapResponse | undefined,
          result.columns,
          result.boardVersion
        )
      );
    },
  });

  const updateColumnMutation = useMutation<
    ColumnMutationResponse,
    Error,
    UpdateColumnMutationVariables,
    MutationContext
  >({
    mutationFn: ({ column, columnId }) =>
      updateActiveColumn(columnId, column, accessToken),
    onError: (_error, _variables, context) => {
      onMutationError?.();
      restoreContext(context);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.board.bootstrap });
      const previousBootstrap = getBootstrap();

      queryClient.setQueryData(queryKeys.board.bootstrap, (current) => {
        const bootstrap = current as BoardBootstrapResponse | undefined;

        return bootstrap
          ? {
              ...bootstrap,
              columns: bootstrap.columns.map((column) =>
                column.id === variables.columnId
                  ? { ...column, title: variables.column.title }
                  : column
              ),
            }
          : bootstrap;
      });

      return { previousBootstrap };
    },
    onSuccess: (result) => {
      onMutationSuccess?.();
      queryClient.setQueryData(queryKeys.board.bootstrap, (current) =>
        updateBootstrapColumns(
          current as BoardBootstrapResponse | undefined,
          result.columns,
          result.boardVersion
        )
      );
    },
  });

  const moveColumnMutation = useMutation<
    ColumnMutationResponse,
    Error,
    MoveColumnMutationVariables,
    MutationContext
  >({
    mutationFn: ({ columnId, placement }) =>
      moveActiveColumn(columnId, placement, accessToken),
    onError: (_error, _variables, context) => {
      onMutationError?.();
      restoreContext(context);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.board.bootstrap });
      const previousBootstrap = getBootstrap();

      queryClient.setQueryData(queryKeys.board.bootstrap, (current) => {
        const bootstrap = current as BoardBootstrapResponse | undefined;

        return bootstrap
          ? {
              ...bootstrap,
              columns: reorderColumns(bootstrap.columns, variables),
            }
          : bootstrap;
      });

      return { previousBootstrap };
    },
    onSuccess: (result) => {
      onMutationSuccess?.();
      queryClient.setQueryData(queryKeys.board.bootstrap, (current) =>
        updateBootstrapColumns(
          current as BoardBootstrapResponse | undefined,
          result.columns,
          result.boardVersion
        )
      );
    },
  });

  const deleteColumnMutation = useMutation<
    DeleteColumnMutationResponse,
    Error,
    DeleteColumnMutationVariables,
    MutationContext
  >({
    mutationFn: ({ columnId }) => deleteActiveColumn(columnId, accessToken),
    onError: (_error, _variables, context) => {
      onMutationError?.();
      restoreContext(context);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.board.bootstrap });
      const previousBootstrap = getBootstrap();
      const affectedCardIds =
        previousBootstrap?.cards.reduce<string[]>((cardIds, card) => {
          if (card.columnId === variables.columnId) {
            cardIds.push(card.id);
          }

          return cardIds;
        }, []) ?? [];
      const previousCardDetails = affectedCardIds.map((cardId) => ({
        cardId,
        detail: queryClient.getQueryData<ActiveCardDetailResponse>(
          queryKeys.board.card(cardId)
        ),
      }));

      queryClient.setQueryData(queryKeys.board.bootstrap, (current) => {
        const bootstrap = current as BoardBootstrapResponse | undefined;

        return bootstrap
          ? {
              ...bootstrap,
              cards: bootstrap.cards.filter(
                (card) => card.columnId !== variables.columnId
              ),
              columns: bootstrap.columns.filter(
                (column) => column.id !== variables.columnId
              ),
              workCycle:
                bootstrap.workCycle.completedColumnId === variables.columnId
                  ? { ...bootstrap.workCycle, completedColumnId: null }
                  : bootstrap.workCycle,
            }
          : bootstrap;
      });

      for (const cardId of affectedCardIds) {
        queryClient.removeQueries({
          exact: true,
          queryKey: queryKeys.board.card(cardId),
        });
      }

      return { previousBootstrap, previousCardDetails };
    },
    onSuccess: (result) => {
      onMutationSuccess?.();
      queryClient.setQueryData(queryKeys.board.bootstrap, (current) =>
        applyDeletedColumn(
          current as BoardBootstrapResponse | undefined,
          result
        )
      );

      for (const cardId of result.cardIds) {
        queryClient.removeQueries({
          exact: true,
          queryKey: queryKeys.board.card(cardId),
        });
      }
    },
  });

  const createTagMutation = useMutation<
    TagMutationResponse,
    Error,
    CreateTagMutationInput,
    MutationContext
  >({
    mutationFn: (tag) => createBoardTag(tag, accessToken),
    onError: (_error, _variables, context) => {
      onMutationError?.();
      restoreContext(context);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.board.bootstrap });
      const previousBootstrap = getBootstrap();

      queryClient.setQueryData(queryKeys.board.bootstrap, (current) => {
        const bootstrap = current as BoardBootstrapResponse | undefined;

        return bootstrap
          ? {
              ...bootstrap,
              tags: [...bootstrap.tags, variables],
            }
          : bootstrap;
      });

      return { previousBootstrap };
    },
    onSuccess: (result) => {
      onMutationSuccess?.();
      queryClient.setQueryData(queryKeys.board.bootstrap, (current) =>
        updateBootstrapTags(
          current as BoardBootstrapResponse | undefined,
          result.tags,
          result.boardVersion
        )
      );
    },
  });

  const updateTagMutation = useMutation<
    TagMutationResponse,
    Error,
    UpdateTagMutationVariables,
    MutationContext
  >({
    mutationFn: ({ tag, tagId }) => updateBoardTag(tagId, tag, accessToken),
    onError: (_error, _variables, context) => {
      onMutationError?.();
      restoreContext(context);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.board.bootstrap });
      const previousBootstrap = getBootstrap();

      queryClient.setQueryData(queryKeys.board.bootstrap, (current) => {
        const bootstrap = current as BoardBootstrapResponse | undefined;

        return bootstrap
          ? {
              ...bootstrap,
              tags: bootstrap.tags.map((tag) =>
                tag.id === variables.tagId
                  ? { ...tag, name: variables.tag.name }
                  : tag
              ),
            }
          : bootstrap;
      });

      return { previousBootstrap };
    },
    onSuccess: (result) => {
      onMutationSuccess?.();
      queryClient.setQueryData(queryKeys.board.bootstrap, (current) =>
        updateBootstrapTags(
          current as BoardBootstrapResponse | undefined,
          result.tags,
          result.boardVersion
        )
      );
    },
  });

  const deleteTagMutation = useMutation<
    DeleteTagMutationResponse,
    Error,
    DeleteTagMutationVariables,
    MutationContext
  >({
    mutationFn: ({ tagId }) => deleteBoardTag(tagId, accessToken),
    onError: (_error, _variables, context) => {
      onMutationError?.();
      restoreContext(context);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.board.bootstrap });
      const previousBootstrap = getBootstrap();
      const affectedCardIds =
        previousBootstrap?.cards.reduce<string[]>((cardIds, card) => {
          if (card.tagIds.includes(variables.tagId)) {
            cardIds.push(card.id);
          }

          return cardIds;
        }, []) ?? [];
      const previousCardDetails = affectedCardIds.map((cardId) => ({
        cardId,
        detail: queryClient.getQueryData<ActiveCardDetailResponse>(
          queryKeys.board.card(cardId)
        ),
      }));

      queryClient.setQueryData(queryKeys.board.bootstrap, (current) => {
        const bootstrap = current as BoardBootstrapResponse | undefined;

        return bootstrap
          ? {
              ...bootstrap,
              cards: bootstrap.cards.map((card) => ({
                ...card,
                tagIds: card.tagIds.filter(
                  (tagId) => tagId !== variables.tagId
                ),
              })),
              tags: bootstrap.tags.filter((tag) => tag.id !== variables.tagId),
            }
          : bootstrap;
      });

      for (const cardId of affectedCardIds) {
        queryClient.setQueryData(queryKeys.board.card(cardId), (current) =>
          updateCardDetailTagIds(
            current as ActiveCardDetailResponse | undefined,
            (current as ActiveCardDetailResponse | undefined)?.tagIds.filter(
              (tagId) => tagId !== variables.tagId
            ) ?? []
          )
        );
      }

      return { previousBootstrap, previousCardDetails };
    },
    onSuccess: (result) => {
      onMutationSuccess?.();
      queryClient.setQueryData(queryKeys.board.bootstrap, (current) =>
        applyDeletedTag(current as BoardBootstrapResponse | undefined, result)
      );
    },
  });

  const assignTagMutation = useMutation<
    CardTagMutationResponse,
    Error,
    CardTagMutationVariables,
    MutationContext
  >({
    mutationFn: ({ cardId, tagId }) =>
      assignActiveCardTag(cardId, tagId, accessToken),
    onError: (_error, _variables, context) => {
      onMutationError?.();
      restoreContext(context);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.board.bootstrap });
      await queryClient.cancelQueries({
        queryKey: queryKeys.board.card(variables.cardId),
      });
      const previousBootstrap = getBootstrap();
      const previousCardDetails = [
        {
          cardId: variables.cardId,
          detail: queryClient.getQueryData<ActiveCardDetailResponse>(
            queryKeys.board.card(variables.cardId)
          ),
        },
      ];

      queryClient.setQueryData(queryKeys.board.bootstrap, (current) => {
        const bootstrap = current as BoardBootstrapResponse | undefined;

        return bootstrap
          ? {
              ...bootstrap,
              cards: bootstrap.cards.map((card) =>
                card.id === variables.cardId &&
                !card.tagIds.includes(variables.tagId)
                  ? { ...card, tagIds: [...card.tagIds, variables.tagId] }
                  : card
              ),
            }
          : bootstrap;
      });
      queryClient.setQueryData(
        queryKeys.board.card(variables.cardId),
        (current) => {
          const detail = current as ActiveCardDetailResponse | undefined;

          return detail && !detail.tagIds.includes(variables.tagId)
            ? { ...detail, tagIds: [...detail.tagIds, variables.tagId] }
            : detail;
        }
      );

      return { previousBootstrap, previousCardDetails };
    },
    onSuccess: (result) => {
      onMutationSuccess?.();
      queryClient.setQueryData(queryKeys.board.bootstrap, (current) =>
        upsertBootstrapCardSummary(
          current as BoardBootstrapResponse | undefined,
          result.card,
          result.boardVersion
        )
      );
      queryClient.setQueryData(
        queryKeys.board.card(result.card.id),
        (current) =>
          updateCardDetailTagIds(
            current as ActiveCardDetailResponse | undefined,
            result.card.tagIds
          )
      );
    },
  });

  const unassignTagMutation = useMutation<
    CardTagMutationResponse,
    Error,
    CardTagMutationVariables,
    MutationContext
  >({
    mutationFn: ({ cardId, tagId }) =>
      unassignActiveCardTag(cardId, tagId, accessToken),
    onError: (_error, _variables, context) => {
      onMutationError?.();
      restoreContext(context);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.board.bootstrap });
      await queryClient.cancelQueries({
        queryKey: queryKeys.board.card(variables.cardId),
      });
      const previousBootstrap = getBootstrap();
      const previousCardDetails = [
        {
          cardId: variables.cardId,
          detail: queryClient.getQueryData<ActiveCardDetailResponse>(
            queryKeys.board.card(variables.cardId)
          ),
        },
      ];

      queryClient.setQueryData(queryKeys.board.bootstrap, (current) => {
        const bootstrap = current as BoardBootstrapResponse | undefined;

        return bootstrap
          ? {
              ...bootstrap,
              cards: bootstrap.cards.map((card) =>
                card.id === variables.cardId
                  ? {
                      ...card,
                      tagIds: card.tagIds.filter(
                        (tagId) => tagId !== variables.tagId
                      ),
                    }
                  : card
              ),
            }
          : bootstrap;
      });
      queryClient.setQueryData(
        queryKeys.board.card(variables.cardId),
        (current) =>
          updateCardDetailTagIds(
            current as ActiveCardDetailResponse | undefined,
            (current as ActiveCardDetailResponse | undefined)?.tagIds.filter(
              (tagId) => tagId !== variables.tagId
            ) ?? []
          )
      );

      return { previousBootstrap, previousCardDetails };
    },
    onSuccess: (result) => {
      onMutationSuccess?.();
      queryClient.setQueryData(queryKeys.board.bootstrap, (current) =>
        upsertBootstrapCardSummary(
          current as BoardBootstrapResponse | undefined,
          result.card,
          result.boardVersion
        )
      );
      queryClient.setQueryData(
        queryKeys.board.card(result.card.id),
        (current) =>
          updateCardDetailTagIds(
            current as ActiveCardDetailResponse | undefined,
            result.card.tagIds
          )
      );
    },
  });

  const updateBoardSettingsMutation = useMutation<
    Awaited<ReturnType<typeof updateBoardSettings>>,
    Error,
    BoardSettingsMutationInput,
    MutationContext
  >({
    mutationFn: (settings) => updateBoardSettings(settings, accessToken),
    onError: (_error, _variables, context) => {
      onMutationError?.();
      restoreContext(context);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.board.bootstrap });
      const previousBootstrap = getBootstrap();

      queryClient.setQueryData(queryKeys.board.bootstrap, (current) =>
        updateBootstrapBackground(
          current as BoardBootstrapResponse | undefined,
          variables.background
        )
      );

      return { previousBootstrap };
    },
    onSuccess: (result) => {
      onMutationSuccess?.();
      queryClient.setQueryData(queryKeys.board.bootstrap, (current) =>
        updateBootstrapBackground(
          current as BoardBootstrapResponse | undefined,
          result.board.background,
          result.board.version
        )
      );
    },
  });

  const updateWorkCycleSettingsMutation = useMutation<
    Awaited<ReturnType<typeof updateWorkCycleSettings>>,
    Error,
    WorkCycleSettingsMutationInput,
    MutationContext
  >({
    mutationFn: (settings) => updateWorkCycleSettings(settings, accessToken),
    onError: (_error, _variables, context) => {
      onMutationError?.();
      restoreContext(context);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.board.bootstrap });
      const previousBootstrap = getBootstrap();

      queryClient.setQueryData(queryKeys.board.bootstrap, (current) => {
        const bootstrap = current as BoardBootstrapResponse | undefined;

        return bootstrap
          ? updateBootstrapWorkCycle(bootstrap, {
              ...bootstrap.workCycle,
              completedColumnId: variables.completedColumnId,
            })
          : bootstrap;
      });

      return { previousBootstrap };
    },
    onSuccess: (result) => {
      onMutationSuccess?.();
      queryClient.setQueryData(queryKeys.board.bootstrap, (current) =>
        updateBootstrapWorkCycle(
          current as BoardBootstrapResponse | undefined,
          result.workCycle,
          result.boardVersion
        )
      );
    },
  });

  const completeWorkCycleMutation = useMutation<
    CompleteWorkCycleMutationResponse,
    Error,
    void,
    MutationContext
  >({
    mutationFn: () => completeWorkCycle(accessToken),
    onError: (_error, _variables, context) => {
      onMutationError?.();
      restoreContext(context);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.board.bootstrap });
      await queryClient.cancelQueries({
        queryKey: queryKeys.board.history(COMPLETED_HISTORY_PAGE_LIMIT),
      });

      const previousBootstrap = getBootstrap();
      const previousHistory = getHistory();
      const completedColumnId = previousBootstrap?.workCycle.completedColumnId;
      const completedCardIds =
        previousBootstrap?.cards.reduce<string[]>((cardIds, card) => {
          if (card.columnId === completedColumnId) {
            cardIds.push(card.id);
          }

          return cardIds;
        }, []) ?? [];
      const completedCardIdSet = new Set(completedCardIds);
      const previousCardDetails = completedCardIds.map((cardId) => ({
        cardId,
        detail: queryClient.getQueryData<ActiveCardDetailResponse>(
          queryKeys.board.card(cardId)
        ),
      }));
      const completedAt = new Date().toISOString();

      queryClient.setQueryData(queryKeys.board.bootstrap, (current) => {
        const bootstrap = current as BoardBootstrapResponse | undefined;

        return bootstrap
          ? {
              ...bootstrap,
              cards: bootstrap.cards.filter(
                (card) => !completedCardIdSet.has(card.id)
              ),
              workCycle: {
                ...bootstrap.workCycle,
                startDate: completedAt,
              },
            }
          : bootstrap;
      });

      for (const cardId of completedCardIds) {
        queryClient.removeQueries({
          exact: true,
          queryKey: queryKeys.board.card(cardId),
        });
      }

      return { previousBootstrap, previousCardDetails, previousHistory };
    },
    onSuccess: (result) => {
      onMutationSuccess?.();
      queryClient.setQueryData(queryKeys.board.bootstrap, (current) =>
        applyCompletedWorkCycleToBootstrap(
          current as BoardBootstrapResponse | undefined,
          result
        )
      );
      queryClient.setQueryData(
        queryKeys.board.history(COMPLETED_HISTORY_PAGE_LIMIT),
        (current) => {
          const history = current as
            | InfiniteData<CompletedHistoryResponse, string | null>
            | undefined;

          if (!history || history.pages.length === 0) {
            return history;
          }

          return {
            ...history,
            pages: history.pages.map((page, index) =>
              index === 0
                ? (mergeCompletedHistoryCycle(page, result) ?? page)
                : page
            ),
          };
        }
      );

      for (const cardId of result.cardIds) {
        queryClient.removeQueries({
          exact: true,
          queryKey: queryKeys.board.card(cardId),
        });
      }
    },
  });

  return useMemo(
    () => ({
      assignCardTag: assignTagMutation.mutate,
      completeWorkCycle: completeWorkCycleMutation.mutate,
      createColumn: createColumnMutation.mutate,
      createTag: createTagMutation.mutate,
      deleteColumn: deleteColumnMutation.mutate,
      deleteTag: deleteTagMutation.mutate,
      moveColumn: moveColumnMutation.mutate,
      unassignCardTag: unassignTagMutation.mutate,
      updateBoardSettings: updateBoardSettingsMutation.mutate,
      updateColumn: updateColumnMutation.mutate,
      updateTag: updateTagMutation.mutate,
      updateWorkCycleSettings: updateWorkCycleSettingsMutation.mutate,
    }),
    [
      assignTagMutation.mutate,
      completeWorkCycleMutation.mutate,
      createColumnMutation.mutate,
      createTagMutation.mutate,
      deleteColumnMutation.mutate,
      deleteTagMutation.mutate,
      moveColumnMutation.mutate,
      unassignTagMutation.mutate,
      updateBoardSettingsMutation.mutate,
      updateColumnMutation.mutate,
      updateTagMutation.mutate,
      updateWorkCycleSettingsMutation.mutate,
    ]
  );
};
