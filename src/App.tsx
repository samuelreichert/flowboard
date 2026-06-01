import { Button } from '@base-ui/react/button';
import { Tooltip } from '@base-ui/react/tooltip';
import { RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

import BackgroundPicker from './components/BackgroundPicker';
import Columns from './components/Columns';
import ConfirmDialog from './components/ConfirmDialog';
import {
  fetchBackgroundStorage,
  fetchStorage,
  hydrateStorageFromDatabase,
  updateBackgroundStorage,
  updateStorage,
} from './storage';
import type { BoardBackground } from './types';

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
                onChange={updateBackground}
              />
              {columnCount > 0 && (
                <Button
                  className="button button--subtle"
                  onClick={() => setClearBoardOpen(true)}
                >
                  <RotateCcw size={16} />
                  Clear board
                </Button>
              )}
            </div>
          </header>
          <Columns key={storageVersion} onColumnCountChange={setColumnCount} />
        </section>
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
