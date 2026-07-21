import { describe, expect, test } from 'vitest';

import {
  APP_ROUTES,
  createActiveCardPath,
  createArchivedCardPath,
  createAuthCallbackPath,
  getInternalDestination,
  getNextSearchDestination,
} from './routes';

describe('app routes', () => {
  test('builds canonical card paths', () => {
    expect(createActiveCardPath('card 1')).toBe('/board/cards/card%201');
    expect(createArchivedCardPath('cycle 1', 'card/1')).toBe(
      '/history/cycles/cycle%201/cards/card%2F1'
    );
  });

  test('keeps only safe internal destinations', () => {
    expect(getInternalDestination('/history?layout=list#top')).toBe(
      '/history?layout=list#top'
    );
    expect(getInternalDestination('https://evil.example/board')).toBe('/board');
    expect(getInternalDestination('//evil.example/board')).toBe('/board');
    expect(getInternalDestination('/bad\\path')).toBe('/board');
  });

  test('builds auth routes with safe next destinations', () => {
    expect(createAuthCallbackPath('/board/cards/card-1')).toBe(
      '/auth/callback?next=%2Fboard%2Fcards%2Fcard-1'
    );
    expect(getNextSearchDestination('?next=%2Fsettings')).toBe('/settings');
    expect(getNextSearchDestination('?next=https%3A%2F%2Fevil.example')).toBe(
      '/board'
    );
  });
});
