import { useState } from 'react';
import type { MouseEvent } from 'react';

import ContentForm from '../ContentForm';
import DropDown from '../Dropdown';
import DeleteIcon from '../../svgs/delete-icon';
import RightIcon from '../../svgs/right-icon';
import { fetchStorage } from '../../storage';
import type { BoardColumn } from '../../types';

import './Card.css';

type CardProps = {
  column: string;
  onEditCard: (oldContent: string, newContent: string) => void;
  title: string;
  setColumns: (columns: BoardColumn[]) => void;
};

const Card = ({ column, onEditCard, title, setColumns }: CardProps) => {
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
    const newColumns = data.map((item) => {
      if (item.title === column) {
        return {
          ...item,
          cards: item.cards.filter((card) => card !== title),
        };
      }

      if (item.title === newColumn) {
        return {
          ...item,
          cards: [...item.cards, title],
        };
      }

      return { ...item };
    });

    setColumns(newColumns);
    setIsMoveOpen(false);
  };

  const onUpdateCardContent = (content: string) => {
    onEditCard(title, content);
    setEditCardOpen(false);
  };

  if (editCardOpen === false) {
    return (
      <div className="card" onClick={() => setEditCardOpen(true)}>
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
