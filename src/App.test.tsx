import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import App from './App';
import { reorderCard } from './dnd';
import { fetchStorage, fetchTagStorage } from './storage';
import type { BoardColumn } from './types';

const CREATED_AT = '2026-06-03T12:34:56.000Z';

beforeEach(() => {
  localStorage.clear();
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  });
});

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
  expect(screen.queryByText(/trello/i)).not.toBeInTheDocument();
});

test('collapses and expands the desktop sidebar', async () => {
  const user = userEvent.setup();
  render(<App />);

  expect(screen.getByRole('main')).toHaveClass('app--sidebar-expanded');

  await user.click(screen.getByRole('button', { name: /collapse sidebar/i }));
  expect(screen.getByRole('main')).toHaveClass('app--sidebar-collapsed');
  expect(screen.getByRole('button', { name: /^board$/i })).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /expand sidebar/i }));
  expect(screen.getByRole('main')).toHaveClass('app--sidebar-expanded');
});

test('opens and closes the mobile navigation drawer', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole('button', { name: /open navigation/i }));
  expect(screen.getByRole('main')).toHaveClass('app--mobile-sidebar-open');

  await user.click(
    screen.getAllByRole('button', { name: /close navigation/i })[0]
  );
  expect(screen.getByRole('main')).not.toHaveClass('app--mobile-sidebar-open');
});

test('changes and persists the app theme preference from the sidebar footer', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole('button', { name: /use dark theme/i }));

  expect(screen.getByRole('main')).toHaveAttribute('data-theme', 'dark');
  expect(screen.getByRole('main')).toHaveAttribute(
    'data-theme-preference',
    'dark'
  );
  expect(localStorage.getItem('flowboardThemePreference')).toBe('dark');
});

test('ignores legacy saved background values for the visible app shell', () => {
  localStorage.setItem(
    'boardBackground',
    JSON.stringify({
      type: 'image',
      value: '/flowboard-background.png',
    })
  );

  render(<App />);

  expect(screen.getByRole('main')).not.toHaveClass('app--image-background');
  expect(screen.getByRole('main').style.backgroundImage).toBe('');
  expect(
    screen.queryByRole('menuitem', { name: /background settings/i })
  ).not.toBeInTheDocument();
});

test('board actions live in the sidebar and the top-right menu is removed', () => {
  render(<App />);

  expect(
    screen.getByRole('button', { name: /manage tags/i })
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: /open board actions/i })
  ).not.toBeInTheDocument();
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: /background settings/i })
  ).not.toBeInTheDocument();
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
  expect(columns[0].cards[0].content).toBe('');
  expect(columns[0].cards[0].priority).toBe('medium');
  expect(columns[0].cards[0].tagIds).toEqual([]);
  expect(Date.parse(columns[0].cards[0].createdAt)).not.toBeNaN();
  expect(columns[0].cards[0].id).toBeTruthy();
  expect(localStorage.getItem('columnsList')).toContain(columns[0].id);
});

test('migrates stable-ID cards that predate content', () => {
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
    content: '',
    createdAt: expect.any(String),
    id: 'ship-it',
    priority: 'medium',
    tagIds: [],
    title: 'Ship it',
  });
  expect(Date.parse(fetchStorage()[0].cards[0].createdAt)).not.toBeNaN();
});

test('migrates card descriptions to content', () => {
  localStorage.setItem(
    'columnsList',
    JSON.stringify([
      {
        id: 'todo',
        title: 'Todo',
        cards: [
          {
            description: 'Legacy notes',
            id: 'ship-it',
            title: 'Ship it',
          },
        ],
        position: 0,
      },
    ])
  );

  expect(fetchStorage()[0].cards[0]).toEqual({
    content: 'Legacy notes',
    createdAt: expect.any(String),
    id: 'ship-it',
    priority: 'medium',
    tagIds: [],
    title: 'Ship it',
  });
  expect(Date.parse(fetchStorage()[0].cards[0].createdAt)).not.toBeNaN();
});

test('creates columns and cards from dialogs', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  expect(screen.getByRole('heading', { name: 'Todo' })).toBeInTheDocument();

  const column = screen
    .getByRole('heading', { name: 'Todo' })
    .closest('section') as HTMLElement;
  fireEvent.click(within(column).getByRole('button', { name: /create card/i }));
  const titleInput = await screen.findByLabelText('Card title');
  await waitFor(() => expect(titleInput).toHaveFocus());
  await user.click(screen.getByRole('button', { name: /close card/i }));

  await addCard(user, 'Todo', 'Ship it', 'Release the new Flowboard build.');
  expect(screen.getByText('Ship it')).toBeInTheDocument();
  expect(readColumns()[0].cards[0].title).toBe('Ship it');
  expect(readColumns()[0].cards[0].content).toBe(
    'Release the new Flowboard build.'
  );
  expect(readColumns()[0].cards[0].priority).toBe('medium');
  expect(readColumns()[0].cards[0].tagIds).toEqual([]);
  expect(Date.parse(readColumns()[0].cards[0].createdAt)).not.toBeNaN();
  expect(
    screen.queryByText('Release the new Flowboard build.')
  ).not.toBeInTheDocument();
  await user.click(screen.getByText('Ship it'));
  expect(screen.getByText(/^Created /i)).toHaveAttribute(
    'datetime',
    readColumns()[0].cards[0].createdAt
  );
});

test('closes an empty new-card draft without discard confirmation', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await openCreateCard(user, 'Todo');
  expect(screen.getByRole('dialog', { name: /new card/i })).toBeInTheDocument();
  await user.keyboard('{Escape}');

  expect(
    screen.queryByRole('alertdialog', { name: /discard new card/i })
  ).not.toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(readColumns()[0].cards).toEqual([]);

  await openCreateCard(user, 'Todo');
  await user.click(screen.getByRole('button', { name: /^cancel$/i }));

  expect(
    screen.queryByRole('alertdialog', { name: /discard new card/i })
  ).not.toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(readColumns()[0].cards).toEqual([]);
});

test('confirms before discarding a new-card draft with title text', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await openCreateCard(user, 'Todo');
  await user.type(screen.getByLabelText('Card title'), 'Draft card');
  await user.keyboard('{Escape}');

  const alert = screen.getByRole('alertdialog', {
    name: /discard new card/i,
  });
  expect(alert).toBeInTheDocument();

  await user.click(within(alert).getByRole('button', { name: /^cancel$/i }));
  await waitFor(() =>
    expect(
      screen.queryByRole('alertdialog', { name: /discard new card/i })
    ).not.toBeInTheDocument()
  );
  expect(await screen.findByLabelText('Card title')).toHaveValue('Draft card');

  await user.click(screen.getByRole('button', { name: /close card/i }));
  await user.click(screen.getByRole('button', { name: /discard card/i }));

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(readColumns()[0].cards).toEqual([]);
});

test('confirms before discarding a new-card draft with content', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await openCreateCard(user, 'Todo');
  await user.click(screen.getByLabelText('Content'));
  pasteText(screen.getByLabelText('Content'), 'Unsaved details');
  await user.click(screen.getByRole('button', { name: /close card/i }));

  const alert = screen.getByRole('alertdialog', {
    name: /discard new card/i,
  });
  expect(alert).toBeInTheDocument();

  await user.click(
    within(alert).getByRole('button', { name: /discard card/i })
  );

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(readColumns()[0].cards).toEqual([]);
});

test('confirms before discarding a new-card draft with selected tags', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await openTagManager(user);
  await user.type(screen.getByLabelText('New tag'), 'Design{Enter}');
  await user.click(screen.getByRole('button', { name: /close tag manager/i }));

  await openCreateCard(user, 'Todo');
  await user.click(screen.getByRole('button', { name: /no tags/i }));
  await user.click(screen.getByRole('option', { name: 'Design' }));
  await user.click(screen.getByRole('button', { name: /close card/i }));

  const alert = screen.getByRole('alertdialog', {
    name: /discard new card/i,
  });
  expect(alert).toBeInTheDocument();
  await user.click(
    within(alert).getByRole('button', { name: /discard card/i })
  );

  expect(readColumns()[0].cards).toEqual([]);
  expect(fetchTagStorage()).toEqual([
    { id: expect.any(String), name: 'Design' },
  ]);
});

test('closes a priority-only new-card draft without discard confirmation', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await openCreateCard(user, 'Todo');
  await chooseSelectOption(user, 'Priority', 'High');
  await user.click(screen.getByRole('button', { name: /close card/i }));

  expect(
    screen.queryByRole('alertdialog', { name: /discard new card/i })
  ).not.toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(readColumns()[0].cards).toEqual([]);
});

test('renders column creation as a placeholder in the columns list', () => {
  render(<App />);

  const addColumn = screen.getByRole('button', {
    name: /add another column/i,
  });

  expect(addColumn).toHaveClass('add-column-placeholder');
  expect(addColumn.parentElement).toHaveClass('columns-list');
  expect(document.querySelector('.board-toolbar')).not.toBeInTheDocument();
});

test('rejects blank and duplicate column titles', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole('button', { name: /add another column/i }));
  expect(screen.getByPlaceholderText('Ready for review')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /add column/i }));
  expect(screen.getByText('Enter a column title.')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /close dialog/i }));

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
  const content = screen.getByLabelText('Content');
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

  await user.click(screen.getByRole('button', { name: 'Design' }));
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

test('manages board tags from the sidebar', async () => {
  const user = userEvent.setup();
  render(<App />);

  await openTagManager(user);
  await user.type(screen.getByLabelText('New tag'), 'Bug{Enter}');
  expect(fetchTagStorage()[0].name).toBe('Bug');

  await user.click(screen.getByRole('button', { name: /rename bug tag/i }));
  await user.clear(screen.getByLabelText('Edit Bug tag'));
  await user.type(screen.getByLabelText('Edit Bug tag'), 'Issue');
  await user.click(screen.getByLabelText('New tag'));
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: /rename issue tag/i })
    ).toBeInTheDocument()
  );
  expect(fetchTagStorage()[0].name).toBe('Issue');

  await user.click(screen.getByRole('button', { name: /remove issue tag/i }));
  expect(fetchTagStorage()).toEqual([]);
});

test('confirms removing tags that are assigned to cards', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Tagged');
  await user.click(screen.getByText('Tagged'));
  await user.click(screen.getByRole('button', { name: /no tags/i }));
  await user.click(screen.getByRole('button', { name: /create tag/i }));
  await user.type(screen.getByLabelText('New tag name'), 'Design{Enter}');
  await user.click(screen.getByRole('button', { name: /close card/i }));

  await openTagManager(user);
  await user.click(screen.getByRole('button', { name: /remove design tag/i }));
  expect(
    screen.getByRole('alertdialog', { name: /remove this tag/i })
  ).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /^remove tag$/i }));

  expect(fetchTagStorage()).toEqual([]);
  expect(readColumns()[0].cards[0].tagIds).toEqual([]);
});

test('keeps the last valid title when an existing card title is cleared', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Ship it', 'Initial content');

  await user.click(screen.getByText('Ship it'));
  await user.click(screen.getByRole('button', { name: /edit card title/i }));
  await user.clear(screen.getByLabelText('Card title'));
  pasteText(screen.getByLabelText('Content'), ' updated');
  await user.keyboard('{Escape}');

  expect(readColumns()[0].cards[0].title).toBe('Ship it');
  expect(readColumns()[0].cards[0].content).toContain('updated');
});

test('exports card content as Markdown', async () => {
  const user = userEvent.setup();
  const writeText = vi
    .spyOn(navigator.clipboard, 'writeText')
    .mockResolvedValue(undefined);
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Prompt', '# Context');

  await user.click(screen.getByText('Prompt'));
  expect(
    screen.getByRole('toolbar', { name: /content formatting/i })
  ).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /copy markdown/i }));

  expect(writeText).toHaveBeenCalledWith('# Context');
});

test('preserves link, code, and list Markdown through the editor', async () => {
  const user = userEvent.setup();
  const writeText = vi
    .spyOn(navigator.clipboard, 'writeText')
    .mockResolvedValue(undefined);
  localStorage.setItem(
    'columnsList',
    JSON.stringify([
      {
        cards: [
          {
            content: '[Docs](https://tiptap.dev)\n\n- `code`',
            createdAt: CREATED_AT,
            id: 'prompt',
            title: 'Prompt',
          },
        ],
        id: 'todo',
        position: 0,
        title: 'Todo',
      },
    ])
  );
  render(<App />);

  await user.click(screen.getByText('Prompt'));
  await user.click(screen.getByRole('button', { name: /copy markdown/i }));

  expect(writeText).toHaveBeenCalledWith(
    '[Docs](https://tiptap.dev)\n\n- `code`'
  );
});

test('drops image files into card content as Markdown data URLs', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Visual');
  await user.click(screen.getByText('Visual'));

  const content = screen.getByLabelText('Content');
  const image = new File(['image-bytes'], 'diagram.png', { type: 'image/png' });
  fireEvent.drop(content, {
    clientX: 0,
    clientY: 0,
    dataTransfer: {
      files: [image],
      types: ['Files'],
    },
  });

  await waitFor(() => {
    expect(readColumns()[0].cards[0].content).toMatch(
      /^!\[diagram\.png]\(data:image\/png;base64,/
    );
  });
});

test('creates and toggles task lists as Markdown checkboxes', async () => {
  const user = userEvent.setup();
  const writeText = vi
    .spyOn(navigator.clipboard, 'writeText')
    .mockResolvedValue(undefined);
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Checklist', 'Ship editor');
  await user.click(screen.getByText('Checklist'));
  await user.click(screen.getByLabelText('Content'));
  await chooseSelectOption(user, 'List style', 'Task list');

  const checkbox = await screen.findByRole('checkbox', {
    name: /incomplete task: ship editor/i,
  });
  await user.click(checkbox);
  await user.click(screen.getByRole('button', { name: /copy markdown/i }));

  expect(writeText).toHaveBeenLastCalledWith('- [x] Ship editor');
  expect(readColumns()[0].cards[0].content).toBe('- [x] Ship editor');
});

test('applies heading and alignment dropdown formatting', async () => {
  const user = userEvent.setup();
  const writeText = vi
    .spyOn(navigator.clipboard, 'writeText')
    .mockResolvedValue(undefined);
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Format', 'Center me');
  await user.click(screen.getByText('Format'));
  await user.click(screen.getByLabelText('Content'));
  await chooseSelectOption(user, 'Text style', 'Heading 3');
  await chooseSelectOption(user, 'Text alignment', 'Align center');
  await user.click(screen.getByRole('button', { name: /copy markdown/i }));

  expect(writeText).toHaveBeenLastCalledWith(
    '<h3 style="text-align: center">Center me</h3>'
  );

  await user.keyboard('{Escape}');
  await user.click(screen.getByText('Format'));
  expect(screen.getByRole('heading', { name: 'Center me' })).toHaveStyle({
    textAlign: 'center',
  });
});

test('creates, opens, edits, and removes links from editor surfaces', async () => {
  const user = userEvent.setup();
  const writeText = vi
    .spyOn(navigator.clipboard, 'writeText')
    .mockResolvedValue(undefined);
  const open = vi.spyOn(window, 'open').mockReturnValue(null);
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Link card', 'Docs');
  await user.click(screen.getByText('Link card'));

  const content = screen.getByLabelText('Content');
  selectEditorContents(content);
  await user.click(screen.getByRole('button', { name: 'Link' }));
  await user.type(await screen.findByLabelText('Link URL'), 'tiptap.dev');
  await user.click(screen.getByRole('button', { name: 'Apply' }));
  await user.click(screen.getByRole('button', { name: /copy markdown/i }));
  expect(writeText).toHaveBeenLastCalledWith('[Docs](https://tiptap.dev)');

  selectEditorContents(content);
  await user.click(await screen.findByRole('button', { name: /open link/i }));
  expect(open).toHaveBeenCalledWith(
    'https://tiptap.dev',
    '_blank',
    'noopener,noreferrer'
  );

  await user.click(screen.getByRole('button', { name: /edit link/i }));
  await user.clear(screen.getByLabelText('Link URL'));
  await user.type(screen.getByLabelText('Link URL'), 'https://example.com/docs');
  await user.click(screen.getByRole('button', { name: /apply link edit/i }));
  await user.click(screen.getByRole('button', { name: /copy markdown/i }));
  expect(writeText).toHaveBeenLastCalledWith(
    '[Docs](https://example.com/docs)'
  );

  selectEditorContents(content);
  await user.click(await screen.findByRole('button', { name: /remove link/i }));
  await user.click(screen.getByRole('button', { name: /copy markdown/i }));
  expect(writeText).toHaveBeenLastCalledWith('Docs');
});

test('inserts image URLs from a Flowboard popover', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Remote image');
  await user.click(screen.getByText('Remote image'));
  await user.click(screen.getByRole('button', { name: /image url/i }));
  await user.type(
    await screen.findByLabelText('Image URL'),
    'https://images.example.com/diagram.png'
  );
  await user.click(screen.getByRole('button', { name: /^insert$/i }));

  await waitFor(() =>
    expect(readColumns()[0].cards[0].content).toBe(
      '![](https://images.example.com/diagram.png)'
    )
  );

  await user.click(screen.getByRole('button', { name: /close card/i }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  await user.click(screen.getByText('Remote image'));
  expect(screen.getByLabelText('Content').querySelector('img')).toHaveAttribute(
    'src',
    'https://images.example.com/diagram.png'
  );
});

test('bold formatting is visible and serializes as Markdown', async () => {
  const user = userEvent.setup();
  const writeText = vi
    .spyOn(navigator.clipboard, 'writeText')
    .mockResolvedValue(undefined);
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Bold card', 'Important');
  await user.click(screen.getByText('Bold card'));

  const content = screen.getByLabelText('Content');
  selectEditorContents(content);
  await user.click(screen.getByRole('button', { name: 'Bold' }));

  expect(content.querySelector('strong')).toHaveTextContent('Important');
  await user.click(screen.getByRole('button', { name: /copy markdown/i }));
  expect(writeText).toHaveBeenLastCalledWith('**Important**');
});

test('updates toolbar active states as editor selection changes', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(
    user,
    'Todo',
    'State card',
    '# Heading\n\nParagraph\n\n- Bullet\n\n[Docs](https://tiptap.dev)\n\n**Important**'
  );
  await user.click(screen.getByText('State card'));

  const content = screen.getByLabelText('Content');
  const textStyle = screen.getByRole('combobox', { name: 'Text style' });
  const listStyle = screen.getByRole('combobox', { name: 'List style' });
  const bold = screen.getByRole('button', { name: 'Bold' });
  const link = screen.getByRole('button', { name: 'Link' });

  selectEditorNode(content, 'p');
  await waitFor(() => expect(textStyle).toHaveAttribute('aria-pressed', 'false'));
  expect(listStyle).toHaveAttribute('aria-pressed', 'false');
  expect(bold).toHaveAttribute('aria-pressed', 'false');
  expect(link).toHaveAttribute('aria-pressed', 'false');

  selectEditorNode(content, 'h1');
  await waitFor(() => expect(textStyle).toHaveAttribute('aria-pressed', 'true'));
  expect(textStyle).toHaveAttribute('aria-label', 'Text style: Heading 1');

  selectEditorNode(content, 'li');
  await waitFor(() => expect(listStyle).toHaveAttribute('aria-pressed', 'true'));
  expect(listStyle).toHaveAttribute('aria-label', 'List style: Bullet list');

  selectEditorNode(content, 'a');
  await waitFor(() => expect(link).toHaveAttribute('aria-pressed', 'true'));

  selectEditorNode(content, 'strong');
  await waitFor(() => expect(bold).toHaveAttribute('aria-pressed', 'true'));

  selectEditorNode(content, 'p');
  await waitFor(() => expect(textStyle).toHaveAttribute('aria-pressed', 'false'));
  expect(listStyle).toHaveAttribute('aria-pressed', 'false');
  expect(bold).toHaveAttribute('aria-pressed', 'false');
  expect(link).toHaveAttribute('aria-pressed', 'false');
});

test('shows rich text toolbar tooltips on hover', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Tooltip card', 'Hover me');
  await user.click(screen.getByText('Tooltip card'));

  await user.hover(screen.getByRole('button', { name: 'Undo' }));
  expect(await screen.findByText('Undo')).toBeInTheDocument();
  await user.unhover(screen.getByRole('button', { name: 'Undo' }));

  await user.hover(screen.getByRole('button', { name: 'Bold' }));

  expect(await screen.findByText('Bold')).toBeInTheDocument();
});

test('shows contextual image actions for selected images', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Image bubble');
  await user.click(screen.getByText('Image bubble'));
  await user.click(screen.getByRole('button', { name: /image url/i }));
  await user.type(
    await screen.findByLabelText('Image URL'),
    'https://images.example.com/diagram.png'
  );
  await user.click(screen.getByRole('button', { name: 'Insert' }));

  const content = screen.getByLabelText('Content');
  const image = await waitFor(() => {
    const renderedImage = content.querySelector('img');

    expect(renderedImage).toBeInTheDocument();

    return renderedImage as HTMLImageElement;
  });
  await user.click(image);

  expect(await screen.findByRole('button', { name: /edit image/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /open image/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /remove image/i })).toBeInTheDocument();
});

test('reorders cards upward and downward in the same column', () => {
  const columns = createBoardColumns();

  const movedUp = reorderCard(columns, {
    cardId: 'third',
    closestEdge: 'top',
    fromColumnId: 'todo',
    targetCardId: 'first',
    toColumnId: 'todo',
  });
  expect(movedUp[0].cards.map((card) => card.id)).toEqual([
    'third',
    'first',
    'second',
  ]);

  const movedDown = reorderCard(movedUp, {
    cardId: 'third',
    closestEdge: 'bottom',
    fromColumnId: 'todo',
    targetCardId: 'second',
    toColumnId: 'todo',
  });
  expect(movedDown[0].cards.map((card) => card.id)).toEqual([
    'first',
    'second',
    'third',
  ]);
});

test('moves a card to a precise position in another column', () => {
  const columns = createBoardColumns();
  const moved = reorderCard(columns, {
    cardId: 'second',
    closestEdge: 'top',
    fromColumnId: 'todo',
    targetCardId: 'done',
    toColumnId: 'complete',
  });

  expect(moved[0].cards.map((card) => card.id)).toEqual(['first', 'third']);
  expect(moved[1].cards.map((card) => card.id)).toEqual(['second', 'done']);
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
  expect(
    screen.queryByRole('button', { name: /save changes/i })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: /cancel/i })
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /close dialog/i }));

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

test('keeps rename column dialog open when the title is blank', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await openColumnActions(user, 'Todo');
  await user.click(
    await screen.findByRole('menuitem', { name: /rename column/i })
  );

  await user.clear(screen.getByLabelText('Column title'));
  await user.keyboard('{Escape}');

  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByText('Enter a column title.')).toBeInTheDocument();
  expect(readColumns()[0].title).toBe('Todo');
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

test('clear board sidebar command appears only when the board can be cleared', async () => {
  const user = userEvent.setup();
  render(<App />);

  expect(
    screen.queryByRole('button', { name: /clear board/i })
  ).not.toBeInTheDocument();

  await addColumn(user, 'Todo');
  expect(
    screen.getByRole('button', { name: /clear board/i })
  ).toBeInTheDocument();
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
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  );
  await waitFor(() =>
    expect(
      document.querySelector('[data-base-ui-inert]')
    ).not.toBeInTheDocument()
  );
};

const addCard = async (
  user: ReturnType<typeof userEvent.setup>,
  columnTitle: string,
  title: string,
  content = ''
) => {
  await openCreateCard(user, columnTitle);
  await user.type(await screen.findByLabelText('Card title'), title);
  if (content) {
    await user.click(screen.getByLabelText('Content'));
    pasteText(screen.getByLabelText('Content'), content);
  }
  await user.click(screen.getByRole('button', { name: /^create$/i }));
};

const openCreateCard = async (
  _user: ReturnType<typeof userEvent.setup>,
  columnTitle: string
) => {
  const column = screen
    .getByRole('heading', { name: columnTitle })
    .closest('section') as HTMLElement;
  fireEvent.click(within(column).getByRole('button', { name: /create card/i }));
  await screen.findByLabelText('Card title');
};

const pasteText = (element: HTMLElement, text: string) => {
  fireEvent.paste(element, {
    clipboardData: {
      files: [],
      getData: (type: string) => (type === 'text/plain' ? text : ''),
      types: ['text/plain'],
    },
  });
};

const selectEditorContents = (element: HTMLElement) => {
  const target =
    element.querySelector('a, p, h1, h2, h3, h4, li') ?? element;
  selectEditorNodeContents(element, target);
};

const selectEditorNode = (element: HTMLElement, selector: string) => {
  const target = element.querySelector(selector);

  if (!target) {
    throw new Error(`Editor node not found: ${selector}`);
  }

  selectEditorNodeContents(element, target);
};

const selectEditorNodeContents = (element: HTMLElement, target: Element) => {
  element.focus();

  const range = document.createRange();
  range.selectNodeContents(target);

  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
  document.dispatchEvent(new Event('selectionchange'));
  fireEvent.mouseUp(element);
  fireEvent.keyUp(element);
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

const chooseSelectOption = async (
  user: ReturnType<typeof userEvent.setup>,
  label: string,
  option: string
) => {
  await user.click(screen.getByRole('combobox', { name: label }));
  await user.click(await screen.findByRole('option', { name: option }));
};

const openTagManager = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: /manage tags/i }));
  await screen.findByRole('dialog', { name: /manage tags/i });
};

const readColumns = () =>
  JSON.parse(localStorage.getItem('columnsList') ?? '[]') as BoardColumn[];

const createBoardColumns = (): BoardColumn[] => [
  {
    cards: [
      {
        content: '',
        createdAt: CREATED_AT,
        id: 'first',
        priority: 'medium',
        tagIds: [],
        title: 'First',
      },
      {
        content: '',
        createdAt: CREATED_AT,
        id: 'second',
        priority: 'medium',
        tagIds: [],
        title: 'Second',
      },
      {
        content: '',
        createdAt: CREATED_AT,
        id: 'third',
        priority: 'medium',
        tagIds: [],
        title: 'Third',
      },
    ],
    id: 'todo',
    position: 0,
    title: 'Todo',
  },
  {
    cards: [
      {
        content: '',
        createdAt: CREATED_AT,
        id: 'done',
        priority: 'medium',
        tagIds: [],
        title: 'Done',
      },
    ],
    id: 'complete',
    position: 10,
    title: 'Complete',
  },
];
