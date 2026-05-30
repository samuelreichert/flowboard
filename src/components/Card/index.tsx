import { GripVertical } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { DragEvent, MouseEvent } from 'react';

import CardDialog from '../CardDialog';
import type { CardDialogValues } from '../CardDialog';
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
  moveCard: (cardId: string, fromColumnId: string, toColumnId: string) => void;
};

const Card = ({ card, columnId, columns, deleteCard, editCard }: CardProps) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const draggedCardRef = useRef<Element | null>(null);
  const dragPreviewRef = useRef<HTMLElement | null>(null);

  const clearDragState = () => {
    draggedCardRef.current?.classList.remove('card--dragging');
    draggedCardRef.current = null;
    dragPreviewRef.current?.remove();
    dragPreviewRef.current = null;
  };

  useEffect(() => clearDragState, []);

  const onDragStart = (event: DragEvent<HTMLButtonElement>) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/x-card-id', card.id);
    event.dataTransfer.setData('application/x-column-id', columnId);

    const cardElement = event.currentTarget.closest('.card');

    if (cardElement && typeof event.dataTransfer.setDragImage === 'function') {
      const dragPreview = cardElement.cloneNode(true) as HTMLElement;
      const { width } = cardElement.getBoundingClientRect();

      dragPreview.classList.add('card--drag-preview');
      dragPreview.style.width = `${width}px`;
      document.body.append(dragPreview);
      event.dataTransfer.setDragImage(dragPreview, 18, 18);
      dragPreviewRef.current = dragPreview;
    }

    cardElement?.classList.add('card--dragging');
    draggedCardRef.current = cardElement;
  };

  const onDragEnd = () => {
    clearDragState();
  };

  const stopCardClick = (event: MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <>
      <article className="card" onClick={() => setDetailsOpen(true)}>
        <button
          aria-label={`Drag ${card.title}`}
          className="card__drag-handle"
          draggable
          onClick={stopCardClick}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          type="button"
        >
          <GripVertical size={16} />
        </button>
        <span className="card__title">{card.title}</span>
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
