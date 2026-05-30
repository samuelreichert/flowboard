import { Button } from '@base-ui/react/button';
import { Menu } from '@base-ui/react/menu';
import { Ellipsis, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { DragEvent } from 'react';

import Card from '../Card';
import ConfirmDialog from '../ConfirmDialog';
import ContentDialog from '../ContentDialog';
import type { BoardColumn } from '../../types';

import './Column.css';

type ColumnProps = {
  column: BoardColumn;
  columns: BoardColumn[];
  deleteCard: (columnId: string, cardId: string) => void;
  deleteColumn: (columnId: string) => void;
  editCard: (columnId: string, cardId: string, title: string) => string | void;
  moveCard: (cardId: string, fromColumnId: string, toColumnId: string) => void;
  renameColumn: (columnId: string, title: string) => string | void;
  saveCard: (columnId: string, title: string) => string | void;
};

const Column = ({
  column,
  columns,
  deleteCard,
  deleteColumn,
  editCard,
  moveCard,
  renameColumn,
  saveCard,
}: ColumnProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDragOver(false);
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const cardId = event.dataTransfer.getData('application/x-card-id');
    const fromColumnId = event.dataTransfer.getData('application/x-column-id');

    if (cardId && fromColumnId) {
      moveCard(cardId, fromColumnId, column.id);
    }
  };

  return (
    <>
      <section
        className={`column ${isDragOver ? 'column--drag-over' : ''}`}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <div className="column__header">
          <h2 className="column__title">{column.title}</h2>
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
              moveCard={moveCard}
            />
          ))}
        </div>
        <Button
          className="add-card-button"
          onClick={() => setAddCardOpen(true)}
        >
          <Plus size={16} />
          Add {column.cards.length > 0 ? 'another' : 'a'} card
        </Button>
      </section>
      <ContentDialog
        description={`Create a card in ${column.title}.`}
        label="Card title"
        onOpenChange={setAddCardOpen}
        onSave={(title) => saveCard(column.id, title)}
        open={addCardOpen}
        submitLabel="Add card"
        title="Add card"
      />
      <ContentDialog
        description="Choose a clear name for this workflow stage."
        initialValue={column.title}
        label="Column title"
        onOpenChange={setRenameOpen}
        onSave={(title) => renameColumn(column.id, title)}
        open={renameOpen}
        submitLabel="Save changes"
        title="Rename column"
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
