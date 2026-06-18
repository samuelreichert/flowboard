import { Button } from '@base-ui/react/button';
import { Field } from '@base-ui/react/field';
import { Popover } from '@base-ui/react/popover';
import { Select } from '@base-ui/react/select';
import { Tooltip } from '@base-ui/react/tooltip';
import { Toolbar } from '@base-ui/react/toolbar';
import type { JSONContent } from '@tiptap/core';
import FileHandler from '@tiptap/extension-file-handler';
import Heading, { type Level } from '@tiptap/extension-heading';
import Image from '@tiptap/extension-image';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import Paragraph from '@tiptap/extension-paragraph';
import TextAlign from '@tiptap/extension-text-align';
import { Markdown } from '@tiptap/markdown';
import { NodeSelection } from '@tiptap/pm/state';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import {
  AlignJustify,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  ChevronDown,
  Code,
  Code2,
  Copy,
  Edit3,
  ExternalLink,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListChecks,
  ListOrdered,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Trash2,
  Undo2,
  X,
} from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
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

type ToolbarSelectOption<TValue extends string> = {
  icon?: ReactNode;
  label: string;
  triggerLabel?: string;
  value: TValue;
};

type ToolbarSelectProps<TValue extends string> = {
  active?: boolean;
  disabled?: boolean;
  fallbackOption?: ToolbarSelectOption<TValue>;
  label: string;
  onValueChange: (value: TValue) => void;
  options: ToolbarSelectOption<TValue>[];
  value: TValue;
};

type HeadingValue = 'paragraph' | 'heading-1' | 'heading-2' | 'heading-3' | 'heading-4';
type ListValue = 'none' | 'bullet' | 'ordered' | 'task';
type AlignValue = 'left' | 'center' | 'right' | 'justify';

const imageMimeTypes = ['image/gif', 'image/jpeg', 'image/png', 'image/webp'];
const headingLevels: Level[] = [1, 2, 3, 4];
const alignValues: AlignValue[] = ['left', 'center', 'right', 'justify'];
const EMPTY_PARAGRAPH_MARKDOWN = '&nbsp;';
const NBSP_CHAR = '\u00A0';

const headingOptions: ToolbarSelectOption<HeadingValue>[] = [
  { icon: <Pilcrow size={15} />, label: 'Paragraph', value: 'paragraph' },
  { icon: <Heading1 size={15} />, label: 'Heading 1', value: 'heading-1' },
  { icon: <Heading2 size={15} />, label: 'Heading 2', value: 'heading-2' },
  { icon: <Heading3 size={15} />, label: 'Heading 3', value: 'heading-3' },
  { icon: <Heading4 size={15} />, label: 'Heading 4', value: 'heading-4' },
];

const listOptions: ToolbarSelectOption<ListValue>[] = [
  { icon: <List size={15} />, label: 'Bullet list', value: 'bullet' },
  { icon: <ListOrdered size={15} />, label: 'Ordered list', value: 'ordered' },
  { icon: <ListChecks size={15} />, label: 'Task list', value: 'task' },
];

const alignOptions: ToolbarSelectOption<AlignValue>[] = [
  { icon: <AlignLeft size={15} />, label: 'Align left', value: 'left' },
  { icon: <AlignCenter size={15} />, label: 'Align center', value: 'center' },
  { icon: <AlignRight size={15} />, label: 'Align right', value: 'right' },
  { icon: <AlignJustify size={15} />, label: 'Justify', value: 'justify' },
];

const defaultListOption: ToolbarSelectOption<ListValue> = {
  icon: <List size={15} />,
  label: 'List style',
  value: 'none',
};

const defaultToolbarState = {
  alignValue: 'left' as AlignValue,
  canRedo: false,
  canUndo: false,
  headingValue: 'paragraph' as HeadingValue,
  imageSrc: '',
  isBlockquote: false,
  isBold: false,
  isCode: false,
  isCodeBlock: false,
  isImage: false,
  isItalic: false,
  isLink: false,
  isStrike: false,
  linkHref: '',
  listValue: 'none' as ListValue,
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapeAttribute = (value: unknown) => escapeHtml(String(value ?? ''));

const renderImageHtml = (alt: string, src: string, title = '') => {
  const titleAttribute = title ? ` title="${escapeAttribute(title)}"` : '';

  return `<img src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}"${titleAttribute}>`;
};

const normalizeMarkdownForEditor = (markdown: string) =>
  markdown
    .replace(
      /^!\[([^\]\n]*)\]\(\[([^\]\n]*)\]\((\S+?)(?:\s+["']([^"'\n]*)["'])?\)\)$/gm,
      (_match, alt: string, _linkText: string, src: string, title = '') =>
        renderImageHtml(alt, src, title)
    )
    .replace(
      /^!\[([^\]\n]*)\]\((\S+?)(?:\s+["']([^"'\n]*)["'])?\)$/gm,
      (_match, alt: string, src: string, title = '') => renderImageHtml(alt, src, title)
    );

const renderInlineHtml = (content: JSONContent[] = []): string =>
  content.map(renderInlineNodeHtml).join('');

const renderInlineNodeHtml = (node: JSONContent): string => {
  if (node.type === 'text') {
    return (node.marks ?? []).reduce((text, mark) => {
      if (mark.type === 'bold') {
        return `<strong>${text}</strong>`;
      }

      if (mark.type === 'italic') {
        return `<em>${text}</em>`;
      }

      if (mark.type === 'strike') {
        return `<s>${text}</s>`;
      }

      if (mark.type === 'code') {
        return `<code>${text}</code>`;
      }

      if (mark.type === 'link') {
        const href = escapeAttribute(mark.attrs?.href);
        return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      }

      return text;
    }, escapeHtml(node.text ?? ''));
  }

  if (node.type === 'hardBreak') {
    return '<br>';
  }

  if (node.type === 'image') {
    const src = escapeAttribute(node.attrs?.src);
    const alt = escapeAttribute(node.attrs?.alt);
    return `<img src="${src}" alt="${alt}">`;
  }

  return renderInlineHtml(node.content);
};

const renderAlignedBlockHtml = (
  tagName: 'p' | `h${Level}`,
  alignment: string,
  content: JSONContent[] = []
) =>
  `<${tagName} style="text-align: ${escapeAttribute(alignment)}">${renderInlineHtml(content)}</${tagName}>`;

const RichParagraph = Paragraph.extend({
  parseMarkdown: (token, h) => {
    const tokens = token.tokens || [];

    if (tokens.length === 1 && tokens[0].type === 'image') {
      return h.parseChildren([tokens[0]]);
    }

    const content = h.parseInline(tokens);
    const hasExplicitEmptyParagraphMarker =
      tokens.length === 1 &&
      tokens[0].type === 'text' &&
      (tokens[0].raw === EMPTY_PARAGRAPH_MARKDOWN ||
        tokens[0].text === EMPTY_PARAGRAPH_MARKDOWN ||
        tokens[0].raw === NBSP_CHAR ||
        tokens[0].text === NBSP_CHAR);

    if (
      hasExplicitEmptyParagraphMarker &&
      content.length === 1 &&
      content[0].type === 'text' &&
      (content[0].text === EMPTY_PARAGRAPH_MARKDOWN || content[0].text === NBSP_CHAR)
    ) {
      return h.createNode('paragraph', undefined, []);
    }

    return h.createNode('paragraph', undefined, content);
  },
  renderMarkdown: (node, h, ctx) => {
    const alignment = node.attrs?.textAlign;

    if (alignment && alignment !== 'left') {
      return renderAlignedBlockHtml('p', alignment, node.content);
    }

    const content = Array.isArray(node.content) ? node.content : [];

    if (content.length === 0) {
      const previousContent = Array.isArray(ctx?.previousNode?.content)
        ? ctx.previousNode.content
        : [];
      const previousNodeIsEmptyParagraph =
        ctx?.previousNode?.type === 'paragraph' && previousContent.length === 0;

      return previousNodeIsEmptyParagraph ? EMPTY_PARAGRAPH_MARKDOWN : '';
    }

    return h.renderChildren(content);
  },
});

const RichHeading = Heading.extend({
  renderMarkdown: (node, h) => {
    const level = node.attrs?.level ? parseInt(String(node.attrs.level), 10) : 1;
    const safeLevel = headingLevels.includes(level as Level) ? (level as Level) : 1;
    const alignment = node.attrs?.textAlign;

    if (!node.content) {
      return '';
    }

    if (alignment && alignment !== 'left') {
      return renderAlignedBlockHtml(`h${safeLevel}`, alignment, node.content);
    }

    return `${'#'.repeat(safeLevel)} ${h.renderChildren(node.content)}`;
  },
});

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

const isSupportedUrl = (value: string, allowDataImage = false) => {
  try {
    const url = new URL(value);

    if (url.protocol === 'https:' || url.protocol === 'mailto:') {
      return true;
    }

    return allowDataImage && url.protocol === 'data:' && value.startsWith('data:image/');
  } catch {
    return false;
  }
};

const isSupportedImageUrl = (value: string) => {
  try {
    const url = new URL(value);

    return url.protocol === 'https:' || (url.protocol === 'data:' && value.startsWith('data:image/'));
  } catch {
    return false;
  }
};

const getEditorMarkdown = (editor: NonNullable<ReturnType<typeof useEditor>>) =>
  editor.getMarkdown().replace(/[ \t]+$/gm, '').trimEnd();

const selectImageElement = (
  view: NonNullable<ReturnType<typeof useEditor>>['view'],
  target: EventTarget | null
) => {
  if (!(target instanceof HTMLImageElement)) {
    return false;
  }

  const src = target.getAttribute('src');
  let position: number | null = null;

  view.state.doc.descendants((node, nodePosition) => {
    if (node.type.name !== 'image') {
      return true;
    }

    const domNode = view.nodeDOM(nodePosition);

    if (
      domNode === target ||
      (domNode instanceof HTMLElement && domNode.contains(target))
    ) {
      position = nodePosition;
      return false;
    }

    return true;
  });

  if (position === null) {
    view.state.doc.descendants((node, nodePosition) => {
      if (node.type.name === 'image' && (!src || node.attrs.src === src)) {
        position = nodePosition;
        return false;
      }

      return true;
    });
  }

  if (position === null) {
    return false;
  }

  view.dispatch(
    view.state.tr.setSelection(NodeSelection.create(view.state.doc, position))
  );
  view.focus();

  return true;
};

const insertImageFiles = async (
  editor: NonNullable<ReturnType<typeof useEditor>>,
  files: File[],
  position?: number
) => {
  const images = files.filter((file) => imageMimeTypes.includes(file.type));
  const imageSources = await Promise.all(
    images.map(async (image) => ({
      image,
      src: await readFileAsDataUrl(image),
    }))
  );

  for (const { image, src } of imageSources) {
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

const ToolbarButton = ({
  active = false,
  disabled = false,
  label,
  onClick,
  children,
}: ToolbarButtonProps) => (
  <Tooltip.Root>
    <Tooltip.Trigger
      aria-label={label}
      aria-disabled={disabled}
      aria-pressed={active}
      className={`editor-toolbar__button ${active ? 'editor-toolbar__button--active' : ''}`}
      data-disabled={disabled ? '' : undefined}
      onClick={(event) => {
        if (disabled) {
          event.preventDefault();
          return;
        }

        onClick();
      }}
      onMouseDown={(event) => event.preventDefault()}
      render={<Toolbar.Button />}
      tabIndex={disabled ? -1 : undefined}
      type="button"
    >
      {children}
    </Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Positioner sideOffset={8}>
        <Tooltip.Popup className="tooltip-popup">
          {label}
        </Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>
);

const ToolbarSelect = <TValue extends string>({
  active = false,
  disabled = false,
  fallbackOption,
  label,
  onValueChange,
  options,
  value,
}: ToolbarSelectProps<TValue>) => {
  const selectLabelId = useId();
  const selectedOption = options.find((option) => option.value === value) ?? fallbackOption ?? options[0];
  const triggerLabel = selectedOption.triggerLabel ?? selectedOption.label;

  return (
    <Select.Root
      onValueChange={(nextValue) => {
        if (nextValue) {
          onValueChange(nextValue as TValue);
        }
      }}
      value={value}
    >
      <span className="editor-toolbar__accessible-label" id={selectLabelId}>
        {label}
      </span>
      <Tooltip.Root>
        <Tooltip.Trigger
          aria-labelledby={selectLabelId}
          aria-pressed={active}
          aria-label={`${label}: ${triggerLabel}`}
          className={`editor-toolbar__select-trigger ${active ? 'editor-toolbar__button--active' : ''}`}
          disabled={disabled}
          render={<Toolbar.Button disabled={disabled} render={<Select.Trigger />} />}
        >
          <span className="editor-toolbar__select-trigger-icon" title={triggerLabel}>
            {selectedOption.icon}
          </span>
          <Select.Icon className="editor-toolbar__select-icon">
            <ChevronDown size={14} />
          </Select.Icon>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner sideOffset={8}>
            <Tooltip.Popup className="tooltip-popup">
              {triggerLabel}
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
      <Select.Portal>
        <Select.Positioner
          align="start"
          className="editor-toolbar__select-positioner"
          sideOffset={5}
        >
          <Select.Popup className="editor-toolbar__select-popup">
            <Select.List>
              {options.map((option) => (
                <Select.Item
                  className="editor-toolbar__select-item"
                  key={option.value}
                  value={option.value}
                >
                  <Select.ItemText>
                    <span className="editor-toolbar__select-label">
                      {option.icon}
                      <span>{option.label}</span>
                    </span>
                  </Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={14} />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
};

const CardContentEditor = ({
  id,
  labelId,
  onChange,
  value,
}: CardContentEditorProps) => {
  const onChangeRef = useRef(onChange);
  const lastSyncedValue = useRef(value);
  const [copyStatus, setCopyStatus] = useState('');
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkError, setLinkError] = useState('');
  const [imagePopoverOpen, setImagePopoverOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageError, setImageError] = useState('');
  const [linkBubbleEditing, setLinkBubbleEditing] = useState(false);
  const [linkBubbleUrl, setLinkBubbleUrl] = useState('');
  const [linkBubbleError, setLinkBubbleError] = useState('');
  const [imageBubbleEditing, setImageBubbleEditing] = useState(false);
  const [imageBubbleUrl, setImageBubbleUrl] = useState('');
  const [imageBubbleError, setImageBubbleError] = useState('');
  const linkSelectionRef = useRef<{ from: number; to: number } | null>(null);
  const imageSelectionRef = useRef<number | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    content: normalizeMarkdownForEditor(value),
    contentType: 'markdown',
    editorProps: {
      attributes: {
        'aria-labelledby': labelId,
        class: 'card-content-editor__surface',
        id,
      },
      handleClick: (view, _position, event) => {
        return selectImageElement(view, event.target);
      },
      handleClickOn: (view, _position, node, nodePosition, event, direct) => {
        if (!direct || node.type.name !== 'image') {
          return false;
        }

        view.dispatch(
          view.state.tr.setSelection(NodeSelection.create(view.state.doc, nodePosition))
        );
        view.focus();
        event.preventDefault();

        return true;
      },
    },
    extensions: [
      StarterKit.configure({
        heading: false,
        link: {
          HTMLAttributes: {
            rel: 'noopener noreferrer',
            target: '_blank',
          },
          openOnClick: false,
        },
        paragraph: false,
      }),
      RichParagraph,
      RichHeading.configure({ levels: headingLevels }),
      TaskList,
      TaskItem.configure({
        a11y: {
          checkboxLabel: (node, checked) =>
            `${checked ? 'Completed' : 'Incomplete'} task: ${node.textContent || 'empty task item'}`,
        },
        nested: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
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
      const markdown = getEditorMarkdown(currentEditor);
      lastSyncedValue.current = markdown;
      onChangeRef.current(markdown);
    },
  });

  useEffect(() => {
    if (!editor || value === lastSyncedValue.current) {
      return;
    }

    lastSyncedValue.current = value;
    editor.commands.setContent(normalizeMarkdownForEditor(value), {
      contentType: 'markdown',
      emitUpdate: false,
    });
  }, [editor, value]);

  const toolbarState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      if (!currentEditor) {
        return defaultToolbarState;
      }

      const headingValue =
        headingLevels
          .map((level) => `heading-${level}` as HeadingValue)
          .find((option) =>
            currentEditor.isActive('heading', {
              level: Number(option.replace('heading-', '')),
            })
          ) ?? 'paragraph';
      const listValue = currentEditor.isActive('taskList')
        ? 'task'
        : currentEditor.isActive('bulletList')
          ? 'bullet'
          : currentEditor.isActive('orderedList')
            ? 'ordered'
            : 'none';
      const alignValue =
        alignValues.find((alignment) => currentEditor.isActive({ textAlign: alignment })) ?? 'left';
      const linkHref = currentEditor.getAttributes('link').href as string | undefined;
      const selectedNode =
        currentEditor.state.selection instanceof NodeSelection
          ? currentEditor.state.selection.node
          : null;
      const selectedImage =
        selectedNode?.type.name === 'image' ? selectedNode : null;
      const imageSrc =
        (selectedImage?.attrs.src as string | undefined) ??
        (currentEditor.getAttributes('image').src as string | undefined);

      return {
        alignValue,
        canRedo: currentEditor.can().redo(),
        canUndo: currentEditor.can().undo(),
        headingValue,
        imageSrc: imageSrc ?? '',
        isBlockquote: currentEditor.isActive('blockquote'),
        isBold: currentEditor.isActive('bold'),
        isCode: currentEditor.isActive('code'),
        isCodeBlock: currentEditor.isActive('codeBlock'),
        isImage: Boolean(selectedImage),
        isItalic: currentEditor.isActive('italic'),
        isLink: currentEditor.isActive('link'),
        isStrike: currentEditor.isActive('strike'),
        linkHref: linkHref ?? '',
        listValue,
      };
    },
  }) ?? defaultToolbarState;

  const currentHref = toolbarState.linkHref;
  const currentImageSrc = toolbarState.imageSrc;

  const applyLinkValue = (rawValue: string, close: () => void) => {
    if (!editor) {
      return;
    }

    const href = normalizeUrl(rawValue);
    const selection = linkSelectionRef.current;

    if (!href) {
      setLinkError('');
      setLinkBubbleError('');
      let chain = editor.chain().focus();

      if (selection) {
        chain = chain.setTextSelection(selection);
      }

      chain.extendMarkRange('link').unsetLink().run();
      linkSelectionRef.current = null;
      close();
      return;
    }

    if (!isSupportedUrl(href)) {
      setLinkError('Enter a secure HTTPS or mailto link.');
      setLinkBubbleError('Enter a secure HTTPS or mailto link.');
      return;
    }

    setLinkError('');
    setLinkBubbleError('');
    let chain = editor.chain().focus();

    if (selection) {
      chain = chain.setTextSelection(selection);
    }

    chain.extendMarkRange('link').setLink({ href }).run();
    linkSelectionRef.current = null;
    close();
  };

  const applyImageValue = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!editor) {
      return;
    }

    const src = normalizeUrl(imageUrl);

    if (!src) {
      setImageError('Enter an image URL.');
      return;
    }

    if (!isSupportedImageUrl(src)) {
      setImageError('Enter a secure HTTPS image URL.');
      return;
    }

    setImageError('');
    editor.chain().focus().setImage({ alt: '', src }).run();
    setImagePopoverOpen(false);
    setImageUrl('');
  };

  const applyImageBubbleValue = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!editor) {
      return;
    }

    const src = normalizeUrl(imageBubbleUrl);

    if (!src) {
      setImageBubbleError('Enter an image URL.');
      return;
    }

    if (!isSupportedImageUrl(src)) {
      setImageBubbleError('Enter a secure HTTPS image URL.');
      return;
    }

    let chain = editor.chain().focus();

    if (imageSelectionRef.current !== null) {
      chain = chain.setNodeSelection(imageSelectionRef.current);
    }

    chain.updateAttributes('image', { alt: '', src }).run();
    imageSelectionRef.current = null;
    setImageBubbleError('');
    setImageBubbleEditing(false);
  };

  const openLinkPopover = () => {
    storeLinkSelection();
    setLinkUrl(currentHref ?? '');
    setLinkError('');
    setLinkPopoverOpen(true);
  };

  const storeLinkSelection = () => {
    if (!editor) {
      return;
    }

    const { from, to } = editor.state.selection;

    if (from !== to) {
      linkSelectionRef.current = { from, to };
      return;
    }

    const selection = window.getSelection();

    if (selection?.anchorNode && editor.view.dom.contains(selection.anchorNode)) {
      const anchor = editor.view.posAtDOM(selection.anchorNode, selection.anchorOffset);
      const head = editor.view.posAtDOM(selection.focusNode ?? selection.anchorNode, selection.focusOffset);
      linkSelectionRef.current = {
        from: Math.min(anchor, head),
        to: Math.max(anchor, head),
      };
      return;
    }

    linkSelectionRef.current = { from, to };
  };

  const storeImageSelection = () => {
    if (!editor) {
      return;
    }

    imageSelectionRef.current = editor.state.selection.from;
  };

  const openImagePopover = () => {
    setImageUrl('');
    setImageError('');
    setImagePopoverOpen(true);
  };

  const openCurrentLink = () => {
    if (!currentHref) {
      return;
    }

    const openedWindow = window.open(currentHref, '_blank', 'noopener,noreferrer');

    if (openedWindow) {
      openedWindow.opener = null;
    }
  };

  const openCurrentImage = () => {
    if (!currentImageSrc) {
      return;
    }

    const openedWindow = window.open(currentImageSrc, '_blank', 'noopener,noreferrer');

    if (openedWindow) {
      openedWindow.opener = null;
    }
  };

  const removeCurrentImage = () => {
    if (!editor) {
      return;
    }

    let chain = editor.chain().focus();

    if (imageSelectionRef.current !== null) {
      chain = chain.setNodeSelection(imageSelectionRef.current);
    }

    chain.deleteSelection().run();
    imageSelectionRef.current = null;
  };

  const copyMarkdown = async () => {
    if (!editor) {
      return;
    }

    await navigator.clipboard.writeText(getEditorMarkdown(editor));
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

  const onHeadingChange = (nextValue: HeadingValue) => {
    if (!editor) {
      return;
    }

    if (nextValue === 'paragraph') {
      editor.chain().focus().setParagraph().run();
      return;
    }

    editor
      .chain()
      .focus()
      .toggleHeading({ level: Number(nextValue.replace('heading-', '')) as Level })
      .run();
  };

  const onListChange = (nextValue: ListValue) => {
    if (!editor) {
      return;
    }

    const chain = editor.chain().focus();

    if (nextValue === 'none') {
      chain.setParagraph().run();
      return;
    }

    if (nextValue === 'bullet') {
      chain.toggleBulletList().run();
      return;
    }

    if (nextValue === 'ordered') {
      chain.toggleOrderedList().run();
      return;
    }

    chain.toggleTaskList().run();
  };

  const onAlignChange = (nextValue: AlignValue) => {
    if (!editor) {
      return;
    }

    const chain = editor.chain().focus();

    if (nextValue === 'left') {
      chain.unsetTextAlign().run();
      return;
    }

    chain.setTextAlign(nextValue).run();
  };

  return (
    <div
      className="card-content-editor"
      onDrop={onFileDrop}
      onPaste={onFilePaste}
    >
      <Toolbar.Root className="editor-toolbar" aria-label="Content formatting">
        <ToolbarButton
          disabled={!toolbarState.canUndo}
          label="Undo"
          onClick={() => editor?.chain().focus().undo().run()}
        >
          <Undo2 size={16} />
        </ToolbarButton>
        <ToolbarButton
          disabled={!toolbarState.canRedo}
          label="Redo"
          onClick={() => editor?.chain().focus().redo().run()}
        >
          <Redo2 size={16} />
        </ToolbarButton>
        <ToolbarSelect
          active={toolbarState.headingValue !== 'paragraph'}
          disabled={!editor}
          label="Text style"
          onValueChange={onHeadingChange}
          options={headingOptions}
          value={toolbarState.headingValue}
        />
        <ToolbarButton
          active={toolbarState.isBold}
          disabled={!editor}
          label="Bold"
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          active={toolbarState.isItalic}
          disabled={!editor}
          label="Italic"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton
          active={toolbarState.isStrike}
          disabled={!editor}
          label="Strike"
          onClick={() => editor?.chain().focus().toggleStrike().run()}
        >
          <Strikethrough size={16} />
        </ToolbarButton>
        <ToolbarSelect
          active={toolbarState.listValue !== 'none'}
          disabled={!editor}
          label="List style"
          onValueChange={onListChange}
          options={listOptions}
          value={toolbarState.listValue}
          fallbackOption={defaultListOption}
        />
        <ToolbarSelect
          active={toolbarState.alignValue !== 'left'}
          disabled={!editor}
          label="Text alignment"
          onValueChange={onAlignChange}
          options={alignOptions}
          value={toolbarState.alignValue}
        />
        <ToolbarButton
          active={toolbarState.isBlockquote}
          disabled={!editor}
          label="Quote"
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        >
          <Quote size={16} />
        </ToolbarButton>
        <ToolbarButton
          active={toolbarState.isCode}
          disabled={!editor}
          label="Inline code"
          onClick={() => editor?.chain().focus().toggleCode().run()}
        >
          <Code size={16} />
        </ToolbarButton>
        <ToolbarButton
          active={toolbarState.isCodeBlock}
          disabled={!editor}
          label="Code block"
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        >
          <Code2 size={16} />
        </ToolbarButton>
        <Popover.Root
          onOpenChange={(open) => {
            setLinkPopoverOpen(open);
            if (!open) {
              setLinkError('');
            }
          }}
          open={linkPopoverOpen}
        >
          <Tooltip.Root>
            <Tooltip.Trigger
              aria-label="Link"
              aria-pressed={toolbarState.isLink}
              className={`editor-toolbar__button ${toolbarState.isLink ? 'editor-toolbar__button--active' : ''}`}
              disabled={!editor}
              onClick={openLinkPopover}
              onMouseDown={(event) => {
                event.preventDefault();
                storeLinkSelection();
              }}
              render={<Popover.Trigger render={<Toolbar.Button disabled={!editor} />} />}
            >
              <LinkIcon size={16} />
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Positioner sideOffset={8}>
                <Tooltip.Popup className="tooltip-popup">
                  Link
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>
          <Popover.Portal>
            <Popover.Positioner
              align="start"
              className="editor-url-popover__positioner"
              sideOffset={6}
            >
              <Popover.Popup className="editor-url-popover">
                <form
                  className="editor-url-popover__form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    applyLinkValue(linkUrl, () => setLinkPopoverOpen(false));
                  }}
                >
                  <Field.Root invalid={Boolean(linkError)}>
                    <Field.Label className="editor-url-popover__label">
                      Link URL
                    </Field.Label>
                    <Field.Control
                      autoFocus
                      className="editor-url-popover__input"
                      inputMode="url"
                      maxLength={2048}
                      onValueChange={setLinkUrl}
                      placeholder="https://tiptap.dev"
                      type="text"
                      value={linkUrl}
                    />
                    <Field.Error
                      className="editor-url-popover__error"
                      match={Boolean(linkError)}
                    >
                      {linkError}
                    </Field.Error>
                  </Field.Root>
                  <div className="editor-url-popover__actions">
                    <Popover.Close
                      className="editor-url-popover__button"
                      render={<Button />}
                      type="button"
                    >
                      Cancel
                    </Popover.Close>
                    <Button
                      className="editor-url-popover__button editor-url-popover__button--primary"
                      type="submit"
                    >
                      Apply
                    </Button>
                  </div>
                </form>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
        <Popover.Root
          onOpenChange={(open) => {
            setImagePopoverOpen(open);
            if (!open) {
              setImageError('');
            }
          }}
          open={imagePopoverOpen}
        >
          <Tooltip.Root>
            <Tooltip.Trigger
              aria-label="Insert image URL"
              className={`editor-toolbar__button ${toolbarState.isImage ? 'editor-toolbar__button--active' : ''}`}
              disabled={!editor}
              aria-pressed={toolbarState.isImage}
              onClick={openImagePopover}
              onMouseDown={(event) => event.preventDefault()}
              render={<Popover.Trigger render={<Toolbar.Button disabled={!editor} />} />}
            >
              <ImageIcon size={16} />
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Positioner sideOffset={8}>
                <Tooltip.Popup className="tooltip-popup">
                  Insert image URL
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>
          <Popover.Portal>
            <Popover.Positioner
              align="start"
              className="editor-url-popover__positioner"
              sideOffset={6}
            >
              <Popover.Popup className="editor-url-popover">
                <form className="editor-url-popover__form" onSubmit={applyImageValue}>
                  <Field.Root invalid={Boolean(imageError)}>
                    <Field.Label className="editor-url-popover__label">
                      Image URL
                    </Field.Label>
                    <Field.Control
                      autoFocus
                      className="editor-url-popover__input"
                      inputMode="url"
                      maxLength={2048}
                      onValueChange={setImageUrl}
                      placeholder="https://images.example.com/diagram.png"
                      type="text"
                      value={imageUrl}
                    />
                    <Field.Error
                      className="editor-url-popover__error"
                      match={Boolean(imageError)}
                    >
                      {imageError}
                    </Field.Error>
                  </Field.Root>
                  <div className="editor-url-popover__actions">
                    <Popover.Close
                      className="editor-url-popover__button"
                      render={<Button />}
                      type="button"
                    >
                      Cancel
                    </Popover.Close>
                    <Button
                      className="editor-url-popover__button editor-url-popover__button--primary"
                      type="submit"
                    >
                      Insert
                    </Button>
                  </div>
                </form>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
        <Tooltip.Root>
          <Tooltip.Trigger
            aria-label="Copy Markdown"
            className="editor-toolbar__copy"
            disabled={!editor}
            onClick={copyMarkdown}
            render={<Button disabled={!editor} />}
            type="button"
          >
            <Copy size={16} />
            <strong>.MD</strong>
            {copyStatus && (
              <span className="editor-toolbar__copy-status">{copyStatus}</span>
            )}
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner sideOffset={8}>
              <Tooltip.Popup className="tooltip-popup">
                Copy Markdown
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Toolbar.Root>
      {editor && (
        <BubbleMenu
          className="editor-link-bubble"
          editor={editor}
          pluginKey="linkBubbleMenu"
          shouldShow={({ editor: currentEditor }) => currentEditor.isActive('link')}
        >
          {linkBubbleEditing ? (
            <form
              className="editor-link-bubble__form"
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                applyLinkValue(linkBubbleUrl, () => setLinkBubbleEditing(false));
              }}
            >
              <Field.Root invalid={Boolean(linkBubbleError)}>
                <Field.Label className="editor-link-bubble__label">
                  Link URL
                </Field.Label>
                <Field.Control
                  autoFocus
                  className="editor-link-bubble__input"
                  inputMode="url"
                  maxLength={2048}
                  onValueChange={setLinkBubbleUrl}
                  type="text"
                  value={linkBubbleUrl}
                />
                <Field.Error
                  className="editor-link-bubble__error"
                  match={Boolean(linkBubbleError)}
                >
                  {linkBubbleError}
                </Field.Error>
              </Field.Root>
              <div className="editor-link-bubble__actions">
                <Button
                  aria-label="Cancel link edit"
                  className="editor-link-bubble__icon-button"
                  onClick={() => {
                    setLinkBubbleEditing(false);
                    setLinkBubbleError('');
                  }}
                  type="button"
                >
                  <X size={14} />
                </Button>
                <Button
                  aria-label="Apply link edit"
                  className="editor-link-bubble__icon-button editor-link-bubble__icon-button--primary"
                  type="submit"
                >
                  <Check size={14} />
                </Button>
              </div>
            </form>
          ) : (
            <>
              <span className="editor-link-bubble__href">{currentHref}</span>
              <div className="editor-link-bubble__actions">
                <Button
                  aria-label="Edit link"
                  className="editor-link-bubble__icon-button"
                  onClick={() => {
                    storeLinkSelection();
                    setLinkBubbleUrl(currentHref ?? '');
                    setLinkBubbleError('');
                    setLinkBubbleEditing(true);
                  }}
                  type="button"
                >
                  <Edit3 size={14} />
                </Button>
                <Button
                  aria-label="Open link"
                  className="editor-link-bubble__icon-button"
                  onClick={openCurrentLink}
                  type="button"
                >
                  <ExternalLink size={14} />
                </Button>
                <Button
                  aria-label="Remove link"
                  className="editor-link-bubble__icon-button"
                  onClick={() => editor.chain().focus().extendMarkRange('link').unsetLink().run()}
                  type="button"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </>
          )}
        </BubbleMenu>
      )}
      {editor && (
        <BubbleMenu
          className="editor-link-bubble editor-image-bubble"
          editor={editor}
          pluginKey="imageBubbleMenu"
          shouldShow={({ editor: currentEditor }) => {
            const { selection } = currentEditor.state;
            return (
              selection instanceof NodeSelection &&
              selection.node.type.name === 'image'
            );
          }}
        >
          {imageBubbleEditing ? (
            <form
              className="editor-link-bubble__form"
              onSubmit={applyImageBubbleValue}
            >
              <Field.Root invalid={Boolean(imageBubbleError)}>
                <Field.Label className="editor-link-bubble__label">
                  Image URL
                </Field.Label>
                <Field.Control
                  autoFocus
                  className="editor-link-bubble__input"
                  inputMode="url"
                  maxLength={2048}
                  onValueChange={setImageBubbleUrl}
                  type="text"
                  value={imageBubbleUrl}
                />
                <Field.Error
                  className="editor-link-bubble__error"
                  match={Boolean(imageBubbleError)}
                >
                  {imageBubbleError}
                </Field.Error>
              </Field.Root>
              <div className="editor-link-bubble__actions">
                <Button
                  aria-label="Cancel image edit"
                  className="editor-link-bubble__icon-button"
                  onClick={() => {
                    setImageBubbleEditing(false);
                    setImageBubbleError('');
                  }}
                  type="button"
                >
                  <X size={14} />
                </Button>
                <Button
                  aria-label="Apply image edit"
                  className="editor-link-bubble__icon-button editor-link-bubble__icon-button--primary"
                  type="submit"
                >
                  <Check size={14} />
                </Button>
              </div>
            </form>
          ) : (
            <>
              <span className="editor-link-bubble__href">{currentImageSrc}</span>
              <div className="editor-link-bubble__actions">
                <Button
                  aria-label="Edit image"
                  className="editor-link-bubble__icon-button"
                  onClick={() => {
                    storeImageSelection();
                    setImageBubbleUrl(currentImageSrc);
                    setImageBubbleError('');
                    setImageBubbleEditing(true);
                  }}
                  type="button"
                >
                  <Edit3 size={14} />
                </Button>
                <Button
                  aria-label="Open image"
                  className="editor-link-bubble__icon-button"
                  onClick={openCurrentImage}
                  type="button"
                >
                  <ExternalLink size={14} />
                </Button>
                <Button
                  aria-label="Remove image"
                  className="editor-link-bubble__icon-button"
                  onClick={() => {
                    storeImageSelection();
                    removeCurrentImage();
                  }}
                  type="button"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </>
          )}
        </BubbleMenu>
      )}
      <EditorContent
        editor={editor}
        onMouseDown={(event) => {
          if (editor) {
            selectImageElement(editor.view, event.target);
          }
        }}
        onClick={(event) => {
          if (editor) {
            selectImageElement(editor.view, event.target);
          }
        }}
      />
    </div>
  );
};

export default CardContentEditor;
