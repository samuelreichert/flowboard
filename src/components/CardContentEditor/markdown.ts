import type { JSONContent } from '@tiptap/core';

export type MarkdownHeadingLevel = 1 | 2 | 3 | 4;

export const EMPTY_PARAGRAPH_MARKDOWN = '&nbsp;';
export const NBSP_CHAR = '\u00A0';

export const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const escapeAttribute = (value: unknown) =>
  escapeHtml(String(value ?? ''));

export const renderImageHtml = (alt: string, src: string, title = '') => {
  const titleAttribute = title ? ` title="${escapeAttribute(title)}"` : '';

  return `<img src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}"${titleAttribute}>`;
};

export const normalizeMarkdownForEditor = (markdown: string) =>
  markdown
    .replace(
      /^!\[([^\]\n]*)\]\(\[([^\]\n]*)\]\((\S+?)(?:\s+["']([^"'\n]*)["'])?\)\)$/gm,
      (_match, alt: string, _linkText: string, src: string, title = '') =>
        renderImageHtml(alt, src, title)
    )
    .replace(
      /^!\[([^\]\n]*)\]\((\S+?)(?:\s+["']([^"'\n]*)["'])?\)$/gm,
      (_match, alt: string, src: string, title = '') =>
        renderImageHtml(alt, src, title)
    );

export const renderInlineHtml = (content: JSONContent[] = []): string =>
  content.map(renderInlineNodeHtml).join('');

export const renderInlineNodeHtml = (node: JSONContent): string => {
  if (node.type === 'text') {
    return (node.marks ?? []).reduce(
      (text, mark) => {
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
      },
      escapeHtml(node.text ?? '')
    );
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

export const renderAlignedBlockHtml = (
  tagName: 'p' | `h${MarkdownHeadingLevel}`,
  alignment: string,
  content: JSONContent[] = []
) =>
  `<${tagName} style="text-align: ${escapeAttribute(alignment)}">${renderInlineHtml(content)}</${tagName}>`;
