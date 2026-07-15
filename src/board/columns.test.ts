import { expect, test } from 'vitest';

import { moveColumn, normalizeColumnOrder } from './columns';
import type { BoardColumn } from './types';

const createColumn = (
  id: string,
  title: string,
  position: number
): BoardColumn => ({
  cards: [],
  id,
  position,
  title,
});

const columnIds = (columns: BoardColumn[]) =>
  columns.map((column) => column.id);

test('normalizes columns into visual order with stable position gaps', () => {
  const columns = normalizeColumnOrder([
    createColumn('review', 'Review', 20),
    createColumn('todo', 'Todo', 0),
    createColumn('progress', 'In Progress', 10),
  ]);

  expect(columnIds(columns)).toEqual(['todo', 'progress', 'review']);
  expect(columns.map((column) => column.position)).toEqual([0, 10, 20]);
});

test('moves columns to adjacent and edge positions', () => {
  const columns = [
    createColumn('todo', 'Todo', 0),
    createColumn('progress', 'In Progress', 10),
    createColumn('done', 'Done', 20),
  ];

  expect(columnIds(moveColumn(columns, 'progress', 'previous'))).toEqual([
    'progress',
    'todo',
    'done',
  ]);
  expect(columnIds(moveColumn(columns, 'progress', 'next'))).toEqual([
    'todo',
    'done',
    'progress',
  ]);
  expect(columnIds(moveColumn(columns, 'done', 'first'))).toEqual([
    'done',
    'todo',
    'progress',
  ]);
  expect(columnIds(moveColumn(columns, 'todo', 'last'))).toEqual([
    'progress',
    'done',
    'todo',
  ]);
});

test('returns normalized no-op order at first and last edges', () => {
  const columns = [
    createColumn('done', 'Done', 30),
    createColumn('todo', 'Todo', 10),
    createColumn('progress', 'In Progress', 20),
  ];

  expect(moveColumn(columns, 'todo', 'previous')).toEqual([
    createColumn('todo', 'Todo', 0),
    createColumn('progress', 'In Progress', 10),
    createColumn('done', 'Done', 20),
  ]);
  expect(moveColumn(columns, 'done', 'next')).toEqual([
    createColumn('todo', 'Todo', 0),
    createColumn('progress', 'In Progress', 10),
    createColumn('done', 'Done', 20),
  ]);
});
