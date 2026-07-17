import type { Editor } from '@tiptap/core';
import { type Level } from '@tiptap/extension-heading';
import { NodeSelection } from '@tiptap/pm/state';

import type { AlignValue, HeadingValue, ListValue } from './types';

export const normalizeUrl = (value: string) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return '';
  }

  if (/^(https?:|mailto:|data:image\/)/i.test(trimmedValue)) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
};

export const isSupportedUrl = (value: string, allowDataImage = false) => {
  try {
    const url = new URL(value);

    if (url.protocol === 'https:' || url.protocol === 'mailto:') {
      return true;
    }

    return (
      allowDataImage &&
      url.protocol === 'data:' &&
      value.startsWith('data:image/')
    );
  } catch {
    return false;
  }
};

export const isSupportedImageUrl = (value: string) => {
  try {
    const url = new URL(value);

    return (
      url.protocol === 'https:' ||
      (url.protocol === 'data:' && value.startsWith('data:image/'))
    );
  } catch {
    return false;
  }
};

export const getEditorMarkdown = (editor: Editor) =>
  editor
    .getMarkdown()
    .replace(/[ \t]+$/gm, '')
    .trimEnd();

export const selectImageElement = (
  view: Editor['view'],
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

export const applyHeadingChange = (
  editor: Editor | null,
  nextValue: HeadingValue
) => {
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
    .toggleHeading({
      level: Number(nextValue.replace('heading-', '')) as Level,
    })
    .run();
};

export const applyListChange = (
  editor: Editor | null,
  nextValue: ListValue
) => {
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

export const applyAlignChange = (
  editor: Editor | null,
  nextValue: AlignValue
) => {
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
