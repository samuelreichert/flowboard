import { Button } from '@base-ui/react/button';
import {
  ArrowDown,
  ArrowUp,
  ChevronsDown,
  ChevronsUp,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

import type { ColumnMoveDirection } from '../../board/columns';
import type { BoardColumn } from '../../types';
import ColumnRenameDialog from '../ColumnRenameDialog';
import ConfirmDialog from '../ConfirmDialog';
import DialogShell from '../DialogShell';
import { InlineEmptyState } from '../EmptyState';

import './ManageColumnsDialog.css';
import '../IconButton/IconButton.css';

type ManageColumnsDialogProps = {
  columns: BoardColumn[];
  deleteColumn: (columnId: string) => void;
  moveColumn: (columnId: string, direction: ColumnMoveDirection) => void;
  onAddColumnClick: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  renameColumn: (columnId: string, title: string) => string | void;
};

const ManageColumnsDialog = ({
  columns,
  deleteColumn,
  moveColumn,
  onAddColumnClick,
  onOpenChange,
  open,
  renameColumn,
}: ManageColumnsDialogProps) => {
  const [renameColumnTarget, setRenameColumnTarget] =
    useState<BoardColumn | null>(null);
  const [deleteColumnTarget, setDeleteColumnTarget] =
    useState<BoardColumn | null>(null);

  const startAddColumn = () => {
    onOpenChange(false);
    onAddColumnClick();
  };

  return (
    <>
      <DialogShell
        closeLabel="Close column manager"
        description="Reorder and edit the columns on this board."
        onOpenChange={onOpenChange}
        open={open}
        popupClassName="dialog-popup--column-management"
        title="Manage columns"
      >
        <div className="column-manager">
          {columns.length > 0 ? (
            <div className="column-manager__list">
              {columns.map((column, index) => {
                const isFirst = index === 0;
                const isLast = index === columns.length - 1;

                return (
                  <div className="column-manager__item" key={column.id}>
                    <div className="column-manager__summary">
                      <span className="column-manager__title">
                        {column.title}
                      </span>
                      <span className="column-manager__meta">
                        {column.cards.length}{' '}
                        {column.cards.length === 1 ? 'card' : 'cards'}
                      </span>
                    </div>
                    <div className="column-manager__actions">
                      <Button
                        aria-label={`Move ${column.title} to top`}
                        className="icon-button"
                        disabled={isFirst}
                        onClick={() => moveColumn(column.id, 'first')}
                        type="button"
                      >
                        <ChevronsUp size={16} />
                      </Button>
                      <Button
                        aria-label={`Move ${column.title} up`}
                        className="icon-button"
                        disabled={isFirst}
                        onClick={() => moveColumn(column.id, 'previous')}
                        type="button"
                      >
                        <ArrowUp size={16} />
                      </Button>
                      <Button
                        aria-label={`Move ${column.title} down`}
                        className="icon-button"
                        disabled={isLast}
                        onClick={() => moveColumn(column.id, 'next')}
                        type="button"
                      >
                        <ArrowDown size={16} />
                      </Button>
                      <Button
                        aria-label={`Move ${column.title} to bottom`}
                        className="icon-button"
                        disabled={isLast}
                        onClick={() => moveColumn(column.id, 'last')}
                        type="button"
                      >
                        <ChevronsDown size={16} />
                      </Button>
                      <Button
                        aria-label={`Rename ${column.title} column`}
                        className="icon-button"
                        onClick={() => setRenameColumnTarget(column)}
                        type="button"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        aria-label={`Delete ${column.title} column`}
                        className="icon-button column-manager__delete"
                        onClick={() => setDeleteColumnTarget(column)}
                        type="button"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <InlineEmptyState variant="surface">
              Create a column before arranging this board.
            </InlineEmptyState>
          )}
          <Button
            className="button button--subtle column-manager__add"
            onClick={startAddColumn}
            type="button"
          >
            <Plus size={15} />
            <span>Add column</span>
          </Button>
        </div>
      </DialogShell>
      <ColumnRenameDialog
        initialValue={renameColumnTarget?.title ?? ''}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setRenameColumnTarget(null);
          }
        }}
        onSave={(title) =>
          renameColumnTarget
            ? renameColumn(renameColumnTarget.id, title)
            : undefined
        }
        open={Boolean(renameColumnTarget)}
      />
      <ConfirmDialog
        confirmLabel="Delete column"
        description={
          deleteColumnTarget
            ? `This will permanently delete ${deleteColumnTarget.cards.length} ${deleteColumnTarget.cards.length === 1 ? 'card' : 'cards'} in ${deleteColumnTarget.title}.`
            : ''
        }
        onConfirm={() => {
          if (deleteColumnTarget) {
            deleteColumn(deleteColumnTarget.id);
            setDeleteColumnTarget(null);
          }
        }}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setDeleteColumnTarget(null);
          }
        }}
        open={Boolean(deleteColumnTarget)}
        title="Delete this column?"
      />
    </>
  );
};

export default ManageColumnsDialog;
