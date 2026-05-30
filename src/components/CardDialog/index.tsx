import { Button } from '@base-ui/react/button';
import { Dialog } from '@base-ui/react/dialog';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import type { BoardCard, BoardColumn } from '../../types';

type CardDialogProps = {
  card?: BoardCard;
  columnId: string;
  columns: BoardColumn[];
  onDelete?: () => void;
  onOpenChange: (open: boolean) => void;
  onSave: (values: CardDialogValues) => string | void;
  open: boolean;
};

export type CardDialogValues = {
  columnId: string;
  description: string;
  title: string;
};

const CardDialog = ({
  card,
  columnId,
  columns,
  onDelete,
  onOpenChange,
  onSave,
  open,
}: CardDialogProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColumnId, setSelectedColumnId] = useState(columnId);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setTitle(card?.title ?? '');
      setDescription(card?.description ?? '');
      setSelectedColumnId(columnId);
      setError('');
    }
  }, [card, columnId, open]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = onSave({
      columnId: selectedColumnId,
      description: description.trim(),
      title: title.trim(),
    });

    if (message) {
      setError(message);
      return;
    }

    onOpenChange(false);
  };

  const onDeleteCard = () => {
    onDelete?.();
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="dialog-backdrop" />
        <Dialog.Viewport className="dialog-viewport">
          <Dialog.Popup className="dialog-popup">
            <form onSubmit={onSubmit}>
              <Dialog.Title className="dialog-title">
                {card ? 'Card details' : 'Add card'}
              </Dialog.Title>
              <Dialog.Description className="dialog-description">
                {card
                  ? 'Review the card details or update its workflow stage.'
                  : 'Capture the work clearly before adding it to your flow.'}
              </Dialog.Description>
              <label className="dialog-field">
                <span>Card title</span>
                <input
                  autoFocus
                  className="dialog-input"
                  onChange={(event) => setTitle(event.currentTarget.value)}
                  type="text"
                  value={title}
                />
              </label>
              <label className="dialog-field">
                <span>Description</span>
                <textarea
                  className="dialog-input"
                  onChange={(event) =>
                    setDescription(event.currentTarget.value)
                  }
                  rows={5}
                  value={description}
                />
              </label>
              <label className="dialog-field">
                <span>Column</span>
                <select
                  className="dialog-input"
                  onChange={(event) =>
                    setSelectedColumnId(event.currentTarget.value)
                  }
                  value={selectedColumnId}
                >
                  {columns.map((column) => (
                    <option key={column.id} value={column.id}>
                      {column.title}
                    </option>
                  ))}
                </select>
              </label>
              {error && <p className="dialog-error">{error}</p>}
              <div className="dialog-actions dialog-actions--spread">
                <div>
                  {card && (
                    <Button
                      className="button button--danger"
                      onClick={onDeleteCard}
                      type="button"
                    >
                      <Trash2 size={16} />
                      Delete card
                    </Button>
                  )}
                </div>
                <div className="dialog-actions__group">
                  <Dialog.Close
                    className="button button--subtle"
                    render={<Button />}
                  >
                    Cancel
                  </Dialog.Close>
                  <Button className="button button--primary" type="submit">
                    {card ? 'Save changes' : 'Add card'}
                  </Button>
                </div>
              </div>
            </form>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CardDialog;
