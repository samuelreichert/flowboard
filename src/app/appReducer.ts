import { fetchBoardState } from '../storage';
import { fetchThemePreference, resolveThemePreference } from '../theme';
import {
  fetchLanguagePreference,
  resolveBrowserLanguage,
  resolveLanguagePreference,
} from '../localization';
import type { AppAction, AppState } from './appTypes';

export const initAppState = (): AppState => {
  const themePreference = fetchThemePreference();
  const languagePreference = fetchLanguagePreference();
  const systemLanguage = resolveBrowserLanguage();
  const boardState = fetchBoardState();

  return {
    activeWorkCycle: boardState.activeWorkCycle,
    clearBoardOpen: false,
    completionAcknowledgement: false,
    columns: boardState.columns,
    columnCount: boardState.columns.length,
    completeWorkOpen: false,
    languagePreference,
    manageColumnsOpen: false,
    mobileSidebarOpen: false,
    profileDialogOpen: false,
    resolvedLanguage: resolveLanguagePreference(
      languagePreference,
      systemLanguage
    ),
    resolvedTheme: resolveThemePreference(themePreference),
    settingsOpen: false,
    sidebarExpanded: true,
    storageVersion: 0,
    systemLanguage,
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
        storageVersion: state.storageVersion + 1,
        tags: action.state.tags,
      };
    case 'boardStateSynced':
      return {
        ...state,
        activeWorkCycle: action.state.activeWorkCycle,
        columns: action.state.columns,
        columnCount: action.state.columns.length,
        tags: action.state.tags,
      };
    case 'clearBoardOpenChanged':
      return { ...state, clearBoardOpen: action.open };
    case 'completeWorkOpenChanged':
      return { ...state, completeWorkOpen: action.open };
    case 'completionAcknowledgementChanged':
      return { ...state, completionAcknowledgement: action.active };
    case 'languagePreferenceChanged':
      return {
        ...state,
        languagePreference: action.preference,
        resolvedLanguage: resolveLanguagePreference(
          action.preference,
          state.systemLanguage
        ),
      };
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
        activeWorkCycle: action.state.activeWorkCycle,
        columns: action.state.columns,
        columnCount: action.state.columns.length,
        storageVersion: state.storageVersion + 1,
        tags: action.state.tags,
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
