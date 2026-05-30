import { Tooltip } from '@base-ui/react/tooltip';

import Columns from './components/Columns';

import './App.css';

const App = () => (
  <Tooltip.Provider>
    <main
      className="app"
      style={{
        backgroundImage: 'url(/flowboard-background.png)',
        backgroundSize: 'cover',
      }}
    >
      <header className="app__header">
        <div>
          <p className="app__eyebrow">Visual workflow</p>
          <h1 className="app__title">Flowboard</h1>
        </div>
      </header>
      <Columns />
    </main>
  </Tooltip.Provider>
);

export default App;
