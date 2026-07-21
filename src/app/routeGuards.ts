import { getInternalDestination } from './routes';

export const getLocationDestination = (location: {
  hash: string;
  pathname: string;
  search: string;
}) =>
  getInternalDestination(
    `${location.pathname}${location.search}${location.hash}`
  );
