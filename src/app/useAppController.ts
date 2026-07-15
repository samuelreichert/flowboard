import { useEffect, useReducer, useRef, useState } from 'react';

import {
  isSupabaseConfigured,
  getOAuthRedirectTo,
  signInWithSocialProvider,
  supabase,
  type SocialAuthProvider,
  type SupabaseSession,
} from '../auth/supabase';
import {
  getProfileFromSession,
  LOCAL_PROFILE_IDENTITY,
} from '../auth/profileDisplay';
import {
  removeProfileAvatar,
  uploadProfileAvatar,
} from '../auth/profileAvatar';
import { completeWorkCycle } from '../board/completedWork';
import {
  fetchBoardState,
  fetchStorage,
  hydrateStorageFromDatabase,
  updateActiveWorkCycleStorage,
  updateBoardStateStorage,
  updateTagStorage,
  updateStorage,
} from '../storage';
import {
  fetchAuthenticatedProfile,
  fetchAuthenticatedDefaultBoard,
  saveAuthenticatedProfile,
  saveAuthenticatedBoard,
  type AuthenticatedProfile,
} from '../storage/authenticatedApi';
import { getSystemTheme, updateThemePreference } from '../theme';
import type { ThemePreference } from '../theme';
import type { BoardState, BoardTag } from '../types';
import { appReducer, initAppState } from './appReducer';
import { getThemeIconSrc } from './appTheme';

type AuthState =
  | {
      message: string | null;
      session: null;
      status: 'loading' | 'signedOut' | 'static';
    }
  | {
      message: string | null;
      session: SupabaseSession;
      status: 'signedIn';
    };

const hasBoardData = (state: BoardState) =>
  state.columns.length > 0 ||
  state.tags.length > 0 ||
  state.completedWorkCycles.length > 0;

const useAppController = () => {
  const [state, dispatch] = useReducer(appReducer, undefined, initAppState);
  const [authState, setAuthState] = useState<AuthState>(() =>
    isSupabaseConfigured
      ? { message: null, session: null, status: 'loading' }
      : { message: null, session: null, status: 'static' }
  );
  const [authenticatedBoard, setAuthenticatedBoard] = useState<{
    id: string;
    title: string;
    updatedAt: string;
  } | null>(null);
  const [authenticatedBoardLoading, setAuthenticatedBoardLoading] =
    useState(false);
  const [authenticatedProfile, setAuthenticatedProfile] =
    useState<AuthenticatedProfile | null>(null);
  const [persistenceMessage, setPersistenceMessage] = useState<string | null>(
    null
  );
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const completionPulseTimeoutRef = useRef<number | null>(null);
  const {
    activeWorkCycle,
    clearBoardOpen,
    columns,
    columnCount,
    completeWorkOpen,
    completedWorkCycles,
    completionPulse,
    currentView,
    manageColumnsOpen,
    mobileSidebarOpen,
    profileDialogOpen,
    resolvedTheme,
    settingsOpen,
    sidebarExpanded,
    storageVersion,
    tagManagerOpen,
    tags,
    themePreference,
  } = state;

  useEffect(() => {
    if (supabase) {
      return;
    }

    let active = true;

    void hydrateStorageFromDatabase().then((state) => {
      if (!active || !state) {
        return;
      }

      dispatch({
        columnCount: state.columns.length,
        tags: state.tags,
        type: 'storageHydrated',
      });
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) {
        return;
      }

      setAuthState(
        data.session
          ? { message: null, session: data.session, status: 'signedIn' }
          : { message: null, session: null, status: 'signedOut' }
      );
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState(
        session
          ? { message: null, session, status: 'signedIn' }
          : { message: null, session: null, status: 'signedOut' }
      );
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (authState.status !== 'signedIn') {
      setAuthenticatedBoard(null);
      setAuthenticatedBoardLoading(false);
      setAuthenticatedProfile(null);
      return;
    }

    let active = true;
    const localStateBeforeLoad = fetchBoardState();

    setAuthenticatedBoardLoading(true);
    setPersistenceMessage('Loading your board...');
    void fetchAuthenticatedDefaultBoard(authState.session.access_token)
      .then(async (payload) => {
        if (!active) {
          return;
        }

        if (
          hasBoardData(localStateBeforeLoad) &&
          !hasBoardData(payload.state)
        ) {
          setPersistenceMessage('Importing your local board...');
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

        setPersistenceMessage(
          'Your cloud board is unavailable. Check your connection and try again.'
        );
        setAuthenticatedBoardLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authState]);

  useEffect(() => {
    if (authState.status !== 'signedIn') {
      return;
    }

    let active = true;

    void fetchAuthenticatedProfile(authState.session.access_token)
      .then((payload) => {
        if (!active) {
          return;
        }

        setAuthenticatedProfile(payload.profile);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setProfileError('Your profile is unavailable. Try again in a moment.');
      });

    return () => {
      active = false;
    };
  }, [authState]);

  useEffect(() => {
    if (
      themePreference !== 'system' ||
      typeof window.matchMedia !== 'function'
    ) {
      return;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystemThemeChange = () =>
      dispatch({
        resolvedTheme: getSystemTheme(),
        type: 'systemThemeChanged',
      });

    media.addEventListener('change', onSystemThemeChange);

    return () => media.removeEventListener('change', onSystemThemeChange);
  }, [themePreference]);

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    let favicon = document.querySelector<HTMLLinkElement>('#flowboard-favicon');

    if (!favicon) {
      favicon = document.createElement('link');
      favicon.id = 'flowboard-favicon';
      favicon.rel = 'icon';
      favicon.type = 'image/svg+xml';
      document.head.append(favicon);
    }

    favicon.href = getThemeIconSrc(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(
    () => () => {
      if (completionPulseTimeoutRef.current !== null) {
        window.clearTimeout(completionPulseTimeoutRef.current);
      }
    },
    []
  );

  const persistAuthenticatedBoard = (nextState: BoardState) => {
    if (authState.status !== 'signedIn' || !authenticatedBoard) {
      return;
    }

    setPersistenceMessage('Saving...');
    void saveAuthenticatedBoard(
      authenticatedBoard.id,
      nextState,
      authState.session.access_token
    )
      .then((payload) => {
        setAuthenticatedBoard(payload.board);
        setPersistenceMessage(null);
      })
      .catch(() =>
        setPersistenceMessage(
          'Changes are not durably saved yet. Check your connection and try again.'
        )
      );
  };

  const updateTags = (newTags: BoardTag[]) => {
    dispatch({ tags: newTags, type: 'tagsChanged' });
    updateTagStorage(newTags);
    persistAuthenticatedBoard(fetchBoardState());
  };

  const syncBoardState = () => {
    const nextState = fetchBoardState();

    dispatch({ state: nextState, type: 'boardStateSynced' });
    persistAuthenticatedBoard(nextState);
  };

  const deleteTag = (tagId: string) => {
    updateTags(tags.filter((tag) => tag.id !== tagId));
    updateStorage(
      fetchStorage().map((column) => ({
        ...column,
        cards: column.cards.map((card) => ({
          ...card,
          tagIds: card.tagIds.filter((cardTagId) => cardTagId !== tagId),
        })),
      }))
    );
    const nextState = fetchBoardState();

    dispatch({ state: nextState, type: 'boardStateChanged' });
    persistAuthenticatedBoard(nextState);
  };

  const clearBoard = () => {
    updateStorage([]);
    const nextState = fetchBoardState();

    dispatch({ state: nextState, type: 'boardStateChanged' });
    persistAuthenticatedBoard(nextState);
  };

  const chooseThemePreference = (preference: ThemePreference) => {
    dispatch({ preference, type: 'themePreferenceChanged' });
    updateThemePreference(preference);
  };

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

  const openSettings = () => {
    dispatch({ open: true, type: 'settingsOpenChanged' });
    dispatch({ open: false, type: 'mobileSidebarOpenChanged' });
  };

  const openProfileDialog = () => {
    if (!activeAuthenticatedProfile) {
      return;
    }

    setProfileError(null);
    dispatch({ open: true, type: 'profileDialogOpenChanged' });
    dispatch({ open: false, type: 'mobileSidebarOpenChanged' });
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
    persistAuthenticatedBoard(fetchBoardState());
  };

  const openClearBoardConfirmation = () => {
    dispatch({ open: true, type: 'clearBoardOpenChanged' });
    dispatch({ open: false, type: 'settingsOpenChanged' });
    dispatch({ open: false, type: 'mobileSidebarOpenChanged' });
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
    persistAuthenticatedBoard(nextState);
    dispatch({ active: true, type: 'completionPulseChanged' });
    if (completionPulseTimeoutRef.current !== null) {
      window.clearTimeout(completionPulseTimeoutRef.current);
    }
    completionPulseTimeoutRef.current = window.setTimeout(
      () => dispatch({ active: false, type: 'completionPulseChanged' }),
      900
    );
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

  const updateColumnCount = (nextColumnCount: number) =>
    dispatch({
      columnCount: nextColumnCount,
      type: 'columnCountChanged',
    });

  const setProfileDialogOpen = (open: boolean) => {
    if (!open) {
      setProfileError(null);
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

  const requestMagicLink = async (email: string, nextDestination?: string) => {
    if (!supabase) {
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getOAuthRedirectTo(nextDestination),
      },
    });

    setAuthState({
      message: error
        ? 'Unable to send a sign-in link right now.'
        : 'Check your email for a sign-in link.',
      session: null,
      status: 'signedOut',
    });
  };

  const requestSocialAuth = async (
    provider: SocialAuthProvider,
    nextDestination?: string
  ) => {
    const { error } = await signInWithSocialProvider(provider, nextDestination);

    setAuthState({
      message: error
        ? `Unable to start ${provider.label} sign-in right now.`
        : `Opening ${provider.label} sign-in...`,
      session: null,
      status: 'signedOut',
    });
  };

  const signOut = () => {
    if (!supabase) {
      return;
    }

    void supabase.auth.signOut();
  };

  const saveProfile = async ({
    avatarFile,
    displayName,
    removeAvatar,
  }: {
    avatarFile: File | null;
    displayName: string;
    removeAvatar: boolean;
  }) => {
    if (authState.status !== 'signedIn' || !activeAuthenticatedProfile) {
      return;
    }

    setProfileSaving(true);
    setProfileError(null);

    try {
      const profileUpdate: {
        avatarStoragePath?: string | null;
        avatarUrl?: string | null;
        displayName: string;
      } = {
        displayName,
      };

      if (avatarFile) {
        const uploadedAvatar = await uploadProfileAvatar(
          avatarFile,
          activeAuthenticatedProfile.id,
          activeAuthenticatedProfile.avatarStoragePath
        );

        profileUpdate.avatarStoragePath = uploadedAvatar.avatarStoragePath;
        profileUpdate.avatarUrl = uploadedAvatar.avatarUrl;
      } else if (removeAvatar) {
        await removeProfileAvatar(activeAuthenticatedProfile.avatarStoragePath);
        profileUpdate.avatarStoragePath = null;
        profileUpdate.avatarUrl = null;
      }

      const payload = await saveAuthenticatedProfile(
        profileUpdate,
        authState.session.access_token
      );

      setAuthenticatedProfile(payload.profile);
      dispatch({ open: false, type: 'profileDialogOpenChanged' });
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : 'Unable to save profile.'
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const completedColumn = columns.find(
    (column) => column.id === activeWorkCycle.completedColumnId
  );
  const completedCardCount = completedColumn?.cards.length ?? 0;
  const canCompleteWork = Boolean(completedColumn && completedCardCount > 0);
  const completeWorkDisabledReason = activeWorkCycle.completedColumnId
    ? 'Add cards to the completed column before completing work'
    : 'Choose a completed column in settings before completing work';
  const sessionProfile =
    authState.status === 'signedIn'
      ? getProfileFromSession(authState.session)
      : null;
  const activeAuthenticatedProfile = authenticatedProfile ?? sessionProfile;
  const profileIdentity =
    authState.status === 'signedIn'
      ? activeAuthenticatedProfile
      : isSupabaseConfigured
        ? null
        : LOCAL_PROFILE_IDENTITY;

  return {
    activeWorkCycle,
    authState,
    authenticatedBoardLoading,
    authenticatedProfile: activeAuthenticatedProfile,
    canCompleteWork,
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
    syncBoardState,
    tagManagerOpen,
    tags,
    themePreference,
    toggleSidebar,
    updateColumnCount,
    updateTags,
  };
};

export default useAppController;
