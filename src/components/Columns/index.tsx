import { useState } from 'react';

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
import type { CardDialogValues } from '../CardDialog';
import CardComposer from '../CardComposer';
import ManageColumnsDialog from '../ManageColumnsDialog';
import type { BoardColumn, BoardTag } from '../../types';
import ActiveCardMissingState from './ActiveCardMissingState';
import AddColumnDialog from './AddColumnDialog';
import ColumnList from './ColumnList';
import { useColumnsDragMonitor } from './useColumnsDragMonitor';

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

  useColumnsDragMonitor({ columns, onColumnsChange });

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

  const sortedColumns = columns.toSorted(
    (first, second) => first.position - second.position
  );
  const activeCardTarget = activeCardId
    ? findActiveCardRouteTarget(sortedColumns, activeCardId)
    : null;

  return (
    <>
      <div className="columns-board">
        <ActiveCardMissingState
          activeCardId={activeCardId}
          boardLoading={boardLoading}
          hasActiveCardTarget={Boolean(activeCardTarget)}
        />
        <ColumnList
          activeCardId={activeCardId}
          columns={sortedColumns}
          deleteCard={onDeleteCard}
          deleteColumn={onDeleteColumn}
          editCard={onEditCard}
          moveColumn={onMoveColumn}
          onActiveCardClose={onActiveCardClose}
          onAddColumnClick={() => setAddColumnOpen(true)}
          onTagsChange={onTagsChange}
          renameColumn={onRenameColumn}
          tags={tags}
        />
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
      <AddColumnDialog
        onOpenChange={setAddColumnOpen}
        onSave={onSaveColumn}
        open={addColumnOpen}
      />
    </>
  );
};

export default Columns;
