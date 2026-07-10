import { lazy, Suspense } from 'react';

import type { BoardCard } from '../../types';
import '../CardContentEditor/CardContentEditor.css';

const CardContentEditor = lazy(() => import('../CardContentEditor'));

type CardContentFieldProps = {
  card: BoardCard;
  content: string;
  onContentChange: (value: string) => void;
};

const CardContentField = ({
  card,
  content,
  onContentChange,
}: CardContentFieldProps) => {
  const contentId = card.id;

  return (
    <div className="dialog-field">
      <span className="dialog-label" id={`card-content-label-${contentId}`}>
        Content
      </span>
      <Suspense
        fallback={
          <div
            aria-live="polite"
            className="card-content-editor card-content-editor--loading"
          >
            Loading editor...
          </div>
        }
      >
        <CardContentEditor
          id={`card-content-editor-${contentId}`}
          labelId={`card-content-label-${contentId}`}
          onChange={onContentChange}
          value={content}
        />
      </Suspense>
    </div>
  );
};

export default CardContentField;
