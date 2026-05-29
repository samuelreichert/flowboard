import { useEffect, useState } from 'react';

import AddContent from '../AddContent';
import Card from '../Card';
import type { BoardColumn } from '../../types';

import './Column.css';

type ColumnProps = {
  title: string;
  cards?: string[];
  position: number;
  setColumns: (columns: BoardColumn[]) => void;
  updateCards: (title: string, position: number, cards: string[]) => void;
};

const Column = ({
  title,
  cards = [],
  position,
  setColumns,
  updateCards,
}: ColumnProps) => {
  const [columnCards, setColumnCards] = useState<string[]>(cards);

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

  return (
    <div className="column">
      <h4 className="column__title">{title}</h4>

      <div className="cards">
        {columnCards.map((card, i) => (
          <Card
            key={`${title}-${card}-${i}`}
            title={card}
            onEditCard={onEditCard}
            column={title}
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
