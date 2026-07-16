import { describe, expect, test } from 'vitest';

import {
  normalizeMarkdownForEditor,
  renderAlignedBlockHtml,
  renderImageHtml,
  renderInlineHtml,
} from './markdown';

describe('CardContentEditor Markdown helpers', () => {
  test('normalizes Markdown image blocks to HTML image nodes', () => {
    expect(
      normalizeMarkdownForEditor(
        '![Launch <image>](https://example.com/launch.png "Hero")'
      )
    ).toBe(
      '<img src="https://example.com/launch.png" alt="Launch &lt;image&gt;" title="Hero">'
    );
  });

  test('normalizes nested image links emitted by Markdown round-tripping', () => {
    expect(
      normalizeMarkdownForEditor(
        '![Diagram]([Diagram](https://example.com/diagram.png))'
      )
    ).toBe('<img src="https://example.com/diagram.png" alt="Diagram">');
  });

  test('renders inline content with escaped text and secure link attributes', () => {
    expect(
      renderInlineHtml([
        {
          marks: [{ type: 'bold' }],
          text: 'Ship <now>',
          type: 'text',
        },
        { type: 'hardBreak' },
        {
          marks: [
            {
              attrs: { href: 'https://example.com/?q=<query>' },
              type: 'link',
            },
          ],
          text: 'open',
          type: 'text',
        },
      ])
    ).toBe(
      '<strong>Ship &lt;now&gt;</strong><br><a href="https://example.com/?q=&lt;query&gt;" target="_blank" rel="noopener noreferrer">open</a>'
    );
  });

  test('renders aligned blocks with escaped attributes', () => {
    expect(
      renderAlignedBlockHtml('h2', 'center', [
        { text: 'Plan & build', type: 'text' },
      ])
    ).toBe('<h2 style="text-align: center">Plan &amp; build</h2>');
  });

  test('escapes image attributes', () => {
    expect(renderImageHtml('"alt"', 'https://example.com/a.png?x=1&y=2')).toBe(
      '<img src="https://example.com/a.png?x=1&amp;y=2" alt="&quot;alt&quot;">'
    );
  });
});
