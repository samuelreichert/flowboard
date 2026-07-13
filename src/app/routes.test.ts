import { describe, expect, test } from 'vitest';

import {
  APP_ROUTES,
  createActiveCardPath,
  createArchivedCardPath,
  createAuthCallbackPath,
  createSignInPath,
  getInternalDestination,
  getNextSearchDestination,
  isProtectedAppRoute,
  parseAppRoute,
} from './routes';

describe('app routes', () => {
  test('builds canonical card paths', () => {
    expect(createActiveCardPath('card 1')).toBe('/board/cards/card%201');
    expect(createArchivedCardPath('cycle 1', 'card/1')).toBe(
      '/history/cycles/cycle%201/cards/card%2F1'
    );
  });

  test('parses canonical routes and decoded parameters', () => {
    expect(parseAppRoute(APP_ROUTES.board)).toEqual({ type: 'board' });
    expect(parseAppRoute('/board/cards/card%201')).toEqual({
      cardId: 'card 1',
      type: 'active-card',
    });
    expect(parseAppRoute('/history/cycles/cycle%201/cards/card%2F1')).toEqual({
      cardId: 'card/1',
      cycleId: 'cycle 1',
      type: 'archived-card',
    });
    expect(parseAppRoute('/missing')).toEqual({ type: 'not-found' });
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
    expect(createSignInPath('/history')).toBe('/sign-in?next=%2Fhistory');
    expect(getNextSearchDestination('?next=%2Fsettings')).toBe('/settings');
    expect(getNextSearchDestination('?next=https%3A%2F%2Fevil.example')).toBe(
      '/board'
    );
  });

  test('treats unknown app paths as protected until the user is signed in', () => {
    expect(isProtectedAppRoute({ type: 'not-found' })).toBe(true);
    expect(isProtectedAppRoute({ type: 'sign-in' })).toBe(false);
    expect(isProtectedAppRoute({ type: 'auth-callback' })).toBe(false);
  });
});
