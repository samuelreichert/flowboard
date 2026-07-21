import type { KeyboardEvent, RefObject } from 'react';
import { Field } from '@base-ui/react/field';

import { useLocalization } from '../../LocalizationProvider';

type ComposerInputProps = {
  disabled: boolean;
  draft: string;
  error: string;
  errorId: string;
  inputId: string;
  onBlur: () => void;
  onChange: (value: string) => void;
  onFocus: () => void;
  onSubmitShortcut: () => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
};

const ComposerInput = ({
  disabled,
  draft,
  error,
  errorId,
  inputId,
  onBlur,
  onChange,
  onFocus,
  onSubmitShortcut,
  textareaRef,
}: ComposerInputProps) => {
  const { messages } = useLocalization();
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      onSubmitShortcut();
    }
  };

  return (
    <Field.Root className="card-composer__input-row" invalid={Boolean(error)}>
      <Field.Label className="card-composer__label">
        {messages.composer.newCard}
      </Field.Label>
      <Field.Control
        className="card-composer__input"
        disabled={disabled}
        id={inputId}
        maxLength={100_000}
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        onValueChange={onChange}
        placeholder={
          disabled
            ? messages.composer.addColumnBeforeCapturingPlaceholder
            : messages.composer.captureCard
        }
        ref={textareaRef}
        render={<textarea rows={1} />}
        value={draft}
      />
      {error && (
        <Field.Error className="card-composer__error" id={errorId}>
          {error}
        </Field.Error>
      )}
    </Field.Root>
  );
};

export default ComposerInput;
