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
  });

  test('allows only profile, bootstrap, and card detail keys to persist', () => {
    expect(isPersistableFlowboardQueryKey(['profile'])).toBe(true);
    expect(isPersistableFlowboardQueryKey(['board', 'bootstrap'])).toBe(true);
    expect(isPersistableFlowboardQueryKey(['board', 'cards', 'card-1'])).toBe(
      true
    );
    expect(isPersistableFlowboardQueryKey(['board', 'history'])).toBe(false);
    expect(isPersistableFlowboardQueryKey(['unknown'])).toBe(false);
  });
});
