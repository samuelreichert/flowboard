import { Button } from '@base-ui/react/button';
import { Field } from '@base-ui/react/field';
import type { RefObject } from 'react';

import type { BoardCard } from '../../types';

type CardTitleFieldProps = {
  card: BoardCard | undefined;
  createdAtLabel: string;
  fallbackTitle: string;
  onEditClick: () => void;
  onTitleBlur: () => void;
  onTitleChange: (value: string) => void;
  title: string;
  titleEditing: boolean;
  titleInputRef: RefObject<HTMLInputElement | null>;
};

const CardTitleField = ({
  card,
  createdAtLabel,
  fallbackTitle,
  onEditClick,
  onTitleBlur,
  onTitleChange,
  title,
  titleEditing,
  titleInputRef,
}: CardTitleFieldProps) => (
  <div className="card-title-row">
    <h2 className="card-title-field">
      {titleEditing ? (
        <Field.Control
          aria-label="Card title"
          className="card-title-field__input"
          maxLength={120}
          onBlur={onTitleBlur}
          onValueChange={onTitleChange}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onTitleBlur();
            }
          }}
          ref={titleInputRef}
          type="text"
          value={title}
        />
      ) : (
        <Button
          aria-label="Edit card title"
          className="card-title-field__display"
          onClick={onEditClick}
          type="button"
        >
          {title.trim() || fallbackTitle || 'Untitled card'}
        </Button>
      )}
    </h2>
    {createdAtLabel && (
      <time className="card-created-at" dateTime={card?.createdAt}>
        Created {createdAtLabel}
      </time>
    )}
  </div>
);

export default CardTitleField;
