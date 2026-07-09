import { useEffect, useReducer, useRef } from 'react';

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
import { getSystemTheme, updateThemePreference } from '../theme';
import type { ThemePreference } from '../theme';
import type { BoardTag } from '../types';
import { appReducer, initAppState } from './appReducer';
import { getThemeIconSrc } from './appTheme';

const useAppController = () => {
  const [state, dispatch] = useReducer(appReducer, undefined, initAppState);
  const completionPulseTimeoutRef = useRef<number | null>(null);
  const {
    activeWorkCycle,
    boardSettingsOpen,
    clearBoardOpen,
    columns,
    columnCount,
    completeWorkOpen,
    completedWorkCycles,
    completionPulse,
    currentView,
    mobileSidebarOpen,
    resolvedTheme,
    sidebarExpanded,
    storageVersion,
    tagManagerOpen,
    tags,
    themePreference,
  } = state;

  useEffect(() => {
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

  const updateTags = (newTags: BoardTag[]) => {
    dispatch({ tags: newTags, type: 'tagsChanged' });
    updateTagStorage(newTags);
  };

  const syncBoardState = () =>
    dispatch({ state: fetchBoardState(), type: 'boardStateSynced' });

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
    dispatch({ state: fetchBoardState(), type: 'boardStateChanged' });
  };

  const clearBoard = () => {
    updateStorage([]);
    dispatch({ state: fetchBoardState(), type: 'boardStateChanged' });
  };

  const chooseThemePreference = (preference: ThemePreference) => {
    dispatch({ preference, type: 'themePreferenceChanged' });
    updateThemePreference(preference);
  };

  const openTagManager = () => {
    dispatch({ open: true, type: 'tagManagerOpenChanged' });
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

  const openBoardSettings = () => {
    dispatch({ open: true, type: 'boardSettingsOpenChanged' });
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
  };

  const openClearBoardConfirmation = () => {
    dispatch({ open: true, type: 'clearBoardOpenChanged' });
    dispatch({ open: false, type: 'boardSettingsOpenChanged' });
    dispatch({ open: false, type: 'mobileSidebarOpenChanged' });
  };

  const openCompleteWorkConfirmation = () => {
    const latestState = fetchBoardState();
    const completedColumn = latestState.columns.find(
      (column) => column.id === latestState.activeWorkCycle.completedColumnId
    );

    if (!completedColumn) {
      openBoardSettings();
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
        openBoardSettings();
      }

      return;
    }

    const nextState = completeWorkCycle(latestState, completedAt);

    if (!nextState) {
      openBoardSettings();
      return;
    }

    updateBoardStateStorage(nextState);
    dispatch({ state: nextState, type: 'boardStateChanged' });
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

  const setBoardSettingsOpen = (open: boolean) =>
    dispatch({ open, type: 'boardSettingsOpenChanged' });

  const setClearBoardOpen = (open: boolean) =>
    dispatch({ open, type: 'clearBoardOpenChanged' });

  const setCompleteWorkOpen = (open: boolean) =>
    dispatch({ open, type: 'completeWorkOpenChanged' });

  const setTagManagerOpen = (open: boolean) =>
    dispatch({ open, type: 'tagManagerOpenChanged' });

  const completedColumn = columns.find(
    (column) => column.id === activeWorkCycle.completedColumnId
  );
  const completedCardCount = completedColumn?.cards.length ?? 0;
  const canCompleteWork = Boolean(completedColumn && completedCardCount > 0);
  const completeWorkDisabledReason = activeWorkCycle.completedColumnId
    ? 'Add cards to the completed column before completing work'
    : 'Choose a completed column in board settings before completing work';

  return {
    activeWorkCycle,
    boardSettingsOpen,
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
    mobileSidebarOpen,
    openBoard,
    openBoardSettings,
    openClearBoardConfirmation,
    openCompleteWorkConfirmation,
    openHistory,
    openMobileSidebar,
    openTagManager,
    resolvedTheme,
    setBoardSettingsOpen,
    setClearBoardOpen,
    setCompleteWorkOpen,
    setTagManagerOpen,
    sidebarExpanded,
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
