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
import { LocalizationProvider } from '../../LocalizationProvider';
import CardContentEditor from './index';
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
  seedBoardState,
  selectEditorContents,
  selectEditorNode,
  selectText,
} from '../../test/appTestUtils';

beforeEach(() => {
  vi.restoreAllMocks();
  resetAppTestEnvironment();
});

test('exports card content as Markdown', async () => {
  const user = userEvent.setup();
  const writeText = vi
    .spyOn(navigator.clipboard, 'writeText')
    .mockResolvedValue(undefined);
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Prompt', '# Context');

  fireEvent.click(screen.getByText('Prompt'));
  expect(
    await screen.findByRole('toolbar', { name: /content formatting/i })
  ).toBeInTheDocument();
  const copyButton = await screen.findByRole('button', {
    name: /copy markdown/i,
  });
  await waitFor(() => expect(copyButton).not.toBeDisabled());
  await user.click(copyButton);

  await waitFor(() => expect(writeText).toHaveBeenCalledWith('# Context'));

  fireEvent.click(screen.getByRole('button', { name: /close card/i }));
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  );
});

test('visually groups toolbar controls without removing accessible commands', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Grouped toolbar', 'Content');
  fireEvent.click(screen.getByText('Grouped toolbar'));

  const toolbar = await screen.findByRole('toolbar', {
    name: /content formatting/i,
  });

  expect(
    toolbar.querySelectorAll('.editor-toolbar__separator').length
  ).toBeGreaterThan(0);
  expect(
    within(toolbar).getByRole('button', { name: 'Bold' })
  ).toBeInTheDocument();
  expect(
    within(toolbar).getByRole('button', { name: /copy markdown/i })
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /close card/i }));
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  );
});

test('preserves link, code, and list Markdown through the editor', async () => {
  seedBoardState({
    columns: [
      {
        cards: [
          {
            content: '[Docs](https://tiptap.dev)\n\n- `code`',
            createdAt: CREATED_AT,
            id: 'prompt',
            priority: 'medium',
            tagIds: [],
            title: 'Prompt',
          },
        ],
        id: 'todo',
        position: 0,
        title: 'Todo',
      },
    ],
  });
  render(<App />);

  fireEvent.click(screen.getByText('Prompt'));

  const content = await screen.findByLabelText('Content');

  expect(within(content).getByRole('link', { name: 'Docs' })).toHaveAttribute(
    'href',
    'https://tiptap.dev'
  );
  expect(within(content).getByText('code')).toBeInTheDocument();
  expect(readColumns()[0].cards[0].content).toBe(
    '[Docs](https://tiptap.dev)\n\n- `code`'
  );
});

test('drops image files into card content as Markdown data URLs', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Visual');
  await user.click(screen.getByText('Visual'));

  const content = await screen.findByLabelText('Content');
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
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Checklist', 'Ship editor');
  await user.click(screen.getByText('Checklist'));
  await user.click(await screen.findByLabelText('Content'));
  await chooseSelectOption(user, 'List style', 'Task list');

  const checkbox = await screen.findByRole('checkbox', {
    name: /incomplete task: ship editor/i,
  });
  expect(checkbox.closest('li')).toHaveAttribute('data-checked', 'false');
  await user.click(checkbox);
  expect(checkbox.closest('li')).toHaveAttribute('data-checked', 'true');
  expect(readColumns()[0].cards[0].content).toBe('- [x] Ship editor');
});

test('applies heading and alignment dropdown formatting', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Format', 'Center me');
  await user.click(screen.getByText('Format'));
  await user.click(await screen.findByLabelText('Content'));
  await chooseSelectOption(user, 'Text style', 'Heading 3');
  await chooseSelectOption(user, 'Text alignment', 'Align center');
  await waitFor(() =>
    expect(readColumns()[0].cards[0].content).toBe(
      '<h3 style="text-align: center">Center me</h3>'
    )
  );

  expect(screen.getByRole('heading', { name: 'Center me' })).toHaveStyle({
    textAlign: 'center',
  });
}, 10000);

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

  const content = await screen.findByLabelText('Content');
  selectEditorContents(content);
  await user.click(screen.getByRole('button', { name: 'Link' }));
  await user.type(await screen.findByLabelText('Link URL'), 'tiptap.dev');
  await user.click(screen.getByRole('button', { name: 'Apply' }));
  await user.click(
    await screen.findByRole('button', { name: /copy markdown/i })
  );
  expect(writeText).toHaveBeenLastCalledWith('[Docs](https://tiptap.dev)');

  selectEditorContents(content);
  await user.click(await screen.findByRole('button', { name: /open link/i }));
  const linkBubble = screen
    .getByRole('button', { name: /open link/i })
    .closest('.editor-link-bubble');
  expect(linkBubble?.closest('.dialog-popup--card')).toBeInTheDocument();
  expect(window.getComputedStyle(linkBubble as Element).zIndex).toBe('60');
  expect(open).toHaveBeenCalledWith(
    'https://tiptap.dev',
    '_blank',
    'noopener,noreferrer'
  );

  await user.click(screen.getByRole('button', { name: /edit link/i }));
  await user.clear(screen.getByLabelText('Link URL'));
  await user.type(
    screen.getByLabelText('Link URL'),
    'https://example.com/docs'
  );
  await user.click(screen.getByRole('button', { name: /apply link edit/i }));
  await user.click(
    await screen.findByRole('button', { name: /copy markdown/i })
  );
  expect(writeText).toHaveBeenLastCalledWith(
    '[Docs](https://example.com/docs)'
  );

  selectEditorContents(content);
  await user.click(await screen.findByRole('button', { name: /remove link/i }));
  await user.click(
    await screen.findByRole('button', { name: /copy markdown/i })
  );
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
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  );
  await user.click(screen.getByText('Remote image'));
  expect(
    (await screen.findByLabelText('Content')).querySelector('img')
  ).toHaveAttribute('src', 'https://images.example.com/diagram.png');
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

  const content = await screen.findByLabelText('Content');
  selectEditorContents(content);
  await user.click(screen.getByRole('button', { name: 'Bold' }));

  expect(content.querySelector('strong')).toHaveTextContent('Important');
  await user.click(
    await screen.findByRole('button', { name: /copy markdown/i })
  );
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

  const content = await screen.findByLabelText('Content');
  const textStyle = screen.getByRole('combobox', { name: 'Text style' });
  const listStyle = screen.getByRole('combobox', { name: 'List style' });
  const bold = screen.getByRole('button', { name: 'Bold' });
  const link = screen.getByRole('button', { name: 'Link' });

  selectEditorNode(content, 'p');
  await waitFor(() =>
    expect(textStyle).toHaveAttribute('aria-pressed', 'false')
  );
  expect(listStyle).toHaveAttribute('aria-pressed', 'false');
  expect(bold).toHaveAttribute('aria-pressed', 'false');
  expect(link).toHaveAttribute('aria-pressed', 'false');

  selectEditorNode(content, 'h1');
  await waitFor(() =>
    expect(textStyle).toHaveAttribute('aria-pressed', 'true')
  );
  expect(textStyle).toHaveAttribute('aria-label', 'Text style: Heading 1');

  selectEditorNode(content, 'li');
  await waitFor(() =>
    expect(listStyle).toHaveAttribute('aria-pressed', 'true')
  );
  expect(listStyle).toHaveAttribute('aria-label', 'List style: Bullet list');

  selectEditorNode(content, 'a');
  await waitFor(() => expect(link).toHaveAttribute('aria-pressed', 'true'));

  selectEditorNode(content, 'strong');
  await waitFor(() => expect(bold).toHaveAttribute('aria-pressed', 'true'));

  selectEditorNode(content, 'p');
  await waitFor(() =>
    expect(textStyle).toHaveAttribute('aria-pressed', 'false')
  );
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

  const content = await screen.findByLabelText('Content');
  const image = await waitFor(() => {
    const renderedImage = content.querySelector('img');

    expect(renderedImage).toBeInTheDocument();

    return renderedImage as HTMLImageElement;
  });
  await user.click(image);

  expect(
    await screen.findByRole('button', { name: /edit image/i })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /open image/i })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /remove image/i })
  ).toBeInTheDocument();
});

test('uses TextCursorInput for the regular paragraph style', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Paragraph icon', 'Body');
  await user.click(screen.getByText('Paragraph icon'));

  const textStyle = await screen.findByRole('combobox', {
    name: 'Text style',
  });
  expect(
    textStyle.querySelector('.lucide-text-cursor-input')
  ).toBeInTheDocument();

  await user.click(await screen.findByLabelText('Content'));
  await user.click(textStyle);
  expect(
    (await screen.findByRole('option', { name: 'Paragraph' })).querySelector(
      '.lucide-text-cursor-input'
    )
  ).toBeInTheDocument();
});

test('keeps the editor focused while typing and creating a paragraph', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Focus card', 'Start');
  await user.click(screen.getByText('Focus card'));

  const content = await screen.findByLabelText('Content');
  await user.click(content);
  await user.type(content, ' one');

  expect(content).toHaveFocus();
  await user.keyboard('{Enter}two');

  expect(content).toHaveFocus();
  await waitFor(() =>
    expect(readColumns()[0].cards[0].content).toContain('two')
  );
});

test('applies distinct external editor content without emitting another update', async () => {
  const onChange = vi.fn();
  const renderEditor = (value: string) => (
    <LocalizationProvider language="en">
      <span id="content-label">Content</span>
      <CardContentEditor
        id="external-content-editor"
        labelId="content-label"
        onChange={onChange}
        value={value}
      />
    </LocalizationProvider>
  );
  const { rerender } = render(renderEditor('Local'));

  const content = await screen.findByLabelText('Content');
  rerender(renderEditor('Remote'));

  await waitFor(() => expect(content).toHaveTextContent('Remote'));
  expect(onChange).not.toHaveBeenCalled();
});
