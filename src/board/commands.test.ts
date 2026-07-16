import { expect, test } from 'vitest';

import { DEFAULT_CARD_PRIORITY } from './constants';
import {
  createCard,
  createColumn,
  deleteCard,
  deleteColumn,
  editCard,
  renameColumn,
  reorderCard,
} from './commands';
import type { BoardColumn } from './types';

const CREATED_AT = '2026-06-03T12:34:56.000Z';

const createColumns = (): BoardColumn[] => [
  {
    cards: [
      {
        content: 'One content',
        createdAt: CREATED_AT,
        id: 'card-1',
        priority: DEFAULT_CARD_PRIORITY,
        tagIds: ['tag-1'],
        title: 'One',
      },
      {
        content: 'Two content',
        createdAt: CREATED_AT,
        id: 'card-2',
        priority: DEFAULT_CARD_PRIORITY,
        tagIds: [],
        title: 'Two',
      },
    ],
    id: 'todo',
    position: 0,
    title: 'Todo',
  },
  {
    cards: [
      {
        content: 'Three content',
        createdAt: CREATED_AT,
        id: 'card-3',
        priority: DEFAULT_CARD_PRIORITY,
        tagIds: ['tag-2'],
        title: 'Three',
      },
    ],
    id: 'done',
    position: 10,
    title: 'Done',
  },
];

test('creates, renames, and deletes columns immutably', () => {
  const columns = createColumns();
  const withColumn = createColumn(columns, { id: 'review', title: 'Review' });

  expect(withColumn).toHaveLength(3);
  expect(withColumn[2]).toMatchObject({
    cards: [],
    id: 'review',
    position: 20,
    title: 'Review',
  });
  expect(columns).toHaveLength(2);

  const renamed = renameColumn(withColumn, 'review', 'Ready');
  expect(renamed[2].title).toBe('Ready');
  expect(withColumn[2].title).toBe('Review');

  expect(deleteColumn(renamed, 'review')).toHaveLength(2);
});

test('creates, edits, moves, and deletes cards immutably', () => {
  const columns = createColumns();
  const withCard = createCard(columns, {
    columnId: 'done',
    content: 'Four content',
    createdAt: CREATED_AT,
    id: 'card-4',
    priority: 'high',
    tagIds: ['tag-1'],
    title: 'Four',
  });

  expect(withCard[1].cards.map((card) => card.id)).toEqual([
    'card-3',
    'card-4',
  ]);
  expect(columns[1].cards.map((card) => card.id)).toEqual(['card-3']);

  const edited = editCard(withCard, 'done', 'card-4', {
    columnId: 'todo',
    content: 'Moved content',
    priority: 'medium',
    tagIds: [],
    title: 'Moved',
  });

  expect(edited[0].cards.map((card) => card.id)).toEqual([
    'card-1',
    'card-2',
    'card-4',
  ]);
  expect(edited[1].cards.map((card) => card.id)).toEqual(['card-3']);
  expect(edited[0].cards[2]).toMatchObject({
    content: 'Moved content',
    priority: 'medium',
    title: 'Moved',
  });

  const withoutCard = deleteCard(edited, 'todo', 'card-4');
  expect(withoutCard[0].cards.map((card) => card.id)).toEqual([
    'card-1',
    'card-2',
  ]);
});

test('reorders cards within and across columns', () => {
  const columns = createColumns();
  const reordered = reorderCard(columns, {
    cardId: 'card-2',
    closestEdge: 'top',
    fromColumnId: 'todo',
    targetCardId: 'card-1',
    toColumnId: 'todo',
  });

  expect(reordered[0].cards.map((card) => card.id)).toEqual([
    'card-2',
    'card-1',
  ]);

  const moved = reorderCard(reordered, {
    cardId: 'card-2',
    closestEdge: 'bottom',
    fromColumnId: 'todo',
    targetCardId: 'card-3',
    toColumnId: 'done',
  });

  expect(moved[0].cards.map((card) => card.id)).toEqual(['card-1']);
  expect(moved[1].cards.map((card) => card.id)).toEqual(['card-3', 'card-2']);
});
