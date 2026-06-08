import { Button } from '@base-ui/react/button';
import { Toolbar } from '@base-ui/react/toolbar';
import FileHandler from '@tiptap/extension-file-handler';
import Image from '@tiptap/extension-image';
import { Markdown } from '@tiptap/markdown';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Code,
  Code2,
  Copy,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { ClipboardEvent, DragEvent } from 'react';

import './CardContentEditor.css';

type CardContentEditorProps = {
  id: string;
  labelId: string;
  onChange: (value: string) => void;
  value: string;
};

type ToolbarButtonProps = {
  active?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
};

const imageMimeTypes = ['image/gif', 'image/jpeg', 'image/png', 'image/webp'];

export const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => resolve(String(reader.result ?? '')));
    reader.addEventListener('error', () => reject(reader.error));
    reader.readAsDataURL(file);
  });

const normalizeUrl = (value: string) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return '';
  }

  if (/^(https?:|mailto:|data:image\/)/i.test(trimmedValue)) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
};

const ToolbarButton = ({
  active = false,
  disabled = false,
  label,
  onClick,
  children,
}: ToolbarButtonProps) => (
  <Toolbar.Button
    aria-label={label}
    aria-pressed={active}
    className={`editor-toolbar__button ${active ? 'editor-toolbar__button--active' : ''}`}
    disabled={disabled}
    onClick={onClick}
    type="button"
  >
    {children}
  </Toolbar.Button>
);

const CardContentEditor = ({
  id,
  labelId,
  onChange,
  value,
}: CardContentEditorProps) => {
  const onChangeRef = useRef(onChange);
  const lastSyncedValue = useRef(value);
  const [copyStatus, setCopyStatus] = useState('');

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const insertImageFiles = async (
    editor: NonNullable<ReturnType<typeof useEditor>>,
    files: File[],
    position?: number
  ) => {
    const images = files.filter((file) => imageMimeTypes.includes(file.type));

    for (const image of images) {
      const src = await readFileAsDataUrl(image);
      const chain = editor.chain().focus();

      if (typeof position === 'number') {
        chain.insertContentAt(position, {
          attrs: { alt: image.name, src },
          type: 'image',
        });
      } else {
        chain.setImage({ alt: image.name, src });
      }

      chain.run();
    }
  };

  const editor = useEditor({
    content: value,
    contentType: 'markdown',
    editorProps: {
      attributes: {
        'aria-labelledby': labelId,
        class: 'card-content-editor__surface',
        id,
      },
    },
    extensions: [
      StarterKit.configure({
        link: {
          HTMLAttributes: {
            rel: 'noopener noreferrer',
            target: '_blank',
          },
          openOnClick: false,
        },
      }),
      Image.configure({ allowBase64: true }),
      FileHandler.configure({
        allowedMimeTypes: imageMimeTypes,
        onDrop: (currentEditor, files, position) => {
          void insertImageFiles(currentEditor, files, position);
        },
        onPaste: (currentEditor, files) => {
          void insertImageFiles(currentEditor, files);
        },
      }),
      Markdown.configure({
        indentation: { size: 2, style: 'space' },
      }),
    ],
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      const markdown = currentEditor.getMarkdown();
      lastSyncedValue.current = markdown;
      onChangeRef.current(markdown);
    },
  });

  useEffect(() => {
    if (!editor || value === lastSyncedValue.current) {
      return;
    }

    lastSyncedValue.current = value;
    editor.commands.setContent(value, {
      contentType: 'markdown',
      emitUpdate: false,
    });
  }, [editor, value]);

  const setLink = () => {
    if (!editor) {
      return;
    }

    const currentHref = editor.getAttributes('link').href as string | undefined;
    const href = normalizeUrl(
      window.prompt('Paste a link', currentHref ?? '') ?? ''
    );

    if (!href) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
  };

  const insertImageUrl = () => {
    if (!editor) {
      return;
    }

    const src = normalizeUrl(window.prompt('Paste an image URL') ?? '');

    if (!src) {
      return;
    }

    editor.chain().focus().setImage({ alt: '', src }).run();
  };

  const copyMarkdown = async () => {
    if (!editor) {
      return;
    }

    await navigator.clipboard.writeText(editor.getMarkdown());
    setCopyStatus('Copied');
    window.setTimeout(() => setCopyStatus(''), 1600);
  };

  const onFileDrop = (event: DragEvent<HTMLDivElement>) => {
    const files = Array.from(event.dataTransfer.files);

    if (!editor || files.length === 0) {
      return;
    }

    event.preventDefault();
    void insertImageFiles(editor, files);
  };

  const onFilePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    const files = Array.from(event.clipboardData.files);

    if (!editor || files.length === 0) {
      return;
    }

    event.preventDefault();
    void insertImageFiles(editor, files);
  };

  return (
    <div
      className="card-content-editor"
      onDrop={onFileDrop}
      onPaste={onFilePaste}
    >
      <Toolbar.Root className="editor-toolbar" aria-label="Content formatting">
        <ToolbarButton
          active={editor?.isActive('heading', { level: 1 })}
          disabled={!editor}
          label="Heading 1"
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <Heading1 size={16} />
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive('heading', { level: 2 })}
          disabled={!editor}
          label="Heading 2"
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive('bold')}
          disabled={!editor}
          label="Bold"
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive('italic')}
          disabled={!editor}
          label="Italic"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive('strike')}
          disabled={!editor}
          label="Strike"
          onClick={() => editor?.chain().focus().toggleStrike().run()}
        >
          <Strikethrough size={16} />
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive('bulletList')}
          disabled={!editor}
          label="Bullet list"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive('orderedList')}
          disabled={!editor}
          label="Ordered list"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={16} />
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive('blockquote')}
          disabled={!editor}
          label="Quote"
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        >
          <Quote size={16} />
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive('code')}
          disabled={!editor}
          label="Inline code"
          onClick={() => editor?.chain().focus().toggleCode().run()}
        >
          <Code size={16} />
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive('codeBlock')}
          disabled={!editor}
          label="Code block"
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        >
          <Code2 size={16} />
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive('link')}
          disabled={!editor}
          label="Link"
          onClick={setLink}
        >
          <LinkIcon size={16} />
        </ToolbarButton>
        <ToolbarButton
          disabled={!editor}
          label="Image URL"
          onClick={insertImageUrl}
        >
          <ImageIcon size={16} />
        </ToolbarButton>
        <ToolbarButton
          disabled={!editor?.can().undo()}
          label="Undo"
          onClick={() => editor?.chain().focus().undo().run()}
        >
          <Undo2 size={16} />
        </ToolbarButton>
        <ToolbarButton
          disabled={!editor?.can().redo()}
          label="Redo"
          onClick={() => editor?.chain().focus().redo().run()}
        >
          <Redo2 size={16} />
        </ToolbarButton>
        <Button
          aria-label="Copy Markdown"
          className="editor-toolbar__copy"
          disabled={!editor}
          onClick={copyMarkdown}
          type="button"
        >
          <Copy size={16} />
          <strong>.MD</strong>
          {copyStatus && (
            <span className="editor-toolbar__copy-status">{copyStatus}</span>
          )}
        </Button>
      </Toolbar.Root>
      <EditorContent editor={editor} />
    </div>
  );
};

export default CardContentEditor;
