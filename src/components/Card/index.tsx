import { Button } from '@base-ui/react/button';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import {
  attachClosestEdge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { AlignLeft, GripVertical } from 'lucide-react';
import { useEffect, useReducer, useRef } from 'react';
import type { MouseEvent } from 'react';
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

const stopCardClick = (event: MouseEvent) => {
  event.stopPropagation();
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
  const dragHandleRef = useRef<HTMLButtonElement | null>(null);
  const [state, dispatch] = useReducer(cardReducer, {
    closestEdge: null,
    detailsOpen: false,
    isDragging: false,
  });
  const { closestEdge, detailsOpen, isDragging } = state;

  const openCard = () => dispatch({ open: true, type: 'detailsOpenChanged' });

  useEffect(() => {
    const cardElement = cardRef.current;
    const dragHandle = dragHandleRef.current;

    if (!cardElement || !dragHandle) {
      return;
    }

    return combine(
      draggable({
        element: cardElement,
        dragHandle,
        getInitialData: () => ({ cardId: card.id, columnId, type: 'card' }),
        onDragStart: () =>
          dispatch({ isDragging: true, type: 'draggingChanged' }),
        onDrop: () => dispatch({ isDragging: false, type: 'draggingChanged' }),
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
  }, [card.id, columnId]);

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
        className={`card ${isDragging ? 'card--dragging' : ''}`}
        ref={cardRef}
      >
        {closestEdge && (
          <span
            className={`card__drop-indicator card__drop-indicator--${closestEdge}`}
          />
        )}
        <Button
          aria-label={`Drag ${card.title}`}
          className="card__drag-handle"
          onClick={stopCardClick}
          ref={dragHandleRef}
          type="button"
        >
          <GripVertical size={16} />
        </Button>
        <Button className="card__body" onClick={openCard} type="button">
          <div className="card__title-row">
            <span className="card__title">{card.title}</span>
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
        </Button>
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
