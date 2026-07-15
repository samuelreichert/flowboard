import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { Button } from '@base-ui/react/button';
import { Columns3, Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import CardComposer from '../CardComposer';
import Column from '../Column';
import ContentDialog from '../ContentDialog';
import { InlineEmptyState } from '../EmptyState';
import ManageColumnsDialog from '../ManageColumnsDialog';
import {
  isCardDragData,
  isCardDropTargetData,
  isColumnDropTargetData,
  reorderCard,
} from '../../dnd';
import { moveColumn, normalizeColumnOrder } from '../../board/columns';
import { findActiveCardRouteTarget } from '../../board/routeLookup';
import { fetchStorage, updateStorage } from '../../storage';
import type { CardDialogValues } from '../CardDialog';
import type { BoardColumn, BoardTag } from '../../types';

import './Columns.css';

const createId = () => crypto.randomUUID();

type ColumnsProps = {
  activeCardId: string | null;
  boardLoading: boolean;
  manageColumnsOpen: boolean;
  onActiveCardClose: () => void;
  onBoardStateChange: () => void;
  onColumnCountChange: (count: number) => void;
  onManageColumnsOpenChange: (open: boolean) => void;
  onTagsChange: (tags: BoardTag[]) => void;
  tags: BoardTag[];
};

const Columns = ({
  activeCardId,
  boardLoading,
  manageColumnsOpen,
  onActiveCardClose,
  onBoardStateChange,
  onColumnCountChange,
  onManageColumnsOpenChange,
  onTagsChange,
  tags,
}: ColumnsProps) => {
  const [columns, setColumns] = useState<BoardColumn[]>(() =>
    normalizeColumnOrder(fetchStorage())
  );
  const [addColumnOpen, setAddColumnOpen] = useState(false);

  const updateColumns = useCallback(
    (newColumns: BoardColumn[]) => {
      const normalizedColumns = normalizeColumnOrder(newColumns);

      setColumns(normalizedColumns);
      updateStorage(normalizedColumns);
      onColumnCountChange(normalizedColumns.length);
      onBoardStateChange();
    },
    [onBoardStateChange, onColumnCountChange]
  );

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

  const onMoveColumn = (
    columnId: string,
    direction: Parameters<typeof moveColumn>[2]
  ) => {
    updateColumns(moveColumn(columns, columnId, direction));
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
                  content: values.content,
                  createdAt: new Date().toISOString(),
                  id: createId(),
                  priority: values.priority,
                  tagIds: values.tagIds,
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
      content: values.content,
      priority: values.priority,
      tagIds: values.tagIds,
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
    [columns, updateColumns]
  );

  const sortedColumns = columns.toSorted(
    (first, second) => first.position - second.position
  );
  const activeCardTarget = activeCardId
    ? findActiveCardRouteTarget(sortedColumns, activeCardId)
    : null;

  return (
    <>
      <div className="columns-board">
        {activeCardId && !activeCardTarget && !boardLoading && (
          <InlineEmptyState
            className="columns-board__route-missing"
            variant="surface"
          >
            Card not found.
          </InlineEmptyState>
        )}
        <div className="columns-list">
          {sortedColumns.map((column) => (
            <Column
              activeCardId={activeCardId}
              column={column}
              columns={sortedColumns}
              deleteCard={onDeleteCard}
              deleteColumn={onDeleteColumn}
              editCard={onEditCard}
              key={column.id}
              moveColumn={onMoveColumn}
              onActiveCardClose={onActiveCardClose}
              onTagsChange={onTagsChange}
              renameColumn={onRenameColumn}
              tags={tags}
            />
          ))}
          <Button
            className="add-column-placeholder"
            onClick={() => setAddColumnOpen(true)}
          >
            <Plus size={16} />
            Add another column
          </Button>
        </div>
        <div className="card-composer-dock">
          <CardComposer
            columns={sortedColumns}
            onAddColumnClick={() => setAddColumnOpen(true)}
            onSave={onSaveCard}
            onTagsChange={onTagsChange}
            tags={tags}
          />
        </div>
      </div>
      <ManageColumnsDialog
        columns={sortedColumns}
        deleteColumn={onDeleteColumn}
        moveColumn={onMoveColumn}
        onAddColumnClick={() => setAddColumnOpen(true)}
        onOpenChange={onManageColumnsOpenChange}
        open={manageColumnsOpen}
        renameColumn={onRenameColumn}
      />
      <ContentDialog
        description="Give the next stage of your workflow a clear name."
        hideCancel
        label="Column title"
        leadingIcon={<Columns3 size={15} />}
        onOpenChange={setAddColumnOpen}
        onSave={onSaveColumn}
        open={addColumnOpen}
        placeholder="Ready for review"
        submitLabel="Add column"
        title="Add column"
      />
    </>
  );
};

export default Columns;
