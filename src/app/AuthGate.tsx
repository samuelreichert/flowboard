import { Button } from '@base-ui/react/button';
import { Field } from '@base-ui/react/field';
import { type FormEvent, useState } from 'react';

import { useLocalization } from '../LocalizationProvider';
import { socialAuthProviders, type SocialAuthProvider } from '../auth/supabase';
import type { AuthState } from './useAuthSession';

import './AuthGate.css';

type AuthGateProps = {
  iconSrc?: string;
  message: string | null;
  nextDestination?: string;
  onMagicLinkRequest: (
    email: string,
    nextDestination?: string
  ) => Promise<void>;
  onSocialAuthRequest: (
    provider: SocialAuthProvider,
    nextDestination?: string
  ) => Promise<void>;
  status: AuthState['status'];
};

export const AuthGate = ({
  iconSrc = '/icon-light.svg',
  message,
  nextDestination,
  onMagicLinkRequest,
  onSocialAuthRequest,
  status,
}: AuthGateProps) => {
  const { messages } = useLocalization();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittingProvider, setSubmittingProvider] = useState<
    SocialAuthProvider['id'] | null
  >(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await onMagicLinkRequest(email, nextDestination);
    } finally {
      setSubmitting(false);
    }
  };

  const startSocialAuth = async (provider: SocialAuthProvider) => {
    setSubmittingProvider(provider.id);

    try {
      await onSocialAuthRequest(provider, nextDestination);
    } finally {
      setSubmittingProvider(null);
    }
  };

  return (
    <main className="app app--auth">
      <section className="auth-panel" aria-label={messages.app.auth.ariaLabel}>
        <div className="auth-panel__brand">
          <img
            alt=""
            aria-hidden="true"
            className="auth-panel__brand-icon"
            src={iconSrc}
          />
          <div>
            <p className="app__eyebrow">Flowboard</p>
            <h1 className="app__title">{messages.app.auth.signIn}</h1>
          </div>
        </div>
        {status === 'loading' ? (
          <p className="auth-panel__message">
            {messages.app.auth.checkingSession}
          </p>
        ) : (
          <div className="auth-panel__content">
            <p className="auth-panel__description">
              {messages.app.auth.description}
            </p>
            <div
              aria-label={messages.app.auth.socialOptionsLabel}
              className="auth-panel__providers"
            >
              {socialAuthProviders.map((provider) => (
                <div className="auth-panel__provider" key={provider.id}>
                  <Button
                    className="button auth-panel__provider-button"
                    disabled={!provider.enabled || submittingProvider !== null}
                    onClick={() => void startSocialAuth(provider)}
                    type="button"
                  >
                    {submittingProvider === provider.id
                      ? messages.app.auth.opening
                      : messages.app.auth.continueWith(provider.label)}
                  </Button>
                  {!provider.enabled && provider.disabledReason ? (
                    <p className="auth-panel__provider-note">
                      {provider.id === 'apple'
                        ? messages.app.auth.appleDisabledReason
                        : provider.disabledReason}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="auth-panel__divider" role="separator">
              <span>{messages.app.auth.divider}</span>
            </div>
            <form className="auth-panel__form" onSubmit={submit}>
              <Field.Root>
                <Field.Label className="auth-panel__label">
                  {messages.app.auth.email}
                </Field.Label>
                <Field.Control
                  className="auth-panel__input"
                  id="auth-email"
                  onValueChange={setEmail}
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={email}
                />
              </Field.Root>
              <Button
                className="button button--primary"
                disabled={submitting}
                type="submit"
              >
                {submitting
                  ? messages.app.auth.sending
                  : messages.app.auth.sendMagicLink}
              </Button>
            </form>
          </div>
        )}
        {message && <p className="auth-panel__message">{message}</p>}
      </section>
    </main>
  );
};

export default AuthGate;
