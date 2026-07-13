import type { Editor, JSONContent } from '@tiptap/core';
import FileHandler from '@tiptap/extension-file-handler';
import Heading, { type Level } from '@tiptap/extension-heading';
import Image from '@tiptap/extension-image';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import Paragraph from '@tiptap/extension-paragraph';
import TextAlign from '@tiptap/extension-text-align';
import { Markdown } from '@tiptap/markdown';
import { NodeSelection } from '@tiptap/pm/state';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { ClipboardEvent, DragEvent } from 'react';

import { EditorBubbleMenus } from './EditorBubbleMenus';
import { EditorToolbar } from './EditorToolbar';
import type { AlignValue, EditorToolbarState, HeadingValue, ListValue } from './types';

import './CardContentEditor.css';

type CardContentEditorProps = {
  id: string;
  labelId: string;
  onChange: (value: string) => void;
  value: string;
};

type CardContentViewerProps = {
  ariaLabel: string;
  value: string;
};

const imageMimeTypes = ['image/gif', 'image/jpeg', 'image/png', 'image/webp'];
const headingLevels: Level[] = [1, 2, 3, 4];
const alignValues: AlignValue[] = ['left', 'center', 'right', 'justify'];
const EMPTY_PARAGRAPH_MARKDOWN = '&nbsp;';
const NBSP_CHAR = '\u00A0';

const defaultToolbarState: EditorToolbarState = {
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

const getToolbarState = (currentEditor: Editor): EditorToolbarState => {
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

const taskListMarkerLinePattern = /^(\s*[-+*]\s+\[[ xX]\])\s*$/;
const markdownBlockStartPattern =
  /^\s*(?:[-+*]\s+(?:\[[ xX]\]\s*)?|\d+\.\s+|#{1,6}\s+|>|```|~~~|<|!\[|\|)/;

export const normalizeTaskListMarkerLines = (markdown: string) => {
  const lines = markdown.split('\n');
  const normalizedLines: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const taskListMarkerMatch = line.match(taskListMarkerLinePattern);
    const nextLine = lines[index + 1];

    if (
      taskListMarkerMatch &&
      nextLine &&
      nextLine.trim() &&
      !markdownBlockStartPattern.test(nextLine)
    ) {
      normalizedLines.push(`${taskListMarkerMatch[1]} ${nextLine.trim()}`);
      index += 1;
      continue;
    }

    normalizedLines.push(line);
  }

  return normalizedLines.join('\n');
};

const normalizeMarkdownForEditor = (markdown: string) =>
  normalizeTaskListMarkerLines(markdown)
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

const applyHeadingChange = (editor: Editor | null, nextValue: HeadingValue) => {
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

const applyListChange = (editor: Editor | null, nextValue: ListValue) => {
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

const applyAlignChange = (editor: Editor | null, nextValue: AlignValue) => {
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

const getCardContentExtensions = (options: { fileHandling: boolean }) => [
  StarterKit.configure({
    heading: false,
    link: {
      HTMLAttributes: {
        rel: 'noopener noreferrer',
        target: '_blank',
      },
      openOnClick: !options.fileHandling,
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
  ...(options.fileHandling
    ? [
        FileHandler.configure({
          allowedMimeTypes: imageMimeTypes,
          onDrop: (currentEditor, files, position) => {
            void insertImageFiles(currentEditor, files, position);
          },
          onPaste: (currentEditor, files) => {
            void insertImageFiles(currentEditor, files);
          },
        }),
      ]
    : []),
  Markdown.configure({
    indentation: { size: 2, style: 'space' },
  }),
];

const useCardContentTipTapEditor = ({
  id,
  labelId,
  onChange,
  value,
}: CardContentEditorProps) => {
  const onChangeRef = useRef(onChange);
  const lastSyncedValue = useRef(value);

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
    extensions: getCardContentExtensions({ fileHandling: true }),
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

  return editor;
};

export const CardContentViewer = ({
  ariaLabel,
  value,
}: CardContentViewerProps) => {
  const editor = useEditor({
    content: normalizeMarkdownForEditor(value),
    contentType: 'markdown',
    editable: false,
    editorProps: {
      attributes: {
        'aria-label': ariaLabel,
        class:
          'card-content-editor__surface card-content-editor__surface--readonly',
      },
    },
    extensions: getCardContentExtensions({ fileHandling: false }),
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.commands.setContent(normalizeMarkdownForEditor(value), {
      contentType: 'markdown',
      emitUpdate: false,
    });
  }, [editor, value]);

  return <EditorContent editor={editor} />;
};

const useCardContentEditorInteractions = (
  editor: Editor | null,
  toolbarState: EditorToolbarState
) => {
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
  const currentHref = toolbarState.linkHref;
  const currentImageSrc = toolbarState.imageSrc;

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

  return {
    applyImageBubbleValue,
    applyImageValue,
    applyLinkPopoverValue: () => applyLinkValue(linkUrl, () => setLinkPopoverOpen(false)),
    applyLinkBubbleValue: () => applyLinkValue(linkBubbleUrl, () => setLinkBubbleEditing(false)),
    copyMarkdown,
    copyStatus,
    currentHref,
    currentImageSrc,
    imageBubbleEditing,
    imageBubbleError,
    imageBubbleUrl,
    imageError,
    imagePopoverOpen,
    imageUrl,
    linkBubbleEditing,
    linkBubbleError,
    linkBubbleUrl,
    linkError,
    linkPopoverOpen,
    linkUrl,
    onCancelImageEdit: () => {
      setImageBubbleEditing(false);
      setImageBubbleError('');
    },
    onCancelLinkEdit: () => {
      setLinkBubbleEditing(false);
      setLinkBubbleError('');
    },
    onEditImage: () => {
      storeImageSelection();
      setImageBubbleUrl(currentImageSrc);
      setImageBubbleError('');
      setImageBubbleEditing(true);
    },
    onEditLink: () => {
      storeLinkSelection();
      setLinkBubbleUrl(currentHref ?? '');
      setLinkBubbleError('');
      setLinkBubbleEditing(true);
    },
    onFileDrop,
    onFilePaste,
    onImagePopoverOpenChange: (open: boolean) => {
      setImagePopoverOpen(open);
      if (open) {
        openImagePopover();
        return;
      }

      setImageError('');
    },
    onLinkMouseDown: storeLinkSelection,
    onLinkPopoverOpen: openLinkPopover,
    onLinkPopoverOpenChange: (open: boolean) => {
      setLinkPopoverOpen(open);
      if (!open) {
        setLinkError('');
      }
    },
    onOpenImage: openCurrentImage,
    onOpenLink: openCurrentLink,
    onRemoveImage: () => {
      storeImageSelection();
      removeCurrentImage();
    },
    onRemoveLink: () => editor?.chain().focus().extendMarkRange('link').unsetLink().run(),
    setImageBubbleUrl,
    setImageUrl,
    setLinkBubbleUrl,
    setLinkUrl,
  };
};

const CardContentEditor = ({
  id,
  labelId,
  onChange,
  value,
}: CardContentEditorProps) => {
  const editorRootRef = useRef<HTMLDivElement | null>(null);
  const editor = useCardContentTipTapEditor({ id, labelId, onChange, value });
  const toolbarState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      if (!currentEditor) {
        return defaultToolbarState;
      }

      return getToolbarState(currentEditor);
    },
  }) ?? defaultToolbarState;
  const interactions = useCardContentEditorInteractions(editor, toolbarState);

  return (
    <div
      className="card-content-editor"
      onDrop={interactions.onFileDrop}
      onPaste={interactions.onFilePaste}
      ref={editorRootRef}
    >
      <EditorToolbar
        copyStatus={interactions.copyStatus}
        editorReady={Boolean(editor)}
        imageError={interactions.imageError}
        imagePopoverOpen={interactions.imagePopoverOpen}
        imageUrl={interactions.imageUrl}
        linkError={interactions.linkError}
        linkPopoverOpen={interactions.linkPopoverOpen}
        linkUrl={interactions.linkUrl}
        onAlignChange={(nextValue) => applyAlignChange(editor, nextValue)}
        onApplyImage={interactions.applyImageValue}
        onApplyLink={interactions.applyLinkPopoverValue}
        onBlockquote={() => editor?.chain().focus().toggleBlockquote().run()}
        onBold={() => editor?.chain().focus().toggleBold().run()}
        onCode={() => editor?.chain().focus().toggleCode().run()}
        onCodeBlock={() => editor?.chain().focus().toggleCodeBlock().run()}
        onCopyMarkdown={interactions.copyMarkdown}
        onHeadingChange={(nextValue) => applyHeadingChange(editor, nextValue)}
        onImagePopoverOpenChange={interactions.onImagePopoverOpenChange}
        onItalic={() => editor?.chain().focus().toggleItalic().run()}
        onLinkMouseDown={interactions.onLinkMouseDown}
        onLinkPopoverOpen={interactions.onLinkPopoverOpen}
        onLinkPopoverOpenChange={interactions.onLinkPopoverOpenChange}
        onListChange={(nextValue) => applyListChange(editor, nextValue)}
        onRedo={() => editor?.chain().focus().redo().run()}
        onSetImageUrl={interactions.setImageUrl}
        onSetLinkUrl={interactions.setLinkUrl}
        onStrike={() => editor?.chain().focus().toggleStrike().run()}
        onUndo={() => editor?.chain().focus().undo().run()}
        toolbarState={toolbarState}
      />
      <EditorBubbleMenus
        currentHref={interactions.currentHref}
        currentImageSrc={interactions.currentImageSrc}
        editor={editor}
        imageBubbleEditing={interactions.imageBubbleEditing}
        imageBubbleError={interactions.imageBubbleError}
        imageBubbleUrl={interactions.imageBubbleUrl}
        linkBubbleEditing={interactions.linkBubbleEditing}
        linkBubbleError={interactions.linkBubbleError}
        linkBubbleUrl={interactions.linkBubbleUrl}
        onApplyImageBubble={interactions.applyImageBubbleValue}
        onApplyLinkBubble={interactions.applyLinkBubbleValue}
        onCancelImageEdit={interactions.onCancelImageEdit}
        onCancelLinkEdit={interactions.onCancelLinkEdit}
        onEditImage={interactions.onEditImage}
        onEditLink={interactions.onEditLink}
        onOpenImage={interactions.onOpenImage}
        onOpenLink={interactions.onOpenLink}
        onRemoveImage={interactions.onRemoveImage}
        onRemoveLink={interactions.onRemoveLink}
        onSetImageBubbleUrl={interactions.setImageBubbleUrl}
        onSetLinkBubbleUrl={interactions.setLinkBubbleUrl}
      />
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
