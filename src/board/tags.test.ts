import { expect, test } from 'vitest';

import { DEFAULT_CARD_PRIORITY } from './constants';
import {
  countTagUsage,
  createTag,
  deleteTag,
  getTagNameError,
  removeTagFromColumns,
  renameTag,
  TAG_NAME_DUPLICATE_MESSAGE,
  TAG_NAME_REQUIRED_MESSAGE,
} from './tags';
import type { BoardColumn, BoardTag } from './types';

const tags: BoardTag[] = [
  { id: 'tag-1', name: 'Design' },
  { id: 'tag-2', name: 'Build' },
];

const columns: BoardColumn[] = [
  {
    cards: [
      {
        content: '',
        createdAt: '2026-06-03T12:34:56.000Z',
        id: 'card-1',
        priority: DEFAULT_CARD_PRIORITY,
        tagIds: ['tag-1', 'tag-2'],
        title: 'One',
      },
      {
        content: '',
        createdAt: '2026-06-03T12:34:56.000Z',
        id: 'card-2',
        priority: DEFAULT_CARD_PRIORITY,
        tagIds: ['tag-1'],
        title: 'Two',
      },
    ],
    id: 'todo',
    position: 0,
    title: 'Todo',
  },
];

test('validates blank and duplicate tag names consistently', () => {
  expect(getTagNameError(tags, '   ')).toBe(TAG_NAME_REQUIRED_MESSAGE);
  expect(getTagNameError(tags, 'Design')).toBe(TAG_NAME_DUPLICATE_MESSAGE);
  expect(getTagNameError(tags, 'Design', 'tag-1')).toBe('');
  expect(getTagNameError(tags, 'Research')).toBe('');
});

test('creates, renames, and deletes tags immutably', () => {
  const created = createTag(tags, ' Research ', 'tag-3');

  expect(created.tag).toEqual({ id: 'tag-3', name: 'Research' });
  expect(created.tags.map((tag) => tag.name)).toEqual([
    'Design',
    'Build',
    'Research',
  ]);
  expect(tags).toHaveLength(2);

  const renamed = renameTag(created.tags, 'tag-3', ' Discovery ');
  expect(renamed[2]).toEqual({ id: 'tag-3', name: 'Discovery' });

  expect(deleteTag(renamed, 'tag-3')).toEqual(tags);
});

test('counts usage and removes deleted tags from board columns', () => {
  expect(countTagUsage(columns, 'tag-1')).toBe(2);
  expect(countTagUsage(columns, 'tag-2')).toBe(1);

  const withoutTag = removeTagFromColumns(columns, 'tag-1');

  expect(withoutTag[0].cards.map((card) => card.tagIds)).toEqual([
    ['tag-2'],
    [],
  ]);
  expect(columns[0].cards[0].tagIds).toEqual(['tag-1', 'tag-2']);
});
