import {
  BrowserRouter,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router';

import { LocalizationProvider, useLocalization } from './LocalizationProvider';
import AuthGate from './app/AuthGate';
import AppDialogs from './app/AppDialogs';
import AppSidebar from './app/AppSidebar';
import AppWorkspace from './app/AppWorkspace';
import FlowboardQueryProvider from './app/FlowboardQueryProvider';
import { AuthRedirect, NotFoundView } from './app/RouteFallbacks';
import { getThemeIconSrc } from './app/appTheme';
import {
  getLocationDestination,
  shouldRenderAuthGate,
} from './app/routeGuards';
import {
  APP_ROUTES,
  getNextSearchDestination,
  getViewForRoute,
  parseAppRoute,
} from './app/routes';
import useAppController from './app/useAppController';
import { isSupabaseConfigured } from './auth/supabase';

import './App.css';
import './components/Primitives/Primitives.css';
import './app/AppShell.css';

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
  const cardDetailAccessToken =
    controller.authState.status === 'signedIn'
      ? controller.authState.session.access_token
      : undefined;

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
          boardMutations={controller.boardMutations}
          cardDetailAccessToken={cardDetailAccessToken}
          cardMutations={controller.cardMutations}
          canCompleteWork={controller.canCompleteWork}
          columns={controller.columns}
          completeWorkDisabledReason={controller.completeWorkDisabledReason}
          completionPulse={controller.completionPulse}
          currentView={currentView}
          manageColumnsOpen={controller.manageColumnsOpen}
          onActiveCardClose={() => navigate(APP_ROUTES.board)}
          onArchivedCardClose={() => navigate(APP_ROUTES.history)}
          onCardColumnsChange={controller.updateCardColumns}
          onColumnsChange={controller.updateColumns}
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
  <FlowboardQueryProvider>
    <BrowserRouter>
      <RoutedApp />
    </BrowserRouter>
  </FlowboardQueryProvider>
);

export default App;
