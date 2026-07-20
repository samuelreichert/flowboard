import { useEffect, useRef } from 'react';
import type { Dispatch } from 'react';

import { completeWorkCycle } from '../board/completedWork';
import {
  deleteTag as deleteBoardTag,
  removeTagFromColumns,
} from '../board/tags';
import {
  fetchBoardState,
  fetchStorage,
  updateActiveWorkCycleStorage,
  updateBoardStateStorage,
  updateTagStorage,
  updateStorage,
  updateStorageLocal,
} from '../storage';
import type { BoardActiveWorkCycle, BoardColumn, BoardTag } from '../types';
import type { AppAction } from './appTypes';
import type { useFlowboardBoardMutations } from './useFlowboardBoardMutations';

const COMPLETION_ACKNOWLEDGEMENT_DURATION_MS = 2800;

const useBoardActions = ({
  activeWorkCycle,
  boardMutations,
  dispatch,
  openSettings,
  tags,
}: {
  activeWorkCycle: BoardActiveWorkCycle;
  boardMutations: ReturnType<typeof useFlowboardBoardMutations>;
  dispatch: Dispatch<AppAction>;
  openSettings: () => void;
  tags: BoardTag[];
}) => {
  const completionAcknowledgementTimeoutRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (completionAcknowledgementTimeoutRef.current !== null) {
        window.clearTimeout(completionAcknowledgementTimeoutRef.current);
      }
    },
    []
  );

  const updateTags = (newTags: BoardTag[]) => {
    dispatch({ tags: newTags, type: 'tagsChanged' });
    updateTagStorage(newTags);

    const createdTag = newTags.find(
      (tag) => !tags.some((currentTag) => currentTag.id === tag.id)
    );
    const renamedTag = newTags.find((tag) =>
      tags.some(
        (currentTag) => currentTag.id === tag.id && currentTag.name !== tag.name
      )
    );

    if (createdTag) {
      boardMutations.createTag(createdTag);
    } else if (renamedTag) {
      boardMutations.updateTag({
        tag: { name: renamedTag.name },
        tagId: renamedTag.id,
      });
    }
  };

  const updateColumns = (newColumns: BoardColumn[]) => {
    updateStorage(newColumns);
    const nextState = fetchBoardState();

    dispatch({ state: nextState, type: 'boardStateSynced' });
  };

  const updateCardColumns = (newColumns: BoardColumn[]) => {
    updateStorageLocal(newColumns);
    dispatch({ state: fetchBoardState(), type: 'boardStateChanged' });
  };

  const deleteTag = (tagId: string) => {
    updateTags(deleteBoardTag(tags, tagId));
    updateStorage(removeTagFromColumns(fetchStorage(), tagId));
    const nextState = fetchBoardState();

    dispatch({ state: nextState, type: 'boardStateChanged' });
    boardMutations.deleteTag({ tagId });
  };

  const clearBoard = () => {
    updateStorageLocal([]);
    const nextState = fetchBoardState();

    dispatch({ state: nextState, type: 'boardStateChanged' });
    boardMutations.clearBoard();
  };

  const chooseCompletedColumn = (completedColumnId: string | null) => {
    const nextActiveWorkCycle = {
      ...activeWorkCycle,
      completedColumnId,
    };

    dispatch({
      activeWorkCycle: nextActiveWorkCycle,
      type: 'activeWorkCycleChanged',
    });
    updateActiveWorkCycleStorage(nextActiveWorkCycle);
    boardMutations.updateWorkCycleSettings({ completedColumnId });
  };

  const openCompleteWorkConfirmation = () => {
    const latestState = fetchBoardState();
    const completedColumn = latestState.columns.find(
      (column) => column.id === latestState.activeWorkCycle.completedColumnId
    );

    if (!completedColumn) {
      openSettings();
      return;
    }

    dispatch({ state: latestState, type: 'boardStateChanged' });

    if (completedColumn.cards.length === 0) {
      return;
    }

    dispatch({ open: true, type: 'completeWorkOpenChanged' });
    dispatch({ open: false, type: 'mobileSidebarOpenChanged' });
  };

  const confirmCompleteWork = () => {
    const completedAt = new Date().toISOString();
    const latestState = fetchBoardState();
    const completedColumn = latestState.columns.find(
      (column) => column.id === latestState.activeWorkCycle.completedColumnId
    );

    if (!completedColumn || completedColumn.cards.length === 0) {
      if (!completedColumn) {
        openSettings();
      }

      return;
    }

    const nextState = completeWorkCycle(latestState, completedAt);

    if (!nextState) {
      openSettings();
      return;
    }

    updateBoardStateStorage(nextState);
    dispatch({ state: nextState, type: 'boardStateChanged' });
    boardMutations.completeWorkCycle();
    dispatch({ active: true, type: 'completionAcknowledgementChanged' });
    if (completionAcknowledgementTimeoutRef.current !== null) {
      window.clearTimeout(completionAcknowledgementTimeoutRef.current);
    }
    completionAcknowledgementTimeoutRef.current = window.setTimeout(
      () =>
        dispatch({
          active: false,
          type: 'completionAcknowledgementChanged',
        }),
      COMPLETION_ACKNOWLEDGEMENT_DURATION_MS
    );
  };

  return {
    chooseCompletedColumn,
    clearBoard,
    confirmCompleteWork,
    deleteTag,
    openCompleteWorkConfirmation,
    updateCardColumns,
    updateColumns,
    updateTags,
  };
};

export default useBoardActions;
