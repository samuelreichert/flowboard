import { Tooltip } from '@base-ui/react/tooltip';
import { useEffect, useState } from 'react';

import BackgroundPicker from './components/BackgroundPicker';
import Columns from './components/Columns';
import {
  fetchBackgroundStorage,
  hydrateStorageFromDatabase,
  updateBackgroundStorage,
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
  const [storageVersion, setStorageVersion] = useState(0);

  useEffect(() => {
    let active = true;

    void hydrateStorageFromDatabase().then((state) => {
      if (!active || !state) {
        return;
      }

      setBackground(state.background);
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
            <BackgroundPicker
              background={background}
              onChange={updateBackground}
            />
          </header>
          <Columns key={storageVersion} />
        </section>
      </main>
    </Tooltip.Provider>
  );
};

export default App;
