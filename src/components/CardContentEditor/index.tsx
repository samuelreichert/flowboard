import type { Editor } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { ClipboardEvent, DragEvent } from 'react';

import { useLocalization } from '../../LocalizationProvider';
import { EditorBubbleMenus } from './EditorBubbleMenus';
import { EditorToolbar } from './EditorToolbar';
import {
  applyAlignChange,
  applyHeadingChange,
  applyListChange,
  getEditorMarkdown,
  isSupportedImageUrl,
  isSupportedUrl,
  normalizeUrl,
  selectImageElement,
} from './commands';
import {
  getCardContentExtensions,
  headingLevels,
  insertImageFiles,
} from './extensions';
import { normalizeMarkdownForEditor } from './markdown';
import type {
  AlignValue,
  EditorToolbarState,
  HeadingValue,
  ListValue,
} from './types';

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

const alignValues: AlignValue[] = ['left', 'center', 'right', 'justify'];
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
    alignValues.find((alignment) =>
      currentEditor.isActive({ textAlign: alignment })
    ) ?? 'left';
  const linkHref = currentEditor.getAttributes('link').href as
    string | undefined;
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

const useCardContentTipTapEditor = ({
  id,
  labelId,
  onChange,
  value,
}: CardContentEditorProps) => {
  const { messages } = useLocalization();
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
          view.state.tr.setSelection(
            NodeSelection.create(view.state.doc, nodePosition)
          )
        );
        view.focus();
        event.preventDefault();

        return true;
      },
    },
    extensions: getCardContentExtensions(
      { fileHandling: true },
      messages.contentEditor
    ),
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
  const { messages } = useLocalization();
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
    extensions: getCardContentExtensions(
      { fileHandling: false },
      messages.contentEditor
    ),
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
  const { messages } = useLocalization();
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

    if (
      selection?.anchorNode &&
      editor.view.dom.contains(selection.anchorNode)
    ) {
      const anchor = editor.view.posAtDOM(
        selection.anchorNode,
        selection.anchorOffset
      );
      const head = editor.view.posAtDOM(
        selection.focusNode ?? selection.anchorNode,
        selection.focusOffset
      );
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
      setLinkError(messages.contentEditor.secureLinkRequired);
      setLinkBubbleError(messages.contentEditor.secureLinkRequired);
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
      setImageError(messages.contentEditor.imageUrlRequired);
      return;
    }

    if (!isSupportedImageUrl(src)) {
      setImageError(messages.contentEditor.secureImageUrlRequired);
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
      setImageBubbleError(messages.contentEditor.imageUrlRequired);
      return;
    }

    if (!isSupportedImageUrl(src)) {
      setImageBubbleError(messages.contentEditor.secureImageUrlRequired);
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

    const openedWindow = window.open(
      currentHref,
      '_blank',
      'noopener,noreferrer'
    );

    if (openedWindow) {
      openedWindow.opener = null;
    }
  };

  const openCurrentImage = () => {
    if (!currentImageSrc) {
      return;
    }

    const openedWindow = window.open(
      currentImageSrc,
      '_blank',
      'noopener,noreferrer'
    );

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
    setCopyStatus(messages.common.copied);
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
    applyLinkPopoverValue: () =>
      applyLinkValue(linkUrl, () => setLinkPopoverOpen(false)),
    applyLinkBubbleValue: () =>
      applyLinkValue(linkBubbleUrl, () => setLinkBubbleEditing(false)),
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
    onRemoveLink: () =>
      editor?.chain().focus().extendMarkRange('link').unsetLink().run(),
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
  const toolbarState =
    useEditorState({
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
