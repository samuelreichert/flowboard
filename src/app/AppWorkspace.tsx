import { Button } from '@base-ui/react/button';
import { CheckCircle2, Menu as MenuIcon } from 'lucide-react';
import { lazy, Suspense } from 'react';

import Columns from '../components/Columns';
import type { BoardTag, CompletedWorkCycle } from '../types';
import type { AppView } from './appTypes';

const HistoryView = lazy(() => import('../components/HistoryView'));

type AppWorkspaceProps = {
  activeCardId: string | null;
  archivedCardRoute: { cardId: string; cycleId: string } | null;
  boardLoading: boolean;
  canCompleteWork: boolean;
  completeWorkDisabledReason: string;
  completedWorkCycles: CompletedWorkCycle[];
  completionPulse: boolean;
  currentView: AppView;
  onActiveCardClose: () => void;
  onArchivedCardClose: () => void;
  onBoardStateChange: () => void;
  onColumnCountChange: (columnCount: number) => void;
  onCompleteWorkClick: () => void;
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
  completeWorkDisabledReason,
  completedWorkCycles,
  completionPulse,
  currentView,
  onActiveCardClose,
  onArchivedCardClose,
  onBoardStateChange,
  onColumnCountChange,
  onCompleteWorkClick,
  onOpenMobileSidebar,
  onTagsChange,
  storageVersion,
  tags,
}: AppWorkspaceProps) => {
  const workspaceTitle = currentView === 'history' ? 'History' : 'Board';
  const workspaceEyebrow =
    currentView === 'history' ? 'Completed work' : 'Workspace';

  return (
    <section className="app-workspace" aria-label="Board workspace">
      <header className="board__header">
        <div className="board__title-group">
          <Button
            aria-label="Open navigation"
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
              aria-label="Complete work"
              className="button button--primary board__complete-work"
              disabled={!canCompleteWork}
              onClick={onCompleteWorkClick}
              title={
                canCompleteWork ? 'Complete work' : completeWorkDisabledReason
              }
              type="button"
            >
              <CheckCircle2 size={16} />
              <span>Complete work</span>
            </Button>
          </div>
        )}
      </header>
      {currentView === 'board' ? (
        <section className="board" aria-label="Flowboard board">
          {completionPulse && (
            <div className="complete-work-pulse" aria-live="polite">
              <CheckCircle2 size={18} />
              <span>Work completed</span>
            </div>
          )}
          <Columns
            activeCardId={activeCardId}
            boardLoading={boardLoading}
            key={storageVersion}
            onActiveCardClose={onActiveCardClose}
            onBoardStateChange={onBoardStateChange}
            onColumnCountChange={onColumnCountChange}
            onTagsChange={onTagsChange}
            tags={tags}
          />
        </section>
      ) : (
        <Suspense
          fallback={
            <section
              aria-label="Completed work history"
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
