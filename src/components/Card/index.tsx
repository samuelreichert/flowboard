import { AlignLeft } from 'lucide-react';
import { lazy, Suspense, useReducer, useRef } from 'react';
import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router';

import { useCardDragAndDrop } from './useCardDragAndDrop';
import CardMetadata from '../CardMetadata';
import type { CardDialogSaveValues } from '../CardDialog';
import { useLocalization } from '../../LocalizationProvider';
import { createActiveCardPath } from '../../app/routes';
import { useActiveCardDetailQuery } from '../../app/useFlowboardQueries';
import type { BoardCard, BoardColumn, BoardTag } from '../../types';

import './Card.css';

const CardDialog = lazy(() => import('../CardDialog'));

type CardProps = {
  activeCardId: string | null;
  cardDetailAccessToken?: string;
  card: BoardCard;
  columnId: string;
  columns: BoardColumn[];
  deleteCard: (columnId: string, cardId: string) => void;
  editCard: (
    columnId: string,
    cardId: string,
    values: CardDialogSaveValues
  ) => string | void;
  onTagsChange: (tags: BoardTag[]) => void;
  onActiveCardClose: () => void;
  tags: BoardTag[];
};

type CardState = {
  detailsOpen: boolean;
};

type CardAction = { type: 'detailsOpenChanged'; open: boolean };

const cardReducer = (state: CardState, action: CardAction): CardState => {
  switch (action.type) {
    case 'detailsOpenChanged':
      return { ...state, detailsOpen: action.open };
  }
};

const Card = ({
  activeCardId,
  cardDetailAccessToken,
  card,
  columnId,
  columns,
  deleteCard,
  editCard,
  onTagsChange,
  onActiveCardClose,
  tags,
}: CardProps) => {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLElement | null>(null);
  const titleRef = useRef<HTMLSpanElement | null>(null);
  const [state, dispatch] = useReducer(cardReducer, {
    detailsOpen: false,
  });
  const { detailsOpen } = state;
  const { closestEdge, isDragging, shouldSuppressCardClick } =
    useCardDragAndDrop({
      cardId: card.id,
      cardRef,
      columnId,
      titleRef,
    });
  const routeDetailsOpen = activeCardId === card.id;
  const dialogOpen = detailsOpen || routeDetailsOpen;
  const cardDetailQuery = useActiveCardDetailQuery(
    dialogOpen ? card.id : null,
    cardDetailAccessToken
  );
  const dialogCard = cardDetailQuery.data
    ? { ...cardDetailQuery.data, ...card, content: cardDetailQuery.data.content }
    : card;

  const openCard = () => navigate(createActiveCardPath(card.id));

  const onCardClick = (event: MouseEvent<HTMLElement>) => {
    if (shouldSuppressCardClick()) {
      event.preventDefault();
      return;
    }

    openCard();
  };

  const cardTags = card.tagIds
    .map((tagId) => tags.find((tag) => tag.id === tagId))
    .filter((tag): tag is BoardTag => Boolean(tag));
  const visibleTags = cardTags.slice(0, 2);
  const hiddenTagCount = cardTags.length - visibleTags.length;
  const { messages } = useLocalization();

  return (
    <>
      <article
        className={`card ${isDragging ? 'card--dragging' : ''}`}
        ref={cardRef}
      >
        {closestEdge && (
          <span
            className={`card__drop-indicator card__drop-indicator--${closestEdge}`}
          />
        )}
        <button
          aria-label={messages.card.openCard(card.title)}
          className="card__body"
          onClick={onCardClick}
          type="button"
        >
          <div className="card__title-row">
            <span className="card__title" draggable={false} ref={titleRef}>
              {card.title}
            </span>
            {card.content && (
              <AlignLeft
                aria-label={messages.card.hasContent}
                className="card__content-icon"
                size={13}
              />
            )}
          </div>
          <CardMetadata
            hiddenTagCount={hiddenTagCount}
            priority={card.priority}
            tags={visibleTags}
          />
        </button>
      </article>
      {dialogOpen && (
        <Suspense fallback={null}>
          <CardDialog
            card={dialogCard}
            columnId={columnId}
            columns={columns}
            onDelete={() => deleteCard(columnId, card.id)}
            onTagsChange={onTagsChange}
            onOpenChange={(open) => {
              if (!open && routeDetailsOpen) {
                onActiveCardClose();
                return;
              }

              dispatch({ open, type: 'detailsOpenChanged' });
            }}
            onSave={(values) => editCard(columnId, card.id, values)}
            open={dialogOpen}
            tags={tags}
          />
        </Suspense>
      )}
    </>
  );
};

export default Card;
