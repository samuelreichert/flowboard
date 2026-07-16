import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, vi } from 'vitest';

import { fetchStorage } from './index';
import { resetAppTestEnvironment } from '../test/appTestUtils';

beforeEach(resetAppTestEnvironment);

test('migrates legacy localStorage data to stable IDs', () => {
  localStorage.setItem(
    'columnsList',
    JSON.stringify([{ title: 'Todo', cards: ['Ship it'], position: 0 }])
  );

  const columns = fetchStorage();

  expect(columns[0]).toMatchObject({ title: 'Todo', position: 0 });
  expect(columns[0].id).toBeTruthy();
  expect(columns[0].cards[0]).toMatchObject({ title: 'Ship it' });
  expect(columns[0].cards[0].content).toBe('');
  expect(columns[0].cards[0].priority).toBe('medium');
  expect(columns[0].cards[0].tagIds).toEqual([]);
  expect(Date.parse(columns[0].cards[0].createdAt)).not.toBeNaN();
  expect(columns[0].cards[0].id).toBeTruthy();
  expect(localStorage.getItem('columnsList')).toContain(columns[0].id);
});

test('migrates stable-ID cards that predate content', () => {
  localStorage.setItem(
    'columnsList',
    JSON.stringify([
      {
        id: 'todo',
        title: 'Todo',
        cards: [{ id: 'ship-it', title: 'Ship it' }],
        position: 0,
      },
    ])
  );

  expect(fetchStorage()[0].cards[0]).toEqual({
    content: '',
    createdAt: expect.any(String),
    id: 'ship-it',
    priority: 'medium',
    tagIds: [],
    title: 'Ship it',
  });
  expect(Date.parse(fetchStorage()[0].cards[0].createdAt)).not.toBeNaN();
});

test('migrates card descriptions to content', () => {
  localStorage.setItem(
    'columnsList',
    JSON.stringify([
      {
        id: 'todo',
        title: 'Todo',
        cards: [
          {
            description: 'Legacy notes',
            id: 'ship-it',
            title: 'Ship it',
          },
        ],
        position: 0,
      },
    ])
  );

  expect(fetchStorage()[0].cards[0]).toEqual({
    content: 'Legacy notes',
    createdAt: expect.any(String),
    id: 'ship-it',
    priority: 'medium',
    tagIds: [],
    title: 'Ship it',
  });
  expect(Date.parse(fetchStorage()[0].cards[0].createdAt)).not.toBeNaN();
});
