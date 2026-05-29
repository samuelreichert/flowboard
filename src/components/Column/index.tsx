import { useEffect, useState } from 'react';
import type { DragEvent } from 'react';

import AddContent from '../AddContent';
import Card from '../Card';
import type { BoardColumn } from '../../types';

import './Column.css';

type ColumnProps = {
  title: string;
  cards?: string[];
  position: number;
  moveCard: (cardTitle: string, fromColumn: string, toColumn: string) => void;
  setColumns: (columns: BoardColumn[]) => void;
  updateCards: (title: string, position: number, cards: string[]) => void;
};

const Column = ({
  title,
  cards = [],
  position,
  moveCard,
  setColumns,
  updateCards,
}: ColumnProps) => {
  const [columnCards, setColumnCards] = useState<string[]>(cards);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    setColumnCards(cards);
  }, [cards]);

  const onSaveCard = (content: string) => {
    const newCards = [...columnCards, content];

    updateColumnCards(newCards);
  };

  const onEditCard = (oldContent: string, newContent: string) => {
    const newCards = columnCards.map((card) => {
      return card === oldContent ? newContent : card;
    });

    updateColumnCards(newCards);
  };

  const updateColumnCards = (newCards: string[]) => {
    setColumnCards(newCards);
    updateCards(title, position, newCards);
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDragOver(false);
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const cardTitle = event.dataTransfer.getData('text/plain');
    const fromColumn = event.dataTransfer.getData('application/x-column-title');

    if (cardTitle && fromColumn) {
      moveCard(cardTitle, fromColumn, title);
    }
  };

  return (
    <div
      className={`column ${isDragOver ? 'column--drag-over' : ''}`}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <h4 className="column__title">{title}</h4>

      <div className="cards">
        {columnCards.map((card, i) => (
          <Card
            key={`${title}-${card}-${i}`}
            title={card}
            onEditCard={onEditCard}
            column={title}
            moveCard={moveCard}
            setColumns={setColumns}
          />
        ))}
      </div>

      <AddContent
        contentType="card"
        dark
        hasContent={columnCards.length > 0}
        isTextArea
        onSaveContent={onSaveCard}
      />
    </div>
  );
};

export default Column;
