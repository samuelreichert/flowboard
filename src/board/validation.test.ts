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
    activeWorkCycle: {
      completedColumnId: null,
      startDate: expect.any(String),
    },
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
    completedWorkCycles: [],
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

test('normalizes work-cycle history by inferring a Done column', () => {
  const normalized = normalizeBoardState({
    background: { type: 'color', value: '#ffffff' },
    columns: [
      {
        cards: [
          {
            content: 'Newest done',
            createdAt: '2026-06-10T09:00:00.000Z',
            id: 'newest',
            priority: DEFAULT_CARD_PRIORITY,
            tagIds: [],
            title: 'Newest',
          },
          {
            content: 'Oldest done',
            createdAt: '2026-06-01T09:00:00.000Z',
            id: 'oldest',
            priority: DEFAULT_CARD_PRIORITY,
            tagIds: [],
            title: 'Oldest',
          },
        ],
        id: 'done',
        position: 10,
        title: 'Done',
      },
    ],
    tags: [],
  });

  expect(normalized).toMatchObject({
    activeWorkCycle: {
      completedColumnId: 'done',
      startDate: '2026-06-01T09:00:00.000Z',
    },
  });
  expect(isBoardState(normalized)).toBe(true);
});

test('normalizes work-cycle history without a Done column', () => {
  const normalized = normalizeBoardState({
    background: { type: 'color', value: '#ffffff' },
    columns: [
      {
        cards: [],
        id: 'todo',
        position: 0,
        title: 'Todo',
      },
    ],
    tags: [],
  });

  expect(normalized).toMatchObject({
    activeWorkCycle: {
      completedColumnId: null,
      startDate: expect.any(String),
    },
  });
  expect(isBoardState(normalized)).toBe(true);
});

test('normalizes an empty Done column with the current migration date', () => {
  const normalized = normalizeBoardState({
    background: { type: 'color', value: '#ffffff' },
    columns: [
      {
        cards: [],
        id: 'done',
        position: 10,
        title: 'Done',
      },
    ],
    tags: [],
  });

  expect(normalized).toMatchObject({
    activeWorkCycle: {
      completedColumnId: 'done',
      startDate: expect.any(String),
    },
  });
  expect(isBoardState(normalized)).toBe(true);
});

test('normalizes invalid completed-column IDs to unset', () => {
  const normalized = normalizeBoardState({
    activeWorkCycle: {
      completedColumnId: 'missing-column',
      startDate: CREATED_AT,
    },
    background: { type: 'color', value: '#ffffff' },
    columns: [
      {
        cards: [],
        id: 'todo',
        position: 0,
        title: 'Todo',
      },
    ],
    completedWorkCycles: [],
    tags: [],
  });

  expect(normalized).toMatchObject({
    activeWorkCycle: {
      completedColumnId: null,
      startDate: CREATED_AT,
    },
  });
  expect(isBoardState(normalized)).toBe(true);
});

test('preserves valid completed work-cycle history', () => {
  const normalized = normalizeBoardState({
    activeWorkCycle: {
      completedColumnId: 'done',
      startDate: '2026-06-14T12:00:00.000Z',
    },
    background: { type: 'color', value: '#ffffff' },
    columns: [
      {
        cards: [],
        id: 'done',
        position: 10,
        title: 'Done',
      },
    ],
    completedWorkCycles: [
      {
        cards: [
          {
            archivedAt: '2026-06-14T12:00:00.000Z',
            content: 'Delivered notes',
            createdAt: CREATED_AT,
            id: 'card-1',
            priority: DEFAULT_CARD_PRIORITY,
            tagIds: ['tag-1'],
            tagSnapshots: [{ id: 'tag-1', name: 'Launch' }],
            title: 'Delivered card',
          },
        ],
        completedColumnId: 'done',
        completedColumnTitle: 'Done',
        endDate: '2026-06-14T12:00:00.000Z',
        id: 'cycle-1',
        startDate: '2026-06-01T12:00:00.000Z',
      },
    ],
    tags: [{ id: 'tag-1', name: 'Launch' }],
  });

  expect(normalized).toMatchObject({
    completedWorkCycles: [
      {
        cards: [{ title: 'Delivered card' }],
        id: 'cycle-1',
      },
    ],
  });
  expect(isBoardState(normalized)).toBe(true);
});

test('rejects invalid board payloads', () => {
  expect(
    isBoardState({
      activeWorkCycle: {
        completedColumnId: null,
        startDate: CREATED_AT,
      },
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
      completedWorkCycles: [],
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
