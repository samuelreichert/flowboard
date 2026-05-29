import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import type { BoardColumn } from './types';

afterEach(() => {
  localStorage.clear();
});

test('renders the board title', () => {
  render(<App />);

  expect(
    screen.getByRole('heading', { name: /trello board/i })
  ).toBeInTheDocument();
});

test('adds a column and card', async () => {
  const user = userEvent.setup();

  render(<App />);

  await user.click(screen.getByRole('button', { name: /\+ add a column/i }));
  await user.type(screen.getByPlaceholderText(/enter column title/i), 'Todo');
  await user.click(screen.getByRole('button', { name: /add column/i }));

  expect(screen.getByRole('heading', { name: 'Todo' })).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /\+ add a card/i }));
  await user.type(screen.getByPlaceholderText(/enter card title/i), 'Ship it');
  await user.click(screen.getByRole('button', { name: /add card/i }));

  expect(screen.getByText('Ship it')).toBeInTheDocument();
  expect(localStorage.getItem('columnsList')).toContain('Ship it');
});

test('drags a card from one column to another', async () => {
  const user = userEvent.setup();

  render(<App />);

  await user.click(screen.getByRole('button', { name: /\+ add a column/i }));
  await user.type(screen.getByPlaceholderText(/enter column title/i), 'Todo');
  await user.click(screen.getByRole('button', { name: /add column/i }));

  await user.click(screen.getByRole('button', { name: /\+ add a card/i }));
  await user.type(screen.getByPlaceholderText(/enter card title/i), 'Ship it');
  await user.click(screen.getByRole('button', { name: /add card/i }));

  await user.click(
    screen.getByRole('button', { name: /\+ add another column/i })
  );
  await user.type(screen.getByPlaceholderText(/enter column title/i), 'Done');
  await user.click(screen.getByRole('button', { name: /add column/i }));

  const card = screen.getByText('Ship it');
  const doneColumn = screen.getByRole('heading', { name: 'Done' })
    .parentElement as HTMLElement;
  const dataTransfer = createDataTransfer();

  fireEvent.dragStart(card, { dataTransfer });
  fireEvent.dragOver(doneColumn, { dataTransfer });
  fireEvent.drop(doneColumn, { dataTransfer });

  const columns = JSON.parse(
    localStorage.getItem('columnsList') ?? '[]'
  ) as BoardColumn[];

  expect(columns.find((column) => column.title === 'Todo')?.cards).toEqual([]);
  expect(columns.find((column) => column.title === 'Done')?.cards).toEqual([
    'Ship it',
  ]);
});

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
