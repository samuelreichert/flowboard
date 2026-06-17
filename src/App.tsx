import { Button } from '@base-ui/react/button';
import { Menu } from '@base-ui/react/menu';
import { Tooltip } from '@base-ui/react/tooltip';
import {
  KanbanSquare,
  Menu as MenuIcon,
  Monitor,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Settings2,
  Sun,
  Tags,
  X,
} from 'lucide-react';
import { useEffect, useReducer } from 'react';

import Columns from './components/Columns';
import ConfirmDialog from './components/ConfirmDialog';
import TagManagerDialog from './components/TagManagerDialog';
import {
  fetchStorage,
  fetchTagStorage,
  hydrateStorageFromDatabase,
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
import type { BoardTag } from './types';

import './App.css';

const getTagUsageCount = (tagId: string) =>
  fetchStorage().reduce(
    (count, column) =>
      count + column.cards.filter((card) => card.tagIds.includes(tagId)).length,
    0
  );

type AppState = {
  clearBoardOpen: boolean;
  columnCount: number;
  mobileSidebarOpen: boolean;
  resolvedTheme: ResolvedTheme;
  sidebarExpanded: boolean;
  storageVersion: number;
  tagManagerOpen: boolean;
  tags: BoardTag[];
  themePreference: ThemePreference;
};

type AppAction =
  | { type: 'boardCleared' }
  | { type: 'clearBoardOpenChanged'; open: boolean }
  | { type: 'columnCountChanged'; columnCount: number }
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

  return {
    clearBoardOpen: false,
    columnCount: fetchStorage().length,
    mobileSidebarOpen: false,
    resolvedTheme: resolveThemePreference(themePreference),
    sidebarExpanded: true,
    storageVersion: 0,
    tagManagerOpen: false,
    tags: fetchTagStorage(),
    themePreference,
  };
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'boardCleared':
      return {
        ...state,
        columnCount: 0,
        storageVersion: state.storageVersion + 1,
      };
    case 'clearBoardOpenChanged':
      return { ...state, clearBoardOpen: action.open };
    case 'columnCountChanged':
      return { ...state, columnCount: action.columnCount };
    case 'mobileSidebarOpenChanged':
      return { ...state, mobileSidebarOpen: action.open };
    case 'sidebarExpandedChanged':
      return { ...state, sidebarExpanded: action.expanded };
    case 'storageHydrated':
      return {
        ...state,
        columnCount: action.columnCount,
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

const THEME_OPTIONS: {
  icon: typeof Monitor;
  label: string;
  value: ThemePreference;
}[] = [
  { icon: Monitor, label: 'System', value: 'system' },
  { icon: Sun, label: 'Light', value: 'light' },
  { icon: Moon, label: 'Dark', value: 'dark' },
];

const App = () => {
  const [state, dispatch] = useReducer(appReducer, undefined, initAppState);
  const {
    clearBoardOpen,
    columnCount,
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

  const updateTags = (newTags: BoardTag[]) => {
    dispatch({ tags: newTags, type: 'tagsChanged' });
    updateTagStorage(newTags);
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
    dispatch({ type: 'storageVersionIncremented' });
  };

  const clearBoard = () => {
    updateStorage([]);
    dispatch({ type: 'boardCleared' });
  };

  const chooseThemePreference = (preference: ThemePreference) => {
    dispatch({ preference, type: 'themePreferenceChanged' });
    updateThemePreference(preference);
  };

  const openTagManager = () => {
    dispatch({ open: true, type: 'tagManagerOpenChanged' });
    dispatch({ open: false, type: 'mobileSidebarOpenChanged' });
  };

  const closeMobileSidebar = () =>
    dispatch({ open: false, type: 'mobileSidebarOpenChanged' });

  const toggleSidebar = () =>
    dispatch({
      expanded: !sidebarExpanded,
      type: 'sidebarExpandedChanged',
    });

  return (
    <Tooltip.Provider>
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
        <aside
          aria-label="Flowboard navigation"
          className="app-sidebar"
          data-expanded={sidebarExpanded}
        >
          <div className="app-sidebar__header">
            <Button
              aria-label={
                sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'
              }
              className="icon-button app-sidebar__toggle"
              onClick={toggleSidebar}
              type="button"
            >
              {sidebarExpanded ? (
                <PanelLeftClose size={18} />
              ) : (
                <PanelLeftOpen size={18} />
              )}
            </Button>
            <div className="app-sidebar__brand">
              <span aria-hidden="true" className="app-sidebar__mark">
                F
              </span>
              <span className="app-sidebar__brand-text">Flowboard</span>
            </div>
            <Button
              aria-label="Close navigation"
              className="icon-button app-sidebar__mobile-close"
              onClick={closeMobileSidebar}
              type="button"
            >
              <X size={18} />
            </Button>
          </div>
          <nav className="app-sidebar__nav" aria-label="Primary navigation">
            <Button
              aria-current="page"
              aria-label="Board"
              className="app-sidebar__nav-item app-sidebar__nav-item--active"
              title="Board"
              type="button"
            >
              <KanbanSquare size={18} />
              <span>Board</span>
            </Button>
            <Button
              aria-label="Manage tags"
              className="app-sidebar__nav-item"
              onClick={openTagManager}
              title="Tags"
              type="button"
            >
              <Tags size={18} />
              <span>Tags</span>
            </Button>
          </nav>
          <div className="app-sidebar__footer">
            <p className="app-sidebar__footer-label">Theme</p>
            <div
              aria-label="Theme preference"
              className="theme-switcher"
              role="group"
            >
              {THEME_OPTIONS.map((option) => {
                const Icon = option.icon;

                return (
                  <Button
                    aria-label={`Use ${option.label.toLowerCase()} theme`}
                    aria-pressed={themePreference === option.value}
                    className="theme-switcher__button"
                    key={option.value}
                    onClick={() => chooseThemePreference(option.value)}
                    title={option.label}
                    type="button"
                  >
                    <Icon size={16} />
                    <span>{option.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </aside>
        <section className="app-workspace" aria-label="Board workspace">
          <header className="board__header">
            <div className="board__title-group">
              <Button
                aria-label="Open navigation"
                className="icon-button board__mobile-nav-trigger"
                onClick={() =>
                  dispatch({ open: true, type: 'mobileSidebarOpenChanged' })
                }
                type="button"
              >
                <MenuIcon size={18} />
              </Button>
              <div>
                <p className="app__eyebrow">Workspace</p>
                <h1 className="app__title">Board</h1>
              </div>
            </div>
            <div className="board__actions">
              <Tooltip.Root>
                <Menu.Root>
                  <Tooltip.Trigger
                    aria-label="Open board actions"
                    className="button button--subtle board-actions__trigger"
                    render={<Menu.Trigger render={<Button />} />}
                  >
                    <Settings2 size={16} />
                  </Tooltip.Trigger>
                  <Menu.Portal>
                    <Menu.Positioner sideOffset={4}>
                      <Menu.Popup className="menu-popup">
                        <Menu.Item className="menu-item" onClick={openTagManager}>
                          <Tags size={15} />
                          Manage tags
                        </Menu.Item>
                        {columnCount > 0 && (
                          <Menu.Item
                            className="menu-item menu-item--danger"
                            onClick={() =>
                              dispatch({
                                open: true,
                                type: 'clearBoardOpenChanged',
                              })
                            }
                          >
                            <RotateCcw size={15} />
                            Clear board
                          </Menu.Item>
                        )}
                      </Menu.Popup>
                    </Menu.Positioner>
                  </Menu.Portal>
                </Menu.Root>
                <Tooltip.Portal>
                  <Tooltip.Positioner sideOffset={8}>
                    <Tooltip.Popup className="tooltip-popup">
                      Board actions
                    </Tooltip.Popup>
                  </Tooltip.Positioner>
                </Tooltip.Portal>
              </Tooltip.Root>
            </div>
          </header>
          <section className="board" aria-label="Flowboard board">
            <Columns
              key={storageVersion}
              onColumnCountChange={(nextColumnCount) =>
                dispatch({
                  columnCount: nextColumnCount,
                  type: 'columnCountChanged',
                })
              }
              onTagsChange={updateTags}
              tags={tags}
            />
          </section>
        </section>
        <TagManagerDialog
          getTagUsageCount={getTagUsageCount}
          onDeleteTag={deleteTag}
          onOpenChange={(open) =>
            dispatch({ open, type: 'tagManagerOpenChanged' })
          }
          onTagsChange={updateTags}
          open={tagManagerOpen}
          tags={tags}
        />
        <ConfirmDialog
          confirmLabel="Clear board"
          description={`This will permanently delete ${columnCount} columns and all of their cards.`}
          onConfirm={clearBoard}
          onOpenChange={(open) =>
            dispatch({ open, type: 'clearBoardOpenChanged' })
          }
          open={clearBoardOpen}
          title="Clear this board?"
        />
      </main>
    </Tooltip.Provider>
  );
};

export default App;
