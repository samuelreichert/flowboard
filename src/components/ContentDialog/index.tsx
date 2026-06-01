import { Button } from '@base-ui/react/button';
import { Dialog } from '@base-ui/react/dialog';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import './ContentDialog.css';

type ContentDialogProps = {
  description: string;
  initialValue?: string;
  label: string;
  onOpenChange: (open: boolean) => void;
  onSave: (value: string) => string | void;
  open: boolean;
  submitLabel: string;
  title: string;
};

const ContentDialog = ({
  description,
  initialValue = '',
  label,
  onOpenChange,
  onSave,
  open,
  submitLabel,
  title,
}: ContentDialogProps) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setValue(initialValue);
      setError('');
    }
  }, [initialValue, open]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = onSave(value.trim());

    if (message) {
      setError(message);
      return;
    }

    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="dialog-backdrop" />
        <Dialog.Viewport className="dialog-viewport">
          <Dialog.Popup className="dialog-popup">
            <form onSubmit={onSubmit}>
              <Dialog.Title className="dialog-title">{title}</Dialog.Title>
              <Dialog.Description className="dialog-description">
                {description}
              </Dialog.Description>
              <label className="dialog-field">
                <span>{label}</span>
                <input
                  autoFocus
                  className="dialog-input"
                  maxLength={80}
                  onChange={(event) => setValue(event.currentTarget.value)}
                  type="text"
                  value={value}
                />
              </label>
              {error && <p className="dialog-error">{error}</p>}
              <div className="dialog-actions">
                <Dialog.Close
                  className="button button--subtle"
                  render={<Button />}
                >
                  Cancel
                </Dialog.Close>
                <Button className="button button--primary" type="submit">
                  {submitLabel}
                </Button>
              </div>
            </form>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ContentDialog;
