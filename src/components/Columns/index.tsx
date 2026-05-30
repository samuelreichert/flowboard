import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { Button } from '@base-ui/react/button';
import { Plus, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

import Column from '../Column';
import ConfirmDialog from '../ConfirmDialog';
import ContentDialog from '../ContentDialog';
import {
  isCardDragData,
  isCardDropTargetData,
  isColumnDropTargetData,
  reorderCard,
} from '../../dnd';
import { fetchStorage, updateStorage } from '../../storage';
import type { CardDialogValues } from '../CardDialog';
import type { BoardColumn } from '../../types';

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

  const onSaveCard = (values: CardDialogValues) => {
    if (!values.title) {
      return 'Enter a card title.';
    }

    updateColumns(
      columns.map((column) =>
        column.id === values.columnId
          ? {
              ...column,
              cards: [
                ...column.cards,
                {
                  description: values.description,
                  id: createId(),
                  title: values.title,
                },
              ],
            }
          : column
      )
    );
  };

  const onEditCard = (
    sourceColumnId: string,
    cardId: string,
    values: CardDialogValues
  ) => {
    if (!values.title) {
      return 'Enter a card title.';
    }

    const sourceColumn = columns.find((column) => column.id === sourceColumnId);
    const existingCard = sourceColumn?.cards.find((card) => card.id === cardId);

    if (!existingCard) {
      return;
    }

    const updatedCard = {
      ...existingCard,
      description: values.description,
      title: values.title,
    };

    updateColumns(
      columns.map((column) => {
        if (
          sourceColumnId === values.columnId &&
          column.id === sourceColumnId
        ) {
          return {
            ...column,
            cards: column.cards.map((card) =>
              card.id === cardId ? updatedCard : card
            ),
          };
        }

        if (column.id === sourceColumnId) {
          return {
            ...column,
            cards: column.cards.filter((card) => card.id !== cardId),
          };
        }

        if (column.id === values.columnId) {
          return {
            ...column,
            cards: [...column.cards, updatedCard],
          };
        }

        return column;
      })
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

  useEffect(
    () =>
      monitorForElements({
        canMonitor: ({ source }) => isCardDragData(source.data),
        onDrop: ({ location, source }) => {
          if (!isCardDragData(source.data)) {
            return;
          }

          const target = location.current.dropTargets[0];

          if (!target) {
            return;
          }

          if (isCardDropTargetData(target.data)) {
            updateColumns(
              reorderCard(columns, {
                cardId: source.data.cardId,
                closestEdge: extractClosestEdge(target.data),
                fromColumnId: source.data.columnId,
                targetCardId: target.data.cardId,
                toColumnId: target.data.columnId,
              })
            );
          }

          if (isColumnDropTargetData(target.data)) {
            updateColumns(
              reorderCard(columns, {
                cardId: source.data.cardId,
                closestEdge: null,
                fromColumnId: source.data.columnId,
                toColumnId: target.data.columnId,
              })
            );
          }
        },
      }),
    [columns]
  );

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
