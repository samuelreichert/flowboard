import { expect, test } from 'vitest';

import {
  formatHistoryDate,
  getVisibleTagNames,
  sortCompletedWorkCycles,
} from './historyHelpers';
import type {
  ArchivedBoardCard,
  BoardTag,
  CompletedWorkCycle,
} from '../../types';

const createCycle = (id: string, endDate: string): CompletedWorkCycle => ({
  cards: [],
  completedColumnId: 'done',
  completedColumnTitle: 'Done',
  endDate,
  id,
  startDate: '2026-06-01T00:00:00.000Z',
});

const createCard = (tagIds: string[]): ArchivedBoardCard => ({
  archivedAt: '2026-06-05T00:00:00.000Z',
  content: '',
  createdAt: '2026-06-01T00:00:00.000Z',
  id: 'card-1',
  priority: 'medium',
  tagIds,
  tagSnapshots: [{ id: 'deleted-tag', name: 'Archived Tag' }],
  title: 'Archived card',
});

test('sorts completed work cycles newest first without mutating input', () => {
  const cycles = [
    createCycle('old', '2026-06-02T00:00:00.000Z'),
    createCycle('new', '2026-06-05T00:00:00.000Z'),
  ];

  expect(sortCompletedWorkCycles(cycles).map((cycle) => cycle.id)).toEqual([
    'new',
    'old',
  ]);
  expect(cycles.map((cycle) => cycle.id)).toEqual(['old', 'new']);
});

test('formats valid history dates and leaves invalid values visible', () => {
  expect(formatHistoryDate('not-a-date')).toBe('not-a-date');
  expect(formatHistoryDate('2026-06-05T00:00:00.000Z')).toMatch(
    /06.*05.*2026|05.*06.*2026/
  );
});

test('resolves visible history tags from live tags and archived snapshots', () => {
  const tags: BoardTag[] = [{ id: 'live-tag', name: 'Live Tag' }];

  expect(
    getVisibleTagNames(createCard(['live-tag', 'deleted-tag']), tags)
  ).toEqual(['Live Tag', 'Archived Tag']);
});
