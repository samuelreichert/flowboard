import { Button } from '@base-ui/react/button';
import { Menu } from '@base-ui/react/menu';
import { Tooltip } from '@base-ui/react/tooltip';
import { Palette, RotateCcw, Settings2, Tags } from 'lucide-react';
import { useEffect, useReducer, useRef } from 'react';

import BackgroundPicker from './components/BackgroundPicker';
import Columns from './components/Columns';
import ConfirmDialog from './components/ConfirmDialog';
import TagManagerDialog from './components/TagManagerDialog';
import {
  fetchBackgroundStorage,
  fetchStorage,
  fetchTagStorage,
  hydrateStorageFromDatabase,
  updateBackgroundStorage,
  updateTagStorage,
  updateStorage,
} from './storage';
import type { BoardBackground, BoardTag } from './types';

import './App.css';

const getBackgroundStyle = (background: BoardBackground) => {
  if (background.type === 'image') {
    return {
      backgroundImage: `linear-gradient(rgb(11 21 46 / 16%), rgb(11 21 46 / 16%)), url(${JSON.stringify(background.value)})`,
    };
  }

  return { backgroundColor: background.value };
};

const getTagUsageCount = (tagId: string) =>
  fetchStorage().reduce(
    (count, column) =>
      count + column.cards.filter((card) => card.tagIds.includes(tagId)).length,
    0
  );

type AppState = {
  background: BoardBackground;
  backgroundOpen: boolean;
  clearBoardOpen: boolean;
  columnCount: number;
  storageVersion: number;
  tagManagerOpen: boolean;
  tags: BoardTag[];
};

type AppAction =
  | { type: 'backgroundChanged'; background: BoardBackground }
  | { type: 'backgroundOpenChanged'; open: boolean }
  | { type: 'boardCleared' }
  | { type: 'clearBoardOpenChanged'; open: boolean }
  | { type: 'columnCountChanged'; columnCount: number }
  | {
      type: 'storageHydrated';
      background: BoardBackground;
      columnCount: number;
      tags: BoardTag[];
    }
  | { type: 'storageVersionIncremented' }
  | { type: 'tagManagerOpenChanged'; open: boolean }
  | { type: 'tagsChanged'; tags: BoardTag[] };

const initAppState = (): AppState => ({
  background: fetchBackgroundStorage(),
  backgroundOpen: false,
  clearBoardOpen: false,
  columnCount: fetchStorage().length,
  storageVersion: 0,
  tagManagerOpen: false,
  tags: fetchTagStorage(),
});

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'backgroundChanged':
      return { ...state, background: action.background };
    case 'backgroundOpenChanged':
      return { ...state, backgroundOpen: action.open };
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
    case 'storageHydrated':
      return {
        ...state,
        background: action.background,
        columnCount: action.columnCount,
        storageVersion: state.storageVersion + 1,
        tags: action.tags,
      };
    case 'storageVersionIncremented':
      return { ...state, storageVersion: state.storageVersion + 1 };
    case 'tagManagerOpenChanged':
      return { ...state, tagManagerOpen: action.open };
    case 'tagsChanged':
      return { ...state, tags: action.tags };
  }
};

const App = () => {
  const [state, dispatch] = useReducer(appReducer, undefined, initAppState);
  const boardActionsRef = useRef<HTMLDivElement | null>(null);
  const {
    background,
    backgroundOpen,
    clearBoardOpen,
    columnCount,
    storageVersion,
    tagManagerOpen,
    tags,
  } = state;

  useEffect(() => {
    let active = true;

    void hydrateStorageFromDatabase().then((state) => {
      if (!active || !state) {
        return;
      }

      dispatch({
        background: state.background,
        columnCount: state.columns.length,
        tags: state.tags,
        type: 'storageHydrated',
      });
    });

    return () => {
      active = false;
    };
  }, []);

  const updateBackground = (newBackground: BoardBackground) => {
    dispatch({ background: newBackground, type: 'backgroundChanged' });
    updateBackgroundStorage(newBackground);
  };

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

  return (
    <Tooltip.Provider>
      <main
        className={`app ${background.type === 'image' ? 'app--image-background' : ''}`}
        style={getBackgroundStyle(background)}
      >
        <section className="board">
          <header className="board__header">
            <div>
              <h1 className="app__title">Flowboard</h1>
            </div>
            <div className="board__actions" ref={boardActionsRef}>
              <BackgroundPicker
                anchor={boardActionsRef}
                background={background}
                onOpenChange={(open) =>
                  dispatch({ open, type: 'backgroundOpenChanged' })
                }
                onChange={updateBackground}
                open={backgroundOpen}
                showTrigger={false}
              />
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
                        <Menu.Item
                          className="menu-item"
                          onClick={() =>
                            dispatch({
                              open: true,
                              type: 'backgroundOpenChanged',
                            })
                          }
                        >
                          <Palette size={15} />
                          Background settings
                        </Menu.Item>
                        <Menu.Item
                          className="menu-item"
                          onClick={() =>
                            dispatch({
                              open: true,
                              type: 'tagManagerOpenChanged',
                            })
                          }
                        >
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
