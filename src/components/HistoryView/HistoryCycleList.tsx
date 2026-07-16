import { Button } from '@base-ui/react/button';
import { AlignLeft } from 'lucide-react';

import { useLocalization } from '../../LocalizationProvider';
import type { BoardTag, CompletedWorkCycle } from '../../types';
import CardMetadata from '../CardMetadata';
import { InlineEmptyState } from '../EmptyState';
import { getVisibleTagNames } from './historyHelpers';

export type HistoryLayout = 'grid' | 'list';

type HistoryCycleListProps = {
  cycles: CompletedWorkCycle[];
  historyLayout: HistoryLayout;
  onCardOpen: (cycleId: string, cardId: string) => void;
  tags: BoardTag[];
};

const HistoryCycleList = ({
  cycles,
  historyLayout,
  onCardOpen,
  tags,
}: HistoryCycleListProps) => {
  const { formatDate, messages } = useLocalization();

  return (
    <div className="history-list">
      {cycles.map((cycle) => (
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
                      onClick={() => onCardOpen(cycle.id, card.id)}
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
  );
};

export default HistoryCycleList;
