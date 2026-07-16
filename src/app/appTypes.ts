import type { ResolvedTheme, ThemePreference } from '../theme';
import type {
  BoardActiveWorkCycle,
  BoardColumn,
  BoardState,
  BoardTag,
  CompletedWorkCycle,
} from '../types';

export type AppView = 'board' | 'history';

export type AppState = {
  activeWorkCycle: BoardActiveWorkCycle;
  clearBoardOpen: boolean;
  columns: BoardColumn[];
  columnCount: number;
  completeWorkOpen: boolean;
  completedWorkCycles: CompletedWorkCycle[];
  completionPulse: boolean;
  currentView: AppView;
  manageColumnsOpen: boolean;
  mobileSidebarOpen: boolean;
  profileDialogOpen: boolean;
  resolvedTheme: ResolvedTheme;
  settingsOpen: boolean;
  sidebarExpanded: boolean;
  storageVersion: number;
  tagManagerOpen: boolean;
  tags: BoardTag[];
  themePreference: ThemePreference;
};

export type AppAction =
  | { type: 'activeWorkCycleChanged'; activeWorkCycle: BoardActiveWorkCycle }
  | { type: 'boardStateChanged'; state: BoardState }
  | { type: 'boardStateSynced'; state: BoardState }
  | { type: 'clearBoardOpenChanged'; open: boolean }
  | { type: 'columnCountChanged'; columnCount: number }
  | { type: 'completeWorkOpenChanged'; open: boolean }
  | { type: 'completionPulseChanged'; active: boolean }
  | { type: 'currentViewChanged'; view: AppView }
  | { type: 'manageColumnsOpenChanged'; open: boolean }
  | { type: 'mobileSidebarOpenChanged'; open: boolean }
  | { type: 'profileDialogOpenChanged'; open: boolean }
  | { type: 'settingsOpenChanged'; open: boolean }
  | { type: 'sidebarExpandedChanged'; expanded: boolean }
  | {
      type: 'storageHydrated';
      state: BoardState;
    }
  | { type: 'storageVersionIncremented' }
  | { type: 'systemThemeChanged'; resolvedTheme: ResolvedTheme }
  | { type: 'tagManagerOpenChanged'; open: boolean }
  | { type: 'tagsChanged'; tags: BoardTag[] }
  | { type: 'themePreferenceChanged'; preference: ThemePreference };
