import type { KeyboardEvent, RefObject } from 'react';

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
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      onSubmitShortcut();
    }
  };

  return (
    <div className="card-composer__input-row">
      <label className="card-composer__label" htmlFor={inputId}>
        {messages.composer.newCard}
      </label>
      <textarea
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        className="card-composer__input"
        disabled={disabled}
        id={inputId}
        maxLength={100_000}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        placeholder={
          disabled
            ? messages.composer.addColumnBeforeCapturingPlaceholder
            : messages.composer.captureCard
        }
        ref={textareaRef}
        rows={1}
        value={draft}
      />
    </div>
  );
};

export default ComposerInput;
