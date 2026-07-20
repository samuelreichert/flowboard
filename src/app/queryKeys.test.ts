import { describe, expect, test } from 'vitest';

import { isPersistableFlowboardQueryKey, queryKeys } from './queryKeys';

describe('queryKeys', () => {
  test('defines stable keys for persisted read queries', () => {
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

  test('allows only supported resource query keys to persist', () => {
    expect(isPersistableFlowboardQueryKey(['profile'])).toBe(true);
    expect(isPersistableFlowboardQueryKey(['board', 'bootstrap'])).toBe(true);
    expect(isPersistableFlowboardQueryKey(['board', 'cards', 'card-1'])).toBe(
      true
    );
    expect(
      isPersistableFlowboardQueryKey(['board', 'work-cycles', 'history', 20])
    ).toBe(true);
    expect(
      isPersistableFlowboardQueryKey([
        'board',
        'work-cycles',
        'history',
        20,
        'cursor-1',
      ])
    ).toBe(true);
    expect(
      isPersistableFlowboardQueryKey([
        'board',
        'work-cycles',
        'cycle-1',
        'cards',
        'card-1',
      ])
    ).toBe(true);
    expect(isPersistableFlowboardQueryKey(['board', 'history'])).toBe(false);
    expect(isPersistableFlowboardQueryKey(['unknown'])).toBe(false);
  });
});
