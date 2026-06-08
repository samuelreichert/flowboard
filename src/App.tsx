import { Button } from '@base-ui/react/button';
import { Menu } from '@base-ui/react/menu';
import { Tooltip } from '@base-ui/react/tooltip';
import { Ellipsis, Palette, RotateCcw, Tags } from 'lucide-react';
import { useEffect, useState } from 'react';

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

const App = () => {
  const [background, setBackground] = useState(fetchBackgroundStorage);
  const [columnCount, setColumnCount] = useState(() => fetchStorage().length);
  const [tags, setTags] = useState<BoardTag[]>(fetchTagStorage);
  const [backgroundOpen, setBackgroundOpen] = useState(false);
  const [tagManagerOpen, setTagManagerOpen] = useState(false);
  const [clearBoardOpen, setClearBoardOpen] = useState(false);
  const [storageVersion, setStorageVersion] = useState(0);

  useEffect(() => {
    let active = true;

    void hydrateStorageFromDatabase().then((state) => {
      if (!active || !state) {
        return;
      }

      setBackground(state.background);
      setColumnCount(state.columns.length);
      setTags(state.tags);
      setStorageVersion((version) => version + 1);
    });

    return () => {
      active = false;
    };
  }, []);

  const updateBackground = (newBackground: BoardBackground) => {
    setBackground(newBackground);
    updateBackgroundStorage(newBackground);
  };

  const updateTags = (newTags: BoardTag[]) => {
    setTags(newTags);
    updateTagStorage(newTags);
  };

  const getTagUsageCount = (tagId: string) =>
    fetchStorage().reduce(
      (count, column) =>
        count +
        column.cards.filter((card) => card.tagIds.includes(tagId)).length,
      0
    );

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
    setStorageVersion((version) => version + 1);
  };

  const clearBoard = () => {
    updateStorage([]);
    setColumnCount(0);
    setStorageVersion((version) => version + 1);
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
            <div className="board__actions">
              <BackgroundPicker
                background={background}
                onOpenChange={setBackgroundOpen}
                onChange={updateBackground}
                open={backgroundOpen}
                showTrigger={false}
              />
              <Menu.Root>
                <Menu.Trigger
                  aria-label="Open board actions"
                  className="button button--subtle"
                  render={<Button />}
                >
                  <Ellipsis size={16} />
                  Board
                </Menu.Trigger>
                <Menu.Portal>
                  <Menu.Positioner sideOffset={4}>
                    <Menu.Popup className="menu-popup">
                      <Menu.Item
                        className="menu-item"
                        onClick={() => setBackgroundOpen(true)}
                      >
                        <Palette size={15} />
                        Background settings
                      </Menu.Item>
                      <Menu.Item
                        className="menu-item"
                        onClick={() => setTagManagerOpen(true)}
                      >
                        <Tags size={15} />
                        Manage tags
                      </Menu.Item>
                      {columnCount > 0 && (
                        <Menu.Item
                          className="menu-item menu-item--danger"
                          onClick={() => setClearBoardOpen(true)}
                        >
                          <RotateCcw size={15} />
                          Clear board
                        </Menu.Item>
                      )}
                    </Menu.Popup>
                  </Menu.Positioner>
                </Menu.Portal>
              </Menu.Root>
            </div>
          </header>
          <Columns
            key={storageVersion}
            onColumnCountChange={setColumnCount}
            onTagsChange={updateTags}
            tags={tags}
          />
        </section>
        <TagManagerDialog
          getTagUsageCount={getTagUsageCount}
          onDeleteTag={deleteTag}
          onOpenChange={setTagManagerOpen}
          onTagsChange={updateTags}
          open={tagManagerOpen}
          tags={tags}
        />
        <ConfirmDialog
          confirmLabel="Clear board"
          description={`This will permanently delete ${columnCount} columns and all of their cards.`}
          onConfirm={clearBoard}
          onOpenChange={setClearBoardOpen}
          open={clearBoardOpen}
          title="Clear this board?"
        />
      </main>
    </Tooltip.Provider>
  );
};

export default App;
