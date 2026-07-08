import { Button } from '@base-ui/react/button';
import { Field } from '@base-ui/react/field';
import { Check, Edit3, ExternalLink, Trash2, X } from 'lucide-react';
import type { FormEvent } from 'react';

type EditorAssetBubbleProps = {
  assetLabel: string;
  currentUrl: string;
  editing: boolean;
  error: string;
  onCancelEdit: () => void;
  onEdit: () => void;
  onOpen: () => void;
  onRemove: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUrlChange: (value: string) => void;
  url: string;
};

const EditorAssetBubble = ({
  assetLabel,
  currentUrl,
  editing,
  error,
  onCancelEdit,
  onEdit,
  onOpen,
  onRemove,
  onSubmit,
  onUrlChange,
  url,
}: EditorAssetBubbleProps) => {
  const lowerAssetLabel = assetLabel.toLowerCase();

  if (editing) {
    return (
      <form className="editor-link-bubble__form" onSubmit={onSubmit}>
        <Field.Root invalid={Boolean(error)}>
          <Field.Label className="editor-link-bubble__label">
            {assetLabel} URL
          </Field.Label>
          <Field.Control
            autoFocus
            className="editor-link-bubble__input"
            inputMode="url"
            maxLength={2048}
            onValueChange={onUrlChange}
            type="text"
            value={url}
          />
          <Field.Error
            className="editor-link-bubble__error"
            match={Boolean(error)}
          >
            {error}
          </Field.Error>
        </Field.Root>
        <div className="editor-link-bubble__actions">
          <Button
            aria-label={`Cancel ${lowerAssetLabel} edit`}
            className="editor-link-bubble__icon-button"
            onClick={onCancelEdit}
            type="button"
          >
            <X size={14} />
          </Button>
          <Button
            aria-label={`Apply ${lowerAssetLabel} edit`}
            className="editor-link-bubble__icon-button editor-link-bubble__icon-button--primary"
            type="submit"
          >
            <Check size={14} />
          </Button>
        </div>
      </form>
    );
  }

  return (
    <>
      <span className="editor-link-bubble__href">{currentUrl}</span>
      <div className="editor-link-bubble__actions">
        <Button
          aria-label={`Edit ${lowerAssetLabel}`}
          className="editor-link-bubble__icon-button"
          onClick={onEdit}
          type="button"
        >
          <Edit3 size={14} />
        </Button>
        <Button
          aria-label={`Open ${lowerAssetLabel}`}
          className="editor-link-bubble__icon-button"
          onClick={onOpen}
          type="button"
        >
          <ExternalLink size={14} />
        </Button>
        <Button
          aria-label={`Remove ${lowerAssetLabel}`}
          className="editor-link-bubble__icon-button"
          onClick={onRemove}
          type="button"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </>
  );
};

export default EditorAssetBubble;
