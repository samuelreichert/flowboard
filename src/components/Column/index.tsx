import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { Button } from '@base-ui/react/button';
import { Menu } from '@base-ui/react/menu';
import { Ellipsis, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useReducer, useRef } from 'react';

import Card from '../Card';
import ColumnRenameDialog from '../ColumnRenameDialog';
import ConfirmDialog from '../ConfirmDialog';
import type { CardDialogValues } from '../CardDialog';
import { isCardDragData } from '../../dnd';
import type { BoardColumn, BoardTag } from '../../types';

import './Column.css';
import '../IconButton/IconButton.css';

type ColumnProps = {
  column: BoardColumn;
  columns: BoardColumn[];
  deleteCard: (columnId: string, cardId: string) => void;
  deleteColumn: (columnId: string) => void;
  editCard: (
    columnId: string,
    cardId: string,
    values: CardDialogValues
  ) => string | void;
  onTagsChange: (tags: BoardTag[]) => void;
  renameColumn: (columnId: string, title: string) => string | void;
  tags: BoardTag[];
};

type ColumnState = {
  deleteOpen: boolean;
  isDragOver: boolean;
  renameOpen: boolean;
};

type ColumnAction =
  | { type: 'deleteOpenChanged'; open: boolean }
  | { type: 'dragOverChanged'; isDragOver: boolean }
  | { type: 'renameOpenChanged'; open: boolean };

const columnReducer = (
  state: ColumnState,
  action: ColumnAction
): ColumnState => {
  switch (action.type) {
    case 'deleteOpenChanged':
      return { ...state, deleteOpen: action.open };
    case 'dragOverChanged':
      return { ...state, isDragOver: action.isDragOver };
    case 'renameOpenChanged':
      return { ...state, renameOpen: action.open };
  }
};

const Column = ({
  column,
  columns,
  deleteCard,
  deleteColumn,
  editCard,
  onTagsChange,
  renameColumn,
  tags,
}: ColumnProps) => {
  const columnRef = useRef<HTMLElement | null>(null);
  const [state, dispatch] = useReducer(columnReducer, {
    deleteOpen: false,
    isDragOver: false,
    renameOpen: false,
  });
  const { deleteOpen, isDragOver, renameOpen } = state;

  useEffect(() => {
    const columnElement = columnRef.current;

    if (!columnElement) {
      return;
    }

    return dropTargetForElements({
      element: columnElement,
      canDrop: ({ source }) => isCardDragData(source.data),
      getData: () => ({ columnId: column.id, type: 'column' }),
      onDragEnter: () =>
        dispatch({ isDragOver: true, type: 'dragOverChanged' }),
      onDragLeave: () =>
        dispatch({ isDragOver: false, type: 'dragOverChanged' }),
      onDrop: () => dispatch({ isDragOver: false, type: 'dragOverChanged' }),
    });
  }, [column.id]);

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
              aria-label={`Open ${column.title} column actions`}
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
                    onClick={() =>
                      dispatch({ open: true, type: 'renameOpenChanged' })
                    }
                  >
                    <Pencil size={15} />
                    Rename column
                  </Menu.Item>
                  <Menu.Item
                    className="menu-item menu-item--danger"
                    onClick={() =>
                      dispatch({ open: true, type: 'deleteOpenChanged' })
                    }
                  >
                    <Trash2 size={15} />
                    Delete column
                  </Menu.Item>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        </div>
        <div className="cards">
          {column.cards.map((card) => (
            <Card
              card={card}
              columnId={column.id}
              columns={columns}
              deleteCard={deleteCard}
              editCard={editCard}
              key={card.id}
              onTagsChange={onTagsChange}
              tags={tags}
            />
          ))}
        </div>
        {isDragOver && column.cards.length === 0 && (
          <div className="column__empty-drop-indicator">Drop card here</div>
        )}
      </section>
      <ColumnRenameDialog
        initialValue={column.title}
        onOpenChange={(open) => dispatch({ open, type: 'renameOpenChanged' })}
        onSave={(title) => renameColumn(column.id, title)}
        open={renameOpen}
      />
      <ConfirmDialog
        confirmLabel="Delete column"
        description={`This will permanently delete ${column.cards.length} ${column.cards.length === 1 ? 'card' : 'cards'} in ${column.title}.`}
        onConfirm={() => deleteColumn(column.id)}
        onOpenChange={(open) => dispatch({ open, type: 'deleteOpenChanged' })}
        open={deleteOpen}
        title="Delete this column?"
      />
    </>
  );
};

export default Column;
