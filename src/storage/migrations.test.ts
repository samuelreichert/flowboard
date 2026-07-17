import { expect, test } from 'vitest';

import { DEFAULT_CARD_PRIORITY } from '../board/constants';
import { normalizeStoredColumns } from './migrations';

const CREATED_AT = '2026-06-03T12:34:56.000Z';

test('returns current board columns without migration', () => {
  const columns = [
    {
      cards: [
        {
          content: 'Notes',
          createdAt: CREATED_AT,
          id: 'card-1',
          priority: DEFAULT_CARD_PRIORITY,
          tagIds: [],
          title: 'Card',
        },
      ],
      id: 'todo',
      position: 0,
      title: 'Todo',
    },
  ];

  expect(
    normalizeStoredColumns(columns, CREATED_AT, crypto.randomUUID)
  ).toEqual({
    columns,
    migrated: false,
  });
});

test('migrates legacy string cards to stable board cards', () => {
  let idCount = 0;
  const createId = () => `generated-${++idCount}`;
  const normalized = normalizeStoredColumns(
    [{ cards: ['Legacy card'], position: 0, title: 'Todo' }],
    CREATED_AT,
    createId
  );

  expect(normalized).toEqual({
    columns: [
      {
        cards: [
          {
            content: '',
            createdAt: CREATED_AT,
            id: 'generated-2',
            priority: DEFAULT_CARD_PRIORITY,
            tagIds: [],
            title: 'Legacy card',
          },
        ],
        id: 'generated-1',
        position: 0,
        title: 'Todo',
      },
    ],
    migrated: true,
  });
});

test('migrates legacy card descriptions to content', () => {
  const normalized = normalizeStoredColumns(
    [
      {
        cards: [
          {
            createdAt: CREATED_AT,
            description: 'Old description',
            id: 'card-1',
            title: 'Card',
          },
        ],
        id: 'todo',
        position: 0,
        title: 'Todo',
      },
    ],
    CREATED_AT,
    crypto.randomUUID
  );

  expect(normalized).toMatchObject({
    columns: [
      {
        cards: [
          {
            content: 'Old description',
            createdAt: CREATED_AT,
            id: 'card-1',
            priority: DEFAULT_CARD_PRIORITY,
            tagIds: [],
            title: 'Card',
          },
        ],
      },
    ],
    migrated: true,
  });
});
