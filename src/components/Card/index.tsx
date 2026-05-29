import { useState } from 'react';
import type { DragEvent, MouseEvent } from 'react';

import ContentForm from '../ContentForm';
import DropDown from '../Dropdown';
import DeleteIcon from '../../svgs/delete-icon';
import RightIcon from '../../svgs/right-icon';
import { fetchStorage } from '../../storage';
import type { BoardColumn } from '../../types';

import './Card.css';

type CardProps = {
  column: string;
  moveCard: (cardTitle: string, fromColumn: string, toColumn: string) => void;
  onEditCard: (oldContent: string, newContent: string) => void;
  title: string;
  setColumns: (columns: BoardColumn[]) => void;
};

const Card = ({
  column,
  moveCard,
  onEditCard,
  title,
  setColumns,
}: CardProps) => {
  const data = fetchStorage();
  const options = data.map((option) => option.title);
  const [editCardOpen, setEditCardOpen] = useState(false);
  const [isMoveOpen, setIsMoveOpen] = useState(false);

  const onDeleteCard = (e: MouseEvent<HTMLSpanElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const newColumns = data.map((item) => {
      if (item.title === column) {
        return {
          ...item,
          cards: item.cards.filter((card) => card !== title),
        };
      }

      return { ...item };
    });

    setColumns(newColumns);
  };

  const onSelectColumnToMove = (newColumn: string) => {
    moveCard(title, column, newColumn);
    setIsMoveOpen(false);
  };

  const onDragStart = (event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', title);
    event.dataTransfer.setData('application/x-column-title', column);
  };

  const onUpdateCardContent = (content: string) => {
    onEditCard(title, content);
    setEditCardOpen(false);
  };

  if (editCardOpen === false) {
    return (
      <div
        className="card"
        draggable
        onClick={() => setEditCardOpen(true)}
        onDragStart={onDragStart}
      >
        {title}

        <div className="card__options">
          <span onClick={onDeleteCard}>
            <DeleteIcon size={14} />
          </span>
          <span
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMoveOpen(true);
            }}
          >
            <RightIcon size={16} />
          </span>
          <DropDown
            isOpen={isMoveOpen}
            onSelectOption={onSelectColumnToMove}
            options={options}
          />
        </div>
      </div>
    );
  }

  return (
    <ContentForm
      contentType="card"
      dark
      defaultContent={title}
      isEdit
      isTextArea
      onClose={() => setEditCardOpen(false)}
      onSaveContent={onUpdateCardContent}
    />
  );
};

export default Card;
