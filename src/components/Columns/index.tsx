import { useCallback, useState } from 'react';

import { useLocalization } from '../../LocalizationProvider';
import { moveColumn } from '../../board/columns';
import {
  createCard,
  createColumn,
  deleteCard,
  deleteColumn,
  editCard,
  renameColumn,
} from '../../board/commands';
import { findActiveCardRouteTarget } from '../../board/routeLookup';
import type { CardDialogSaveValues, CardDialogValues } from '../CardDialog';
import CardComposer from '../CardComposer';
import ManageColumnsDialog from '../ManageColumnsDialog';
import type { useFlowboardBoardMutations } from '../../app/useFlowboardBoardMutations';
import type {
  MoveCardMutationVariables,
  useFlowboardCardMutations,
} from '../../app/useFlowboardCardMutations';
import { fetchStorage } from '../../storage';
import type { BoardColumn, BoardTag } from '../../types';
import { EmptyState } from '../EmptyState';
import ActiveCardMissingState from './ActiveCardMissingState';
import AddColumnDialog from './AddColumnDialog';
import ColumnList from './ColumnList';
import { useColumnsDragMonitor } from './useColumnsDragMonitor';
import { useHorizontalOverflow } from './useHorizontalOverflow';

import './Columns.css';

const createId = () => crypto.randomUUID();

type ColumnsProps = {
  activeCardId: string | null;
  boardLoading: boolean;
  boardMutations: ReturnType<typeof useFlowboardBoardMutations>;
  cardDetailAccessToken?: string;
  cardMutations: ReturnType<typeof useFlowboardCardMutations>;
  columns: BoardColumn[];
  manageColumnsOpen: boolean;
  onActiveCardClose: () => void;
  onCardColumnsChange: (columns: BoardColumn[]) => void;
  onColumnsChange: (columns: BoardColumn[]) => void;
  onManageColumnsOpenChange: (open: boolean) => void;
  onPreferredColumnChange: (columnId: string) => void;
  onTagsChange: (tags: BoardTag[]) => void;
  preferredColumnId: string;
  tags: BoardTag[];
};

const getColumnPlacement = (nextColumns: BoardColumn[], columnId: string) => {
  const orderedColumns = nextColumns.toSorted(
    (first, second) => first.position - second.position
  );
  const columnIndex = orderedColumns.findIndex(
    (column) => column.id === columnId
  );
  const nextColumn = orderedColumns[columnIndex + 1];
  const previousColumn = orderedColumns[columnIndex - 1];

  return {
    afterColumnId: nextColumn ? null : (previousColumn?.id ?? null),
    beforeColumnId: nextColumn?.id ?? null,
  };
};

const Columns = ({
  activeCardId,
  boardLoading,
  boardMutations,
  cardDetailAccessToken,
  cardMutations,
  columns,
  manageColumnsOpen,
  onActiveCardClose,
  onCardColumnsChange,
  onColumnsChange,
  onManageColumnsOpenChange,
  onPreferredColumnChange,
  onTagsChange,
  preferredColumnId,
  tags,
}: ColumnsProps) => {
  const { messages } = useLocalization();
  const [addColumnOpen, setAddColumnOpen] = useState(false);

  const moveCard = useCallback(
    ({
      cardId,
      nextColumns,
      placement,
    }: MoveCardMutationVariables & { nextColumns: BoardColumn[] }) => {
      onCardColumnsChange(nextColumns);
      cardMutations.moveCard({ cardId, placement });
    },
    [cardMutations, onCardColumnsChange]
  );

  useColumnsDragMonitor({ columns, onCardMove: moveCard });

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

    const id = createId();

    onColumnsChange(createColumn(columns, { id, title }));
    boardMutations.createColumn({ id, title });
  };

  const openAddColumn = () => setAddColumnOpen(true);

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
    boardMutations.updateColumn({
      column: { title },
      columnId,
    });
  };

  const onDeleteColumn = (columnId: string) => {
    onColumnsChange(deleteColumn(columns, columnId));
    boardMutations.deleteColumn({ columnId });
  };

  const onMoveColumn = (
    columnId: string,
    direction: Parameters<typeof moveColumn>[2]
  ) => {
    const nextColumns = moveColumn(columns, columnId, direction);

    onColumnsChange(nextColumns);
    boardMutations.moveColumn({
      columnId,
      placement: getColumnPlacement(nextColumns, columnId),
    });
  };

  const onSaveCard = (values: CardDialogValues) => {
    if (!values.title) {
      return messages.card.titleRequired;
    }

    const createdAt = new Date().toISOString();
    const id = createId();
    const latestColumns = fetchStorage();

    onCardColumnsChange(
      createCard(latestColumns, {
        ...values,
        createdAt,
        id,
      })
    );
    cardMutations.createCard({
      ...values,
      createdAt,
      id,
    });
  };

  const onEditCard = (
    sourceColumnId: string,
    cardId: string,
    values: CardDialogSaveValues
  ) => {
    if (!values.title) {
      return messages.card.titleRequired;
    }

    const latestColumns = fetchStorage();
    const existingCard = latestColumns
      .find((column) => column.id === sourceColumnId)
      ?.cards.find((card) => card.id === cardId);

    onCardColumnsChange(
      editCard(latestColumns, sourceColumnId, cardId, values)
    );

    if (values.changedFields) {
      const {
        columnId: _columnId,
        tagIds,
        ...cardFields
      } = values.changedFields;

      if (Object.keys(cardFields).length > 0) {
        cardMutations.updateCard({
          card: cardFields,
          cardId,
        });
      }

      if (tagIds) {
        const previousTagIds = new Set(existingCard?.tagIds ?? []);
        const nextTagIds = new Set(tagIds);

        for (const tagId of tagIds) {
          if (!previousTagIds.has(tagId)) {
            boardMutations.assignCardTag({ cardId, tagId });
          }
        }

        for (const tagId of previousTagIds) {
          if (!nextTagIds.has(tagId)) {
            boardMutations.unassignCardTag({ cardId, tagId });
          }
        }
      }
    }

    if (sourceColumnId !== values.columnId) {
      cardMutations.moveCard({
        cardId,
        placement: {
          afterCardId: null,
          beforeCardId: null,
          columnId: values.columnId,
        },
      });
    }
  };

  const onDeleteCard = (columnId: string, cardId: string) => {
    onCardColumnsChange(deleteCard(fetchStorage(), columnId, cardId));
    cardMutations.deleteCard({ cardId });
  };

  const sortedColumns = columns.toSorted(
    (first, second) => first.position - second.position
  );
  const horizontalOverflow = useHorizontalOverflow(sortedColumns.length);
  const activeCardTarget = activeCardId
    ? findActiveCardRouteTarget(sortedColumns, activeCardId)
    : null;

  if (boardLoading) {
    return (
      <div aria-busy="true" className="columns-board">
        <div aria-live="polite" className="columns-list columns-list--empty">
          <EmptyState title={messages.app.toast.loadingBoard}>
            {messages.app.persistence.loadingBoard}
          </EmptyState>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="columns-board"
        data-horizontal-overflow={horizontalOverflow.hasOverflow || undefined}
      >
        <ActiveCardMissingState
          activeCardId={activeCardId}
          boardLoading={boardLoading}
          hasActiveCardTarget={Boolean(activeCardTarget)}
        />
        <ColumnList
          activeCardId={activeCardId}
          cardDetailAccessToken={cardDetailAccessToken}
          columns={sortedColumns}
          deleteCard={onDeleteCard}
          deleteColumn={onDeleteColumn}
          editCard={onEditCard}
          moveColumn={onMoveColumn}
          onActiveCardClose={onActiveCardClose}
          onAddColumnClick={openAddColumn}
          onTagsChange={onTagsChange}
          renameColumn={onRenameColumn}
          tags={tags}
          horizontalOverflow={horizontalOverflow}
        />
        <div className="card-composer-dock">
          <CardComposer
            columns={sortedColumns}
            onAddColumnClick={openAddColumn}
            onPreferredColumnChange={onPreferredColumnChange}
            onSave={onSaveCard}
            onTagsChange={onTagsChange}
            preferredColumnId={preferredColumnId}
            tags={tags}
          />
        </div>
      </div>
      <ManageColumnsDialog
        columns={sortedColumns}
        deleteColumn={onDeleteColumn}
        moveColumn={onMoveColumn}
        onAddColumnSave={onSaveColumn}
        onOpenChange={onManageColumnsOpenChange}
        open={manageColumnsOpen}
        renameColumn={onRenameColumn}
      />
      <AddColumnDialog
        onOpenChange={setAddColumnOpen}
        onSave={onSaveColumn}
        open={addColumnOpen}
      />
    </>
  );
};

export default Columns;
