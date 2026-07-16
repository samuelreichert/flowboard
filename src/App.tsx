import { Button } from '@base-ui/react/button';
import { History, Home } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router';

import { LocalizationProvider, useLocalization } from './LocalizationProvider';
import AppDialogs from './app/AppDialogs';
import AppSidebar from './app/AppSidebar';
import AppWorkspace from './app/AppWorkspace';
import { shouldRenderAuthGate, type AuthGateStatus } from './app/authGate';
import { getThemeIconSrc } from './app/appTheme';
import {
  APP_ROUTES,
  getInternalDestination,
  getNextSearchDestination,
  getViewForRoute,
  parseAppRoute,
} from './app/routes';
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
  nextDestination?: string;
  onMagicLinkRequest: (
    email: string,
    nextDestination?: string
  ) => Promise<void>;
  onSocialAuthRequest: (
    provider: SocialAuthProvider,
    nextDestination?: string
  ) => Promise<void>;
  status: AuthGateStatus;
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
              <label className="auth-panel__label" htmlFor="auth-email">
                {messages.app.auth.email}
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

type AuthRedirectProps = {
  destination: string;
};

const AuthRedirect = ({ destination }: AuthRedirectProps) => {
  const navigate = useNavigate();
  const { messages } = useLocalization();

  useEffect(() => {
    navigate(destination, { replace: true });
  }, [destination, navigate]);

  return (
    <main className="app app--auth">
      <section
        className="auth-panel"
        aria-label={messages.app.auth.openingFlowboardLabel}
      >
        <p className="auth-panel__message">{messages.app.auth.openingBoard}</p>
      </section>
    </main>
  );
};

type NotFoundViewProps = {
  onBoardClick: () => void;
  onHistoryClick: () => void;
  requestedPath: string;
  iconSrc?: string;
};

const NotFoundView = ({
  iconSrc = '/icon-light.svg',
  onBoardClick,
  onHistoryClick,
  requestedPath,
}: NotFoundViewProps) => {
  const { messages } = useLocalization();

  return (
    <main className="app app--not-found">
      <section
        className="not-found-panel"
        aria-label={messages.app.notFound.ariaLabel}
      >
        <div className="not-found-panel__mark" aria-hidden="true">
          <img alt="" className="not-found-panel__brand-icon" src={iconSrc} />
          <span>404</span>
        </div>
        <p className="app__eyebrow">{messages.app.notFound.eyebrow}</p>
        <h1 className="not-found-panel__title">
          {messages.app.notFound.title}
        </h1>
        <p className="not-found-panel__body">{messages.app.notFound.body}</p>
        <code className="not-found-panel__path">{requestedPath}</code>
        <div className="not-found-panel__actions">
          <Button className="button button--primary" onClick={onBoardClick}>
            <Home aria-hidden="true" size={15} />
            {messages.app.notFound.openBoard}
          </Button>
          <Button className="button button--subtle" onClick={onHistoryClick}>
            <History aria-hidden="true" size={15} />
            {messages.app.notFound.viewHistory}
          </Button>
        </div>
      </section>
    </main>
  );
};

type MobileNavigationBackdropProps = {
  onClose: () => void;
};

const MobileNavigationBackdrop = ({
  onClose,
}: MobileNavigationBackdropProps) => {
  const { messages } = useLocalization();

  return (
    <button
      aria-label={messages.app.navigation.closeNavigation}
      className="app__mobile-backdrop"
      onClick={onClose}
      type="button"
    />
  );
};

const getLocationDestination = (location: {
  hash: string;
  pathname: string;
  search: string;
}) =>
  getInternalDestination(
    `${location.pathname}${location.search}${location.hash}`
  );

const RoutedApp = () => {
  const controller = useAppController();
  const location = useLocation();
  const navigate = useNavigate();
  const route = parseAppRoute(location.pathname);
  const currentView = getViewForRoute(route);
  const nextDestination =
    route.type === 'auth-callback' || route.type === 'sign-in'
      ? getNextSearchDestination(location.search)
      : getLocationDestination(location);

  if (route.type === 'root') {
    return <Navigate replace to={APP_ROUTES.board} />;
  }

  if (
    shouldRenderAuthGate({
      authConfigured: isSupabaseConfigured,
      route,
      status: controller.authState.status,
    })
  ) {
    return (
      <LocalizationProvider language={controller.resolvedLanguage}>
        <AuthGate
          message={controller.authState.message}
          iconSrc={getThemeIconSrc(controller.resolvedTheme)}
          nextDestination={nextDestination}
          onMagicLinkRequest={controller.requestMagicLink}
          onSocialAuthRequest={controller.requestSocialAuth}
          status={controller.authState.status}
        />
      </LocalizationProvider>
    );
  }

  if (
    controller.authState.status === 'signedIn' &&
    (route.type === 'auth-callback' || route.type === 'sign-in')
  ) {
    return (
      <LocalizationProvider language={controller.resolvedLanguage}>
        <AuthRedirect destination={nextDestination} />
      </LocalizationProvider>
    );
  }

  if (route.type === 'not-found') {
    return (
      <LocalizationProvider language={controller.resolvedLanguage}>
        <NotFoundView
          iconSrc={getThemeIconSrc(controller.resolvedTheme)}
          onBoardClick={() => navigate(APP_ROUTES.board, { replace: true })}
          onHistoryClick={() => navigate(APP_ROUTES.history, { replace: true })}
          requestedPath={getLocationDestination(location)}
        />
      </LocalizationProvider>
    );
  }

  const closeMobileSidebar = () => controller.closeMobileSidebar();
  const navigateTo = (path: string) => {
    navigate(path);
    closeMobileSidebar();
  };
  const routeBoardSettingsOpen = route.type === 'settings';
  const routeTagManagerOpen = route.type === 'tags';
  const activeCardId = route.type === 'active-card' ? route.cardId : null;
  const archivedCardRoute =
    route.type === 'archived-card'
      ? { cardId: route.cardId, cycleId: route.cycleId }
      : null;

  return (
    <LocalizationProvider language={controller.resolvedLanguage}>
      <main
        className={`app ${controller.sidebarExpanded ? 'app--sidebar-expanded' : 'app--sidebar-collapsed'} ${controller.mobileSidebarOpen ? 'app--mobile-sidebar-open' : ''}`}
        data-theme={controller.resolvedTheme}
        data-theme-preference={controller.themePreference}
        data-language={controller.resolvedLanguage}
        data-language-preference={controller.languagePreference}
      >
        <MobileNavigationBackdrop onClose={closeMobileSidebar} />
        <AppSidebar
          currentView={currentView}
          onBoardClick={() => navigateTo(APP_ROUTES.board)}
          onCloseMobileSidebar={closeMobileSidebar}
          onHistoryClick={() => navigateTo(APP_ROUTES.history)}
          onManageColumnsClick={() => {
            navigate(APP_ROUTES.board);
            controller.openManageColumns();
          }}
          onManageTagsClick={() => navigateTo(APP_ROUTES.tags)}
          onProfileClick={controller.openProfileDialog}
          onSettingsClick={() => navigateTo(APP_ROUTES.settings)}
          onSignOut={controller.signOut}
          onToggleSidebar={controller.toggleSidebar}
          profile={controller.profileIdentity}
          resolvedTheme={controller.resolvedTheme}
          sidebarExpanded={controller.sidebarExpanded}
          showProfile={controller.authState.status === 'signedIn'}
          showSignOut={controller.authState.status === 'signedIn'}
        />
        {controller.persistenceMessage && (
          <div className="app__persistence-status" role="status">
            {controller.persistenceMessage}
          </div>
        )}
        <AppWorkspace
          activeCardId={activeCardId}
          archivedCardRoute={archivedCardRoute}
          boardLoading={controller.authenticatedBoardLoading}
          canCompleteWork={controller.canCompleteWork}
          completeWorkDisabledReason={controller.completeWorkDisabledReason}
          completedWorkCycles={controller.completedWorkCycles}
          completionPulse={controller.completionPulse}
          currentView={currentView}
          manageColumnsOpen={controller.manageColumnsOpen}
          onActiveCardClose={() => navigate(APP_ROUTES.board)}
          onArchivedCardClose={() => navigate(APP_ROUTES.history)}
          onBoardStateChange={controller.syncBoardState}
          onColumnCountChange={controller.updateColumnCount}
          onCompleteWorkClick={controller.openCompleteWorkConfirmation}
          onManageColumnsOpenChange={controller.setManageColumnsOpen}
          onOpenMobileSidebar={controller.openMobileSidebar}
          onTagsChange={controller.updateTags}
          storageVersion={controller.storageVersion}
          tags={controller.tags}
        />
        <AppDialogs
          activeWorkCycle={controller.activeWorkCycle}
          authenticatedProfile={controller.authenticatedProfile}
          clearBoardOpen={controller.clearBoardOpen}
          columnCount={controller.columnCount}
          columns={controller.columns}
          completeWorkOpen={controller.completeWorkOpen}
          completedCardCount={controller.completedCardCount}
          completedColumn={controller.completedColumn}
          onSettingsOpenChange={(open) => {
            if (routeBoardSettingsOpen && !open) {
              navigate(APP_ROUTES.board);
              return;
            }

            controller.setSettingsOpen(open);
          }}
          onClearBoard={controller.clearBoard}
          onClearBoardOpenChange={controller.setClearBoardOpen}
          onClearBoardRequest={() => {
            if (routeBoardSettingsOpen) {
              navigate(APP_ROUTES.board);
            }

            controller.openClearBoardConfirmation();
          }}
          onCompleteWork={controller.confirmCompleteWork}
          onCompleteWorkOpenChange={controller.setCompleteWorkOpen}
          onCompletedColumnChange={controller.chooseCompletedColumn}
          onDeleteTag={controller.deleteTag}
          onLanguagePreferenceChange={controller.chooseLanguagePreference}
          onProfileOpenChange={controller.setProfileDialogOpen}
          onProfileSave={controller.saveProfile}
          onThemePreferenceChange={controller.chooseThemePreference}
          onTagManagerOpenChange={(open) => {
            if (routeTagManagerOpen && !open) {
              navigate(APP_ROUTES.board);
              return;
            }

            controller.setTagManagerOpen(open);
          }}
          onTagsChange={controller.updateTags}
          languagePreference={controller.languagePreference}
          profileError={controller.profileError}
          profileOpen={controller.profileDialogOpen}
          profileSaving={controller.profileSaving}
          routeManagementOpen={routeBoardSettingsOpen || routeTagManagerOpen}
          settingsOpen={routeBoardSettingsOpen || controller.settingsOpen}
          systemLanguage={controller.systemLanguage}
          tagManagerOpen={routeTagManagerOpen || controller.tagManagerOpen}
          tags={controller.tags}
          themePreference={controller.themePreference}
        />
      </main>
    </LocalizationProvider>
  );
};

const App = () => (
  <BrowserRouter>
    <RoutedApp />
  </BrowserRouter>
);

export default App;
