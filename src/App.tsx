import { Button } from '@base-ui/react/button';
import { Tooltip } from '@base-ui/react/tooltip';
import { Bell, Boxes, LayoutDashboard, Search, Settings2 } from 'lucide-react';

import Columns from './components/Columns';
import IconButton from './components/IconButton';

import './App.css';

const App = () => (
  <Tooltip.Provider>
    <main className="app">
      <header className="topbar">
        <div className="topbar__brand">
          <span className="topbar__logo">
            <Boxes size={17} strokeWidth={2.4} />
          </span>
          <span>Flowboard</span>
        </div>
        <div className="topbar__actions">
          <IconButton label="Search">
            <Search size={17} />
          </IconButton>
          <IconButton label="Notifications">
            <Bell size={17} />
          </IconButton>
          <span className="topbar__avatar" aria-label="Samuel Reichert">
            SR
          </span>
        </div>
      </header>
      <div className="workspace">
        <aside className="workspace-rail" aria-label="Workspace navigation">
          <Button
            aria-label="Board"
            className="rail-button rail-button--active"
          >
            <LayoutDashboard size={18} />
          </Button>
          <Button aria-label="Settings" className="rail-button">
            <Settings2 size={18} />
          </Button>
        </aside>
        <section className="board">
          <header className="board__header">
            <div>
              <p className="app__eyebrow">Product workspace</p>
              <h1 className="app__title">Flowboard</h1>
            </div>
            <span className="board__status">
              <span className="board__status-dot" />
              Synced
            </span>
          </header>
          <Columns />
        </section>
      </div>
    </main>
  </Tooltip.Provider>
);

export default App;
