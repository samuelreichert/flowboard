import { Button } from '@base-ui/react/button';
import { Field } from '@base-ui/react/field';
import { Popover } from '@base-ui/react/popover';
import type { FormEvent } from 'react';

type EditorUrlPopoverFormProps = {
  error: string;
  label: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onValueChange: (value: string) => void;
  placeholder: string;
  submitLabel: string;
  value: string;
};

const EditorUrlPopoverForm = ({
  error,
  label,
  onSubmit,
  onValueChange,
  placeholder,
  submitLabel,
  value,
}: EditorUrlPopoverFormProps) => (
  <Popover.Popup className="editor-url-popover">
    <form className="editor-url-popover__form" onSubmit={onSubmit}>
      <Field.Root invalid={Boolean(error)}>
        <Field.Label className="editor-url-popover__label">{label}</Field.Label>
        <Field.Control
          autoFocus
          className="editor-url-popover__input"
          inputMode="url"
          maxLength={2048}
          onValueChange={onValueChange}
          placeholder={placeholder}
          type="text"
          value={value}
        />
        <Field.Error
          className="editor-url-popover__error"
          match={Boolean(error)}
        >
          {error}
        </Field.Error>
      </Field.Root>
      <div className="editor-url-popover__actions">
        <Popover.Close
          className="editor-url-popover__button"
          render={<Button />}
          type="button"
        >
          Cancel
        </Popover.Close>
        <Button
          className="editor-url-popover__button editor-url-popover__button--primary"
          type="submit"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  </Popover.Popup>
);

export default EditorUrlPopoverForm;
