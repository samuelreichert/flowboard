import type { Editor } from '@tiptap/core';
import { useRef, useState } from 'react';
import type { ClipboardEvent, DragEvent, FormEvent } from 'react';

import { useLocalization } from '../../LocalizationProvider';
import {
  getEditorMarkdown,
  isSupportedImageUrl,
  isSupportedUrl,
  normalizeUrl,
} from './commands';
import { insertImageFiles } from './extensions';
import type { EditorToolbarState } from './types';

export const useCardContentInteractions = (
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

  const openExternal = (url: string) => {
    const openedWindow = window.open(url, '_blank', 'noopener,noreferrer');

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
    applyLinkBubbleValue: () =>
      applyLinkValue(linkBubbleUrl, () => setLinkBubbleEditing(false)),
    applyLinkPopoverValue: () =>
      applyLinkValue(linkUrl, () => setLinkPopoverOpen(false)),
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
    onOpenImage: () => {
      if (currentImageSrc) {
        openExternal(currentImageSrc);
      }
    },
    onOpenLink: () => {
      if (currentHref) {
        openExternal(currentHref);
      }
    },
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
