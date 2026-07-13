import { Button } from '@base-ui/react/button';
import { type FormEvent, useState } from 'react';

import AppDialogs from './app/AppDialogs';
import AppSidebar from './app/AppSidebar';
import AppWorkspace from './app/AppWorkspace';
import { getThemeIconSrc } from './app/appTheme';
import useAppController from './app/useAppController';
import {
  isSupabaseConfigured,
  socialAuthProviders,
  type SocialAuthProvider,
} from './auth/supabase';

import './App.css';

type AuthGateProps = {
  iconSrc?: string;
  message: string | null;
  onMagicLinkRequest: (email: string) => Promise<void>;
  onSocialAuthRequest: (provider: SocialAuthProvider) => Promise<void>;
  status: 'loading' | 'signedOut' | 'static' | 'signedIn';
};

export const AuthGate = ({
  iconSrc = '/icon-light.svg',
  message,
  onMagicLinkRequest,
  onSocialAuthRequest,
  status,
}: AuthGateProps) => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittingProvider, setSubmittingProvider] = useState<
    SocialAuthProvider['id'] | null
  >(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await onMagicLinkRequest(email);
    } finally {
      setSubmitting(false);
    }
  };

  const startSocialAuth = async (provider: SocialAuthProvider) => {
    setSubmittingProvider(provider.id);

    try {
      await onSocialAuthRequest(provider);
    } finally {
      setSubmittingProvider(null);
    }
  };

  return (
    <main className="app app--auth">
      <section className="auth-panel" aria-label="Sign in to Flowboard">
        <div className="auth-panel__brand">
          <img
            alt=""
            aria-hidden="true"
            className="auth-panel__brand-icon"
            src={iconSrc}
          />
          <div>
            <p className="app__eyebrow">Flowboard</p>
            <h1 className="app__title">Sign in</h1>
          </div>
        </div>
        {status === 'loading' ? (
          <p className="auth-panel__message">Checking your session...</p>
        ) : (
          <div className="auth-panel__content">
            <p className="auth-panel__description">
              Continue with your account. If you are new, Flowboard will create
              one for you.
            </p>
            <div
              aria-label="Social sign-in options"
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
                      ? 'Opening...'
                      : `Continue with ${provider.label}`}
                  </Button>
                  {!provider.enabled && provider.disabledReason ? (
                    <p className="auth-panel__provider-note">
                      {provider.disabledReason}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="auth-panel__divider" role="separator">
              <span>or</span>
            </div>
            <form className="auth-panel__form" onSubmit={submit}>
              <label className="auth-panel__label" htmlFor="auth-email">
                Email
              </label>
              <input
                className="auth-panel__input"
                id="auth-email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={email}
              />
              <Button
                className="button button--primary"
                disabled={submitting}
                type="submit"
              >
                {submitting ? 'Sending...' : 'Send magic link'}
              </Button>
            </form>
          </div>
        )}
        {message && <p className="auth-panel__message">{message}</p>}
      </section>
    </main>
  );
};

const App = () => {
  const controller = useAppController();

  if (isSupabaseConfigured && controller.authState.status !== 'signedIn') {
    return (
      <AuthGate
        message={controller.authState.message}
        iconSrc={getThemeIconSrc(controller.resolvedTheme)}
        onMagicLinkRequest={controller.requestMagicLink}
        onSocialAuthRequest={controller.requestSocialAuth}
        status={controller.authState.status}
      />
    );
  }

  return (
    <main
      className={`app ${controller.sidebarExpanded ? 'app--sidebar-expanded' : 'app--sidebar-collapsed'} ${controller.mobileSidebarOpen ? 'app--mobile-sidebar-open' : ''}`}
      data-theme={controller.resolvedTheme}
      data-theme-preference={controller.themePreference}
    >
      <button
        aria-label="Close navigation"
        className="app__mobile-backdrop"
        onClick={controller.closeMobileSidebar}
        type="button"
      />
      <AppSidebar
        authEmail={
          controller.authState.status === 'signedIn'
            ? (controller.authState.session.user.email ?? 'Signed in')
            : null
        }
        currentView={controller.currentView}
        onBoardClick={controller.openBoard}
        onBoardSettingsClick={controller.openBoardSettings}
        onCloseMobileSidebar={controller.closeMobileSidebar}
        onHistoryClick={controller.openHistory}
        onManageTagsClick={controller.openTagManager}
        onSignOut={controller.signOut}
        onThemePreferenceChange={controller.chooseThemePreference}
        onToggleSidebar={controller.toggleSidebar}
        resolvedTheme={controller.resolvedTheme}
        sidebarExpanded={controller.sidebarExpanded}
        themePreference={controller.themePreference}
      />
      {controller.persistenceMessage && (
        <div className="app__persistence-status" role="status">
          {controller.persistenceMessage}
        </div>
      )}
      <AppWorkspace
        canCompleteWork={controller.canCompleteWork}
        completeWorkDisabledReason={controller.completeWorkDisabledReason}
        completedWorkCycles={controller.completedWorkCycles}
        completionPulse={controller.completionPulse}
        currentView={controller.currentView}
        onBoardStateChange={controller.syncBoardState}
        onColumnCountChange={controller.updateColumnCount}
        onCompleteWorkClick={controller.openCompleteWorkConfirmation}
        onOpenMobileSidebar={controller.openMobileSidebar}
        onTagsChange={controller.updateTags}
        storageVersion={controller.storageVersion}
        tags={controller.tags}
      />
      <AppDialogs
        activeWorkCycle={controller.activeWorkCycle}
        boardSettingsOpen={controller.boardSettingsOpen}
        clearBoardOpen={controller.clearBoardOpen}
        columnCount={controller.columnCount}
        columns={controller.columns}
        completeWorkOpen={controller.completeWorkOpen}
        completedCardCount={controller.completedCardCount}
        completedColumn={controller.completedColumn}
        onBoardSettingsOpenChange={controller.setBoardSettingsOpen}
        onClearBoard={controller.clearBoard}
        onClearBoardOpenChange={controller.setClearBoardOpen}
        onClearBoardRequest={controller.openClearBoardConfirmation}
        onCompleteWork={controller.confirmCompleteWork}
        onCompleteWorkOpenChange={controller.setCompleteWorkOpen}
        onCompletedColumnChange={controller.chooseCompletedColumn}
        onDeleteTag={controller.deleteTag}
        onTagManagerOpenChange={controller.setTagManagerOpen}
        onTagsChange={controller.updateTags}
        tagManagerOpen={controller.tagManagerOpen}
        tags={controller.tags}
      />
    </main>
  );
};

export default App;
