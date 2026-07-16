import { Button } from '@base-ui/react/button';
import {
  AlignLeft,
  CalendarDays,
  CheckCircle2,
  Copy,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { useLocalization } from '../../LocalizationProvider';
import { resolveArchivedTagName } from '../../board/completedWork';
import { findArchivedCardRouteTarget } from '../../board/routeLookup';
import { createArchivedCardPath } from '../../app/routes';
import type {
  ArchivedBoardCard,
  BoardTag,
  CompletedWorkCycle,
} from '../../types';
import CardMetadata, { PriorityBadge, TagChip } from '../CardMetadata';
import { CardContentViewer } from '../CardContentEditor';
import DialogShell from '../DialogShell';
import { EmptyState, InlineEmptyState } from '../EmptyState';
import '../IconButton/IconButton.css';
import SegmentedControl from '../SegmentedControl';
import type { SegmentedControlOption } from '../SegmentedControl';

type HistoryViewProps = {
  boardLoading: boolean;
  completedWorkCycles: CompletedWorkCycle[];
  onArchivedCardClose: () => void;
  routeCard: { cardId: string; cycleId: string } | null;
  tags: BoardTag[];
};

type HistoryDetailState = {
  copyStatus: string;
  selectedCardId: string | null;
  selectedCycleId: string | null;
};

type HistoryLayout = 'grid' | 'list';

const getVisibleTagNames = (card: ArchivedBoardCard, tags: BoardTag[]) =>
  card.tagIds
    .map((tagId) => resolveArchivedTagName(tagId, card, tags))
    .filter((tagName): tagName is string => Boolean(tagName));

const HistoryView = ({
  boardLoading,
  completedWorkCycles,
  onArchivedCardClose,
  routeCard,
  tags,
}: HistoryViewProps) => {
  const { formatDate, messages } = useLocalization();
  const navigate = useNavigate();
  const [detailState, setDetailState] = useState<HistoryDetailState>({
    copyStatus: '',
    selectedCardId: null,
    selectedCycleId: null,
  });
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
  const { copyStatus, selectedCardId, selectedCycleId } = detailState;
  const sortedCycles = useMemo(
    () =>
      completedWorkCycles.toSorted(
        (first, second) =>
          Date.parse(second.endDate) - Date.parse(first.endDate)
      ),
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
  const selectedCard =
    routeTarget?.card ??
    sortedCycles
      .find((cycle) => cycle.id === selectedCycleId)
      ?.cards.find((card) => card.id === selectedCardId) ??
    null;
  const routeCardMissing = Boolean(routeCard && !routeTarget && !boardLoading);
  const selectedTagNames = selectedCard
    ? getVisibleTagNames(selectedCard, tags)
    : [];

  const copySelectedCardMarkdown = async () => {
    if (!selectedCard) {
      return;
    }

    await navigator.clipboard.writeText(selectedCard.content);
    setDetailState((currentState) => ({
      ...currentState,
      copyStatus: messages.common.copied,
    }));
    window.setTimeout(
      () =>
        setDetailState((currentState) => ({
          ...currentState,
          copyStatus: '',
        })),
      1600
    );
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
      <div className="history-list">
        {sortedCycles.map((cycle) => (
          <section className="history-cycle" key={cycle.id}>
            <header className="history-cycle__header">
              <div>
                <p className="history-cycle__eyebrow">
                  {messages.history.workCycle}
                </p>
                <h2 className="history-cycle__title">
                  {formatDate(cycle.startDate)} - {formatDate(cycle.endDate)}
                </h2>
              </div>
              <span className="history-cycle__count">
                {messages.history.cardCount(cycle.cards.length)}
              </span>
            </header>
            {cycle.cards.length === 0 ? (
              <InlineEmptyState>
                {messages.history.completedWithoutCards}
              </InlineEmptyState>
            ) : (
              <div className={`history-cards history-cards--${historyLayout}`}>
                {cycle.cards.map((card) => {
                  const visibleTagNames = getVisibleTagNames(card, tags);

                  return (
                    <article className="history-card" key={card.id}>
                      <Button
                        className="history-card__button"
                        onClick={() =>
                          navigate(createArchivedCardPath(cycle.id, card.id))
                        }
                        type="button"
                      >
                        <div className="history-card__title-row">
                          <span className="history-card__title">
                            {card.title}
                          </span>
                          {card.content && (
                            <AlignLeft
                              aria-label={messages.card.hasContent}
                              className="history-card__content-icon"
                              size={13}
                            />
                          )}
                        </div>
                        <CardMetadata
                          hiddenTagCount={Math.max(
                            0,
                            visibleTagNames.length - 2
                          )}
                          leadingClassName="history-card__created-date"
                          leadingText={messages.history.created(
                            formatDate(card.createdAt)
                          )}
                          priority={card.priority}
                          tags={visibleTagNames.slice(0, 2).map((tagName) => ({
                            id: tagName,
                            name: tagName,
                          }))}
                        />
                      </Button>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </div>
      <DialogShell
        closeLabel={messages.history.closeArchivedCard}
        description={
          selectedCard
            ? messages.history.created(formatDate(selectedCard.createdAt))
            : undefined
        }
        open={Boolean(selectedCard)}
        onOpenChange={(open) => {
          if (!open) {
            if (routeCard) {
              onArchivedCardClose();
              return;
            }

            setDetailState({
              copyStatus: '',
              selectedCardId: null,
              selectedCycleId: null,
            });
          }
        }}
        popupClassName="dialog-popup--card"
        title={selectedCard?.title ?? messages.history.archivedCard}
      >
        {selectedCard && (
          <div className="history-card-detail__body">
            <div className="history-card-detail__toolbar">
              <div className="history-card-detail__metadata">
                <div className="history-card-detail__metadata-row">
                  <span className="history-card-detail__metadata-label">
                    {messages.card.priority}
                  </span>
                  <span className="history-card-detail__metadata-chips">
                    <PriorityBadge priority={selectedCard.priority} />
                  </span>
                </div>
                <div className="history-card-detail__metadata-row">
                  <span className="history-card-detail__metadata-label">
                    {messages.card.tags}
                  </span>
                  <span className="history-card-detail__metadata-chips">
                    {selectedTagNames.length > 0 ? (
                      selectedTagNames.map((tagName) => (
                        <TagChip key={tagName}>{tagName}</TagChip>
                      ))
                    ) : (
                      <InlineEmptyState variant="soft">
                        {messages.card.noTags}
                      </InlineEmptyState>
                    )}
                  </span>
                </div>
              </div>
              <Button
                aria-label={messages.history.copyMarkdown}
                className="button button--subtle history-card-detail__copy"
                onClick={copySelectedCardMarkdown}
                type="button"
              >
                <Copy size={15} />
                <span>{messages.history.copyMarkdown}</span>
                {copyStatus && (
                  <span className="history-card-detail__copy-status">
                    {copyStatus}
                  </span>
                )}
              </Button>
            </div>
            {selectedCard.content ? (
              <div className="history-card-detail__content">
                <CardContentViewer
                  ariaLabel={`${selectedCard.title} content`}
                  value={selectedCard.content}
                />
              </div>
            ) : (
              <InlineEmptyState>
                {messages.history.archivedCardNoContent}
              </InlineEmptyState>
            )}
          </div>
        )}
        {selectedCard && (
          <div className="history-card-detail__meta">
            <CalendarDays size={14} />
            <span>
              {messages.history.archived(formatDate(selectedCard.archivedAt))}
            </span>
          </div>
        )}
      </DialogShell>
    </section>
  );
};

export default HistoryView;
