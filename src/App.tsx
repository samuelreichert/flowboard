import { Tooltip } from '@base-ui/react/tooltip';
import { Boxes } from 'lucide-react';

import Columns from './components/Columns';

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
        </div>
      </header>
      <section className="board">
        <header className="board__header">
          <div>
            <p className="app__eyebrow">Workspace / Product</p>
            <h1 className="app__title">Flowboard</h1>
          </div>
        </header>
        <Columns />
      </section>
    </main>
  </Tooltip.Provider>
);

export default App;
