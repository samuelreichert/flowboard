import { describe, expect, test } from 'vitest';

import { parseComposerDraft } from './parseComposerDraft';

describe('parseComposerDraft', () => {
  test('returns empty values for blank drafts', () => {
    expect(parseComposerDraft(' \n\t\n')).toEqual({ content: '', title: '' });
  });

  test('uses a single line as the title', () => {
    expect(parseComposerDraft('Ship it')).toEqual({
      content: '',
      title: 'Ship it',
    });
  });

  test('uses the first non-empty line as title and the rest as content', () => {
    expect(
      parseComposerDraft(
        '\n\n  Call Megan about launch copy  \nNeed options by Friday.\nInclude pricing page note.\n'
      )
    ).toEqual({
      content: 'Need options by Friday.\nInclude pricing page note.',
      title: 'Call Megan about launch copy',
    });
  });

  test('normalizes windows line endings', () => {
    expect(parseComposerDraft('Title\r\nBody line\r\nNext line')).toEqual({
      content: 'Body line\nNext line',
      title: 'Title',
    });
  });
});
