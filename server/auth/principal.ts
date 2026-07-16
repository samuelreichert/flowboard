import type { IncomingMessage } from 'node:http';

import type { ServerConfig } from '../config.js';
import type { AuthenticatedUser, AuthVerifier } from './supabaseAuth.js';

export type RequestPrincipal = AuthenticatedUser & {
  source: 'local-dev' | 'supabase';
};

export type PrincipalResolver = {
  resolveRequest: (
    request: IncomingMessage
  ) => Promise<RequestPrincipal | null>;
};

export const LOCAL_DEV_PRINCIPAL: RequestPrincipal = {
  avatarUrl: null,
  displayName: 'Local Flowboard',
  email: null,
  id: 'local-flowboard-user',
  source: 'local-dev',
};

export const createPrincipalResolver = (
  config: Pick<ServerConfig, 'localDevAuthEnabled'>,
  authVerifier: AuthVerifier
): PrincipalResolver => ({
  resolveRequest: async (request) => {
    const user = await authVerifier.verifyRequest(request);

    if (user) {
      return {
        ...user,
        source: 'supabase',
      };
    }

    return config.localDevAuthEnabled ? LOCAL_DEV_PRINCIPAL : null;
  },
});
