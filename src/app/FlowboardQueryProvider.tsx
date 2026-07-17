import { QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import type { ReactNode } from 'react';

import {
  FLOWBOARD_QUERY_CACHE_MAX_AGE,
  flowboardQueryClient,
  flowboardQueryPersister,
  shouldPersistFlowboardQuery,
} from './queryClient';

type FlowboardQueryProviderProps = {
  children: ReactNode;
};

const persistOptions = flowboardQueryPersister
  ? {
      buster: 'flowboard-query-cache-v1',
      dehydrateOptions: {
        shouldDehydrateQuery: shouldPersistFlowboardQuery,
      },
      maxAge: FLOWBOARD_QUERY_CACHE_MAX_AGE,
      persister: flowboardQueryPersister,
      queryClient: flowboardQueryClient,
    }
  : null;

const FlowboardQueryProvider = ({ children }: FlowboardQueryProviderProps) =>
  persistOptions ? (
    <PersistQueryClientProvider
      client={flowboardQueryClient}
      persistOptions={persistOptions}
    >
      {children}
    </PersistQueryClientProvider>
  ) : (
    <QueryClientProvider client={flowboardQueryClient}>
      {children}
    </QueryClientProvider>
  );

export default FlowboardQueryProvider;
