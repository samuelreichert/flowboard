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

import { resolveArchivedTagName } from '../../board/completedWork';
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
  completedWorkCycles: CompletedWorkCycle[];
  tags: BoardTag[];
};

type HistoryDetailState = {
  copyStatus: string;
  selectedCardId: string | null;
  selectedCycleId: string | null;
};

type HistoryLayout = 'grid' | 'list';

const HISTORY_LAYOUT_OPTIONS: SegmentedControlOption<HistoryLayout>[] = [
  {
    ariaLabel: 'Grid view',
    icon: <LayoutGrid size={15} />,
    label: 'Grid',
    value: 'grid',
  },
  {
    ariaLabel: 'List view',
    icon: <List size={15} />,
    label: 'List',
    value: 'list',
  },
];

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return dateFormatter.format(date);
};

const getVisibleTagNames = (card: ArchivedBoardCard, tags: BoardTag[]) =>
  card.tagIds
    .map((tagId) => resolveArchivedTagName(tagId, card, tags))
    .filter((tagName): tagName is string => Boolean(tagName));

const HistoryView = ({ completedWorkCycles, tags }: HistoryViewProps) => {
  const [detailState, setDetailState] = useState<HistoryDetailState>({
    copyStatus: '',
    selectedCardId: null,
    selectedCycleId: null,
  });
  const [historyLayout, setHistoryLayout] = useState<HistoryLayout>('grid');
  const { copyStatus, selectedCardId, selectedCycleId } = detailState;
  const sortedCycles = useMemo(
    () =>
      completedWorkCycles.toSorted(
        (first, second) =>
          Date.parse(second.endDate) - Date.parse(first.endDate)
      ),
    [completedWorkCycles]
  );
  const selectedCard = useMemo(
    () =>
      sortedCycles
        .find((cycle) => cycle.id === selectedCycleId)
        ?.cards.find((card) => card.id === selectedCardId) ?? null,
    [selectedCardId, selectedCycleId, sortedCycles]
  );
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
      copyStatus: 'Copied',
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
      <section className="history-view" aria-label="Completed work history">
        <EmptyState
          icon={<CheckCircle2 size={22} />}
          title="No completed work yet"
        >
          Complete work from the board to start building your history.
        </EmptyState>
      </section>
    );
  }

  return (
    <section className="history-view" aria-label="Completed work history">
      <div className="history-view__toolbar">
        <SegmentedControl
          ariaLabel="History layout"
          className="history-view__layout-toggle"
          onValueChange={setHistoryLayout}
          options={HISTORY_LAYOUT_OPTIONS}
          value={historyLayout}
        />
      </div>
      <div className="history-list">
        {sortedCycles.map((cycle) => (
          <section className="history-cycle" key={cycle.id}>
            <header className="history-cycle__header">
              <div>
                <p className="history-cycle__eyebrow">Work cycle</p>
                <h2 className="history-cycle__title">
                  {formatDate(cycle.startDate)} - {formatDate(cycle.endDate)}
                </h2>
              </div>
              <span className="history-cycle__count">
                {cycle.cards.length}{' '}
                {cycle.cards.length === 1 ? 'card' : 'cards'}
              </span>
            </header>
            {cycle.cards.length === 0 ? (
              <InlineEmptyState>
                Completed without archived cards.
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
                          setDetailState({
                            copyStatus: '',
                            selectedCardId: card.id,
                            selectedCycleId: cycle.id,
                          })
                        }
                        type="button"
                      >
                        <div className="history-card__title-row">
                          <span className="history-card__title">
                            {card.title}
                          </span>
                          {card.content && (
                            <AlignLeft
                              aria-label="Has content"
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
                          leadingText={`Created ${formatDate(card.createdAt)}`}
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
        closeLabel="Close archived card"
        description={
          selectedCard
            ? `Created ${formatDate(selectedCard.createdAt)}`
            : undefined
        }
        open={Boolean(selectedCard)}
        onOpenChange={(open) => {
          if (!open) {
            setDetailState({
              copyStatus: '',
              selectedCardId: null,
              selectedCycleId: null,
            });
          }
        }}
        popupClassName="dialog-popup--card"
        title={selectedCard?.title ?? 'Archived card'}
      >
        {selectedCard && (
          <div className="history-card-detail__body">
            <div className="history-card-detail__toolbar">
              <div className="history-card-detail__metadata">
                <div className="history-card-detail__metadata-row">
                  <span className="history-card-detail__metadata-label">
                    Priority
                  </span>
                  <span className="history-card-detail__metadata-chips">
                    <PriorityBadge priority={selectedCard.priority} />
                  </span>
                </div>
                <div className="history-card-detail__metadata-row">
                  <span className="history-card-detail__metadata-label">
                    Tags
                  </span>
                  <span className="history-card-detail__metadata-chips">
                    {selectedTagNames.length > 0 ? (
                      selectedTagNames.map((tagName) => (
                        <TagChip key={tagName}>{tagName}</TagChip>
                      ))
                    ) : (
                      <InlineEmptyState variant="soft">
                        No tags
                      </InlineEmptyState>
                    )}
                  </span>
                </div>
              </div>
              <Button
                aria-label="Copy Markdown"
                className="button button--subtle history-card-detail__copy"
                onClick={copySelectedCardMarkdown}
                type="button"
              >
                <Copy size={15} />
                <span>Copy Markdown</span>
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
                This archived card has no content.
              </InlineEmptyState>
            )}
          </div>
        )}
        {selectedCard && (
          <div className="history-card-detail__meta">
            <CalendarDays size={14} />
            <span>Archived {formatDate(selectedCard.archivedAt)}</span>
          </div>
        )}
      </DialogShell>
    </section>
  );
};

export default HistoryView;
