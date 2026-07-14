import { Button } from '@base-ui/react/button';
import { History, Home } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router';

import AppDialogs from './app/AppDialogs';
import AppSidebar from './app/AppSidebar';
import AppWorkspace from './app/AppWorkspace';
import { getThemeIconSrc } from './app/appTheme';
import {
  APP_ROUTES,
  getInternalDestination,
  getNextSearchDestination,
  getViewForRoute,
  isProtectedAppRoute,
  parseAppRoute,
  type ParsedAppRoute,
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
  status: 'loading' | 'signedOut' | 'static' | 'signedIn';
};

export const AuthGate = ({
  iconSrc = '/icon-light.svg',
  message,
  nextDestination,
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

type AuthRedirectProps = {
  destination: string;
};

const AuthRedirect = ({ destination }: AuthRedirectProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(destination, { replace: true });
  }, [destination, navigate]);

  return (
    <main className="app app--auth">
      <section className="auth-panel" aria-label="Opening Flowboard">
        <p className="auth-panel__message">Opening your board...</p>
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
}: NotFoundViewProps) => (
  <main className="app app--not-found">
    <section className="not-found-panel" aria-label="Route not found">
      <div className="not-found-panel__mark" aria-hidden="true">
        <img alt="" className="not-found-panel__brand-icon" src={iconSrc} />
        <span>404</span>
      </div>
      <p className="app__eyebrow">Page not found</p>
      <h1 className="not-found-panel__title">That page is off the board</h1>
      <p className="not-found-panel__body">
        The link points to a Flowboard route that does not exist anymore.
      </p>
      <code className="not-found-panel__path">{requestedPath}</code>
      <div className="not-found-panel__actions">
        <Button className="button button--primary" onClick={onBoardClick}>
          <Home aria-hidden="true" size={15} />
          Open board
        </Button>
        <Button className="button button--subtle" onClick={onHistoryClick}>
          <History aria-hidden="true" size={15} />
          View history
        </Button>
      </div>
    </section>
  </main>
);

const getLocationDestination = (location: {
  hash: string;
  pathname: string;
  search: string;
}) =>
  getInternalDestination(
    `${location.pathname}${location.search}${location.hash}`
  );

export const shouldRenderAuthGate = ({
  authConfigured,
  route,
  status,
}: {
  authConfigured: boolean;
  route: ParsedAppRoute;
  status: AuthGateProps['status'];
}) =>
  authConfigured &&
  status !== 'signedIn' &&
  (isProtectedAppRoute(route) ||
    route.type === 'auth-callback' ||
    route.type === 'sign-in');

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
      <AuthGate
        message={controller.authState.message}
        iconSrc={getThemeIconSrc(controller.resolvedTheme)}
        nextDestination={nextDestination}
        onMagicLinkRequest={controller.requestMagicLink}
        onSocialAuthRequest={controller.requestSocialAuth}
        status={controller.authState.status}
      />
    );
  }

  if (
    controller.authState.status === 'signedIn' &&
    (route.type === 'auth-callback' || route.type === 'sign-in')
  ) {
    return <AuthRedirect destination={nextDestination} />;
  }

  if (route.type === 'not-found') {
    return (
      <NotFoundView
        iconSrc={getThemeIconSrc(controller.resolvedTheme)}
        onBoardClick={() => navigate(APP_ROUTES.board, { replace: true })}
        onHistoryClick={() => navigate(APP_ROUTES.history, { replace: true })}
        requestedPath={getLocationDestination(location)}
      />
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
    <main
      className={`app ${controller.sidebarExpanded ? 'app--sidebar-expanded' : 'app--sidebar-collapsed'} ${controller.mobileSidebarOpen ? 'app--mobile-sidebar-open' : ''}`}
      data-theme={controller.resolvedTheme}
      data-theme-preference={controller.themePreference}
    >
      <button
        aria-label="Close navigation"
        className="app__mobile-backdrop"
        onClick={closeMobileSidebar}
        type="button"
      />
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
        profileError={controller.profileError}
        profileOpen={controller.profileDialogOpen}
        profileSaving={controller.profileSaving}
        routeManagementOpen={routeBoardSettingsOpen || routeTagManagerOpen}
        settingsOpen={routeBoardSettingsOpen || controller.settingsOpen}
        tagManagerOpen={routeTagManagerOpen || controller.tagManagerOpen}
        tags={controller.tags}
        themePreference={controller.themePreference}
      />
    </main>
  );
};

const App = () => (
  <BrowserRouter>
    <RoutedApp />
  </BrowserRouter>
);

export default App;
