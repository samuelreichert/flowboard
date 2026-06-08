import { Button } from '@base-ui/react/button';
import { Dialog } from '@base-ui/react/dialog';
import { Field } from '@base-ui/react/field';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import '../ContentDialog/ContentDialog.css';
import '../IconButton/IconButton.css';

type ColumnRenameDialogProps = {
  initialValue: string;
  onOpenChange: (open: boolean) => void;
  onSave: (value: string) => string | void;
  open: boolean;
};

const ColumnRenameDialog = ({
  initialValue,
  onOpenChange,
  onSave,
  open,
}: ColumnRenameDialogProps) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setValue(initialValue);
      setError('');
    }
  }, [initialValue, open]);

  const saveValue = (nextValue: string) => {
    const trimmedValue = nextValue.trim();

    if (!trimmedValue) {
      setError('Enter a column title.');
      return false;
    }

    const message = onSave(trimmedValue);

    if (message) {
      setError(message);
      return false;
    }

    setError('');
    return true;
  };

  const onValueChange = (nextValue: string) => {
    setValue(nextValue);
    saveValue(nextValue);
  };

  const onDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !saveValue(value)) {
      return;
    }

    onOpenChange(nextOpen);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onDialogOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="dialog-backdrop" />
        <Dialog.Viewport className="dialog-viewport">
          <Dialog.Popup className="dialog-popup">
            <div className="dialog-header">
              <Dialog.Title className="dialog-title">
                Rename column
              </Dialog.Title>
              <Dialog.Close
                aria-label="Close dialog"
                className="icon-button dialog-close"
                render={<Button />}
              >
                <X size={17} />
              </Dialog.Close>
            </div>
            <Dialog.Description className="dialog-description dialog-description--compact">
              Choose a clear name for this workflow stage.
            </Dialog.Description>
            <Field.Root className="dialog-field" invalid={Boolean(error)}>
              <Field.Label>Column title</Field.Label>
              <Field.Control
                autoFocus
                className="dialog-input"
                maxLength={80}
                onValueChange={onValueChange}
                type="text"
                value={value}
              />
              <Field.Error className="dialog-error" match={Boolean(error)}>
                {error}
              </Field.Error>
            </Field.Root>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ColumnRenameDialog;
