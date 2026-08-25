import { useEffect, useRef, useState } from 'react';

import {
  getOAuthRedirectTo,
  isSupabaseConfigured,
  signInWithSocialProvider,
  supabase,
  type SocialAuthProvider,
  type SupabaseSession,
} from '../auth/supabase';
import type { Messages } from '../localization';
import { clearFlowboardQueryCache } from './queryClient';
import { APP_ROUTES } from './routes';

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

const hasCallbackErrorParameters = () => {
  if (
    typeof window === 'undefined' ||
    window.location.pathname !== APP_ROUTES.authCallback
  ) {
    return false;
  }

  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const errorKeys = ['error', 'error_code', 'error_description'];

  return errorKeys.some((key) => search.has(key) || hash.has(key));
};

const hasUnconsumedCallbackCode = () => {
  if (
    typeof window === 'undefined' ||
    window.location.pathname !== APP_ROUTES.authCallback
  ) {
    return false;
  }

  return new URLSearchParams(window.location.search).has('code');
};

const signOut = () => {
  clearFlowboardQueryCache();

  if (!supabase) {
    return;
  }

  void supabase.auth.signOut();
};

const useAuthSession = (messages: AuthMessages) => {
  const [initialCallbackFailure] = useState(hasCallbackErrorParameters);
  const callbackFailureRef = useRef(initialCallbackFailure);
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

    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) {
          return;
        }

        const callbackFailed =
          callbackFailureRef.current ||
          hasCallbackErrorParameters() ||
          hasUnconsumedCallbackCode();
        callbackFailureRef.current = callbackFailed;

        if (error) {
          setAuthState({
            message: messages.callbackFailure,
            session: null,
            status: 'signedOut',
          });
          return;
        }

        setAuthState(
          data.session
            ? {
                message: callbackFailed ? messages.callbackFailure : null,
                session: data.session,
                status: 'signedIn',
              }
            : {
                message: callbackFailed ? messages.callbackFailure : null,
                session: null,
                status: 'signedOut',
              }
        );
      })
      .catch(() => {
        if (active) {
          callbackFailureRef.current = true;
          setAuthState({
            message: messages.callbackFailure,
            session: null,
            status: 'signedOut',
          });
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (window.location.pathname !== APP_ROUTES.authCallback) {
        callbackFailureRef.current = false;
      }

      setAuthState(
        session
          ? {
              message: callbackFailureRef.current
                ? messages.callbackFailure
                : null,
              session,
              status: 'signedIn',
            }
          : {
              message: callbackFailureRef.current
                ? messages.callbackFailure
                : null,
              session: null,
              status: 'signedOut',
            }
      );
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [messages.callbackFailure]);

  const requestMagicLink = async (email: string, nextDestination?: string) => {
    if (!supabase) {
      return;
    }

    callbackFailureRef.current = false;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getOAuthRedirectTo(nextDestination),
      },
    });

    setAuthState({
      message: error ? messages.magicLinkFailure : messages.magicLinkSuccess,
      session: null,
      status: 'signedOut',
    });
  };

  const requestSocialAuth = async (
    provider: SocialAuthProvider,
    nextDestination?: string
  ) => {
    callbackFailureRef.current = false;
    const { error } = await signInWithSocialProvider(provider, nextDestination);

    setAuthState({
      message: error
        ? messages.socialFailure(provider.label)
        : messages.socialOpening(provider.label),
      session: null,
      status: 'signedOut',
    });
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
