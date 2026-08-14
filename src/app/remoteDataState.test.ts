import { describe, expect, test } from 'vitest';

import { deriveRemoteDataState } from './remoteDataState';

describe('deriveRemoteDataState', () => {
  test('treats absent unresolved data as loading', () => {
    expect(
      deriveRemoteDataState({
        data: undefined,
        isEmpty: (items: string[]) => items.length === 0,
        isError: false,
      })
    ).toBe('loading');
  });

  test('treats absent failed data as an initial error', () => {
    expect(
      deriveRemoteDataState({
        data: undefined,
        isEmpty: (items: string[]) => items.length === 0,
        isError: true,
      })
    ).toBe('error');
  });

  test('distinguishes resolved empty data from unresolved data', () => {
    expect(
      deriveRemoteDataState({
        data: [],
        isEmpty: (items) => items.length === 0,
        isError: false,
      })
    ).toBe('empty');
  });

  test('preserves resolved content when a secondary request fails', () => {
    expect(
      deriveRemoteDataState({
        data: ['cached'],
        isEmpty: (items) => items.length === 0,
        isError: true,
      })
    ).toBe('content');
  });

  test('preserves a resolved empty response when a secondary request fails', () => {
    expect(
      deriveRemoteDataState({
        data: [],
        isEmpty: (items) => items.length === 0,
        isError: true,
      })
    ).toBe('empty');
  });
});
