import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, test } from 'vitest';

import App from './App';
import { readColumns, resetAppTestEnvironment } from './test/appTestUtils';

beforeEach(resetAppTestEnvironment);

test('renders the Flowboard app shell and quiet board heading', () => {
  render(<App />);

  expect(
    screen.getByRole('complementary', { name: /flowboard navigation/i })
  ).toBeInTheDocument();
  expect(screen.getByText('Flowboard')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /board/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^board$/i })).toHaveAttribute(
    'aria-current',
    'page'
  );
  expect(
    within(
      screen.getByRole('complementary', { name: /flowboard navigation/i })
    ).queryByRole('button', { name: /complete work/i })
  ).not.toBeInTheDocument();
  expect(
    within(screen.getByRole('region', { name: /board workspace/i })).getByRole(
      'button',
      { name: /complete work/i }
    )
  ).toBeInTheDocument();
  expect(screen.queryByText(/trello/i)).not.toBeInTheDocument();
});

test('resolves root and sidebar navigation through canonical routes', async () => {
  const user = userEvent.setup();
  render(<App />);

  await waitFor(() => expect(window.location.pathname).toBe('/board'));

  await user.click(screen.getByRole('button', { name: /^history$/i }));
  expect(window.location.pathname).toBe('/history');
  expect(screen.getByRole('heading', { name: /history/i })).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /^board$/i }));
  expect(window.location.pathname).toBe('/board');
  expect(screen.getByRole('heading', { name: /board/i })).toBeInTheDocument();
});

test('closes a create dialog with Escape without saving', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(
    screen.getByRole('button', {
      name: /add another column|create first column/i,
    })
  );
  await user.type(screen.getByLabelText('Column title'), 'Todo');
  await user.keyboard('{Escape}');

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(readColumns()).toEqual([]);
});
