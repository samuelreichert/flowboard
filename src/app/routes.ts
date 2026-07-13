export const APP_ROUTES = {
  authCallback: '/auth/callback',
  board: '/board',
  history: '/history',
  root: '/',
  settings: '/settings',
  signIn: '/sign-in',
  tags: '/tags',
} as const;

export type ParsedAppRoute =
  | { type: 'active-card'; cardId: string }
  | { type: 'archived-card'; cardId: string; cycleId: string }
  | { type: 'auth-callback' }
  | { type: 'board' }
  | { type: 'history' }
  | { type: 'not-found' }
  | { type: 'root' }
  | { type: 'settings' }
  | { type: 'sign-in' }
  | { type: 'tags' };

export type AppRouteType = ParsedAppRoute['type'];

const ACTIVE_CARD_PATTERN = /^\/board\/cards\/([^/]+)$/;
const ARCHIVED_CARD_PATTERN = /^\/history\/cycles\/([^/]+)\/cards\/([^/]+)$/;

const decodeRouteSegment = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export const createActiveCardPath = (cardId: string) =>
  `/board/cards/${encodeURIComponent(cardId)}`;

export const createArchivedCardPath = (cycleId: string, cardId: string) =>
  `/history/cycles/${encodeURIComponent(cycleId)}/cards/${encodeURIComponent(cardId)}`;

export const parseAppRoute = (pathname: string): ParsedAppRoute => {
  if (pathname === APP_ROUTES.root) {
    return { type: 'root' };
  }

  if (pathname === APP_ROUTES.board) {
    return { type: 'board' };
  }

  if (pathname === APP_ROUTES.history) {
    return { type: 'history' };
  }

  if (pathname === APP_ROUTES.tags) {
    return { type: 'tags' };
  }

  if (pathname === APP_ROUTES.settings) {
    return { type: 'settings' };
  }

  if (pathname === APP_ROUTES.signIn) {
    return { type: 'sign-in' };
  }

  if (pathname === APP_ROUTES.authCallback) {
    return { type: 'auth-callback' };
  }

  const activeCardMatch = pathname.match(ACTIVE_CARD_PATTERN);

  if (activeCardMatch) {
    return {
      cardId: decodeRouteSegment(activeCardMatch[1]),
      type: 'active-card',
    };
  }

  const archivedCardMatch = pathname.match(ARCHIVED_CARD_PATTERN);

  if (archivedCardMatch) {
    return {
      cardId: decodeRouteSegment(archivedCardMatch[2]),
      cycleId: decodeRouteSegment(archivedCardMatch[1]),
      type: 'archived-card',
    };
  }

  return { type: 'not-found' };
};

export const getViewForRoute = (route: ParsedAppRoute) =>
  route.type === 'archived-card' || route.type === 'history'
    ? 'history'
    : 'board';

export const isProtectedAppRoute = (route: ParsedAppRoute) =>
  !['auth-callback', 'not-found', 'root', 'sign-in'].includes(route.type);

export const isInternalDestination = (value: string) =>
  value.startsWith('/') && !value.startsWith('//') && !value.includes('\\');

export const getInternalDestination = (
  value: string | null | undefined,
  fallback: string = APP_ROUTES.board
) => {
  if (!value) {
    return fallback;
  }

  if (value.includes('\\') || value.startsWith('//')) {
    return fallback;
  }

  const origin =
    typeof window === 'undefined' ? 'http://localhost' : window.location.origin;

  try {
    const url = new URL(value, origin);

    if (url.origin !== origin || !isInternalDestination(url.pathname)) {
      return fallback;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
};

export const getNextSearchDestination = (
  search: string,
  fallback = APP_ROUTES.board
) => getInternalDestination(new URLSearchParams(search).get('next'), fallback);

export const createAuthCallbackPath = (nextDestination: string) => {
  const next = getInternalDestination(nextDestination);
  const params = new URLSearchParams({ next });

  return `${APP_ROUTES.authCallback}?${params.toString()}`;
};

export const createSignInPath = (nextDestination?: string | null) => {
  const next = getInternalDestination(nextDestination, '');

  if (!next) {
    return APP_ROUTES.signIn;
  }

  const params = new URLSearchParams({ next });

  return `${APP_ROUTES.signIn}?${params.toString()}`;
};
