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
import { useEffect, useRef, useState } from 'react';
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
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

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
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
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
        onDrag: ({ self }) => setClosestEdge(extractClosestEdge(self.data)),
        onDragEnter: ({ self }) =>
          setClosestEdge(extractClosestEdge(self.data)),
        onDragLeave: () => setClosestEdge(null),
        onDrop: () => setClosestEdge(null),
      })
    );
  }, [card.id, columnId]);

  const stopCardClick = (event: MouseEvent) => {
    event.stopPropagation();
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
        className={`card ${isDragging ? 'card--dragging' : ''}`}
        onClick={() => setDetailsOpen(true)}
        ref={cardRef}
      >
        {closestEdge && (
          <span
            className={`card__drop-indicator card__drop-indicator--${closestEdge}`}
          />
        )}
        <button
          aria-label={`Drag ${card.title}`}
          className="card__drag-handle"
          onClick={stopCardClick}
          ref={dragHandleRef}
          type="button"
        >
          <GripVertical size={16} />
        </button>
        <div className="card__body">
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
        </div>
      </article>
      <CardDialog
        card={card}
        columnId={columnId}
        columns={columns}
        onDelete={() => deleteCard(columnId, card.id)}
        onTagsChange={onTagsChange}
        onOpenChange={setDetailsOpen}
        onSave={(values) => editCard(columnId, card.id, values)}
        open={detailsOpen}
        tags={tags}
      />
    </>
  );
};

export default Card;
