import type { IncomingMessage } from 'node:http';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type AuthenticatedUser = {
  avatarUrl: string | null;
  displayName: string | null;
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

const readMetadataString = (
  metadata: Record<string, unknown>,
  keys: string[]
) => {
  for (const key of keys) {
    const value = metadata[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return null;
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
        avatarUrl: readMetadataString(data.user.user_metadata, [
          'avatar_url',
          'picture',
        ]),
        displayName: readMetadataString(data.user.user_metadata, [
          'full_name',
          'name',
          'display_name',
        ]),
        email: data.user.email ?? null,
        id: data.user.id,
      };
    },
  };
};
