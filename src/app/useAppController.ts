import { useEffect, useReducer, useRef } from 'react';

import { isSupabaseConfigured, supabase } from '../auth/supabase';
import { LOCAL_PROFILE_IDENTITY } from '../auth/profileDisplay';
import { getMessages } from '../localization';
import { hydrateStorageFromDatabase } from '../storage';
import { appReducer, initAppState } from './appReducer';
import useBoardActions from './useBoardActions';
import useAuthenticatedBoardSync from './useAuthenticatedBoardSync';
import useAuthenticatedProfile from './useAuthenticatedProfile';
import useAppThemeEffects from './useAppThemeEffects';
import useAuthSession from './useAuthSession';

const useAppController = () => {
  const [state, dispatch] = useReducer(appReducer, undefined, initAppState);
  const {
    activeWorkCycle,
    clearBoardOpen,
    columns,
    columnCount,
    completeWorkOpen,
    completedWorkCycles,
    completionPulse,
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
  const persistenceMessagesRef = useRef(messages.app.persistence);
  const { authState, requestMagicLink, requestSocialAuth, signOut } =
    useAuthSession(messages.app.auth);
  const {
    authenticatedBoardLoading,
    persistenceMessage,
    persistAuthenticatedBoard,
    setAuthenticatedBoardLoading,
    setPersistenceMessage,
  } = useAuthenticatedBoardSync(
    authState,
    dispatch,
    messages.app.persistence
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
    updateColumns,
    updateTags,
  } = useBoardActions({
    activeWorkCycle,
    dispatch,
    openSettings,
    persistAuthenticatedBoard,
    tags,
  });

  useEffect(() => {
    persistenceMessagesRef.current = messages.app.persistence;
  }, [messages.app.persistence]);

  useEffect(() => {
    if (supabase) {
      return;
    }

    let active = true;

    setAuthenticatedBoardLoading(true);
    setPersistenceMessage(persistenceMessagesRef.current.loadingLocalBoard);
    void hydrateStorageFromDatabase().then((state) => {
      if (!active) {
        return;
      }

      setAuthenticatedBoardLoading(false);

      if (!state) {
        setPersistenceMessage(
          persistenceMessagesRef.current.localDatabaseUnavailable
        );
        return;
      }

      setPersistenceMessage(null);
      dispatch({
        state,
        type: 'storageHydrated',
      });
    });

    return () => {
      active = false;
    };
  }, [setAuthenticatedBoardLoading, setPersistenceMessage]);

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
    chooseLanguagePreference,
    completeWorkDisabledReason,
    chooseCompletedColumn,
    chooseThemePreference,
    clearBoard,
    clearBoardOpen,
    closeMobileSidebar,
    columnCount,
    columns,
    completeWorkOpen,
    completedCardCount,
    completedColumn,
    completedWorkCycles,
    completionPulse,
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
    persistenceMessage,
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
    updateColumns,
    updateTags,
  };
};

export default useAppController;
