import { Button } from '@base-ui/react/button';
import { Menu } from '@base-ui/react/menu';
import { ArrowRight, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { DragEvent, MouseEvent } from 'react';

import ContentDialog from '../ContentDialog';
import IconButton from '../IconButton';
import type { BoardCard, BoardColumn } from '../../types';

import './Card.css';

type CardProps = {
  card: BoardCard;
  columnId: string;
  columns: BoardColumn[];
  deleteCard: (columnId: string, cardId: string) => void;
  editCard: (columnId: string, cardId: string, title: string) => string | void;
  moveCard: (cardId: string, fromColumnId: string, toColumnId: string) => void;
};

const Card = ({
  card,
  columnId,
  columns,
  deleteCard,
  editCard,
  moveCard,
}: CardProps) => {
  const [editOpen, setEditOpen] = useState(false);

  const onDragStart = (event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/x-card-id', card.id);
    event.dataTransfer.setData('application/x-column-id', columnId);
  };

  const stopCardClick = (event: MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <>
      <article
        className="card"
        draggable
        onClick={() => setEditOpen(true)}
        onDragStart={onDragStart}
      >
        <span className="card__title">{card.title}</span>
        <div className="card__options" onClick={stopCardClick}>
          <IconButton
            label={`Delete ${card.title}`}
            onClick={() => deleteCard(columnId, card.id)}
          >
            <Trash2 size={15} />
          </IconButton>
          <Menu.Root>
            <Menu.Trigger
              aria-label={`Move ${card.title}`}
              className="icon-button"
              render={<Button />}
            >
              <ArrowRight size={16} />
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner sideOffset={4}>
                <Menu.Popup className="menu-popup">
                  {columns
                    .filter((column) => column.id !== columnId)
                    .map((column) => (
                      <Menu.Item
                        className="menu-item"
                        key={column.id}
                        onClick={() => moveCard(card.id, columnId, column.id)}
                      >
                        {column.title}
                      </Menu.Item>
                    ))}
                  {columns.length === 1 && (
                    <Menu.Item className="menu-item" disabled>
                      Add another column to move this card
                    </Menu.Item>
                  )}
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        </div>
      </article>
      <ContentDialog
        description="Update the card title."
        initialValue={card.title}
        label="Card title"
        onOpenChange={setEditOpen}
        onSave={(title) => editCard(columnId, card.id, title)}
        open={editOpen}
        submitLabel="Save changes"
        title="Edit card"
      />
    </>
  );
};

export default Card;
