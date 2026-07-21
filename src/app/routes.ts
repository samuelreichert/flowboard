export const APP_ROUTES = {
  authCallback: '/auth/callback',
  board: '/board',
  history: '/history',
  root: '/',
  settings: '/settings',
  signIn: '/sign-in',
  tags: '/tags',
} as const;

export const createActiveCardPath = (cardId: string) =>
  `/board/cards/${encodeURIComponent(cardId)}`;

export const createArchivedCardPath = (cycleId: string, cardId: string) =>
  `/history/cycles/${encodeURIComponent(cycleId)}/cards/${encodeURIComponent(cardId)}`;

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
