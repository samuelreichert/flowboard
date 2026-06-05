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
import { fetchStorage } from './storage';
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

test('renders the Flowboard identity', () => {
  render(<App />);

  expect(
    screen.getByRole('heading', { name: /flowboard/i })
  ).toBeInTheDocument();
  expect(screen.queryByText(/trello/i)).not.toBeInTheDocument();
});

test('uses the original image as the default board background', () => {
  render(<App />);

  expect(screen.getByRole('main')).toHaveClass('app--image-background');
  expect(screen.getByRole('main').style.backgroundImage).toContain(
    '/flowboard-background.png'
  );
});

test('changes and persists a solid board background', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole('button', { name: /background/i }));
  await user.click(
    screen.getByRole('button', { name: /use lavender background/i })
  );

  expect(screen.getByRole('main')).toHaveStyle({
    backgroundColor: '#f3f0ff',
  });
  expect(localStorage.getItem('boardBackground')).toBe(
    JSON.stringify({ type: 'color', value: '#f3f0ff' })
  );
});

test('restores the original image as a board background preset', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole('button', { name: /background/i }));
  await user.click(
    screen.getByRole('button', { name: /use northern lights background/i })
  );

  expect(screen.getByRole('main')).toHaveClass('app--image-background');
  expect(screen.getByRole('main').style.backgroundImage).toContain(
    '/flowboard-background.png'
  );
  expect(localStorage.getItem('boardBackground')).toBe(
    JSON.stringify({ type: 'image', value: '/flowboard-background.png' })
  );
});

test('applies and persists a custom background image URL', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole('button', { name: /background/i }));
  await user.type(
    screen.getByLabelText(/image url/i),
    'https://images.example.com/cover.jpg'
  );
  await user.click(screen.getByRole('button', { name: /apply/i }));

  expect(screen.getByRole('main')).toHaveClass('app--image-background');
  expect(screen.getByRole('main').style.backgroundImage).toContain(
    'https://images.example.com/cover.jpg'
  );
  expect(localStorage.getItem('boardBackground')).toBe(
    JSON.stringify({
      type: 'image',
      value: 'https://images.example.com/cover.jpg',
    })
  );
});

test('rejects an insecure custom background image URL', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole('button', { name: /background/i }));
  await user.type(
    screen.getByLabelText(/image url/i),
    'http://images.example.com/cover.jpg'
  );
  await user.click(screen.getByRole('button', { name: /apply/i }));

  expect(
    screen.getByText('Enter a secure HTTPS image URL.')
  ).toBeInTheDocument();
  expect(localStorage.getItem('boardBackground')).toBeNull();
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
  await user.selectOptions(
    screen.getByLabelText('Column'),
    screen.getByRole('option', { name: 'Done' })
  );

  expect(
    readColumns().find((column) => column.title === 'Done')?.cards[0].title
  ).toBe('Ship it');
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
  expect(
    screen.getByRole('button', { name: /clear board/i }).parentElement
  ).toHaveClass('board__actions');
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
  const column = screen
    .getByRole('heading', { name: columnTitle })
    .closest('section') as HTMLElement;
  fireEvent.click(within(column).getByRole('button', { name: /create card/i }));
  await user.type(await screen.findByLabelText('Card title'), title);
  if (content) {
    await user.click(screen.getByLabelText('Content'));
    pasteText(screen.getByLabelText('Content'), content);
  }
  await user.click(screen.getByRole('button', { name: /^create$/i }));
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

const createBoardColumns = (): BoardColumn[] => [
  {
    cards: [
      { content: '', createdAt: CREATED_AT, id: 'first', title: 'First' },
      { content: '', createdAt: CREATED_AT, id: 'second', title: 'Second' },
      { content: '', createdAt: CREATED_AT, id: 'third', title: 'Third' },
    ],
    id: 'todo',
    position: 0,
    title: 'Todo',
  },
  {
    cards: [{ content: '', createdAt: CREATED_AT, id: 'done', title: 'Done' }],
    id: 'complete',
    position: 10,
    title: 'Complete',
  },
];
