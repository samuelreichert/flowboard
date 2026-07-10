import { Field } from '@base-ui/react/field';
import { useState } from 'react';

import DialogShell from '../DialogShell';
import '../ContentDialog/ContentDialog.css';

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
  const dialogKey = open ? 'open' : 'closed';

  return (
    <ColumnRenameDialogContent
      initialValue={initialValue}
      key={dialogKey}
      onOpenChange={onOpenChange}
      onSave={onSave}
      open={open}
    />
  );
};

const ColumnRenameDialogContent = ({
  initialValue,
  onOpenChange,
  onSave,
  open,
}: ColumnRenameDialogProps) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');

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
    <DialogShell
      description="Choose a clear name for this workflow stage."
      descriptionClassName="dialog-description--compact"
      onOpenChange={onDialogOpenChange}
      open={open}
      title="Rename column"
    >
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
    </DialogShell>
  );
};

export default ColumnRenameDialog;
