import { beforeEach, describe, expect, test } from 'vitest';

import {
  flowboardQueryClient,
  removeLegacyFlowboardQueryCache,
  shouldClearFlowboardQueryCache,
} from './queryClient';

describe('query client storage', () => {
  beforeEach(() => {
    flowboardQueryClient.clear();
    localStorage.clear();
  });

  test('removes the legacy persisted board cache without touching preferences', () => {
    localStorage.setItem('flowboard:query-cache:v1', 'legacy board data');
    localStorage.setItem('flowboardThemePreference', 'dark');

    removeLegacyFlowboardQueryCache();

    expect(localStorage.getItem('flowboard:query-cache:v1')).toBeNull();
    expect(localStorage.getItem('flowboardThemePreference')).toBe('dark');
  });

  test('keeps the first authenticated bootstrap query intact', () => {
    expect(shouldClearFlowboardQueryCache(null, 'user-1')).toBe(false);
  });

  test('clears cached data when the authenticated user changes or signs out', () => {
    expect(shouldClearFlowboardQueryCache('user-1', 'user-2')).toBe(true);
    expect(shouldClearFlowboardQueryCache('user-1', null)).toBe(true);
  });
});
