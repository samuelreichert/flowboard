import { useEffect } from 'react';
import type { Dispatch } from 'react';

import {
  dismissToast,
  notifyBoardLoading,
  notifyBoardUnavailable,
  TOAST_IDS,
} from '../components/ToastNotifications/toastNotifications';
import type { Messages } from '../localization';
import { fetchBoardState, updateBoardStateStorage } from '../storage';
import type { AppAction } from './appTypes';
import type { AuthState } from './useAuthSession';
import { createBoardStateFromBootstrap } from './boardBootstrap';
import { useBoardBootstrapQuery } from './useFlowboardQueries';

const useAuthenticatedBoardSync = (
  authState: AuthState,
  dispatch: Dispatch<AppAction>,
  messages: Messages['app']
) => {
  const accessToken =
    authState.status === 'signedIn'
      ? authState.session.access_token
      : undefined;
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

  useEffect(() => {
    if (!shouldLoadBoard) {
      dismissToast(TOAST_IDS.boardLoad);
      return;
    }

    if (bootstrapQuery.isPending || bootstrapQuery.isFetching) {
      notifyBoardLoading(messages);
      return;
    }

    dismissToast(TOAST_IDS.boardLoad);

    if (bootstrapQuery.isError) {
      notifyBoardUnavailable(messages);
    }
  }, [
    bootstrapQuery.isError,
    bootstrapQuery.isFetching,
    bootstrapQuery.isPending,
    messages,
    shouldLoadBoard,
  ]);

  return {
    authenticatedBoardLoading:
      authState.status === 'signedIn' &&
      !bootstrapQuery.data &&
      !bootstrapQuery.isError,
  };
};

export default useAuthenticatedBoardSync;
