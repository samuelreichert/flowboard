import { Button } from '@base-ui/react/button';
import { CheckCircle2, Menu as MenuIcon } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';

import { useLocalization } from '../LocalizationProvider';
import Columns from '../components/Columns';
import type { BoardColumn, BoardTag } from '../types';
import CompletionOverlay from './CompletionOverlay';
import type { AppView } from './appTypes';
import type { useFlowboardBoardMutations } from './useFlowboardBoardMutations';
import type { useFlowboardCardMutations } from './useFlowboardCardMutations';
import { useCompletedHistoryQuery } from './useFlowboardQueries';

import './AppWorkspace.css';

const HistoryView = lazy(() => import('../components/HistoryView'));

type AppWorkspaceProps = {
  activeCardId: string | null;
  archivedCardRoute: { cardId: string; cycleId: string } | null;
  cardDetailAccessToken?: string;
  boardLoading: boolean;
  boardMutations: ReturnType<typeof useFlowboardBoardMutations>;
  canCompleteWork: boolean;
  cardMutations: ReturnType<typeof useFlowboardCardMutations>;
  columns: BoardColumn[];
  completeWorkDisabledReason: string;
  completionAcknowledgement: boolean;
  currentView: AppView;
  manageColumnsOpen: boolean;
  onActiveCardClose: () => void;
  onArchivedCardClose: () => void;
  onCardColumnsChange: (columns: BoardColumn[]) => void;
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
  cardDetailAccessToken,
  boardLoading,
  boardMutations,
  canCompleteWork,
  cardMutations,
  columns,
  completeWorkDisabledReason,
  completionAcknowledgement,
  currentView,
  manageColumnsOpen,
  onActiveCardClose,
  onArchivedCardClose,
  onCardColumnsChange,
  onColumnsChange,
  onCompleteWorkClick,
  onManageColumnsOpenChange,
  onOpenMobileSidebar,
  onTagsChange,
  storageVersion,
  tags,
}: AppWorkspaceProps) => {
  const { messages } = useLocalization();
  const historyQuery = useCompletedHistoryQuery({
    accessToken: cardDetailAccessToken,
    enabled: currentView === 'history',
  });
  const completedWorkCycles =
    historyQuery.data?.pages.flatMap((page) => page.cycles) ?? [];
  const [composerPreferredColumnId, setComposerPreferredColumnId] =
    useState('');
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
          {completionAcknowledgement && (
            <CompletionOverlay
              description={messages.app.workspace.newCycleReady}
              title={messages.app.workspace.workCompleted}
            />
          )}
          <Columns
            activeCardId={activeCardId}
            boardLoading={boardLoading}
            boardMutations={boardMutations}
            cardDetailAccessToken={cardDetailAccessToken}
            cardMutations={cardMutations}
            columns={columns}
            key={storageVersion}
            manageColumnsOpen={manageColumnsOpen}
            onActiveCardClose={onActiveCardClose}
            onCardColumnsChange={onCardColumnsChange}
            onPreferredColumnChange={setComposerPreferredColumnId}
            onManageColumnsOpenChange={onManageColumnsOpenChange}
            onColumnsChange={onColumnsChange}
            onTagsChange={onTagsChange}
            preferredColumnId={composerPreferredColumnId}
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
            accessToken={cardDetailAccessToken}
            boardLoading={boardLoading}
            completedWorkCycles={completedWorkCycles}
            hasMoreHistory={Boolean(historyQuery.hasNextPage)}
            historyLoading={historyQuery.isLoading}
            historyLoadingMore={historyQuery.isFetchingNextPage}
            onArchivedCardClose={onArchivedCardClose}
            onLoadMoreHistory={() => {
              void historyQuery.fetchNextPage();
            }}
            routeCard={archivedCardRoute}
            tags={tags}
          />
        </Suspense>
      )}
    </section>
  );
};

export default AppWorkspace;
