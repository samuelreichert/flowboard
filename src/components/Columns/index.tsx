import { useState } from 'react';

import AddContent from '../AddContent';
import Column from '../Column';
import { fetchStorage, updateStorage } from '../../storage';
import type { BoardColumn } from '../../types';

import './Columns.css';

const Columns = () => {
  const data = fetchStorage();
  const [columns, setColumns] = useState<BoardColumn[]>(data);

  const onSaveColumn = (title: string) => {
    const newColumns = [
      ...columns,
      { title, cards: [], position: columns.length * 10 },
    ];

    updateColumns(newColumns);
  };

  const onUpdateCards = (
    title: string,
    position: number,
    newCards: string[]
  ) => {
    const newColumns = columns.filter((column) => column.title !== title);
    newColumns.push({ title, cards: newCards, position });
    updateColumns(newColumns);
  };

  const onMoveCard = (
    cardTitle: string,
    fromColumn: string,
    toColumn: string
  ) => {
    if (fromColumn === toColumn) {
      return;
    }

    const newColumns = columns.map((column) => {
      if (column.title === fromColumn) {
        return {
          ...column,
          cards: column.cards.filter((card) => card !== cardTitle),
        };
      }

      if (column.title === toColumn) {
        return {
          ...column,
          cards: [...column.cards, cardTitle],
        };
      }

      return column;
    });

    updateColumns(newColumns);
  };

  const updateColumns = (newColumns: BoardColumn[]) => {
    setColumns(newColumns);
    updateStorage(newColumns);
  };

  const sortedColumns = [...columns].sort((a, b) => {
    return a.position - b.position;
  });

  return (
    <div className="columns-list">
      {sortedColumns.map((column, i) => (
        <Column
          cards={column.cards}
          key={i}
          position={column.position}
          title={column.title}
          updateCards={onUpdateCards}
          moveCard={onMoveCard}
          setColumns={updateColumns}
        />
      ))}
      <div className="column column--add">
        <AddContent
          contentType="column"
          hasContent={columns.length > 0}
          onSaveContent={onSaveColumn}
        />
      </div>
    </div>
  );
};

export default Columns;
