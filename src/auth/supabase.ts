import {
  createClient,
  type Provider,
  type Session,
} from '@supabase/supabase-js';

import { createAuthCallbackPath, getInternalDestination } from '../app/routes';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
const isGoogleOAuthEnabled =
  import.meta.env.VITE_SUPABASE_GOOGLE_OAUTH_ENABLED !== 'false';
const isAppleOAuthEnabled =
  import.meta.env.VITE_SUPABASE_APPLE_OAUTH_ENABLED === 'true';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabasePublishableKey
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null;

export type SupabaseSession = Session;

export type SocialAuthProvider = {
  disabledReason?: string;
  enabled: boolean;
  id: Extract<Provider, 'apple' | 'google'>;
  label: string;
};

export const socialAuthProviders: SocialAuthProvider[] = [
  {
    enabled: isGoogleOAuthEnabled,
    id: 'google',
    label: 'Google',
  },
  {
    disabledReason:
      'Apple sign-in needs Apple Developer and production redirect setup first.',
    enabled: isAppleOAuthEnabled,
    id: 'apple',
    label: 'Apple',
  },
];

export const getOAuthRedirectTo = (nextDestination = '/') => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return `${window.location.origin}${createAuthCallbackPath(
    getInternalDestination(nextDestination)
  )}`;
};

export const signInWithSocialProvider = async (
  provider: SocialAuthProvider,
  nextDestination?: string
) => {
  if (!supabase || !provider.enabled) {
    return {
      error: new Error('OAuth provider is not available.'),
    };
  }

  return supabase.auth.signInWithOAuth({
    options: {
      redirectTo: getOAuthRedirectTo(nextDestination),
    },
    provider: provider.id,
  });
};
