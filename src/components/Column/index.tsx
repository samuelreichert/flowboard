import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { Button } from '@base-ui/react/button';
import { Menu } from '@base-ui/react/menu';
import { Ellipsis, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import Card from '../Card';
import CardDialog from '../CardDialog';
import ColumnRenameDialog from '../ColumnRenameDialog';
import ConfirmDialog from '../ConfirmDialog';
import type { CardDialogValues } from '../CardDialog';
import { isCardDragData } from '../../dnd';
import type { BoardColumn } from '../../types';

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
  renameColumn: (columnId: string, title: string) => string | void;
  saveCard: (values: CardDialogValues) => string | void;
};

const Column = ({
  column,
  columns,
  deleteCard,
  deleteColumn,
  editCard,
  renameColumn,
  saveCard,
}: ColumnProps) => {
  const columnRef = useRef<HTMLElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    const columnElement = columnRef.current;

    if (!columnElement) {
      return;
    }

    return dropTargetForElements({
      element: columnElement,
      canDrop: ({ source }) => isCardDragData(source.data),
      getData: () => ({ columnId: column.id, type: 'column' }),
      onDragEnter: () => setIsDragOver(true),
      onDragLeave: () => setIsDragOver(false),
      onDrop: () => setIsDragOver(false),
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
                    onClick={() => setRenameOpen(true)}
                  >
                    <Pencil size={15} />
                    Rename column
                  </Menu.Item>
                  <Menu.Item
                    className="menu-item menu-item--danger"
                    onClick={() => setDeleteOpen(true)}
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
            />
          ))}
        </div>
        {isDragOver && column.cards.length === 0 && (
          <div className="column__empty-drop-indicator">Drop card here</div>
        )}
        <Button
          className="add-card-button"
          onClick={() => setAddCardOpen(true)}
        >
          <Plus size={16} />
          Create card
        </Button>
      </section>
      <CardDialog
        columnId={column.id}
        columns={columns}
        onOpenChange={setAddCardOpen}
        onSave={saveCard}
        open={addCardOpen}
      />
      <ColumnRenameDialog
        initialValue={column.title}
        onOpenChange={setRenameOpen}
        onSave={(title) => renameColumn(column.id, title)}
        open={renameOpen}
      />
      <ConfirmDialog
        confirmLabel="Delete column"
        description={`This will permanently delete ${column.cards.length} ${column.cards.length === 1 ? 'card' : 'cards'} in ${column.title}.`}
        onConfirm={() => deleteColumn(column.id)}
        onOpenChange={setDeleteOpen}
        open={deleteOpen}
        title="Delete this column?"
      />
    </>
  );
};

export default Column;
