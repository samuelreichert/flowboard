import { Button } from '@base-ui/react/button';
import { Dialog } from '@base-ui/react/dialog';
import { Field } from '@base-ui/react/field';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { ReactNode } from 'react';

import './ContentDialog.css';
import '../IconButton/IconButton.css';

type ContentDialogProps = {
  description: string;
  hideCancel?: boolean;
  initialValue?: string;
  label: string;
  leadingIcon?: ReactNode;
  onOpenChange: (open: boolean) => void;
  onSave: (value: string) => string | void;
  open: boolean;
  placeholder?: string;
  submitLabel: string;
  title: string;
};

const ContentDialog = ({
  description,
  hideCancel = false,
  initialValue = '',
  label,
  leadingIcon,
  onOpenChange,
  onSave,
  open,
  placeholder,
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
              <div className="dialog-header">
                <Dialog.Title className="dialog-title">{title}</Dialog.Title>
                <Dialog.Close
                  aria-label="Close dialog"
                  className="icon-button dialog-close"
                  render={<Button />}
                >
                  <X size={17} />
                </Dialog.Close>
              </div>
              <Dialog.Description className="dialog-description dialog-description--compact">
                {description}
              </Dialog.Description>
              <Field.Root className="dialog-field" invalid={Boolean(error)}>
                <Field.Label>{label}</Field.Label>
                {leadingIcon ? (
                  <div className="dialog-input-shell">
                    {leadingIcon}
                    <Field.Control
                      autoFocus
                      maxLength={80}
                      onValueChange={setValue}
                      placeholder={placeholder}
                      type="text"
                      value={value}
                    />
                  </div>
                ) : (
                  <Field.Control
                    autoFocus
                    className="dialog-input"
                    maxLength={80}
                    onValueChange={setValue}
                    placeholder={placeholder}
                    type="text"
                    value={value}
                  />
                )}
                <Field.Error className="dialog-error" match={Boolean(error)}>
                  {error}
                </Field.Error>
              </Field.Root>
              <div className="dialog-actions">
                {!hideCancel && (
                  <Dialog.Close
                    className="button button--subtle"
                    render={<Button />}
                  >
                    Cancel
                  </Dialog.Close>
                )}
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
