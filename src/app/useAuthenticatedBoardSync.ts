import { useEffect, useState } from 'react';
import type { Dispatch } from 'react';

import { fetchBoardState, updateBoardStateStorage } from '../storage';
import {
  fetchAuthenticatedDefaultBoard,
  saveAuthenticatedBoard,
} from '../storage/authenticatedApi';
import type { BoardState } from '../types';
import type { Messages } from '../localization';
import type { AppAction } from './appTypes';
import type { AuthState } from './useAuthSession';

const hasBoardData = (state: BoardState) =>
  state.columns.length > 0 ||
  state.tags.length > 0 ||
  state.completedWorkCycles.length > 0;

const useAuthenticatedBoardSync = (
  authState: AuthState,
  dispatch: Dispatch<AppAction>,
  messages: Messages['app']['persistence']
) => {
  const [authenticatedBoard, setAuthenticatedBoard] = useState<{
    id: string;
    title: string;
    updatedAt: string;
  } | null>(null);
  const [authenticatedBoardLoading, setAuthenticatedBoardLoading] =
    useState(false);
  const [persistenceMessage, setPersistenceMessage] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (authState.status !== 'signedIn') {
      setAuthenticatedBoard(null);
      setAuthenticatedBoardLoading(false);
      return;
    }

    let active = true;
    const localStateBeforeLoad = fetchBoardState();

    setAuthenticatedBoardLoading(true);
    setPersistenceMessage(messages.loadingBoard);
    void fetchAuthenticatedDefaultBoard(authState.session.access_token)
      .then(async (payload) => {
        if (!active) {
          return;
        }

        if (
          hasBoardData(localStateBeforeLoad) &&
          !hasBoardData(payload.state)
        ) {
          setPersistenceMessage(messages.importingBoard);
          payload = await saveAuthenticatedBoard(
            payload.board.id,
            localStateBeforeLoad,
            authState.session.access_token
          );
        }

        updateBoardStateStorage(payload.state);
        setAuthenticatedBoard(payload.board);
        setAuthenticatedBoardLoading(false);
        setPersistenceMessage(null);
        dispatch({ state: payload.state, type: 'boardStateSynced' });
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setPersistenceMessage(messages.boardUnavailable);
        setAuthenticatedBoardLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authState, dispatch, messages]);

  const persistAuthenticatedBoard = (nextState: BoardState) => {
    if (authState.status !== 'signedIn' || !authenticatedBoard) {
      return;
    }

    setPersistenceMessage(messages.saving);
    void saveAuthenticatedBoard(
      authenticatedBoard.id,
      nextState,
      authState.session.access_token
    )
      .then((payload) => {
        setAuthenticatedBoard(payload.board);
        setPersistenceMessage(null);
      })
      .catch(() => setPersistenceMessage(messages.unsaved));
  };

  return {
    authenticatedBoardLoading,
    persistenceMessage,
    persistAuthenticatedBoard,
  };
};

export default useAuthenticatedBoardSync;
