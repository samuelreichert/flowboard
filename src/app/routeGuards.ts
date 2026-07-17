import {
  getInternalDestination,
  isProtectedAppRoute,
  type ParsedAppRoute,
} from './routes';
import type { AuthState } from './useAuthSession';

export const getLocationDestination = (location: {
  hash: string;
  pathname: string;
  search: string;
}) =>
  getInternalDestination(
    `${location.pathname}${location.search}${location.hash}`
  );

export const shouldRenderAuthGate = ({
  authConfigured,
  route,
  status,
}: {
  authConfigured: boolean;
  route: ParsedAppRoute;
  status: AuthState['status'];
}) =>
  authConfigured &&
  status !== 'signedIn' &&
  (isProtectedAppRoute(route) ||
    route.type === 'auth-callback' ||
    route.type === 'sign-in');
