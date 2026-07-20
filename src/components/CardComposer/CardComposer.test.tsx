import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, vi } from 'vitest';

import App from '../../App';
import { fetchTagStorage } from '../../storage';
import {
  CREATED_AT,
  addCard,
  addColumn,
  chooseSelectOption,
  closeCardDialog,
  createBoardColumns,
  createBoardStateWithHistory,
  expectCardDialogTitle,
  getBoardCardButton,
  openBoardSettings,
  openColumnActions,
  openTagManager,
  pasteText,
  readColumns,
  resetAppTestEnvironment,
  selectEditorContents,
  selectEditorNode,
  selectText,
} from '../../test/appTestUtils';

beforeEach(resetAppTestEnvironment);

test('creates columns and cards from the global composer', async () => {
  const user = userEvent.setup();
  render(<App />);

  expect(screen.getByLabelText('New card')).toBeDisabled();
  expect(
    screen.getByRole('button', { name: /add column first/i })
  ).toBeInTheDocument();

  await addColumn(user, 'Todo');
  expect(screen.getByRole('heading', { name: 'Todo' })).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: /create card/i })
  ).not.toBeInTheDocument();

  await addCard(user, 'Todo', 'Ship it', 'Release the new Flowboard build.');
  expect(screen.getByText('Ship it')).toBeInTheDocument();
  expect(readColumns()[0].cards[0].title).toBe('Ship it');
  expect(readColumns()[0].cards[0].content).toBe(
    'Release the new Flowboard build.'
  );
  expect(readColumns()[0].cards[0].priority).toBe('medium');
  expect(readColumns()[0].cards[0].tagIds).toEqual([]);
  expect(Date.parse(readColumns()[0].cards[0].createdAt)).not.toBeNaN();
  expect(screen.queryByText(/kept for next card/i)).not.toBeInTheDocument();
  expect(
    screen.queryByText('Release the new Flowboard build.')
  ).not.toBeInTheDocument();
  await user.click(screen.getByText('Ship it'));
  expect(screen.getByText(/^Created /i).getAttribute('datetime')).toEqual(
    expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/)
  );
});

test('composer validates empty drafts and preserves unsent text during board interactions', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');

  expect(screen.getByRole('button', { name: /add card/i })).toBeDisabled();
  expect(screen.queryByText('Enter a card title.')).not.toBeInTheDocument();
  expect(readColumns()[0].cards).toEqual([]);

  await user.type(screen.getByLabelText('New card'), 'Draft card');
  await user.click(screen.getByRole('button', { name: /manage tags/i }));
  expect(
    screen.getByRole('dialog', { name: /manage tags/i })
  ).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /close tag manager/i }));

  expect(screen.getByLabelText('New card')).toHaveValue('Draft card');
  expect(readColumns()[0].cards).toEqual([]);
});

test('composer creates cards with selected column, priority, and inline-created tags', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await addColumn(user, 'Review');

  await chooseSelectOption(user, 'Destination column', 'Review');
  await chooseSelectOption(user, 'Priority', 'High');
  await user.click(screen.getByRole('combobox', { name: /^tags$/i }));
  await user.click(screen.getByRole('button', { name: /create tag/i }));
  await user.type(screen.getByLabelText('New tag name'), 'Design');
  expect(screen.getByLabelText('New tag name')).toHaveValue('Design');
  await user.keyboard('{Enter}');
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  await user.type(screen.getByLabelText('New card'), 'Polish composer');
  await user.click(screen.getByRole('button', { name: /add card/i }));

  expect(readColumns()[0].cards).toEqual([]);
  expect(readColumns()[1].cards[0]).toMatchObject({
    content: '',
    priority: 'high',
    tagIds: [fetchTagStorage()[0].id],
    title: 'Polish composer',
  });
  const card = getBoardCardButton('Polish composer');
  expect(card).toBeInTheDocument();
  expect(within(card).getByText('High')).toBeInTheDocument();
  expect(within(card).getByText('Design')).toBeInTheDocument();
  expect(screen.queryByText(/kept for next card/i)).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: /reset/i })
  ).not.toBeInTheDocument();

  await user.type(screen.getByLabelText('New card'), 'Default follow-up');
  await user.click(screen.getByRole('button', { name: /add card/i }));

  expect(readColumns()[1].cards[1]).toMatchObject({
    priority: 'medium',
    tagIds: [],
    title: 'Default follow-up',
  });
  expect(readColumns()[0].cards).toEqual([]);
  expect(screen.queryByText(/cmd\+enter/i)).not.toBeInTheDocument();
});

test('composer submits with command enter and preserves plain enter as content', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await user.type(screen.getByLabelText('New card'), 'Ship it{Enter}Body');
  expect(screen.getByLabelText('New card')).toHaveValue('Ship it\nBody');
  expect(readColumns()[0].cards).toEqual([]);

  await user.keyboard('{Meta>}{Enter}{/Meta}');

  expect(readColumns()[0].cards[0]).toMatchObject({
    content: 'Body',
    title: 'Ship it',
  });
  expect(screen.getByLabelText('New card')).toHaveValue('');
});
