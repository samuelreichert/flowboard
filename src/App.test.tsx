import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from './App';
import { fetchStorage } from './storage';
import type { BoardColumn } from './types';

beforeEach(() => {
  localStorage.clear();
});

test('renders the Flowboard identity', () => {
  render(<App />);

  expect(
    screen.getByRole('heading', { name: /flowboard/i })
  ).toBeInTheDocument();
  expect(screen.queryByText(/trello/i)).not.toBeInTheDocument();
});

test('migrates legacy localStorage data to stable IDs', () => {
  localStorage.setItem(
    'columnsList',
    JSON.stringify([{ title: 'Todo', cards: ['Ship it'], position: 0 }])
  );

  const columns = fetchStorage();

  expect(columns[0]).toMatchObject({ title: 'Todo', position: 0 });
  expect(columns[0].id).toBeTruthy();
  expect(columns[0].cards[0]).toMatchObject({ title: 'Ship it' });
  expect(columns[0].cards[0].description).toBe('');
  expect(columns[0].cards[0].id).toBeTruthy();
  expect(localStorage.getItem('columnsList')).toContain(columns[0].id);
});

test('migrates stable-ID cards that predate descriptions', () => {
  localStorage.setItem(
    'columnsList',
    JSON.stringify([
      {
        id: 'todo',
        title: 'Todo',
        cards: [{ id: 'ship-it', title: 'Ship it' }],
        position: 0,
      },
    ])
  );

  expect(fetchStorage()[0].cards[0]).toEqual({
    description: '',
    id: 'ship-it',
    title: 'Ship it',
  });
});

test('creates columns and cards from dialogs', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  expect(screen.getByRole('heading', { name: 'Todo' })).toBeInTheDocument();

  await addCard(user, 'Todo', 'Ship it', 'Release the new Flowboard build.');
  expect(screen.getByText('Ship it')).toBeInTheDocument();
  expect(readColumns()[0].cards[0].title).toBe('Ship it');
  expect(readColumns()[0].cards[0].description).toBe(
    'Release the new Flowboard build.'
  );
  expect(
    screen.queryByText('Release the new Flowboard build.')
  ).not.toBeInTheDocument();
});

test('rejects blank and duplicate column titles', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole('button', { name: /add another column/i }));
  await user.click(screen.getByRole('button', { name: /add column/i }));
  expect(screen.getByText('Enter a column title.')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /cancel/i }));

  await addColumn(user, 'Todo');
  await user.click(screen.getByRole('button', { name: /add another column/i }));
  await user.type(screen.getByLabelText('Column title'), 'todo');
  await user.click(screen.getByRole('button', { name: /add column/i }));

  expect(screen.getByText('Column titles must be unique.')).toBeInTheDocument();
  expect(readColumns()).toHaveLength(1);
});

test('shows and edits card details in the modal', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Review', 'First description');
  await addCard(user, 'Todo', 'Review', 'Second description');

  const cards = screen.getAllByText('Review');
  await user.click(cards[0]);
  const input = screen.getByLabelText('Card title');
  await user.clear(input);
  await user.type(input, 'Approved');
  const description = screen.getByLabelText('Description');
  expect(description).toHaveValue('First description');
  await user.clear(description);
  await user.type(description, 'Ready to ship');
  await user.click(screen.getByRole('button', { name: /save changes/i }));

  expect(readColumns()[0].cards.map((card) => card.title)).toEqual([
    'Approved',
    'Review',
  ]);
  expect(readColumns()[0].cards[0].description).toBe('Ready to ship');
});

test('deletes only the selected duplicate-title card from the modal', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Review');
  await addCard(user, 'Todo', 'Review');

  await user.click(screen.getAllByText('Review')[0]);
  await user.click(screen.getByRole('button', { name: /delete card/i }));

  expect(readColumns()[0].cards).toHaveLength(1);
});

test('moves a card from the modal column select', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Ship it');
  await addColumn(user, 'Done');

  await user.click(screen.getByText('Ship it'));
  await user.selectOptions(
    screen.getByLabelText('Column'),
    screen.getByRole('option', { name: 'Done' })
  );
  await user.click(screen.getByRole('button', { name: /save changes/i }));

  expect(
    readColumns().find((column) => column.title === 'Done')?.cards[0].title
  ).toBe('Ship it');
});

test('drags a card from one column to another by ID', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Ship it');
  await addColumn(user, 'Done');

  const storedColumns = readColumns();
  const card = storedColumns[0].cards[0];
  const dataTransfer = createDataTransfer();
  const doneColumn = screen
    .getByRole('heading', { name: 'Done' })
    .closest('section') as HTMLElement;

  fireEvent.dragStart(screen.getByRole('button', { name: /drag ship it/i }), {
    dataTransfer,
  });
  fireEvent.dragOver(doneColumn, { dataTransfer });
  fireEvent.drop(doneColumn, { dataTransfer });

  expect(
    readColumns().find((column) => column.title === 'Done')?.cards[0].id
  ).toBe(card.id);
});

test('renames and deletes a column with confirmation', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Ship it');

  await openColumnActions(user, 'Todo');
  await user.click(
    await screen.findByRole('menuitem', { name: /rename column/i })
  );
  const input = screen.getByLabelText('Column title');
  await user.clear(input);
  await user.type(input, 'Ready');
  await user.click(screen.getByRole('button', { name: /save changes/i }));

  await openColumnActions(user, 'Ready');
  await user.click(
    await screen.findByRole('menuitem', { name: /delete column/i })
  );
  expect(
    screen.getByText(/permanently delete 1 card in Ready/i)
  ).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /^delete column$/i }));

  expect(readColumns()).toEqual([]);
});

test('clears the board only after confirmation', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await user.click(screen.getByRole('button', { name: /clear board/i }));
  await user.click(screen.getByRole('button', { name: /cancel/i }));
  expect(readColumns()).toHaveLength(1);

  await user.click(screen.getByRole('button', { name: /clear board/i }));
  await user.click(screen.getByRole('button', { name: /^clear board$/i }));
  expect(readColumns()).toEqual([]);
});

test('closes a create dialog with Escape without saving', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole('button', { name: /add another column/i }));
  await user.type(screen.getByLabelText('Column title'), 'Todo');
  await user.keyboard('{Escape}');

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(readColumns()).toEqual([]);
});

const addColumn = async (
  user: ReturnType<typeof userEvent.setup>,
  title: string
) => {
  await user.click(screen.getByRole('button', { name: /add another column/i }));
  await user.type(screen.getByLabelText('Column title'), title);
  await user.click(screen.getByRole('button', { name: /add column/i }));
};

const addCard = async (
  user: ReturnType<typeof userEvent.setup>,
  columnTitle: string,
  title: string,
  description = ''
) => {
  const column = screen
    .getByRole('heading', { name: columnTitle })
    .closest('section') as HTMLElement;
  await user.click(within(column).getByRole('button', { name: /add.*card/i }));
  await user.type(screen.getByLabelText('Card title'), title);
  if (description) {
    await user.type(screen.getByLabelText('Description'), description);
  }
  await user.click(screen.getByRole('button', { name: /add card/i }));
};

const openColumnActions = async (
  _user: ReturnType<typeof userEvent.setup>,
  columnTitle: string
) => {
  fireEvent.mouseDown(
    screen.getByRole('button', { name: `Open ${columnTitle} column actions` }),
    { button: 0 }
  );
};

const readColumns = () =>
  JSON.parse(localStorage.getItem('columnsList') ?? '[]') as BoardColumn[];

const createDataTransfer = () => {
  const store = new Map<string, string>();

  return {
    dropEffect: 'none',
    effectAllowed: 'all',
    getData: (type: string) => store.get(type) ?? '',
    setData: (type: string, value: string) => {
      store.set(type, value);
    },
  };
};
