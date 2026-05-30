import { Button } from '@base-ui/react/button';
import { Plus, RotateCcw } from 'lucide-react';
import { useState } from 'react';

import Column from '../Column';
import ConfirmDialog from '../ConfirmDialog';
import ContentDialog from '../ContentDialog';
import { fetchStorage, updateStorage } from '../../storage';
import type { BoardCard, BoardColumn } from '../../types';

import './Columns.css';

const createId = () => crypto.randomUUID();

const Columns = () => {
  const [columns, setColumns] = useState<BoardColumn[]>(fetchStorage);
  const [addColumnOpen, setAddColumnOpen] = useState(false);
  const [clearBoardOpen, setClearBoardOpen] = useState(false);

  const updateColumns = (newColumns: BoardColumn[]) => {
    setColumns(newColumns);
    updateStorage(newColumns);
  };

  const onSaveColumn = (title: string) => {
    if (!title) {
      return 'Enter a column title.';
    }

    if (
      columns.some(
        (column) => column.title.toLowerCase() === title.toLowerCase()
      )
    ) {
      return 'Column titles must be unique.';
    }

    updateColumns([
      ...columns,
      { id: createId(), title, cards: [], position: columns.length * 10 },
    ]);
  };

  const onRenameColumn = (columnId: string, title: string) => {
    if (!title) {
      return 'Enter a column title.';
    }

    if (
      columns.some(
        (column) =>
          column.id !== columnId &&
          column.title.toLowerCase() === title.toLowerCase()
      )
    ) {
      return 'Column titles must be unique.';
    }

    updateColumns(
      columns.map((column) =>
        column.id === columnId ? { ...column, title } : column
      )
    );
  };

  const onDeleteColumn = (columnId: string) => {
    updateColumns(columns.filter((column) => column.id !== columnId));
  };

  const onSaveCard = (columnId: string, title: string) => {
    if (!title) {
      return 'Enter a card title.';
    }

    updateColumns(
      columns.map((column) =>
        column.id === columnId
          ? {
              ...column,
              cards: [...column.cards, { id: createId(), title }],
            }
          : column
      )
    );
  };

  const onEditCard = (columnId: string, cardId: string, title: string) => {
    if (!title) {
      return 'Enter a card title.';
    }

    updateColumns(
      columns.map((column) =>
        column.id === columnId
          ? {
              ...column,
              cards: column.cards.map((card) =>
                card.id === cardId ? { ...card, title } : card
              ),
            }
          : column
      )
    );
  };

  const onDeleteCard = (columnId: string, cardId: string) => {
    updateColumns(
      columns.map((column) =>
        column.id === columnId
          ? {
              ...column,
              cards: column.cards.filter((card) => card.id !== cardId),
            }
          : column
      )
    );
  };

  const onMoveCard = (
    cardId: string,
    fromColumnId: string,
    toColumnId: string
  ) => {
    if (fromColumnId === toColumnId) {
      return;
    }

    const sourceColumn = columns.find((column) => column.id === fromColumnId);
    const card = sourceColumn?.cards.find((item) => item.id === cardId);

    if (!card) {
      return;
    }

    updateColumns(
      columns.map((column) => {
        if (column.id === fromColumnId) {
          return {
            ...column,
            cards: column.cards.filter((item) => item.id !== cardId),
          };
        }

        if (column.id === toColumnId) {
          return { ...column, cards: [...column.cards, card] };
        }

        return column;
      })
    );
  };

  const sortedColumns = [...columns].sort(
    (first, second) => first.position - second.position
  );

  return (
    <>
      <div className="board-toolbar">
        <Button
          className="button button--primary"
          onClick={() => setAddColumnOpen(true)}
        >
          <Plus size={16} />
          Add another column
        </Button>
        {columns.length > 0 && (
          <Button
            className="button button--subtle"
            onClick={() => setClearBoardOpen(true)}
          >
            <RotateCcw size={16} />
            Clear board
          </Button>
        )}
      </div>
      <div className="columns-list">
        {sortedColumns.map((column) => (
          <Column
            column={column}
            columns={sortedColumns}
            deleteCard={onDeleteCard}
            deleteColumn={onDeleteColumn}
            editCard={onEditCard}
            key={column.id}
            moveCard={onMoveCard}
            renameColumn={onRenameColumn}
            saveCard={onSaveCard}
          />
        ))}
      </div>
      <ContentDialog
        description="Give the next stage of your workflow a clear name."
        label="Column title"
        onOpenChange={setAddColumnOpen}
        onSave={onSaveColumn}
        open={addColumnOpen}
        submitLabel="Add column"
        title="Add column"
      />
      <ConfirmDialog
        confirmLabel="Clear board"
        description={`This will permanently delete ${columns.length} columns and all of their cards.`}
        onConfirm={() => updateColumns([])}
        onOpenChange={setClearBoardOpen}
        open={clearBoardOpen}
        title="Clear this board?"
      />
    </>
  );
};

export default Columns;
