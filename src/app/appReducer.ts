import { fetchBoardState, fetchStorage } from '../storage';
import { fetchThemePreference, resolveThemePreference } from '../theme';
import type { AppAction, AppState } from './appTypes';

export const initAppState = (): AppState => {
  const themePreference = fetchThemePreference();
  const boardState = fetchBoardState();

  return {
    activeWorkCycle: boardState.activeWorkCycle,
    clearBoardOpen: false,
    columns: boardState.columns,
    columnCount: boardState.columns.length,
    completeWorkOpen: false,
    completedWorkCycles: boardState.completedWorkCycles,
    completionPulse: false,
    currentView: 'board',
    manageColumnsOpen: false,
    mobileSidebarOpen: false,
    profileDialogOpen: false,
    resolvedTheme: resolveThemePreference(themePreference),
    settingsOpen: false,
    sidebarExpanded: true,
    storageVersion: 0,
    tagManagerOpen: false,
    tags: boardState.tags,
    themePreference,
  };
};

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'activeWorkCycleChanged':
      return {
        ...state,
        activeWorkCycle: action.activeWorkCycle,
      };
    case 'boardStateChanged':
      return {
        ...state,
        activeWorkCycle: action.state.activeWorkCycle,
        columns: action.state.columns,
        columnCount: action.state.columns.length,
        completedWorkCycles: action.state.completedWorkCycles,
        storageVersion: state.storageVersion + 1,
        tags: action.state.tags,
      };
    case 'boardStateSynced':
      return {
        ...state,
        activeWorkCycle: action.state.activeWorkCycle,
        columns: action.state.columns,
        columnCount: action.state.columns.length,
        completedWorkCycles: action.state.completedWorkCycles,
        tags: action.state.tags,
      };
    case 'clearBoardOpenChanged':
      return { ...state, clearBoardOpen: action.open };
    case 'columnCountChanged':
      return { ...state, columnCount: action.columnCount };
    case 'completeWorkOpenChanged':
      return { ...state, completeWorkOpen: action.open };
    case 'completionPulseChanged':
      return { ...state, completionPulse: action.active };
    case 'currentViewChanged':
      return { ...state, currentView: action.view };
    case 'manageColumnsOpenChanged':
      return { ...state, manageColumnsOpen: action.open };
    case 'mobileSidebarOpenChanged':
      return { ...state, mobileSidebarOpen: action.open };
    case 'profileDialogOpenChanged':
      return { ...state, profileDialogOpen: action.open };
    case 'settingsOpenChanged':
      return { ...state, settingsOpen: action.open };
    case 'sidebarExpandedChanged':
      return { ...state, sidebarExpanded: action.expanded };
    case 'storageHydrated':
      return {
        ...state,
        activeWorkCycle: fetchBoardState().activeWorkCycle,
        columns: fetchStorage(),
        columnCount: action.columnCount,
        completedWorkCycles: fetchBoardState().completedWorkCycles,
        storageVersion: state.storageVersion + 1,
        tags: action.tags,
      };
    case 'storageVersionIncremented':
      return { ...state, storageVersion: state.storageVersion + 1 };
    case 'systemThemeChanged':
      return { ...state, resolvedTheme: action.resolvedTheme };
    case 'tagManagerOpenChanged':
      return { ...state, tagManagerOpen: action.open };
    case 'tagsChanged':
      return { ...state, tags: action.tags };
    case 'themePreferenceChanged':
      return {
        ...state,
        resolvedTheme: resolveThemePreference(action.preference),
        themePreference: action.preference,
      };
  }
};
