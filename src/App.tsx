import AppDialogs from './app/AppDialogs';
import AppSidebar from './app/AppSidebar';
import AppWorkspace from './app/AppWorkspace';
import useAppController from './app/useAppController';

import './App.css';

const App = () => {
  const {
    activeWorkCycle,
    boardSettingsOpen,
    canCompleteWork,
    chooseCompletedColumn,
    chooseThemePreference,
    clearBoard,
    clearBoardOpen,
    closeMobileSidebar,
    columnCount,
    columns,
    completeWorkOpen,
    completedCardCount,
    completedColumn,
    completedWorkCycles,
    completionPulse,
    confirmCompleteWork,
    currentView,
    deleteTag,
    mobileSidebarOpen,
    openBoard,
    openBoardSettings,
    openClearBoardConfirmation,
    openCompleteWorkConfirmation,
    openHistory,
    openMobileSidebar,
    openTagManager,
    resolvedTheme,
    setBoardSettingsOpen,
    setClearBoardOpen,
    setCompleteWorkOpen,
    setTagManagerOpen,
    sidebarExpanded,
    storageVersion,
    syncBoardState,
    tagManagerOpen,
    tags,
    themePreference,
    toggleSidebar,
    updateColumnCount,
    updateTags,
  } = useAppController();

  return (
    <main
      className={`app ${sidebarExpanded ? 'app--sidebar-expanded' : 'app--sidebar-collapsed'} ${mobileSidebarOpen ? 'app--mobile-sidebar-open' : ''}`}
      data-theme={resolvedTheme}
      data-theme-preference={themePreference}
    >
      <button
        aria-label="Close navigation"
        className="app__mobile-backdrop"
        onClick={closeMobileSidebar}
        type="button"
      />
      <AppSidebar
        currentView={currentView}
        onBoardClick={openBoard}
        onBoardSettingsClick={openBoardSettings}
        onCloseMobileSidebar={closeMobileSidebar}
        onHistoryClick={openHistory}
        onManageTagsClick={openTagManager}
        onThemePreferenceChange={chooseThemePreference}
        onToggleSidebar={toggleSidebar}
        resolvedTheme={resolvedTheme}
        sidebarExpanded={sidebarExpanded}
        themePreference={themePreference}
      />
      <AppWorkspace
        canCompleteWork={canCompleteWork}
        completedWorkCycles={completedWorkCycles}
        completionPulse={completionPulse}
        currentView={currentView}
        onBoardStateChange={syncBoardState}
        onColumnCountChange={updateColumnCount}
        onCompleteWorkClick={openCompleteWorkConfirmation}
        onOpenMobileSidebar={openMobileSidebar}
        onTagsChange={updateTags}
        storageVersion={storageVersion}
        tags={tags}
      />
      <AppDialogs
        activeWorkCycle={activeWorkCycle}
        boardSettingsOpen={boardSettingsOpen}
        clearBoardOpen={clearBoardOpen}
        columnCount={columnCount}
        columns={columns}
        completeWorkOpen={completeWorkOpen}
        completedCardCount={completedCardCount}
        completedColumn={completedColumn}
        onBoardSettingsOpenChange={setBoardSettingsOpen}
        onClearBoard={clearBoard}
        onClearBoardOpenChange={setClearBoardOpen}
        onClearBoardRequest={openClearBoardConfirmation}
        onCompleteWork={confirmCompleteWork}
        onCompleteWorkOpenChange={setCompleteWorkOpen}
        onCompletedColumnChange={chooseCompletedColumn}
        onDeleteTag={deleteTag}
        onTagManagerOpenChange={setTagManagerOpen}
        onTagsChange={updateTags}
        tagManagerOpen={tagManagerOpen}
        tags={tags}
      />
    </main>
  );
};

export default App;
