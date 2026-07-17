import type { Editor } from '@tiptap/core';
import FileHandler from '@tiptap/extension-file-handler';
import Heading, { type Level } from '@tiptap/extension-heading';
import Image from '@tiptap/extension-image';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import Paragraph from '@tiptap/extension-paragraph';
import TextAlign from '@tiptap/extension-text-align';
import { Markdown } from '@tiptap/markdown';
import StarterKit from '@tiptap/starter-kit';

import {
  EMPTY_PARAGRAPH_MARKDOWN,
  NBSP_CHAR,
  renderAlignedBlockHtml,
  type MarkdownHeadingLevel,
} from './markdown';
import type { Messages } from '../../localization';

export const imageMimeTypes = [
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
];
export const headingLevels: Level[] = [1, 2, 3, 4];

export const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => resolve(String(reader.result ?? '')));
    reader.addEventListener('error', () => reject(reader.error));
    reader.readAsDataURL(file);
  });

export const insertImageFiles = async (
  editor: Editor,
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
      (content[0].text === EMPTY_PARAGRAPH_MARKDOWN ||
        content[0].text === NBSP_CHAR)
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
    const level = node.attrs?.level
      ? parseInt(String(node.attrs.level), 10)
      : 1;
    const safeLevel = headingLevels.includes(level as Level)
      ? (level as Level)
      : 1;
    const alignment = node.attrs?.textAlign;

    if (!node.content) {
      return '';
    }

    if (alignment && alignment !== 'left') {
      return renderAlignedBlockHtml(
        `h${safeLevel as MarkdownHeadingLevel}`,
        alignment,
        node.content
      );
    }

    return `${'#'.repeat(safeLevel)} ${h.renderChildren(node.content)}`;
  },
});

export const getCardContentExtensions = (
  options: {
    fileHandling: boolean;
  },
  messages: Messages['contentEditor']
) => [
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
        messages.taskCheckboxLabel(checked, node.textContent),
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
