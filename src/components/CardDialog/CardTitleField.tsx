import { Button } from '@base-ui/react/button';
import { Field } from '@base-ui/react/field';
import type { RefObject } from 'react';

import { useLocalization } from '../../LocalizationProvider';
import type { BoardCard } from '../../types';

type CardTitleFieldProps = {
  card: BoardCard;
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
}: CardTitleFieldProps) => {
  const { messages } = useLocalization();

  return (
    <div className="card-title-row">
      <h2 className="card-title-field">
        {titleEditing ? (
          <Field.Control
            aria-label={messages.card.cardTitle}
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
            aria-label={messages.card.editCardTitle}
            className="card-title-field__display"
            onClick={onEditClick}
            type="button"
          >
            {title.trim() || fallbackTitle || messages.card.untitledCard}
          </Button>
        )}
      </h2>
      {createdAtLabel && (
        <time className="card-created-at" dateTime={card.createdAt}>
          {messages.card.created(createdAtLabel)}
        </time>
      )}
    </div>
  );
};

export default CardTitleField;
