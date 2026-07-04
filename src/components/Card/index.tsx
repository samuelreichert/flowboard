import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import {
  attachClosestEdge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { AlignLeft } from 'lucide-react';
import { useEffect, useReducer, useRef } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';

import CardDialog from '../CardDialog';
import type { CardDialogValues } from '../CardDialog';
import { isCardDragData } from '../../dnd';
import type { BoardCard, BoardColumn, BoardTag } from '../../types';

import './Card.css';

type CardProps = {
  card: BoardCard;
  columnId: string;
  columns: BoardColumn[];
  deleteCard: (columnId: string, cardId: string) => void;
  editCard: (
    columnId: string,
    cardId: string,
    values: CardDialogValues
  ) => string | void;
  onTagsChange: (tags: BoardTag[]) => void;
  tags: BoardTag[];
};

const hasSelectionInside = (element: HTMLElement) => {
  const selection = window.getSelection();

  if (
    !selection ||
    selection.isCollapsed ||
    selection.toString().trim().length === 0
  ) {
    return false;
  }

  return Boolean(
    (selection.anchorNode && element.contains(selection.anchorNode)) ||
      (selection.focusNode && element.contains(selection.focusNode))
  );
};

type CardState = {
  closestEdge: Edge | null;
  detailsOpen: boolean;
  isDragging: boolean;
};

type CardAction =
  | { type: 'closestEdgeChanged'; closestEdge: Edge | null }
  | { type: 'detailsOpenChanged'; open: boolean }
  | { type: 'draggingChanged'; isDragging: boolean };

const cardReducer = (state: CardState, action: CardAction): CardState => {
  switch (action.type) {
    case 'closestEdgeChanged':
      return { ...state, closestEdge: action.closestEdge };
    case 'detailsOpenChanged':
      return { ...state, detailsOpen: action.open };
    case 'draggingChanged':
      return { ...state, isDragging: action.isDragging };
  }
};

const Card = ({
  card,
  columnId,
  columns,
  deleteCard,
  editCard,
  onTagsChange,
  tags,
}: CardProps) => {
  const cardRef = useRef<HTMLElement | null>(null);
  const ignoreNextClickRef = useRef(false);
  const resetIgnoreClickTimerRef = useRef<number | null>(null);
  const [state, dispatch] = useReducer(cardReducer, {
    closestEdge: null,
    detailsOpen: false,
    isDragging: false,
  });
  const { closestEdge, detailsOpen, isDragging } = state;

  const openCard = () => dispatch({ open: true, type: 'detailsOpenChanged' });

  const setCardDraggingEnabled = (enabled: boolean) => {
    const cardElement = cardRef.current;

    if (cardElement) {
      cardElement.draggable = enabled;
    }
  };

  useEffect(() => {
    const cardElement = cardRef.current;

    if (!cardElement) {
      return;
    }

    const cleanup = combine(
      draggable({
        element: cardElement,
        getInitialData: () => ({ cardId: card.id, columnId, type: 'card' }),
        onDragStart: () => {
          ignoreNextClickRef.current = true;
          dispatch({ isDragging: true, type: 'draggingChanged' });
        },
        onDrop: () => {
          dispatch({ isDragging: false, type: 'draggingChanged' });

          if (resetIgnoreClickTimerRef.current) {
            window.clearTimeout(resetIgnoreClickTimerRef.current);
          }

          resetIgnoreClickTimerRef.current = window.setTimeout(() => {
            ignoreNextClickRef.current = false;
            resetIgnoreClickTimerRef.current = null;
          }, 0);
        },
      }),
      dropTargetForElements({
        element: cardElement,
        canDrop: ({ source }) =>
          isCardDragData(source.data) && source.data.cardId !== card.id,
        getData: ({ element, input }) =>
          attachClosestEdge(
            { cardId: card.id, columnId, type: 'card' },
            { allowedEdges: ['top', 'bottom'], element, input }
          ),
        onDrag: ({ self }) =>
          dispatch({
            closestEdge: extractClosestEdge(self.data),
            type: 'closestEdgeChanged',
          }),
        onDragEnter: ({ self }) =>
          dispatch({
            closestEdge: extractClosestEdge(self.data),
            type: 'closestEdgeChanged',
          }),
        onDragLeave: () =>
          dispatch({ closestEdge: null, type: 'closestEdgeChanged' }),
        onDrop: () =>
          dispatch({ closestEdge: null, type: 'closestEdgeChanged' }),
      })
    );

    return cleanup;
  }, [card.id, columnId]);

  useEffect(
    () => () => {
      if (resetIgnoreClickTimerRef.current) {
        window.clearTimeout(resetIgnoreClickTimerRef.current);
      }
    },
    []
  );

  const onCardClick = (event: MouseEvent<HTMLElement>) => {
    const cardElement = cardRef.current;

    if (!cardElement) {
      return;
    }

    if (ignoreNextClickRef.current || hasSelectionInside(cardElement)) {
      ignoreNextClickRef.current = false;
      event.preventDefault();
      return;
    }

    openCard();
  };

  const onCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    openCard();
  };

  const cardTags = card.tagIds
    .map((tagId) => tags.find((tag) => tag.id === tagId))
    .filter((tag): tag is BoardTag => Boolean(tag));
  const visibleTags = cardTags.slice(0, 2);
  const hiddenTagCount = cardTags.length - visibleTags.length;
  const priorityLabel =
    card.priority.charAt(0).toUpperCase() + card.priority.slice(1);

  return (
    <>
      <article
        aria-label={`Open ${card.title}`}
        className={`card ${isDragging ? 'card--dragging' : ''}`}
        onClick={onCardClick}
        onKeyDown={onCardKeyDown}
        ref={cardRef}
        role="button"
        tabIndex={0}
      >
        {closestEdge && (
          <span
            className={`card__drop-indicator card__drop-indicator--${closestEdge}`}
          />
        )}
        <div className="card__body">
          <div className="card__title-row">
            <span
              className="card__title"
              onMouseDown={() => setCardDraggingEnabled(false)}
              onMouseEnter={() => setCardDraggingEnabled(false)}
              onMouseLeave={() => setCardDraggingEnabled(true)}
            >
              {card.title}
            </span>
            {card.content && (
              <AlignLeft
                aria-label="Has content"
                className="card__content-icon"
                size={13}
              />
            )}
          </div>
          <div className="card__metadata">
            <span className={`card__priority card__priority--${card.priority}`}>
              {priorityLabel}
            </span>
            {visibleTags.map((tag) => (
              <span className="card__tag" key={tag.id}>
                {tag.name}
              </span>
            ))}
            {hiddenTagCount > 0 && (
              <span className="card__tag card__tag--overflow">
                +{hiddenTagCount}
              </span>
            )}
          </div>
        </div>
      </article>
      <CardDialog
        card={card}
        columnId={columnId}
        columns={columns}
        onDelete={() => deleteCard(columnId, card.id)}
        onTagsChange={onTagsChange}
        onOpenChange={(open) => dispatch({ open, type: 'detailsOpenChanged' })}
        onSave={(values) => editCard(columnId, card.id, values)}
        open={detailsOpen}
        tags={tags}
      />
    </>
  );
};

export default Card;
