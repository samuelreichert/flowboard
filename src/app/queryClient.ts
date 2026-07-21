import { QueryClient } from '@tanstack/react-query';

export const FLOWBOARD_QUERY_CACHE_MAX_AGE = 24 * 60 * 60 * 1000;
const LEGACY_FLOWBOARD_QUERY_CACHE_KEY = 'flowboard:query-cache:v1';

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

export const clearFlowboardQueryCache = () => {
  flowboardQueryClient.clear();
};

export const removeLegacyFlowboardQueryCache = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(LEGACY_FLOWBOARD_QUERY_CACHE_KEY);
  }
};
