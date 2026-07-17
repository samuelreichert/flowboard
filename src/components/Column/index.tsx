import { Button } from '@base-ui/react/button';
import { Menu } from '@base-ui/react/menu';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Ellipsis,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useReducer, useRef } from 'react';

import { useLocalization } from '../../LocalizationProvider';
import { useColumnDropTarget } from './useColumnDropTarget';
import Card from '../Card';
import ColumnRenameDialog from '../ColumnRenameDialog';
import ConfirmDialog from '../ConfirmDialog';
import type { CardDialogValues } from '../CardDialog';
import type { ColumnMoveDirection } from '../../board/columns';
import type { BoardColumn, BoardTag } from '../../types';

import './Column.css';
import '../IconButton/IconButton.css';

type ColumnProps = {
  activeCardId: string | null;
  column: BoardColumn;
  columns: BoardColumn[];
  deleteCard: (columnId: string, cardId: string) => void;
  deleteColumn: (columnId: string) => void;
  editCard: (
    columnId: string,
    cardId: string,
    values: CardDialogValues
  ) => string | void;
  moveColumn: (columnId: string, direction: ColumnMoveDirection) => void;
  onTagsChange: (tags: BoardTag[]) => void;
  onActiveCardClose: () => void;
  renameColumn: (columnId: string, title: string) => string | void;
  tags: BoardTag[];
};

type ColumnState = {
  deleteOpen: boolean;
  renameOpen: boolean;
};

type ColumnAction =
  | { type: 'deleteOpenChanged'; open: boolean }
  | { type: 'renameOpenChanged'; open: boolean };

const columnReducer = (
  state: ColumnState,
  action: ColumnAction
): ColumnState => {
  switch (action.type) {
    case 'deleteOpenChanged':
      return { ...state, deleteOpen: action.open };
    case 'renameOpenChanged':
      return { ...state, renameOpen: action.open };
  }
};

const Column = ({
  activeCardId,
  column,
  columns,
  deleteCard,
  deleteColumn,
  editCard,
  moveColumn,
  onTagsChange,
  onActiveCardClose,
  renameColumn,
  tags,
}: ColumnProps) => {
  const { messages } = useLocalization();
  const columnRef = useRef<HTMLElement | null>(null);
  const [state, dispatch] = useReducer(columnReducer, {
    deleteOpen: false,
    renameOpen: false,
  });
  const { deleteOpen, renameOpen } = state;
  const columnIndex = columns.findIndex((item) => item.id === column.id);
  const isFirstColumn = columnIndex <= 0;
  const isLastColumn = columnIndex === columns.length - 1;
  const isDragOver = useColumnDropTarget({
    columnId: column.id,
    columnRef,
  });

  return (
    <>
      <section
        className={`column ${isDragOver ? 'column--drag-over' : ''}`}
        ref={columnRef}
      >
        <div className="column__header">
          <div className="column__heading">
            <span className="column__marker" />
            <h2 className="column__title">{column.title}</h2>
            <span className="column__count">{column.cards.length}</span>
          </div>
          <Menu.Root>
            <Menu.Trigger
              aria-label={messages.board.columnActions(column.title)}
              className="icon-button"
              render={<Button />}
            >
              <Ellipsis size={18} />
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner sideOffset={4}>
                <Menu.Popup className="menu-popup">
                  <Menu.Item
                    className="menu-item"
                    disabled={isFirstColumn}
                    onClick={() => moveColumn(column.id, 'first')}
                  >
                    <ChevronsLeft size={15} />
                    {messages.board.moveColumnToTop(column.title)}
                  </Menu.Item>
                  <Menu.Item
                    className="menu-item"
                    disabled={isFirstColumn}
                    onClick={() => moveColumn(column.id, 'previous')}
                  >
                    <ChevronLeft size={15} />
                    {messages.board.moveColumnUp(column.title)}
                  </Menu.Item>
                  <Menu.Item
                    className="menu-item"
                    disabled={isLastColumn}
                    onClick={() => moveColumn(column.id, 'next')}
                  >
                    <ChevronRight size={15} />
                    {messages.board.moveColumnDown(column.title)}
                  </Menu.Item>
                  <Menu.Item
                    className="menu-item"
                    disabled={isLastColumn}
                    onClick={() => moveColumn(column.id, 'last')}
                  >
                    <ChevronsRight size={15} />
                    {messages.board.moveColumnToBottom(column.title)}
                  </Menu.Item>
                  <Menu.Item
                    className="menu-item"
                    onClick={() =>
                      dispatch({ open: true, type: 'renameOpenChanged' })
                    }
                  >
                    <Pencil size={15} />
                    {messages.board.renameColumn}
                  </Menu.Item>
                  <Menu.Item
                    className="menu-item menu-item--danger"
                    onClick={() =>
                      dispatch({ open: true, type: 'deleteOpenChanged' })
                    }
                  >
                    <Trash2 size={15} />
                    {messages.board.deleteColumn}
                  </Menu.Item>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        </div>
        <div className="cards">
          {column.cards.map((card) => (
            <Card
              activeCardId={activeCardId}
              card={card}
              columnId={column.id}
              columns={columns}
              deleteCard={deleteCard}
              editCard={editCard}
              key={card.id}
              onActiveCardClose={onActiveCardClose}
              onTagsChange={onTagsChange}
              tags={tags}
            />
          ))}
        </div>
        {isDragOver && column.cards.length === 0 && (
          <div className="column__empty-drop-indicator">
            {messages.board.dropCardHere}
          </div>
        )}
      </section>
      <ColumnRenameDialog
        initialValue={column.title}
        onOpenChange={(open) => dispatch({ open, type: 'renameOpenChanged' })}
        onSave={(title) => renameColumn(column.id, title)}
        open={renameOpen}
      />
      <ConfirmDialog
        confirmLabel={messages.board.deleteColumn}
        description={messages.board.deleteColumnDescription(
          column.cards.length,
          column.title
        )}
        onConfirm={() => deleteColumn(column.id)}
        onOpenChange={(open) => dispatch({ open, type: 'deleteOpenChanged' })}
        open={deleteOpen}
        title={messages.board.deleteColumnTitle}
      />
    </>
  );
};

export default Column;
