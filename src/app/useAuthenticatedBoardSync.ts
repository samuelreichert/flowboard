import { useEffect } from 'react';
import type { Dispatch } from 'react';

import { fetchBoardState, updateBoardStateStorage } from '../storage';
import type { Messages } from '../localization';
import type { AppAction } from './appTypes';
import type { AuthState } from './useAuthSession';
import { createBoardStateFromBootstrap } from './boardBootstrap';
import { useBoardBootstrapQuery } from './useFlowboardQueries';

const useAuthenticatedBoardSync = (
  authState: AuthState,
  dispatch: Dispatch<AppAction>,
  messages: Messages['app']['persistence']
) => {
  const accessToken =
    authState.status === 'signedIn' ? authState.session.access_token : undefined;
  const shouldLoadBoard =
    authState.status === 'signedIn' || authState.status === 'static';
  const bootstrapQuery = useBoardBootstrapQuery({
    accessToken,
    enabled: shouldLoadBoard,
  });

  useEffect(() => {
    if (!shouldLoadBoard || !bootstrapQuery.data) {
      return;
    }

    const state = createBoardStateFromBootstrap(
      bootstrapQuery.data,
      fetchBoardState()
    );

    updateBoardStateStorage(state);
    dispatch({ state, type: 'boardStateSynced' });
  }, [bootstrapQuery.data, dispatch, shouldLoadBoard]);

  return {
    authenticatedBoardLoading:
      shouldLoadBoard && (bootstrapQuery.isPending || bootstrapQuery.isFetching),
    persistenceMessage:
      (shouldLoadBoard && (bootstrapQuery.isPending || bootstrapQuery.isFetching)
        ? messages.loadingBoard
        : null) ??
      (bootstrapQuery.isError ? messages.boardUnavailable : null),
  };
};

export default useAuthenticatedBoardSync;
