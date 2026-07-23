import { Drawer } from '@base-ui/react/drawer';
import { useRef } from 'react';
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useMatch,
  useNavigate,
} from 'react-router';

import { LocalizationProvider } from './LocalizationProvider';
import AuthGate from './app/AuthGate';
import AppDialogs from './app/AppDialogs';
import AppSidebar from './app/AppSidebar';
import AppWorkspace from './app/AppWorkspace';
import FlowboardQueryProvider from './app/FlowboardQueryProvider';
import { AuthRedirect, NotFoundView } from './app/RouteFallbacks';
import { getThemeIconSrc } from './app/appTheme';
import { getLocationDestination } from './app/routeGuards';
import {
  APP_ROUTES,
  createSignInPath,
  getNextSearchDestination,
} from './app/routes';
import useAppController from './app/useAppController';
import { isSupabaseConfigured } from './auth/supabase';
import { FlowboardToastProvider } from './components/ToastNotifications';

import './App.css';
import './app/AppShell.css';
import './components/Primitives/Primitives.css';

type AppController = ReturnType<typeof useAppController>;

type RouteControllerProps = {
  controller: AppController;
};

const AuthEntryRoute = ({ controller }: RouteControllerProps) => {
  const location = useLocation();
  const nextDestination = getNextSearchDestination(location.search);

  if (!isSupabaseConfigured) {
    return <Navigate replace to={APP_ROUTES.board} />;
  }

  if (controller.authState.status === 'signedIn') {
    return <AuthRedirect destination={nextDestination} />;
  }

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
};

const ProtectedRoute = ({ controller }: RouteControllerProps) => {
  const location = useLocation();

  if (isSupabaseConfigured && controller.authState.status !== 'signedIn') {
    return (
      <Navigate
        replace
        to={createSignInPath(getLocationDestination(location))}
      />
    );
  }

  return <Outlet />;
};

const NotFoundRoute = ({ controller }: RouteControllerProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <NotFoundView
      iconSrc={getThemeIconSrc(controller.resolvedTheme)}
      onBoardClick={() => navigate(APP_ROUTES.board, { replace: true })}
      onHistoryClick={() => navigate(APP_ROUTES.history, { replace: true })}
      requestedPath={getLocationDestination(location)}
    />
  );
};

const AppShell = ({ controller }: RouteControllerProps) => {
  const mobileNavigationTriggerRef = useRef<HTMLButtonElement | null>(null);
  const navigate = useNavigate();
  const activeCardMatch = useMatch('/board/cards/:cardId');
  const archivedCardMatch = useMatch('/history/cycles/:cycleId/cards/:cardId');
  const historyMatch = useMatch('/history/*');
  const routeBoardSettingsOpen = Boolean(useMatch(APP_ROUTES.settings));
  const routeTagManagerOpen = Boolean(useMatch(APP_ROUTES.tags));
  const currentView = archivedCardMatch || historyMatch ? 'history' : 'board';
  const activeCardId = activeCardMatch?.params.cardId ?? null;
  const archivedCardRoute =
    archivedCardMatch?.params.cardId && archivedCardMatch.params.cycleId
      ? {
          cardId: archivedCardMatch.params.cardId,
          cycleId: archivedCardMatch.params.cycleId,
        }
      : null;
  const closeMobileSidebar = () => {
    controller.closeMobileSidebar();
    window.setTimeout(() => mobileNavigationTriggerRef.current?.focus(), 0);
  };
  const navigateTo = (path: string) => {
    navigate(path);
    closeMobileSidebar();
  };
  const cardDetailAccessToken =
    controller.authState.status === 'signedIn'
      ? controller.authState.session.access_token
      : undefined;

  return (
    <main
      className={`app ${controller.sidebarExpanded ? 'app--sidebar-expanded' : 'app--sidebar-collapsed'} ${controller.mobileSidebarOpen ? 'app--mobile-sidebar-open' : ''}`}
      data-theme={controller.resolvedTheme}
      data-theme-preference={controller.themePreference}
      data-language={controller.resolvedLanguage}
      data-language-preference={controller.languagePreference}
    >
      <AppSidebar
        className="app-sidebar--desktop"
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
        onSettingsClick={() => navigate(APP_ROUTES.settings)}
        onSignOut={controller.signOut}
        onToggleSidebar={controller.toggleSidebar}
        profile={controller.profileIdentity}
        resolvedTheme={controller.resolvedTheme}
        sidebarExpanded={controller.sidebarExpanded}
        showProfile={controller.authState.status === 'signedIn'}
        showSignOut={controller.authState.status === 'signedIn'}
      />
      <Drawer.Root
        onOpenChange={(open) =>
          open ? controller.openMobileSidebar() : closeMobileSidebar()
        }
        open={controller.mobileSidebarOpen}
      >
        <Drawer.Portal>
          <Drawer.Backdrop className="app__mobile-drawer-backdrop" />
          <Drawer.Viewport className="app__mobile-drawer-viewport">
            <Drawer.Popup className="app__mobile-drawer-popup">
              <Drawer.Title className="sr-only">
                Flowboard navigation
              </Drawer.Title>
              <AppSidebar
                className="app-sidebar--mobile"
                currentView={currentView}
                onBoardClick={() => navigateTo(APP_ROUTES.board)}
                onCloseMobileSidebar={closeMobileSidebar}
                onHistoryClick={() => navigateTo(APP_ROUTES.history)}
                onManageColumnsClick={() => {
                  navigate(APP_ROUTES.board);
                  controller.openManageColumns();
                  closeMobileSidebar();
                }}
                onManageTagsClick={() => navigateTo(APP_ROUTES.tags)}
                onProfileClick={controller.openProfileDialog}
                onSettingsClick={() => navigate(APP_ROUTES.settings)}
                onSignOut={controller.signOut}
                onToggleSidebar={controller.toggleSidebar}
                profile={controller.profileIdentity}
                resolvedTheme={controller.resolvedTheme}
                sidebarExpanded={controller.sidebarExpanded}
                showProfile={controller.authState.status === 'signedIn'}
                showSignOut={controller.authState.status === 'signedIn'}
              />
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>
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
        completionAcknowledgement={controller.completionAcknowledgement}
        currentView={currentView}
        manageColumnsOpen={controller.manageColumnsOpen}
        onActiveCardClose={() => navigate(APP_ROUTES.board)}
        onArchivedCardClose={() => navigate(APP_ROUTES.history)}
        onCardColumnsChange={controller.updateCardColumns}
        onColumnsChange={controller.updateColumns}
        onCompleteWorkClick={controller.openCompleteWorkConfirmation}
        onManageColumnsOpenChange={controller.setManageColumnsOpen}
        onOpenMobileSidebar={controller.openMobileSidebar}
        mobileNavigationTriggerRef={mobileNavigationTriggerRef}
        onTagsChange={controller.updateTags}
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
      <Outlet />
    </main>
  );
};

const RoutedApp = () => {
  const controller = useAppController();

  return (
    <LocalizationProvider language={controller.resolvedLanguage}>
      <FlowboardToastProvider>
        <Routes>
          <Route
            element={<Navigate replace to={APP_ROUTES.board} />}
            path={APP_ROUTES.root}
          />
          <Route
            element={<AuthEntryRoute controller={controller} />}
            path={APP_ROUTES.signIn}
          />
          <Route
            element={<AuthEntryRoute controller={controller} />}
            path={APP_ROUTES.authCallback}
          />
          <Route element={<ProtectedRoute controller={controller} />}>
            <Route element={<AppShell controller={controller} />}>
              <Route element={null} path={APP_ROUTES.board} />
              <Route
                element={null}
                path={`${APP_ROUTES.board}/cards/:cardId`}
              />
              <Route element={null} path={APP_ROUTES.history} />
              <Route
                element={null}
                path={`${APP_ROUTES.history}/cycles/:cycleId/cards/:cardId`}
              />
              <Route element={null} path={APP_ROUTES.settings} />
              <Route element={null} path={APP_ROUTES.tags} />
            </Route>
            <Route
              element={<NotFoundRoute controller={controller} />}
              path="*"
            />
          </Route>
        </Routes>
      </FlowboardToastProvider>
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
