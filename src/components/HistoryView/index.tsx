import { CheckCircle2, LayoutGrid, List } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { useLocalization } from '../../LocalizationProvider';
import type { RemoteDataState } from '../../app/remoteDataState';
import { useArchivedCardDetailQuery } from '../../app/useFlowboardQueries';
import { createArchivedCardPath } from '../../app/routes';
import type {
  CompletedHistoryCardSummary,
  CompletedHistoryCycleSummary,
} from '../../storage/authenticatedApi';
import { isApiRequestErrorWithStatus } from '../../storage/apiRequestError';
import type { BoardTag } from '../../types';
import { EmptyState, InlineEmptyState } from '../EmptyState';
import '../IconButton/IconButton.css';
import { InlineRemoteDataState, RemoteDataPanel } from '../RemoteDataState';
import SegmentedControl from '../SegmentedControl';
import type { SegmentedControlOption } from '../SegmentedControl';
import ArchivedCardDialog from './ArchivedCardDialog';
import HistoryCycleList from './HistoryCycleList';
import type { HistoryLayout } from './HistoryCycleList';
import { getVisibleTagNames, sortHistoryCycles } from './historyHelpers';

import './HistoryView.css';

type HistoryViewProps = {
  accessToken?: string;
  completedWorkCycles: CompletedHistoryCycleSummary[] | undefined;
  hasMoreHistory: boolean;
  historyLoadMoreError: boolean;
  historyLoadingMore: boolean;
  historyRefreshError: boolean;
  historyRefreshing: boolean;
  historyState: RemoteDataState;
  onArchivedCardClose: () => void;
  onLoadMoreHistory: () => void;
  onRetryHistory: () => void;
  onRetryLoadMoreHistory: () => void;
  routeCard: { cardId: string; cycleId: string } | null;
  tags: BoardTag[];
};

const HistoryView = ({
  accessToken,
  completedWorkCycles,
  hasMoreHistory,
  historyLoadMoreError,
  historyLoadingMore,
  historyRefreshError,
  historyRefreshing,
  historyState,
  onArchivedCardClose,
  onLoadMoreHistory,
  onRetryHistory,
  onRetryLoadMoreHistory,
  routeCard,
  tags,
}: HistoryViewProps) => {
  const { messages } = useLocalization();
  const navigate = useNavigate();
  const [copyStatus, setCopyStatus] = useState('');
  const copyStatusTimeoutRef = useRef<number | null>(null);
  const [historyLayout, setHistoryLayout] = useState<HistoryLayout>('grid');
  const historyLayoutOptions: SegmentedControlOption<HistoryLayout>[] = [
    {
      ariaLabel: messages.history.gridView,
      icon: <LayoutGrid size={15} />,
      label: messages.history.grid,
      value: 'grid',
    },
    {
      ariaLabel: messages.history.listView,
      icon: <List size={15} />,
      label: messages.history.list,
      value: 'list',
    },
  ];
  const sortedCycles = useMemo(
    () => sortHistoryCycles(completedWorkCycles ?? []),
    [completedWorkCycles]
  );
  const routeTarget = useMemo(() => {
    if (!routeCard) {
      return null;
    }

    const cycle = sortedCycles.find((item) => item.id === routeCard.cycleId);
    const card = cycle?.cards.find((item) => item.id === routeCard.cardId);

    return cycle && card ? { card, cycle } : null;
  }, [routeCard, sortedCycles]);
  const archivedCardDetailQuery = useArchivedCardDetailQuery({
    accessToken,
    cardId: routeCard?.cardId ?? null,
    cycleId: routeCard?.cycleId ?? null,
    enabled: Boolean(routeCard),
  });
  const archivedCardDetailState: RemoteDataState =
    archivedCardDetailQuery.data !== undefined
      ? 'content'
      : archivedCardDetailQuery.isError
        ? 'error'
        : 'loading';
  const routeCardMissing = Boolean(
    routeCard && isApiRequestErrorWithStatus(archivedCardDetailQuery.error, 404)
  );
  const selectedCard: CompletedHistoryCardSummary | null =
    archivedCardDetailQuery.data ?? routeTarget?.card ?? null;
  const selectedTagNames = selectedCard
    ? getVisibleTagNames(selectedCard, tags)
    : [];

  useEffect(
    () => () => {
      if (copyStatusTimeoutRef.current !== null) {
        window.clearTimeout(copyStatusTimeoutRef.current);
      }
    },
    []
  );

  const copySelectedCardMarkdown = async () => {
    if (!archivedCardDetailQuery.data) {
      return false;
    }

    try {
      await navigator.clipboard.writeText(archivedCardDetailQuery.data.content);
      setCopyStatus(messages.common.copied);

      if (copyStatusTimeoutRef.current !== null) {
        window.clearTimeout(copyStatusTimeoutRef.current);
      }

      copyStatusTimeoutRef.current = window.setTimeout(
        () => setCopyStatus(''),
        1600
      );
      return true;
    } catch {
      setCopyStatus('');
      return false;
    }
  };

  const archivedCardDialog = (
    <ArchivedCardDialog
      copyStatus={copyStatus}
      detailContent={archivedCardDetailQuery.data?.content}
      detailState={archivedCardDetailState}
      onCopyMarkdown={copySelectedCardMarkdown}
      onOpenChange={(open) => {
        if (!open && routeCard) {
          onArchivedCardClose();
        }
      }}
      onRetry={() => {
        void archivedCardDetailQuery.refetch();
      }}
      open={Boolean(routeCard && !routeCardMissing)}
      selectedCard={selectedCard}
      selectedTagNames={selectedTagNames}
    />
  );

  if (historyState === 'loading') {
    return (
      <section
        aria-busy="true"
        aria-label={messages.history.completedHistory}
        className="history-view"
      >
        <RemoteDataPanel
          description={messages.history.historyLoadingBody}
          title={messages.history.historyLoadingTitle}
          variant="loading"
        />
        {archivedCardDialog}
      </section>
    );
  }

  if (historyState === 'error') {
    return (
      <section
        aria-label={messages.history.completedHistory}
        className="history-view"
      >
        <RemoteDataPanel
          description={messages.history.historyUnavailableBody}
          onRetry={onRetryHistory}
          retryLabel={messages.common.retry}
          title={messages.history.historyUnavailableTitle}
          variant="error"
        />
        {archivedCardDialog}
      </section>
    );
  }

  if (historyState === 'empty') {
    return (
      <section
        className="history-view"
        aria-label={messages.history.completedHistory}
      >
        {routeCardMissing ? (
          <EmptyState title={messages.history.archivedCardNotFoundTitle}>
            {messages.history.archivedCardNotFoundBody}
          </EmptyState>
        ) : (
          <EmptyState
            icon={<CheckCircle2 size={22} />}
            title={messages.history.noCompletedWorkTitle}
          >
            {messages.history.noCompletedWorkBody}
          </EmptyState>
        )}
        {archivedCardDialog}
      </section>
    );
  }

  return (
    <section
      aria-busy={historyRefreshing || historyLoadingMore || undefined}
      className="history-view"
      aria-label={messages.history.completedHistory}
    >
      <div className="history-view__toolbar">
        <SegmentedControl
          ariaLabel={messages.history.historyLayout}
          className="history-view__layout-toggle"
          onValueChange={setHistoryLayout}
          options={historyLayoutOptions}
          value={historyLayout}
        />
      </div>
      {historyRefreshError && !historyLoadMoreError && (
        <InlineRemoteDataState
          onRetry={onRetryHistory}
          retryLabel={messages.common.retry}
          variant="error"
        >
          {messages.history.historyRefreshFailed}
        </InlineRemoteDataState>
      )}
      {routeCardMissing && (
        <InlineEmptyState variant="surface">
          {messages.history.archivedCardNotFound}
        </InlineEmptyState>
      )}
      <HistoryCycleList
        cycles={sortedCycles}
        historyLayout={historyLayout}
        onCardOpen={(cycleId, cardId) =>
          navigate(createArchivedCardPath(cycleId, cardId))
        }
        tags={tags}
      />
      {(hasMoreHistory || historyLoadMoreError) && (
        <div className="history-view__load-more">
          {historyLoadMoreError ? (
            <InlineRemoteDataState
              onRetry={onRetryLoadMoreHistory}
              retryLabel={messages.common.retry}
              variant="error"
            >
              {messages.history.loadMoreFailed}
            </InlineRemoteDataState>
          ) : (
            <button
              className="button button--subtle"
              disabled={historyLoadingMore}
              onClick={onLoadMoreHistory}
              type="button"
            >
              {messages.common.loadMore}
            </button>
          )}
        </div>
      )}
      {archivedCardDialog}
    </section>
  );
};

export default HistoryView;
