import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

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
