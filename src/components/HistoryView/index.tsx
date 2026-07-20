import { CheckCircle2, LayoutGrid, List } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { useLocalization } from '../../LocalizationProvider';
import { useArchivedCardDetailQuery } from '../../app/useFlowboardQueries';
import { createArchivedCardPath } from '../../app/routes';
import type {
  ArchivedCardDetailResponse,
  CompletedHistoryCardSummary,
  CompletedHistoryCycleSummary,
} from '../../storage/authenticatedApi';
import type { ArchivedBoardCard, BoardTag } from '../../types';
import { EmptyState, InlineEmptyState } from '../EmptyState';
import '../IconButton/IconButton.css';
import SegmentedControl from '../SegmentedControl';
import type { SegmentedControlOption } from '../SegmentedControl';
import ArchivedCardDialog from './ArchivedCardDialog';
import HistoryCycleList from './HistoryCycleList';
import type { HistoryLayout } from './HistoryCycleList';
import { getVisibleTagNames, sortHistoryCycles } from './historyHelpers';

import './HistoryView.css';

type HistoryViewProps = {
  accessToken?: string;
  boardLoading: boolean;
  completedWorkCycles: CompletedHistoryCycleSummary[];
  hasMoreHistory: boolean;
  historyLoading: boolean;
  historyLoadingMore: boolean;
  onArchivedCardClose: () => void;
  onLoadMoreHistory: () => void;
  routeCard: { cardId: string; cycleId: string } | null;
  tags: BoardTag[];
};

const toDialogCard = (
  summary: CompletedHistoryCardSummary,
  detail?: ArchivedCardDetailResponse
): ArchivedBoardCard => ({
  ...summary,
  content: detail?.content ?? '',
});

const HistoryView = ({
  accessToken,
  boardLoading,
  completedWorkCycles,
  hasMoreHistory,
  historyLoading,
  historyLoadingMore,
  onArchivedCardClose,
  onLoadMoreHistory,
  routeCard,
  tags,
}: HistoryViewProps) => {
  const { messages } = useLocalization();
  const navigate = useNavigate();
  const [copyStatus, setCopyStatus] = useState('');
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
    () => sortHistoryCycles(completedWorkCycles),
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
    cardId: routeTarget?.card.id ?? null,
    cycleId: routeTarget?.cycle.id ?? null,
    enabled: Boolean(routeTarget),
  });
  const routeCardMissing = Boolean(
    routeCard &&
    (!routeTarget || archivedCardDetailQuery.isError) &&
    !boardLoading &&
    !historyLoading &&
    !archivedCardDetailQuery.isLoading
  );
  const selectedCard =
    routeTarget && !archivedCardDetailQuery.isError
      ? toDialogCard(routeTarget.card, archivedCardDetailQuery.data)
      : null;
  const selectedTagNames = selectedCard
    ? getVisibleTagNames(selectedCard, tags)
    : [];
  const copySelectedCardMarkdown = async () => {
    if (!archivedCardDetailQuery.data) {
      return;
    }

    await navigator.clipboard.writeText(archivedCardDetailQuery.data.content);
    setCopyStatus(messages.common.copied);
    window.setTimeout(() => setCopyStatus(''), 1600);
  };

  if (sortedCycles.length === 0) {
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
      </section>
    );
  }

  return (
    <section
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
      {hasMoreHistory && (
        <div className="history-view__load-more">
          <button
            className="button button--subtle"
            disabled={historyLoadingMore}
            onClick={onLoadMoreHistory}
            type="button"
          >
            {messages.common.loadMore}
          </button>
        </div>
      )}
      <ArchivedCardDialog
        copyStatus={copyStatus}
        onCopyMarkdown={copySelectedCardMarkdown}
        onOpenChange={(open) => {
          if (!open) {
            if (routeCard) {
              onArchivedCardClose();
              return;
            }
          }
        }}
        selectedCard={selectedCard}
        selectedTagNames={selectedTagNames}
      />
    </section>
  );
};

export default HistoryView;
