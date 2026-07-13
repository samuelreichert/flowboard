import type { IncomingMessage } from 'node:http';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type AuthenticatedUser = {
  email: string | null;
  id: string;
};

export type AuthVerifier = {
  verifyRequest: (request: IncomingMessage) => Promise<AuthenticatedUser | null>;
};

export type SupabaseAuthConfig = {
  supabasePublishableKey: string | null;
  supabaseUrl: string | null;
};

const extractBearerToken = (request: IncomingMessage) => {
  const header = request.headers.authorization;

  if (!header) {
    return null;
  }

  const [scheme, token] = header.split(' ');

  return scheme?.toLowerCase() === 'bearer' && token ? token : null;
};

export const createSupabaseAuthVerifier = (
  config: SupabaseAuthConfig,
  client?: SupabaseClient
): AuthVerifier => {
  const supabase =
    client ??
    (config.supabaseUrl && config.supabasePublishableKey
      ? createClient(config.supabaseUrl, config.supabasePublishableKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        })
      : null);

  return {
    verifyRequest: async (request) => {
      const token = extractBearerToken(request);

      if (!token || !supabase) {
        return null;
      }

      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data.user) {
        return null;
      }

      return {
        email: data.user.email ?? null,
        id: data.user.id,
      };
    },
  };
};
