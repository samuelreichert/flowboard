import {
  isProtectedAppRoute,
  type ParsedAppRoute,
} from './routes';

export type AuthGateStatus = 'loading' | 'signedOut' | 'static' | 'signedIn';

export const shouldRenderAuthGate = ({
  authConfigured,
  route,
  status,
}: {
  authConfigured: boolean;
  route: ParsedAppRoute;
  status: AuthGateStatus;
}) =>
  authConfigured &&
  status !== 'signedIn' &&
  (isProtectedAppRoute(route) ||
    route.type === 'auth-callback' ||
    route.type === 'sign-in');
