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
import type { BoardCard, BoardColumn } from '../../types';

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
};

const Card = ({ card, columnId, columns, deleteCard, editCard }: CardProps) => {
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
        <span className="card__title">{card.title}</span>
        {card.description && (
          <AlignLeft
            aria-label="Has description"
            className="card__description-icon"
            size={13}
          />
        )}
      </article>
      <CardDialog
        card={card}
        columnId={columnId}
        columns={columns}
        onDelete={() => deleteCard(columnId, card.id)}
        onOpenChange={setDetailsOpen}
        onSave={(values) => editCard(columnId, card.id, values)}
        open={detailsOpen}
      />
    </>
  );
};

export default Card;
