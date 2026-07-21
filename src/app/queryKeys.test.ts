import { describe, expect, test } from 'vitest';

import { queryKeys } from './queryKeys';

describe('queryKeys', () => {
  test('defines stable keys for resource queries', () => {
    expect(queryKeys.profile).toEqual(['profile']);
    expect(queryKeys.board.bootstrap).toEqual(['board', 'bootstrap']);
    expect(queryKeys.board.card('card-1')).toEqual([
      'board',
      'cards',
      'card-1',
    ]);
    expect(queryKeys.board.history(20)).toEqual([
      'board',
      'work-cycles',
      'history',
      20,
    ]);
    expect(queryKeys.board.historyPage(20, 'cursor-1')).toEqual([
      'board',
      'work-cycles',
      'history',
      20,
      'cursor-1',
    ]);
    expect(queryKeys.board.archivedCard('cycle-1', 'card-1')).toEqual([
      'board',
      'work-cycles',
      'cycle-1',
      'cards',
      'card-1',
    ]);
  });
});
