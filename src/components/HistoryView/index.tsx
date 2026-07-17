import { CheckCircle2, LayoutGrid, List } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { useLocalization } from '../../LocalizationProvider';
import { createArchivedCardPath } from '../../app/routes';
import { findArchivedCardRouteTarget } from '../../board/routeLookup';
import type { BoardTag, CompletedWorkCycle } from '../../types';
import { EmptyState, InlineEmptyState } from '../EmptyState';
import '../IconButton/IconButton.css';
import SegmentedControl from '../SegmentedControl';
import type { SegmentedControlOption } from '../SegmentedControl';
import ArchivedCardDialog from './ArchivedCardDialog';
import HistoryCycleList from './HistoryCycleList';
import type { HistoryLayout } from './HistoryCycleList';
import { getVisibleTagNames, sortCompletedWorkCycles } from './historyHelpers';
import { useHistoryDetail } from './useHistoryDetail';

import './HistoryView.css';

type HistoryViewProps = {
  boardLoading: boolean;
  completedWorkCycles: CompletedWorkCycle[];
  onArchivedCardClose: () => void;
  routeCard: { cardId: string; cycleId: string } | null;
  tags: BoardTag[];
};

const HistoryView = ({
  boardLoading,
  completedWorkCycles,
  onArchivedCardClose,
  routeCard,
  tags,
}: HistoryViewProps) => {
  const { messages } = useLocalization();
  const navigate = useNavigate();
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
    () => sortCompletedWorkCycles(completedWorkCycles),
    [completedWorkCycles]
  );
  const routeTarget = useMemo(
    () =>
      routeCard
        ? findArchivedCardRouteTarget(
            sortedCycles,
            routeCard.cycleId,
            routeCard.cardId
          )
        : null,
    [routeCard, sortedCycles]
  );
  const {
    clearSelectedCard,
    copySelectedCardMarkdown,
    copyStatus,
    selectedCard,
  } = useHistoryDetail({
    copiedMessage: messages.common.copied,
    routeCard,
    routeTargetCard: routeTarget?.card ?? null,
    sortedCycles,
  });
  const routeCardMissing = Boolean(routeCard && !routeTarget && !boardLoading);
  const selectedTagNames = selectedCard
    ? getVisibleTagNames(selectedCard, tags)
    : [];

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
      <ArchivedCardDialog
        copyStatus={copyStatus}
        onCopyMarkdown={copySelectedCardMarkdown}
        onOpenChange={(open) => {
          if (!open) {
            if (routeCard) {
              onArchivedCardClose();
              return;
            }

            clearSelectedCard();
          }
        }}
        selectedCard={selectedCard}
        selectedTagNames={selectedTagNames}
      />
    </section>
  );
};

export default HistoryView;
