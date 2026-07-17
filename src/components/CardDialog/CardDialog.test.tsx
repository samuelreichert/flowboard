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
import '../CardContentEditor';
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

test('shows and edits card details in the modal', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Review', 'First content');
  await addCard(user, 'Todo', 'Review', 'Second content');

  const cards = screen.getAllByText('Review');
  await user.click(cards[0]);
  expect(
    screen.queryByRole('button', { name: /save changes/i })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: /cancel/i })
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /delete card/i })
  ).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /edit card title/i }));
  const input = screen.getByLabelText('Card title');
  await user.clear(input);
  await user.type(input, 'Approved');
  const content = await screen.findByLabelText('Content');
  expect(content).toHaveTextContent('First content');
  pasteText(content, ' Ready to ship');
  await user.click(screen.getByRole('button', { name: /close card/i }));

  expect(
    screen.queryByRole('alertdialog', { name: /discard new card/i })
  ).not.toBeInTheDocument();
  expect(readColumns()[0].cards.map((card) => card.title)).toEqual([
    'Approved',
    'Review',
  ]);
  expect(readColumns()[0].cards[0].content).toContain('Ready to ship');
});

test('opens card details from the card title, metadata, and background', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Review surfaces', 'First content');

  await user.click(screen.getByText('Review surfaces'));
  expectCardDialogTitle('Review surfaces');
  await closeCardDialog(user);

  await user.click(screen.getAllByText('Medium')[0]);
  expectCardDialogTitle('Review surfaces');
  await closeCardDialog(user);

  await user.click(getBoardCardButton('Review surfaces'));
  expectCardDialogTitle('Review surfaces');
});

test('keeps card title text selectable without opening details', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Selectable title');

  const title = screen.getByText('Selectable title');
  selectText(title);
  fireEvent.click(title);

  expect(window.getSelection()?.toString()).toBe('Selectable title');
  expect(
    screen.queryByRole('dialog', { name: /selectable title/i })
  ).not.toBeInTheDocument();
  expect(readColumns()[0].cards[0].title).toBe('Selectable title');
});

test('does not expose a dedicated card drag-handle control', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Move me');

  expect(
    screen.queryByRole('button', { name: /drag move me/i })
  ).not.toBeInTheDocument();
});

test('deletes only the selected duplicate-title card from the modal', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Review');
  await addCard(user, 'Todo', 'Review');

  await user.click(screen.getAllByText('Review')[0]);
  await user.click(screen.getByRole('button', { name: /delete card/i }));
  const confirmDialog = screen.getByRole('alertdialog', {
    name: /delete this card/i,
  });
  expect(confirmDialog).toBeInTheDocument();
  expect(screen.getByText(/permanently delete Review/i)).toBeInTheDocument();
  expect(readColumns()[0].cards).toHaveLength(2);

  await user.click(screen.getByRole('button', { name: /cancel/i }));
  expect(
    screen.queryByRole('alertdialog', { name: /delete this card/i })
  ).not.toBeInTheDocument();
  expect(readColumns()[0].cards).toHaveLength(2);

  await user.click(screen.getByRole('button', { name: /delete card/i }));
  await user.click(
    within(
      screen.getByRole('alertdialog', { name: /delete this card/i })
    ).getByRole('button', { name: /delete card/i })
  );

  expect(readColumns()[0].cards).toHaveLength(1);
});

test('moves a card from the modal column select', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Ship it');
  await addColumn(user, 'Done');

  await user.click(screen.getByText('Ship it'));
  await chooseSelectOption(user, 'Column', 'Done');

  expect(
    readColumns().find((column) => column.title === 'Done')?.cards[0].title
  ).toBe('Ship it');
});

test('edits card priority and displays it on the board', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Escalate');

  await user.click(screen.getByText('Escalate'));
  await chooseSelectOption(user, 'Priority', 'High');
  await user.click(screen.getByRole('button', { name: /close card/i }));

  expect(readColumns()[0].cards[0].priority).toBe('high');
  expect(screen.getByText('High')).toBeInTheDocument();
});

test('creates, assigns, and removes card tags from the card dropdown', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Tagged');

  await user.click(screen.getByText('Tagged'));
  await user.click(screen.getByRole('button', { name: /no tags/i }));
  await user.click(screen.getByRole('button', { name: /create tag/i }));
  await user.type(screen.getByLabelText('New tag name'), 'Design{Enter}');

  expect(fetchTagStorage()).toEqual([
    { id: expect.any(String), name: 'Design' },
  ]);
  expect(readColumns()[0].cards[0].tagIds).toEqual([fetchTagStorage()[0].id]);
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

  await user.click(await screen.findByRole('button', { name: 'Design' }));
  await user.click(screen.getByRole('option', { name: 'Design' }));
  expect(readColumns()[0].cards[0].tagIds).toEqual([]);
});

test('closes the tag dropdown when clicking outside', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Tagged');
  await user.click(screen.getByText('Tagged'));
  await user.click(screen.getByRole('button', { name: /no tags/i }));
  expect(screen.getByRole('listbox')).toBeInTheDocument();

  await user.click(screen.getByText('Content'));

  await waitFor(() =>
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  );
});

test('keeps the last valid title when an existing card title is cleared', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Ship it', 'Initial content');

  await user.click(screen.getByText('Ship it'));
  await user.click(screen.getByRole('button', { name: /edit card title/i }));
  await user.clear(screen.getByLabelText('Card title'));
  pasteText(await screen.findByLabelText('Content'), ' updated');
  await user.keyboard('{Escape}');

  expect(readColumns()[0].cards[0].title).toBe('Ship it');
  expect(readColumns()[0].cards[0].content).toContain('updated');
});

test('updates card title without sending rich content or legacy board saves', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Ship it', 'Rich body');
  await user.click(screen.getByText('Ship it'));

  const fetchMock = vi.mocked(fetch);

  fetchMock.mockClear();
  await user.click(screen.getByRole('button', { name: /edit card title/i }));
  await user.clear(screen.getByLabelText('Card title'));
  await user.type(screen.getByLabelText('Card title'), 'Renamed');
  await user.click(screen.getByRole('button', { name: /close card/i }));

  await waitFor(() =>
    expect(
      fetchMock.mock.calls.some(
        ([url, init]) =>
          String(url).includes('/api/board/cards/') && init?.method === 'PATCH'
      )
    ).toBe(true)
  );
  const titlePatch = fetchMock.mock.calls.find(
    ([url, init]) =>
      String(url).includes('/api/board/cards/') && init?.method === 'PATCH'
  )?.[1];

  expect(JSON.parse(String(titlePatch?.body))).toEqual({ title: 'Renamed' });
  expect(
    fetchMock.mock.calls.some(
      ([url, init]) => String(url).includes('/api/boards/') && init?.method === 'PUT'
    )
  ).toBe(false);
});
