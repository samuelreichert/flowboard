import { Button } from '@base-ui/react/button';
import { Dialog } from '@base-ui/react/dialog';
import { AlignLeft, CalendarDays, CheckCircle2, Copy, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { resolveArchivedTagName } from '../../board/completedWork';
import type {
  ArchivedBoardCard,
  BoardTag,
  CompletedWorkCycle,
} from '../../types';
import { CardContentViewer } from '../CardContentEditor';
import '../IconButton/IconButton.css';

type HistoryViewProps = {
  completedWorkCycles: CompletedWorkCycle[];
  tags: BoardTag[];
};

type HistoryDetailState = {
  copyStatus: string;
  selectedCard: ArchivedBoardCard | null;
};

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

const formatPriorityLabel = (priority: ArchivedBoardCard['priority']) =>
  priority.charAt(0).toUpperCase() + priority.slice(1);

const getVisibleTagNames = (card: ArchivedBoardCard, tags: BoardTag[]) =>
  card.tagIds
    .map((tagId) => resolveArchivedTagName(tagId, card, tags))
    .filter((tagName): tagName is string => Boolean(tagName));

const HistoryView = ({ completedWorkCycles, tags }: HistoryViewProps) => {
  const [detailState, setDetailState] = useState<HistoryDetailState>({
    copyStatus: '',
    selectedCard: null,
  });
  const { copyStatus, selectedCard } = detailState;
  const sortedCycles = useMemo(
    () =>
      completedWorkCycles.toSorted(
        (first, second) => Date.parse(second.endDate) - Date.parse(first.endDate)
    ),
    [completedWorkCycles]
  );
  const selectedTagNames = useMemo(
    () => (selectedCard ? getVisibleTagNames(selectedCard, tags) : []),
    [selectedCard, tags]
  );

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
        <div className="history-empty">
          <CheckCircle2 size={22} />
          <h2>No completed work yet</h2>
          <p>Complete work from the board to start building your history.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="history-view" aria-label="Completed work history">
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
              <p className="history-cycle__empty">
                Completed without archived cards.
              </p>
            ) : (
              <div className="history-cards">
                {cycle.cards.map((card) => {
                  const visibleTagNames = getVisibleTagNames(card, tags);

                  return (
                    <article className="history-card" key={card.id}>
                      <Button
                        className="history-card__button"
                        onClick={() =>
                          setDetailState({
                            copyStatus: '',
                            selectedCard: card,
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
                        <div className="card__metadata">
                          <span
                            className={`card__priority card__priority--${card.priority}`}
                          >
                            {formatPriorityLabel(card.priority)}
                          </span>
                          {visibleTagNames.slice(0, 2).map((tagName) => (
                            <span className="card__tag" key={tagName}>
                              {tagName}
                            </span>
                          ))}
                          {visibleTagNames.length > 2 && (
                            <span className="card__tag card__tag--overflow">
                              +{visibleTagNames.length - 2}
                            </span>
                          )}
                        </div>
                      </Button>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </div>
      <Dialog.Root
        open={Boolean(selectedCard)}
        onOpenChange={(open) => {
          if (!open) {
            setDetailState({
              copyStatus: '',
              selectedCard: null,
            });
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="dialog-backdrop" />
          <Dialog.Viewport className="dialog-viewport">
            <Dialog.Popup className="dialog-popup dialog-popup--card">
              <div className="dialog-header">
                <div>
                  <Dialog.Title className="dialog-title">
                    {selectedCard?.title ?? 'Archived card'}
                  </Dialog.Title>
                  {selectedCard && (
                    <Dialog.Description className="dialog-description">
                      Created {formatDate(selectedCard.createdAt)}
                    </Dialog.Description>
                  )}
                </div>
                <Dialog.Close
                  aria-label="Close archived card"
                  className="icon-button dialog-close"
                  render={<Button />}
                >
                  <X size={17} />
                </Dialog.Close>
              </div>
              {selectedCard && (
                <div className="history-card-detail__body">
                  <div className="history-card-detail__toolbar">
                    <div className="history-card-detail__metadata">
                      <div className="history-card-detail__metadata-row">
                        <span className="history-card-detail__metadata-label">
                          Priority
                        </span>
                        <span className="history-card-detail__metadata-chips">
                          <span
                            className={`card__priority card__priority--${selectedCard.priority}`}
                          >
                            {formatPriorityLabel(selectedCard.priority)}
                          </span>
                        </span>
                      </div>
                      <div className="history-card-detail__metadata-row">
                        <span className="history-card-detail__metadata-label">
                          Tags
                        </span>
                        <span className="history-card-detail__metadata-chips">
                          {selectedTagNames.length > 0 ? (
                            selectedTagNames.map((tagName) => (
                              <span className="card__tag" key={tagName}>
                                {tagName}
                              </span>
                            ))
                          ) : (
                            <span className="history-card-detail__empty-tag">
                              No tags
                            </span>
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
                    <p className="history-card-detail__empty">
                      This archived card has no content.
                    </p>
                  )}
                </div>
              )}
              {selectedCard && (
                <div className="history-card-detail__meta">
                  <CalendarDays size={14} />
                  <span>Archived {formatDate(selectedCard.archivedAt)}</span>
                </div>
              )}
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
};

export default HistoryView;
