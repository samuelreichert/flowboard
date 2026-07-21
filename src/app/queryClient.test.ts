import { beforeEach, describe, expect, test } from 'vitest';

import {
  flowboardQueryClient,
  removeLegacyFlowboardQueryCache,
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
});
