import Columns from './components/Columns';

import './App.css';

const App = () => (
  <div
    className="app"
    style={{
      backgroundImage: 'url(/trello-background.png)',
      backgroundSize: 'cover',
    }}
  >
    <header className="app__header">
      <h1 className="app__title">Trello Board</h1>
    </header>

    <Columns />
  </div>
);

export default App;
