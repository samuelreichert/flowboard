import { useEffect, useReducer, useRef } from 'react';

import { isSupabaseConfigured } from '../auth/supabase';
import { LOCAL_PROFILE_IDENTITY } from '../auth/profileDisplay';
import { notifyPersistenceFailure } from '../components/ToastNotifications';
import { getMessages } from '../localization';
import { appReducer, initAppState } from './appReducer';
import useBoardActions from './useBoardActions';
import useAuthenticatedBoardSync from './useAuthenticatedBoardSync';
import useAuthenticatedProfile from './useAuthenticatedProfile';
import useAppThemeEffects from './useAppThemeEffects';
import useAuthSession from './useAuthSession';
import { clearFlowboardQueryCache } from './queryClient';
import { useFlowboardBoardMutations } from './useFlowboardBoardMutations';
import { useFlowboardCardMutations } from './useFlowboardCardMutations';

const useAppController = () => {
  const [state, dispatch] = useReducer(appReducer, undefined, initAppState);
  const {
    activeWorkCycle,
    clearBoardOpen,
    columns,
    columnCount,
    completionAcknowledgement,
    completeWorkOpen,
    completedWorkCycles,
    currentView,
    languagePreference,
    manageColumnsOpen,
    mobileSidebarOpen,
    profileDialogOpen,
    resolvedLanguage,
    resolvedTheme,
    settingsOpen,
    sidebarExpanded,
    storageVersion,
    systemLanguage,
    tagManagerOpen,
    tags,
    themePreference,
  } = state;
  const messages = getMessages(resolvedLanguage);
  const authenticatedUserIdRef = useRef<string | null | undefined>(undefined);
  const { authState, requestMagicLink, requestSocialAuth, signOut } =
    useAuthSession(messages.app.auth);
  const cardMutations = useFlowboardCardMutations({
    accessToken:
      authState.status === 'signedIn'
        ? authState.session.access_token
        : undefined,
    onMutationError: () => notifyPersistenceFailure(messages.app),
  });
  const boardMutations = useFlowboardBoardMutations({
    accessToken:
      authState.status === 'signedIn'
        ? authState.session.access_token
        : undefined,
    onMutationError: () => notifyPersistenceFailure(messages.app),
  });
  const { authenticatedBoardLoading } = useAuthenticatedBoardSync(
    authState,
    dispatch,
    messages.app
  );
  const {
    authenticatedProfile,
    clearProfileError,
    profileError,
    profileSaving,
    saveProfile,
  } = useAuthenticatedProfile(authState, dispatch, messages.app.persistence);
  const { chooseLanguagePreference, chooseThemePreference } =
    useAppThemeEffects({
      dispatch,
      resolvedLanguage,
      resolvedTheme,
      themePreference,
    });
  const openSettings = () => {
    dispatch({ open: true, type: 'settingsOpenChanged' });
    dispatch({ open: false, type: 'mobileSidebarOpenChanged' });
  };
  const {
    chooseCompletedColumn,
    clearBoard,
    confirmCompleteWork,
    deleteTag,
    openCompleteWorkConfirmation,
    updateCardColumns,
    updateColumns,
    updateTags,
  } = useBoardActions({
    activeWorkCycle,
    dispatch,
    boardMutations,
    openSettings,
    tags,
  });

  useEffect(() => {
    const authenticatedUserId =
      authState.status === 'signedIn' ? authState.session.user.id : null;

    if (
      authenticatedUserIdRef.current !== undefined &&
      authenticatedUserIdRef.current !== authenticatedUserId
    ) {
      clearFlowboardQueryCache();
    }

    authenticatedUserIdRef.current = authenticatedUserId;
  }, [authState]);

  const openTagManager = () => {
    dispatch({ open: true, type: 'tagManagerOpenChanged' });
    dispatch({ open: false, type: 'mobileSidebarOpenChanged' });
  };

  const openManageColumns = () => {
    dispatch({ open: true, type: 'manageColumnsOpenChanged' });
    dispatch({ open: false, type: 'mobileSidebarOpenChanged' });
  };

  const openBoard = () => {
    dispatch({ view: 'board', type: 'currentViewChanged' });
    dispatch({ open: false, type: 'mobileSidebarOpenChanged' });
  };

  const openHistory = () => {
    dispatch({ view: 'history', type: 'currentViewChanged' });
    dispatch({ open: false, type: 'mobileSidebarOpenChanged' });
  };

  const openProfileDialog = () => {
    if (!authenticatedProfile) {
      return;
    }

    clearProfileError();
    dispatch({ open: true, type: 'profileDialogOpenChanged' });
    dispatch({ open: false, type: 'mobileSidebarOpenChanged' });
  };

  const openClearBoardConfirmation = () => {
    dispatch({ open: true, type: 'clearBoardOpenChanged' });
    dispatch({ open: false, type: 'settingsOpenChanged' });
    dispatch({ open: false, type: 'mobileSidebarOpenChanged' });
  };

  const closeMobileSidebar = () =>
    dispatch({ open: false, type: 'mobileSidebarOpenChanged' });

  const toggleSidebar = () =>
    dispatch({
      expanded: !sidebarExpanded,
      type: 'sidebarExpandedChanged',
    });

  const openMobileSidebar = () =>
    dispatch({ open: true, type: 'mobileSidebarOpenChanged' });

  const setProfileDialogOpen = (open: boolean) => {
    if (!open) {
      clearProfileError();
    }

    dispatch({ open, type: 'profileDialogOpenChanged' });
  };

  const setSettingsOpen = (open: boolean) =>
    dispatch({ open, type: 'settingsOpenChanged' });

  const setClearBoardOpen = (open: boolean) =>
    dispatch({ open, type: 'clearBoardOpenChanged' });

  const setCompleteWorkOpen = (open: boolean) =>
    dispatch({ open, type: 'completeWorkOpenChanged' });

  const setManageColumnsOpen = (open: boolean) =>
    dispatch({ open, type: 'manageColumnsOpenChanged' });

  const setTagManagerOpen = (open: boolean) =>
    dispatch({ open, type: 'tagManagerOpenChanged' });

  const completedColumn = columns.find(
    (column) => column.id === activeWorkCycle.completedColumnId
  );
  const completedCardCount = completedColumn?.cards.length ?? 0;
  const canCompleteWork = Boolean(completedColumn && completedCardCount > 0);
  const completeWorkDisabledReason = activeWorkCycle.completedColumnId
    ? messages.app.workspace.completeWorkNeedsCards
    : messages.app.workspace.completeWorkNeedsColumn;
  const profileIdentity =
    authState.status === 'signedIn'
      ? authenticatedProfile
      : isSupabaseConfigured
        ? null
        : LOCAL_PROFILE_IDENTITY;

  return {
    activeWorkCycle,
    authState,
    authenticatedBoardLoading,
    authenticatedProfile,
    canCompleteWork,
    boardMutations,
    cardMutations,
    chooseLanguagePreference,
    completeWorkDisabledReason,
    chooseCompletedColumn,
    chooseThemePreference,
    clearBoard,
    clearBoardOpen,
    closeMobileSidebar,
    columnCount,
    columns,
    completionAcknowledgement,
    completeWorkOpen,
    completedCardCount,
    completedColumn,
    completedWorkCycles,
    confirmCompleteWork,
    currentView,
    deleteTag,
    languagePreference,
    manageColumnsOpen,
    mobileSidebarOpen,
    openBoard,
    openClearBoardConfirmation,
    openCompleteWorkConfirmation,
    openHistory,
    openManageColumns,
    openMobileSidebar,
    openProfileDialog,
    openSettings,
    openTagManager,
    profileDialogOpen,
    profileError,
    profileIdentity,
    profileSaving,
    requestMagicLink,
    requestSocialAuth,
    resolvedLanguage,
    resolvedTheme,
    setClearBoardOpen,
    setCompleteWorkOpen,
    setManageColumnsOpen,
    setProfileDialogOpen,
    setSettingsOpen,
    setTagManagerOpen,
    saveProfile,
    settingsOpen,
    sidebarExpanded,
    signOut,
    storageVersion,
    systemLanguage,
    tagManagerOpen,
    tags,
    themePreference,
    toggleSidebar,
    updateCardColumns,
    updateColumns,
    updateTags,
  };
};

export default useAppController;
