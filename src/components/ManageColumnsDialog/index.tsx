import { Button } from '@base-ui/react/button';
import { Field } from '@base-ui/react/field';
import { Menu } from '@base-ui/react/menu';
import {
  ArrowDown,
  ArrowUp,
  ChevronsDown,
  ChevronsUp,
  Ellipsis,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { Fragment, useEffect, useReducer, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';

import { useLocalization } from '../../LocalizationProvider';
import { COLUMN_TITLE_LIMIT } from '../../board/constants';
import type { ColumnMoveDirection } from '../../board/columns';
import type { BoardColumn } from '../../types';
import ConfirmDialog from '../ConfirmDialog';
import DialogShell from '../DialogShell';
import { InlineEmptyState } from '../EmptyState';
import AddColumnDialog from '../Columns/AddColumnDialog';
import ActionGroup from '../IconButton/ActionGroup';

import './ManageColumnsDialog.css';
import '../IconButton/IconButton.css';

type ManageColumnsDialogProps = {
  columns: BoardColumn[];
  deleteColumn: (columnId: string) => void;
  moveColumn: (columnId: string, direction: ColumnMoveDirection) => void;
  onAddColumnSave: (title: string) => string | void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  renameColumn: (columnId: string, title: string) => string | void;
};

type ColumnManagerState = {
  editError: string;
  editingColumnId: string | null;
  editingColumnTitle: string;
};

type ColumnManagerAction =
  | { type: 'editErrorChanged'; error: string }
  | { type: 'editTitleChanged'; title: string }
  | { type: 'editingCanceled' }
  | { type: 'renameStarted'; column: BoardColumn }
  | { type: 'renamed' }
  | { type: 'reset' };

type ColumnAction = {
  disabled: boolean;
  icon: ReactNode;
  id: 'first' | 'previous' | 'next' | 'last' | 'rename' | 'delete';
  label: string;
  onSelect: () => void;
};

const initialColumnManagerState: ColumnManagerState = {
  editError: '',
  editingColumnId: null,
  editingColumnTitle: '',
};

const columnManagerReducer = (
  state: ColumnManagerState,
  action: ColumnManagerAction
): ColumnManagerState => {
  switch (action.type) {
    case 'editErrorChanged':
      return { ...state, editError: action.error };
    case 'editTitleChanged':
      return { ...state, editError: '', editingColumnTitle: action.title };
    case 'editingCanceled':
    case 'renamed':
      return initialColumnManagerState;
    case 'renameStarted':
      return {
        editError: '',
        editingColumnId: action.column.id,
        editingColumnTitle: action.column.title,
      };
    case 'reset':
      return initialColumnManagerState;
  }
};

const ManageColumnsDialog = ({
  columns,
  deleteColumn,
  moveColumn,
  onAddColumnSave,
  onOpenChange,
  open,
  renameColumn,
}: ManageColumnsDialogProps) => {
  const { messages } = useLocalization();
  const [state, dispatch] = useReducer(
    columnManagerReducer,
    initialColumnManagerState
  );
  const [deleteColumnTarget, setDeleteColumnTarget] =
    useState<BoardColumn | null>(null);
  const [addColumnOpen, setAddColumnOpen] = useState(false);
  const addColumnTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [menuPortalContainer, setMenuPortalContainer] =
    useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      dispatch({ type: 'reset' });
    }
  }, [open]);

  const saveRename = (
    columnId: string,
    options?: { revertInvalid?: boolean }
  ) => {
    const error = renameColumn(columnId, state.editingColumnTitle.trim());

    if (error) {
      if (options?.revertInvalid) {
        dispatch({ type: 'editingCanceled' });
        return;
      }

      dispatch({ error, type: 'editErrorChanged' });
      return;
    }

    dispatch({ type: 'renamed' });
  };
  return (
    <>
      <DialogShell
        closeLabel={messages.board.closeColumnManager}
        description={messages.board.manageColumnsDescription}
        onOpenChange={onOpenChange}
        open={open}
        popupClassName="dialog-popup--column-management"
        title={messages.board.manageColumns}
        viewportRef={setMenuPortalContainer}
      >
        <div className="column-manager">
          {columns.length > 0 ? (
            <div className="column-manager__list">
              {columns.map((column, index) => {
                const isFirst = index === 0;
                const isLast = index === columns.length - 1;
                const isEditing = state.editingColumnId === column.id;
                const actions: ColumnAction[] = [
                  {
                    disabled: isFirst,
                    icon: <ChevronsUp size={16} />,
                    id: 'first',
                    label: messages.board.moveColumnToTop(column.title),
                    onSelect: () => moveColumn(column.id, 'first'),
                  },
                  {
                    disabled: isFirst,
                    icon: <ArrowUp size={16} />,
                    id: 'previous',
                    label: messages.board.moveColumnUp(column.title),
                    onSelect: () => moveColumn(column.id, 'previous'),
                  },
                  {
                    disabled: isLast,
                    icon: <ArrowDown size={16} />,
                    id: 'next',
                    label: messages.board.moveColumnDown(column.title),
                    onSelect: () => moveColumn(column.id, 'next'),
                  },
                  {
                    disabled: isLast,
                    icon: <ChevronsDown size={16} />,
                    id: 'last',
                    label: messages.board.moveColumnToBottom(column.title),
                    onSelect: () => moveColumn(column.id, 'last'),
                  },
                  {
                    disabled: false,
                    icon: <Pencil size={16} />,
                    id: 'rename',
                    label: messages.board.renameColumnAction(column.title),
                    onSelect: () => dispatch({ column, type: 'renameStarted' }),
                  },
                  {
                    disabled: false,
                    icon: <Trash2 size={16} />,
                    id: 'delete',
                    label: messages.board.deleteColumnAction(column.title),
                    onSelect: () => setDeleteColumnTarget(column),
                  },
                ];

                return (
                  <div
                    className={`column-manager__item${isEditing ? ' column-manager__item--editing' : ''}`}
                    key={column.id}
                  >
                    {isEditing ? (
                      <Field.Root
                        className="column-manager__edit-field"
                        invalid={Boolean(state.editError)}
                      >
                        <Field.Control
                          aria-label={messages.board.renameColumnAction(
                            column.title
                          )}
                          autoFocus
                          className="dialog-input column-manager__edit-input"
                          maxLength={COLUMN_TITLE_LIMIT}
                          onBlur={() =>
                            saveRename(column.id, { revertInvalid: true })
                          }
                          onKeyDown={(
                            event: KeyboardEvent<HTMLInputElement>
                          ) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              event.stopPropagation();
                              saveRename(column.id);
                            }

                            if (event.key === 'Escape') {
                              event.preventDefault();
                              event.stopPropagation();
                              dispatch({ type: 'editingCanceled' });
                            }
                          }}
                          onValueChange={(title) =>
                            dispatch({ title, type: 'editTitleChanged' })
                          }
                          type="text"
                          value={state.editingColumnTitle}
                        />
                        <Field.Error
                          className="column-manager__edit-error dialog-error"
                          match={Boolean(state.editError)}
                        >
                          {state.editError}
                        </Field.Error>
                      </Field.Root>
                    ) : (
                      <>
                        <div className="column-manager__summary">
                          <span className="column-manager__title">
                            {column.title}
                          </span>
                          <span className="column-manager__meta">
                            {messages.board.cardCount(column.cards.length)}
                          </span>
                        </div>
                        <ActionGroup className="column-manager__desktop-actions">
                          {actions.map((action) => (
                            <Button
                              aria-label={action.label}
                              className={`icon-button${action.id === 'delete' ? ' column-manager__delete' : ''}`}
                              disabled={action.disabled}
                              key={action.id}
                              onClick={action.onSelect}
                              type="button"
                            >
                              {action.icon}
                            </Button>
                          ))}
                        </ActionGroup>
                        <Menu.Root>
                          <Menu.Trigger
                            aria-label={messages.board.columnActions(
                              column.title
                            )}
                            className="column-manager__mobile-actions icon-button"
                            render={<Button />}
                          >
                            <Ellipsis size={16} />
                          </Menu.Trigger>
                          <Menu.Portal container={menuPortalContainer}>
                            <Menu.Positioner
                              className="column-manager__menu-positioner"
                              sideOffset={4}
                            >
                              <Menu.Popup className="menu-popup">
                                {actions.map((action) => (
                                  <Fragment key={action.id}>
                                    {action.id === 'delete' && (
                                      <div
                                        aria-hidden="true"
                                        className="menu-separator"
                                      />
                                    )}
                                    <Menu.Item
                                      className={`menu-item${action.id === 'delete' ? ' menu-item--danger' : ''}`}
                                      disabled={action.disabled}
                                      onClick={action.onSelect}
                                    >
                                      {action.icon}
                                      {action.label}
                                    </Menu.Item>
                                  </Fragment>
                                ))}
                              </Menu.Popup>
                            </Menu.Positioner>
                          </Menu.Portal>
                        </Menu.Root>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <InlineEmptyState variant="surface">
              {messages.board.emptyColumnManager}
            </InlineEmptyState>
          )}
          <Button
            className="button button--subtle column-manager__add"
            onClick={() => setAddColumnOpen(true)}
            ref={addColumnTriggerRef}
            type="button"
          >
            <Plus size={15} />
            <span>{messages.board.addColumn}</span>
          </Button>
          <AddColumnDialog
            finalFocus={addColumnTriggerRef}
            onOpenChange={setAddColumnOpen}
            onSave={onAddColumnSave}
            open={addColumnOpen}
          />
        </div>
      </DialogShell>
      <ConfirmDialog
        confirmLabel={messages.board.deleteColumn}
        description={
          deleteColumnTarget
            ? messages.board.deleteColumnDescription(
                deleteColumnTarget.cards.length,
                deleteColumnTarget.title
              )
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
        title={messages.board.deleteColumnTitle}
      />
    </>
  );
};

export default ManageColumnsDialog;
