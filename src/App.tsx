import { Button } from '@base-ui/react/button';
import {
  CheckCircle2,
  History,
  KanbanSquare,
  Menu as MenuIcon,
  Monitor,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sun,
  Tags,
  X,
} from 'lucide-react';
import { useEffect, useReducer, useRef } from 'react';

import { completeWorkCycle } from './board/completedWork';
import BoardSettingsDialog from './components/BoardSettingsDialog';
import Columns from './components/Columns';
import ConfirmDialog from './components/ConfirmDialog';
import HistoryView from './components/HistoryView';
import SegmentedControl from './components/SegmentedControl';
import type { SegmentedControlOption } from './components/SegmentedControl';
import TagManagerDialog from './components/TagManagerDialog';
import {
  fetchBoardState,
  fetchStorage,
  fetchTagStorage,
  hydrateStorageFromDatabase,
  updateActiveWorkCycleStorage,
  updateBoardStateStorage,
  updateTagStorage,
  updateStorage,
} from './storage';
import {
  fetchThemePreference,
  getSystemTheme,
  resolveThemePreference,
  updateThemePreference,
} from './theme';
import type { ResolvedTheme, ThemePreference } from './theme';
import type {
  BoardActiveWorkCycle,
  BoardColumn,
  BoardState,
  BoardTag,
  CompletedWorkCycle,
} from './types';

import './App.css';

const getTagUsageCount = (tagId: string) =>
  fetchStorage().reduce(
    (count, column) =>
      count + column.cards.filter((card) => card.tagIds.includes(tagId)).length,
    0
  );

const getThemeIconSrc = (theme: ResolvedTheme) =>
  theme === 'dark' ? '/icon-dark.svg' : '/icon-light.svg';

type AppState = {
  activeWorkCycle: BoardActiveWorkCycle;
  boardSettingsOpen: boolean;
  clearBoardOpen: boolean;
  columns: BoardColumn[];
  columnCount: number;
  completeWorkOpen: boolean;
  completedWorkCycles: CompletedWorkCycle[];
  completionPulse: boolean;
  currentView: 'board' | 'history';
  mobileSidebarOpen: boolean;
  resolvedTheme: ResolvedTheme;
  sidebarExpanded: boolean;
  storageVersion: number;
  tagManagerOpen: boolean;
  tags: BoardTag[];
  themePreference: ThemePreference;
};

type AppAction =
  | { type: 'activeWorkCycleChanged'; activeWorkCycle: BoardActiveWorkCycle }
  | { type: 'boardSettingsOpenChanged'; open: boolean }
  | { type: 'boardStateChanged'; state: BoardState }
  | { type: 'boardStateSynced'; state: BoardState }
  | { type: 'clearBoardOpenChanged'; open: boolean }
  | { type: 'columnCountChanged'; columnCount: number }
  | { type: 'completeWorkOpenChanged'; open: boolean }
  | { type: 'completionPulseChanged'; active: boolean }
  | { type: 'currentViewChanged'; view: AppState['currentView'] }
  | { type: 'mobileSidebarOpenChanged'; open: boolean }
  | { type: 'sidebarExpandedChanged'; expanded: boolean }
  | {
      type: 'storageHydrated';
      columnCount: number;
      tags: BoardTag[];
    }
  | { type: 'storageVersionIncremented' }
  | { type: 'systemThemeChanged'; resolvedTheme: ResolvedTheme }
  | { type: 'tagManagerOpenChanged'; open: boolean }
  | { type: 'tagsChanged'; tags: BoardTag[] }
  | { type: 'themePreferenceChanged'; preference: ThemePreference };

const initAppState = (): AppState => {
  const themePreference = fetchThemePreference();
  const boardState = fetchBoardState();

  return {
    activeWorkCycle: boardState.activeWorkCycle,
    boardSettingsOpen: false,
    clearBoardOpen: false,
    columns: boardState.columns,
    columnCount: boardState.columns.length,
    completeWorkOpen: false,
    completedWorkCycles: boardState.completedWorkCycles,
    completionPulse: false,
    currentView: 'board',
    mobileSidebarOpen: false,
    resolvedTheme: resolveThemePreference(themePreference),
    sidebarExpanded: true,
    storageVersion: 0,
    tagManagerOpen: false,
    tags: boardState.tags,
    themePreference,
  };
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'activeWorkCycleChanged':
      return {
        ...state,
        activeWorkCycle: action.activeWorkCycle,
      };
    case 'boardSettingsOpenChanged':
      return { ...state, boardSettingsOpen: action.open };
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
    case 'mobileSidebarOpenChanged':
      return { ...state, mobileSidebarOpen: action.open };
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

const THEME_OPTIONS: SegmentedControlOption<ThemePreference>[] = [
  { icon: <Monitor size={16} />, label: 'System', value: 'system' },
  { icon: <Sun size={16} />, label: 'Light', value: 'light' },
  { icon: <Moon size={16} />, label: 'Dark', value: 'dark' },
];

type AppSidebarProps = {
  currentView: AppState['currentView'];
  onBoardClick: () => void;
  onBoardSettingsClick: () => void;
  onCloseMobileSidebar: () => void;
  onHistoryClick: () => void;
  onManageTagsClick: () => void;
  onThemePreferenceChange: (preference: ThemePreference) => void;
  onToggleSidebar: () => void;
  resolvedTheme: ResolvedTheme;
  sidebarExpanded: boolean;
  themePreference: ThemePreference;
};

const AppSidebar = ({
  currentView,
  onBoardClick,
  onBoardSettingsClick,
  onCloseMobileSidebar,
  onHistoryClick,
  onManageTagsClick,
  onThemePreferenceChange,
  onToggleSidebar,
  resolvedTheme,
  sidebarExpanded,
  themePreference,
}: AppSidebarProps) => (
  <aside
    aria-label="Flowboard navigation"
    className="app-sidebar"
    data-expanded={sidebarExpanded}
  >
    <div className="app-sidebar__header">
      <Button
        aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        className="icon-button app-sidebar__toggle"
        onClick={onToggleSidebar}
        type="button"
      >
        {sidebarExpanded ? (
          <PanelLeftClose size={18} />
        ) : (
          <PanelLeftOpen size={18} />
        )}
      </Button>
      <div className="app-sidebar__brand">
        <img
          alt=""
          aria-hidden="true"
          className="app-sidebar__brand-icon"
          src={getThemeIconSrc(resolvedTheme)}
        />
        <span className="app-sidebar__brand-text">Flowboard</span>
      </div>
      <Button
        aria-label="Close navigation"
        className="icon-button app-sidebar__mobile-close"
        onClick={onCloseMobileSidebar}
        type="button"
      >
        <X size={18} />
      </Button>
    </div>
    <nav className="app-sidebar__nav" aria-label="Primary navigation">
      <Button
        aria-current={currentView === 'board' ? 'page' : undefined}
        aria-label="Board"
        className={`app-sidebar__nav-item ${currentView === 'board' ? 'app-sidebar__nav-item--active' : ''}`}
        onClick={onBoardClick}
        title="Board"
        type="button"
      >
        <KanbanSquare size={18} />
        <span>Board</span>
      </Button>
      <Button
        aria-current={currentView === 'history' ? 'page' : undefined}
        aria-label="History"
        className={`app-sidebar__nav-item ${currentView === 'history' ? 'app-sidebar__nav-item--active' : ''}`}
        onClick={onHistoryClick}
        title="History"
        type="button"
      >
        <History size={18} />
        <span>History</span>
      </Button>
      <Button
        aria-label="Manage tags"
        className="app-sidebar__nav-item"
        onClick={onManageTagsClick}
        title="Tags"
        type="button"
      >
        <Tags size={18} />
        <span>Tags</span>
      </Button>
      <Button
        aria-label="Board settings"
        className="app-sidebar__nav-item"
        onClick={onBoardSettingsClick}
        title="Board settings"
        type="button"
      >
        <Settings size={18} />
        <span>Board settings</span>
      </Button>
    </nav>
    <div className="app-sidebar__footer">
      <p className="app-sidebar__footer-label">Theme</p>
      <SegmentedControl
        ariaLabel="Theme preference"
        className="app-sidebar__theme-control"
        onValueChange={onThemePreferenceChange}
        options={THEME_OPTIONS.map((option) => ({
          ...option,
          ariaLabel: `Use ${option.label.toLowerCase()} theme`,
        }))}
        value={themePreference}
      />
    </div>
  </aside>
);

type AppWorkspaceProps = {
  canCompleteWork: boolean;
  completedWorkCycles: CompletedWorkCycle[];
  completionPulse: boolean;
  currentView: AppState['currentView'];
  onBoardStateChange: () => void;
  onColumnCountChange: (columnCount: number) => void;
  onCompleteWorkClick: () => void;
  onOpenMobileSidebar: () => void;
  onTagsChange: (tags: BoardTag[]) => void;
  storageVersion: number;
  tags: BoardTag[];
};

const AppWorkspace = ({
  canCompleteWork,
  completedWorkCycles,
  completionPulse,
  currentView,
  onBoardStateChange,
  onColumnCountChange,
  onCompleteWorkClick,
  onOpenMobileSidebar,
  onTagsChange,
  storageVersion,
  tags,
}: AppWorkspaceProps) => {
  const workspaceTitle = currentView === 'history' ? 'History' : 'Board';
  const workspaceEyebrow =
    currentView === 'history' ? 'Completed work' : 'Workspace';

  return (
    <section className="app-workspace" aria-label="Board workspace">
      <header className="board__header">
        <div className="board__title-group">
          <Button
            aria-label="Open navigation"
            className="icon-button board__mobile-nav-trigger"
            onClick={onOpenMobileSidebar}
            type="button"
          >
            <MenuIcon size={18} />
          </Button>
          <div>
            <p className="app__eyebrow">{workspaceEyebrow}</p>
            <h1 className="app__title">{workspaceTitle}</h1>
          </div>
        </div>
        {currentView === 'board' && (
          <div className="board__header-actions">
            <Button
              aria-label="Complete work"
              className="button button--primary board__complete-work"
              disabled={!canCompleteWork}
              onClick={onCompleteWorkClick}
              title={
                canCompleteWork
                  ? 'Complete work'
                  : 'Add cards to the completed column before completing work'
              }
              type="button"
            >
              <CheckCircle2 size={16} />
              <span>Complete work</span>
            </Button>
          </div>
        )}
      </header>
      {currentView === 'board' ? (
        <section className="board" aria-label="Flowboard board">
          {completionPulse && (
            <div className="complete-work-pulse" aria-live="polite">
              <CheckCircle2 size={18} />
              <span>Work completed</span>
            </div>
          )}
          <Columns
            key={storageVersion}
            onBoardStateChange={onBoardStateChange}
            onColumnCountChange={onColumnCountChange}
            onTagsChange={onTagsChange}
            tags={tags}
          />
        </section>
      ) : (
        <HistoryView completedWorkCycles={completedWorkCycles} tags={tags} />
      )}
    </section>
  );
};

type AppDialogsProps = {
  activeWorkCycle: BoardActiveWorkCycle;
  boardSettingsOpen: boolean;
  clearBoardOpen: boolean;
  columnCount: number;
  columns: BoardColumn[];
  completeWorkOpen: boolean;
  completedCardCount: number;
  completedColumn: BoardColumn | undefined;
  onBoardSettingsOpenChange: (open: boolean) => void;
  onClearBoard: () => void;
  onClearBoardOpenChange: (open: boolean) => void;
  onClearBoardRequest: () => void;
  onCompleteWork: () => void;
  onCompleteWorkOpenChange: (open: boolean) => void;
  onCompletedColumnChange: (completedColumnId: string | null) => void;
  onDeleteTag: (tagId: string) => void;
  onTagManagerOpenChange: (open: boolean) => void;
  onTagsChange: (tags: BoardTag[]) => void;
  tagManagerOpen: boolean;
  tags: BoardTag[];
};

const AppDialogs = ({
  activeWorkCycle,
  boardSettingsOpen,
  clearBoardOpen,
  columnCount,
  columns,
  completeWorkOpen,
  completedCardCount,
  completedColumn,
  onBoardSettingsOpenChange,
  onClearBoard,
  onClearBoardOpenChange,
  onClearBoardRequest,
  onCompleteWork,
  onCompleteWorkOpenChange,
  onCompletedColumnChange,
  onDeleteTag,
  onTagManagerOpenChange,
  onTagsChange,
  tagManagerOpen,
  tags,
}: AppDialogsProps) => (
  <>
    <BoardSettingsDialog
      canClearBoard={columnCount > 0}
      columns={columns}
      completedColumnId={activeWorkCycle.completedColumnId}
      onClearBoard={onClearBoardRequest}
      onCompletedColumnChange={onCompletedColumnChange}
      onOpenChange={onBoardSettingsOpenChange}
      open={boardSettingsOpen}
    />
    <TagManagerDialog
      getTagUsageCount={getTagUsageCount}
      onDeleteTag={onDeleteTag}
      onOpenChange={onTagManagerOpenChange}
      onTagsChange={onTagsChange}
      open={tagManagerOpen}
      tags={tags}
    />
    <ConfirmDialog
      confirmLabel="Clear board"
      description={`This will permanently delete ${columnCount} columns and all of their cards.`}
      onConfirm={onClearBoard}
      onOpenChange={onClearBoardOpenChange}
      open={clearBoardOpen}
      title="Clear this board?"
    />
    <ConfirmDialog
      confirmLabel="Complete work"
      confirmVariant="primary"
      description={
        completedColumn
          ? `This will archive ${completedCardCount} ${completedCardCount === 1 ? 'card' : 'cards'} from ${completedColumn.title} and start a new work cycle.`
          : 'Choose a completed column in board settings before completing work.'
      }
      onConfirm={onCompleteWork}
      onOpenChange={onCompleteWorkOpenChange}
      open={completeWorkOpen}
      title="Complete work?"
    />
  </>
);

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
  const canCompleteWork =
    !activeWorkCycle.completedColumnId || completedCardCount > 0;

  return {
    activeWorkCycle,
    boardSettingsOpen,
    canCompleteWork,
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

const App = () => {
  const {
    activeWorkCycle,
    boardSettingsOpen,
    canCompleteWork,
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
  } = useAppController();

  return (
    <main
      className={`app ${sidebarExpanded ? 'app--sidebar-expanded' : 'app--sidebar-collapsed'} ${mobileSidebarOpen ? 'app--mobile-sidebar-open' : ''}`}
      data-theme={resolvedTheme}
      data-theme-preference={themePreference}
    >
      <button
        aria-label="Close navigation"
        className="app__mobile-backdrop"
        onClick={closeMobileSidebar}
        type="button"
      />
      <AppSidebar
        currentView={currentView}
        onBoardClick={openBoard}
        onBoardSettingsClick={openBoardSettings}
        onCloseMobileSidebar={closeMobileSidebar}
        onHistoryClick={openHistory}
        onManageTagsClick={openTagManager}
        onThemePreferenceChange={chooseThemePreference}
        onToggleSidebar={toggleSidebar}
        resolvedTheme={resolvedTheme}
        sidebarExpanded={sidebarExpanded}
        themePreference={themePreference}
      />
      <AppWorkspace
        canCompleteWork={canCompleteWork}
        completedWorkCycles={completedWorkCycles}
        completionPulse={completionPulse}
        currentView={currentView}
        onBoardStateChange={syncBoardState}
        onColumnCountChange={updateColumnCount}
        onCompleteWorkClick={openCompleteWorkConfirmation}
        onOpenMobileSidebar={openMobileSidebar}
        onTagsChange={updateTags}
        storageVersion={storageVersion}
        tags={tags}
      />
      <AppDialogs
        activeWorkCycle={activeWorkCycle}
        boardSettingsOpen={boardSettingsOpen}
        clearBoardOpen={clearBoardOpen}
        columnCount={columnCount}
        columns={columns}
        completeWorkOpen={completeWorkOpen}
        completedCardCount={completedCardCount}
        completedColumn={completedColumn}
        onBoardSettingsOpenChange={setBoardSettingsOpen}
        onClearBoard={clearBoard}
        onClearBoardOpenChange={setClearBoardOpen}
        onClearBoardRequest={openClearBoardConfirmation}
        onCompleteWork={confirmCompleteWork}
        onCompleteWorkOpenChange={setCompleteWorkOpen}
        onCompletedColumnChange={chooseCompletedColumn}
        onDeleteTag={deleteTag}
        onTagManagerOpenChange={setTagManagerOpen}
        onTagsChange={updateTags}
        tagManagerOpen={tagManagerOpen}
        tags={tags}
      />
    </main>
  );
};

export default App;
