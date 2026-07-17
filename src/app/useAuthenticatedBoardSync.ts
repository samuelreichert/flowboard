import { useCallback, useEffect, useState } from 'react';
import type { Dispatch } from 'react';

import { updateBoardStateStorage } from '../storage';
import {
  fetchDefaultBoard,
  saveBoard,
  saveAuthenticatedBoard,
} from '../storage/authenticatedApi';
import type { BoardState } from '../types';
import type { Messages } from '../localization';
import type { AppAction } from './appTypes';
import type { AuthState } from './useAuthSession';
import { createBoardStateFromBootstrap } from './boardBootstrap';
import {
  mergeBoardSurfaceIntoCompleteState,
  needsCompleteBoardSnapshotForSave,
} from './boardSaveSafety';
import { useBoardBootstrapQuery } from './useFlowboardQueries';

const useAuthenticatedBoardSync = (
  authState: AuthState,
  dispatch: Dispatch<AppAction>,
  messages: Messages['app']['persistence']
) => {
  const [authenticatedBoard, setAuthenticatedBoard] = useState<{
    id: string;
    title: string;
    updatedAt?: string;
  } | null>(null);
  const [persistenceMessage, setPersistenceMessage] = useState<string | null>(
    null
  );
  const [completeBoardLoading, setCompleteBoardLoading] = useState(false);
  const accessToken =
    authState.status === 'signedIn' ? authState.session.access_token : undefined;
  const shouldLoadBoard =
    authState.status === 'signedIn' || authState.status === 'static';
  const bootstrapQuery = useBoardBootstrapQuery({
    accessToken,
    enabled: shouldLoadBoard,
  });
  const [completeBoardSnapshot, setCompleteBoardSnapshot] =
    useState<BoardState | null>(null);
  const bootstrapBoard = bootstrapQuery.data
    ? {
        id: bootstrapQuery.data.board.id,
        title: bootstrapQuery.data.board.title,
        updatedAt: String(bootstrapQuery.data.board.version),
      }
    : null;
  const activeBoard = completeBoardSnapshot
    ? authenticatedBoard
    : (bootstrapBoard ?? authenticatedBoard);

  useEffect(() => {
    if (!shouldLoadBoard || !bootstrapQuery.data || completeBoardSnapshot) {
      return;
    }

    const state = createBoardStateFromBootstrap(bootstrapQuery.data);

    updateBoardStateStorage(state);
    dispatch({ state, type: 'boardStateSynced' });
  }, [
    bootstrapQuery.data,
    completeBoardSnapshot,
    dispatch,
    shouldLoadBoard,
  ]);

  const persistAuthenticatedBoard = (nextState: BoardState) => {
    if (!shouldLoadBoard || !activeBoard) {
      return;
    }

    setPersistenceMessage(messages.saving);
    void (async () => {
      let stateToSave = nextState;

      if (needsCompleteBoardSnapshotForSave(nextState)) {
        const completeState =
          completeBoardSnapshot ?? (await fetchDefaultBoard(accessToken)).state;

        stateToSave = mergeBoardSurfaceIntoCompleteState(
          nextState,
          completeState
        );
      }

      const payload =
        authState.status === 'signedIn'
          ? await saveAuthenticatedBoard(
              activeBoard.id,
              stateToSave,
              authState.session.access_token
            )
          : await saveBoard(activeBoard.id, stateToSave);

      return payload;
    })()
      .then((payload) => {
        setAuthenticatedBoard(payload.board);
        setCompleteBoardSnapshot(payload.state);
        setPersistenceMessage(null);
      })
      .catch(() => setPersistenceMessage(messages.unsaved));
  };

  const loadCompleteBoardState = useCallback(() => {
    if (!shouldLoadBoard || completeBoardSnapshot) {
      return;
    }

    setCompleteBoardLoading(true);
    void fetchDefaultBoard(accessToken)
      .then((payload) => {
        updateBoardStateStorage(payload.state);
        setAuthenticatedBoard(payload.board);
        setCompleteBoardSnapshot(payload.state);
        dispatch({ state: payload.state, type: 'boardStateSynced' });
      })
      .catch(() => setPersistenceMessage(messages.boardUnavailable))
      .finally(() => setCompleteBoardLoading(false));
  }, [
    accessToken,
    completeBoardSnapshot,
    dispatch,
    messages.boardUnavailable,
    shouldLoadBoard,
  ]);

  return {
    authenticatedBoardLoading:
      completeBoardLoading ||
      (shouldLoadBoard &&
        (bootstrapQuery.isPending || bootstrapQuery.isFetching)),
    loadCompleteBoardState,
    persistenceMessage:
      persistenceMessage ??
      (shouldLoadBoard && (bootstrapQuery.isPending || bootstrapQuery.isFetching)
        ? messages.loadingBoard
        : null) ??
      (bootstrapQuery.isError ? messages.boardUnavailable : null),
    persistAuthenticatedBoard,
  };
};

export default useAuthenticatedBoardSync;
