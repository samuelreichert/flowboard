import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, type ReactNode } from 'react';

import {
  flowboardQueryClient,
  removeLegacyFlowboardQueryCache,
} from './queryClient';

type FlowboardQueryProviderProps = {
  children: ReactNode;
};

const FlowboardQueryProvider = ({ children }: FlowboardQueryProviderProps) => {
  useEffect(() => {
    removeLegacyFlowboardQueryCache();
  }, []);

  return (
    <QueryClientProvider client={flowboardQueryClient}>
      {children}
    </QueryClientProvider>
  );
};

export default FlowboardQueryProvider;
