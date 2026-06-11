import { expect, test } from 'vitest';

import { DEFAULT_CARD_PRIORITY } from './constants';
import {
  isBoardState,
  isSafeImageUrl,
  normalizeBoardState,
} from './validation';

const CREATED_AT = '2026-06-03T12:34:56.000Z';

test('normalizes missing card metadata for shared board states', () => {
  const normalized = normalizeBoardState({
    background: { type: 'color', value: '#ffffff' },
    columns: [
      {
        cards: [
          {
            content: 'Shared notes',
            createdAt: CREATED_AT,
            id: 'card-1',
            title: 'Shared card',
          },
        ],
        id: 'todo',
        position: 0,
        title: 'Todo',
      },
    ],
  });

  expect(normalized).toMatchObject({
    columns: [
      {
        cards: [
          {
            priority: DEFAULT_CARD_PRIORITY,
            tagIds: [],
          },
        ],
      },
    ],
    tags: [],
  });
  expect(isBoardState(normalized)).toBe(true);
});

test('normalizes legacy card descriptions to content', () => {
  const normalized = normalizeBoardState({
    background: { type: 'color', value: '#ffffff' },
    columns: [
      {
        cards: [
          {
            description: 'Legacy body',
            id: 'card-1',
            title: 'Legacy card',
          },
        ],
        id: 'todo',
        position: 0,
        title: 'Todo',
      },
    ],
    tags: [],
  });

  expect(normalized).toMatchObject({
    columns: [
      {
        cards: [
          {
            content: 'Legacy body',
            id: 'card-1',
            priority: DEFAULT_CARD_PRIORITY,
            tagIds: [],
            title: 'Legacy card',
          },
        ],
      },
    ],
  });
  expect(isBoardState(normalized)).toBe(true);
});

test('rejects invalid board payloads', () => {
  expect(
    isBoardState({
      background: { type: 'color', value: '#ffffff' },
      columns: [
        {
          cards: [
            {
              content: 'Bad card',
              createdAt: CREATED_AT,
              id: 'card-1',
              priority: 'urgent',
              tagIds: [],
              title: 'Bad card',
            },
          ],
          id: 'todo',
          position: 0,
          title: 'Todo',
        },
      ],
      tags: [],
    })
  ).toBe(false);
});

test('allows local and https image URLs only', () => {
  expect(isSafeImageUrl('/flowboard-background.png')).toBe(true);
  expect(isSafeImageUrl('https://images.example.com/cover.jpg')).toBe(true);
  expect(isSafeImageUrl('//images.example.com/cover.jpg')).toBe(false);
  expect(isSafeImageUrl('http://images.example.com/cover.jpg')).toBe(false);
});
