import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';

import {
  normalizeMarkdownForEditor,
  sanitizeMarkdownContent,
} from './markdown';

const markdownPatterns = [
  /^(?: {0,3})#{1,6}(?:[ \t]+|$)/m,
  /^(?: {0,3})(?:[-*+]\s+|\d+[.)]\s+)/m,
  /^(?: {0,3})>\s?/m,
  /^(?: {0,3})(?:```|~~~)/m,
  /^(?: {0,3})(?:---+|\*\*\*+|___+)\s*$/m,
  /(?:^|[^\\])(?:\*\*|__|~~)[^\n]+?(?:\*\*|__|~~)/m,
  /(?:^|[^\\])`[^`\n]+`/m,
  /!?\[[^\]\n]*]\([^\n)]+\)/m,
  /^<(?:img|p|h[1-4])(?:\s|>)/im,
];

export const looksLikeSupportedMarkdown = (text: string) =>
  markdownPatterns.some((pattern) => pattern.test(text));

const hasFiles = (event: ClipboardEvent) =>
  Array.from(event.clipboardData?.files ?? []).length > 0;

export const MarkdownPaste = Extension.create({
  name: 'markdownPaste',

  addProseMirrorPlugins() {
    const { editor } = this;

    return [
      new Plugin({
        props: {
          handlePaste: (_view, event) => {
            if (hasFiles(event)) {
              return false;
            }

            const text = event.clipboardData?.getData('text/plain') ?? '';

            if (!text || !looksLikeSupportedMarkdown(text)) {
              return false;
            }

            const markdown = editor.markdown;

            if (!markdown) {
              return false;
            }

            const content = markdown.parse(normalizeMarkdownForEditor(text));

            editor.commands.insertContent(sanitizeMarkdownContent(content));

            return true;
          },
        },
      }),
    ];
  },
});
