import { Button } from '@base-ui/react/button';
import { CheckCircle2, Menu as MenuIcon } from 'lucide-react';
import { lazy, Suspense } from 'react';

import { useLocalization } from '../LocalizationProvider';
import Columns from '../components/Columns';
import type { BoardColumn, BoardTag, CompletedWorkCycle } from '../types';
import type { AppView } from './appTypes';

const HistoryView = lazy(() => import('../components/HistoryView'));

type AppWorkspaceProps = {
  activeCardId: string | null;
  archivedCardRoute: { cardId: string; cycleId: string } | null;
  boardLoading: boolean;
  canCompleteWork: boolean;
  columns: BoardColumn[];
  completeWorkDisabledReason: string;
  completedWorkCycles: CompletedWorkCycle[];
  completionPulse: boolean;
  currentView: AppView;
  manageColumnsOpen: boolean;
  onActiveCardClose: () => void;
  onArchivedCardClose: () => void;
  onColumnsChange: (columns: BoardColumn[]) => void;
  onCompleteWorkClick: () => void;
  onManageColumnsOpenChange: (open: boolean) => void;
  onOpenMobileSidebar: () => void;
  onTagsChange: (tags: BoardTag[]) => void;
  storageVersion: number;
  tags: BoardTag[];
};

const AppWorkspace = ({
  activeCardId,
  archivedCardRoute,
  boardLoading,
  canCompleteWork,
  columns,
  completeWorkDisabledReason,
  completedWorkCycles,
  completionPulse,
  currentView,
  manageColumnsOpen,
  onActiveCardClose,
  onArchivedCardClose,
  onColumnsChange,
  onCompleteWorkClick,
  onManageColumnsOpenChange,
  onOpenMobileSidebar,
  onTagsChange,
  storageVersion,
  tags,
}: AppWorkspaceProps) => {
  const { messages } = useLocalization();
  const workspaceTitle =
    currentView === 'history'
      ? messages.app.workspace.history
      : messages.app.navigation.board;
  const workspaceEyebrow =
    currentView === 'history'
      ? messages.app.workspace.completedWork
      : messages.app.workspace.workspace;

  return (
    <section
      className="app-workspace"
      aria-label={messages.app.workspace.boardWorkspace}
    >
      <header className="board__header">
        <div className="board__title-group">
          <Button
            aria-label={messages.app.navigation.openNavigation}
            className="icon-button board__mobile-nav-trigger"
            onClick={onOpenMobileSidebar}
            type="button"
          >
            <MenuIcon size={18} />
          </Button>
          <div>
            <p className="app__eyebrow">{workspaceEyebrow}</p>
            <h1 className="app__title">{workspaceTitle}</h1>
          </div>
        </div>
        {currentView === 'board' && (
          <div className="board__header-actions">
            <Button
              aria-label={messages.app.workspace.completeWork}
              className="button button--primary board__complete-work"
              disabled={!canCompleteWork}
              onClick={onCompleteWorkClick}
              title={
                canCompleteWork
                  ? messages.app.workspace.completeWork
                  : completeWorkDisabledReason
              }
              type="button"
            >
              <CheckCircle2 size={16} />
              <span>{messages.app.workspace.completeWork}</span>
            </Button>
          </div>
        )}
      </header>
      {currentView === 'board' ? (
        <section
          className="board"
          aria-label={messages.app.workspace.boardAriaLabel}
        >
          {completionPulse && (
            <div className="complete-work-pulse" aria-live="polite">
              <CheckCircle2 size={18} />
              <span>{messages.app.workspace.workCompleted}</span>
            </div>
          )}
          <Columns
            activeCardId={activeCardId}
            boardLoading={boardLoading}
            columns={columns}
            key={storageVersion}
            manageColumnsOpen={manageColumnsOpen}
            onActiveCardClose={onActiveCardClose}
            onManageColumnsOpenChange={onManageColumnsOpenChange}
            onColumnsChange={onColumnsChange}
            onTagsChange={onTagsChange}
            tags={tags}
          />
        </section>
      ) : (
        <Suspense
          fallback={
            <section
              aria-label={messages.history.completedHistory}
              className="history-view"
            />
          }
        >
          <HistoryView
            boardLoading={boardLoading}
            completedWorkCycles={completedWorkCycles}
            onArchivedCardClose={onArchivedCardClose}
            routeCard={archivedCardRoute}
            tags={tags}
          />
        </Suspense>
      )}
    </section>
  );
};

export default AppWorkspace;
