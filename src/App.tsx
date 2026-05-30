import { Tooltip } from '@base-ui/react/tooltip';
import { Bell, Boxes, Search } from 'lucide-react';

import Columns from './components/Columns';
import IconButton from './components/IconButton';

import './App.css';

const App = () => (
  <Tooltip.Provider>
    <main className="app">
      <header className="topbar">
        <div className="topbar__brand">
          <span className="topbar__logo">
            <Boxes size={15} strokeWidth={2.2} />
          </span>
          <span>Flowboard</span>
          <span className="topbar__divider" />
          <span className="topbar__workspace">Product</span>
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
      <section className="board">
        <header className="board__header">
          <div>
            <p className="app__eyebrow">Workspace / Product</p>
            <h1 className="app__title">Flowboard</h1>
          </div>
          <nav className="board__views" aria-label="Board views">
            <span className="board__view board__view--active">Board</span>
          </nav>
        </header>
        <Columns />
      </section>
    </main>
  </Tooltip.Provider>
);

export default App;
