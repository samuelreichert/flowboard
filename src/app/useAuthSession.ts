import { useEffect, useState } from 'react';

import {
  getOAuthRedirectTo,
  isSupabaseConfigured,
  signInWithSocialProvider,
  supabase,
  type SocialAuthProvider,
  type SupabaseSession,
} from '../auth/supabase';
import type { Messages } from '../localization';

type AuthState =
  | {
      message: string | null;
      session: null;
      status: 'loading' | 'signedOut' | 'static';
    }
  | {
      message: string | null;
      session: SupabaseSession;
      status: 'signedIn';
    };

type AuthMessages = Messages['app']['auth'];

const useAuthSession = (messages: AuthMessages) => {
  const [authState, setAuthState] = useState<AuthState>(() =>
    isSupabaseConfigured
      ? { message: null, session: null, status: 'loading' }
      : { message: null, session: null, status: 'static' }
  );

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) {
        return;
      }

      setAuthState(
        data.session
          ? { message: null, session: data.session, status: 'signedIn' }
          : { message: null, session: null, status: 'signedOut' }
      );
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState(
        session
          ? { message: null, session, status: 'signedIn' }
          : { message: null, session: null, status: 'signedOut' }
      );
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const requestMagicLink = async (email: string, nextDestination?: string) => {
    if (!supabase) {
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getOAuthRedirectTo(nextDestination),
      },
    });

    setAuthState({
      message: error
        ? messages.magicLinkFailure
        : messages.magicLinkSuccess,
      session: null,
      status: 'signedOut',
    });
  };

  const requestSocialAuth = async (
    provider: SocialAuthProvider,
    nextDestination?: string
  ) => {
    const { error } = await signInWithSocialProvider(provider, nextDestination);

    setAuthState({
      message: error
        ? messages.socialFailure(provider.label)
        : messages.socialOpening(provider.label),
      session: null,
      status: 'signedOut',
    });
  };

  const signOut = () => {
    if (!supabase) {
      return;
    }

    void supabase.auth.signOut();
  };

  return {
    authState,
    requestMagicLink,
    requestSocialAuth,
    signOut,
  };
};

export default useAuthSession;
export type { AuthState };
