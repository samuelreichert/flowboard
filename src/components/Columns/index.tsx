import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { Button } from '@base-ui/react/button';
import { Columns3, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useLocalization } from '../../LocalizationProvider';
import CardComposer from '../CardComposer';
import Column from '../Column';
import ContentDialog from '../ContentDialog';
import { InlineEmptyState } from '../EmptyState';
import ManageColumnsDialog from '../ManageColumnsDialog';
import {
  isCardDragData,
  isCardDropTargetData,
  isColumnDropTargetData,
} from '../../dnd';
import { moveColumn } from '../../board/columns';
import {
  createCard,
  createColumn,
  deleteCard,
  deleteColumn,
  editCard,
  renameColumn,
  reorderCard,
} from '../../board/commands';
import { findActiveCardRouteTarget } from '../../board/routeLookup';
import type { CardDialogValues } from '../CardDialog';
import type { BoardColumn, BoardTag } from '../../types';

import './Columns.css';

const createId = () => crypto.randomUUID();

type ColumnsProps = {
  activeCardId: string | null;
  boardLoading: boolean;
  columns: BoardColumn[];
  manageColumnsOpen: boolean;
  onActiveCardClose: () => void;
  onColumnsChange: (columns: BoardColumn[]) => void;
  onManageColumnsOpenChange: (open: boolean) => void;
  onTagsChange: (tags: BoardTag[]) => void;
  tags: BoardTag[];
};

const Columns = ({
  activeCardId,
  boardLoading,
  columns,
  manageColumnsOpen,
  onActiveCardClose,
  onColumnsChange,
  onManageColumnsOpenChange,
  onTagsChange,
  tags,
}: ColumnsProps) => {
  const { messages } = useLocalization();
  const [addColumnOpen, setAddColumnOpen] = useState(false);
  const onSaveColumn = (title: string) => {
    if (!title) {
      return messages.board.columnTitleRequired;
    }

    if (
      columns.some(
        (column) => column.title.toLowerCase() === title.toLowerCase()
      )
    ) {
      return messages.board.columnTitlesUnique;
    }

    onColumnsChange(createColumn(columns, { id: createId(), title }));
  };

  const onRenameColumn = (columnId: string, title: string) => {
    if (!title) {
      return messages.board.columnTitleRequired;
    }

    if (
      columns.some(
        (column) =>
          column.id !== columnId &&
          column.title.toLowerCase() === title.toLowerCase()
      )
    ) {
      return messages.board.columnTitlesUnique;
    }

    onColumnsChange(renameColumn(columns, columnId, title));
  };

  const onDeleteColumn = (columnId: string) => {
    onColumnsChange(deleteColumn(columns, columnId));
  };

  const onMoveColumn = (
    columnId: string,
    direction: Parameters<typeof moveColumn>[2]
  ) => {
    onColumnsChange(moveColumn(columns, columnId, direction));
  };

  const onSaveCard = (values: CardDialogValues) => {
    if (!values.title) {
      return messages.card.titleRequired;
    }

    onColumnsChange(
      createCard(columns, {
        ...values,
        createdAt: new Date().toISOString(),
        id: createId(),
      })
    );
  };

  const onEditCard = (
    sourceColumnId: string,
    cardId: string,
    values: CardDialogValues
  ) => {
    if (!values.title) {
      return messages.card.titleRequired;
    }

    onColumnsChange(editCard(columns, sourceColumnId, cardId, values));
  };

  const onDeleteCard = (columnId: string, cardId: string) => {
    onColumnsChange(deleteCard(columns, columnId, cardId));
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
            onColumnsChange(
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
            onColumnsChange(
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
    [columns, onColumnsChange]
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
            {messages.board.cardNotFound}
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
            {messages.board.addAnotherColumn}
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
        description={messages.board.addColumnDescription}
        hideCancel
        label={messages.board.columnTitle}
        leadingIcon={<Columns3 size={15} />}
        onOpenChange={setAddColumnOpen}
        onSave={onSaveColumn}
        open={addColumnOpen}
        placeholder={messages.board.readyForReview}
        submitLabel={messages.board.addColumn}
        title={messages.board.addColumn}
      />
    </>
  );
};

export default Columns;
