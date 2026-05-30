import { Tooltip } from '@base-ui/react/tooltip';
import Columns from './components/Columns';
import './App.css';

const App = () => (
  <Tooltip.Provider>
    <main className="app">
      <section className="board">
        <header className="board__header">
          <div>
            <h1 className="app__title">Flowboard</h1>
          </div>
        </header>
        <Columns />
      </section>
    </main>
  </Tooltip.Provider>
);

export default App;
