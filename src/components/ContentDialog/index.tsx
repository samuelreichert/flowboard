import { Button } from '@base-ui/react/button';
import { Field } from '@base-ui/react/field';
import { useState } from 'react';
import type { FormEvent } from 'react';
import type { ReactNode, RefObject } from 'react';

import { useLocalization } from '../../LocalizationProvider';
import DialogShell from '../DialogShell';
import './ContentDialog.css';

type ContentDialogProps = {
  description: string;
  finalFocus?: RefObject<HTMLElement | null>;
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
  finalFocus,
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
  const dialogKey = open ? initialValue : 'closed';

  return (
    <ContentDialogContent
      description={description}
      finalFocus={finalFocus}
      hideCancel={hideCancel}
      initialValue={initialValue}
      key={dialogKey}
      label={label}
      leadingIcon={leadingIcon}
      onOpenChange={onOpenChange}
      onSave={onSave}
      open={open}
      placeholder={placeholder}
      submitLabel={submitLabel}
      title={title}
    />
  );
};

const ContentDialogContent = ({
  description,
  finalFocus,
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
  const { messages } = useLocalization();
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');

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
    <DialogShell
      description={description}
      descriptionClassName="dialog-description--compact"
      finalFocus={finalFocus}
      onOpenChange={onOpenChange}
      open={open}
      title={title}
    >
      <form onSubmit={onSubmit}>
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
            <Button
              className="button button--subtle"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              {messages.common.cancel}
            </Button>
          )}
          <Button className="button button--primary" type="submit">
            {submitLabel}
          </Button>
        </div>
      </form>
    </DialogShell>
  );
};

export default ContentDialog;
