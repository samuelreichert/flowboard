import { QueryClient } from '@tanstack/react-query';
import type { Query } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

import { isPersistableFlowboardQueryKey } from './queryKeys';

export const FLOWBOARD_QUERY_CACHE_KEY = 'flowboard:query-cache:v1';
export const FLOWBOARD_QUERY_CACHE_MAX_AGE = 24 * 60 * 60 * 1000;

export const createFlowboardQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: FLOWBOARD_QUERY_CACHE_MAX_AGE,
        refetchOnWindowFocus: false,
        staleTime: 30_000,
      },
    },
  });

export const flowboardQueryClient = createFlowboardQueryClient();

export const flowboardQueryPersister =
  typeof window === 'undefined'
    ? undefined
    : createSyncStoragePersister({
        key: FLOWBOARD_QUERY_CACHE_KEY,
        storage: window.localStorage,
      });

export const shouldPersistFlowboardQuery = (query: Query) =>
  query.state.status === 'success' &&
  isPersistableFlowboardQueryKey(query.queryKey);

export const clearFlowboardQueryCache = () => {
  flowboardQueryClient.clear();

  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(FLOWBOARD_QUERY_CACHE_KEY);
  }
};
