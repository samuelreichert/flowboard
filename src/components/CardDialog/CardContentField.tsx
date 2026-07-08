import CardContentEditor from '../CardContentEditor';
import type { BoardCard } from '../../types';

type CardContentFieldProps = {
  card: BoardCard | undefined;
  columnId: string;
  content: string;
  onContentChange: (value: string) => void;
};

const CardContentField = ({
  card,
  columnId,
  content,
  onContentChange,
}: CardContentFieldProps) => {
  const contentId = card?.id ?? columnId;

  return (
    <div className="dialog-field">
      <span className="dialog-label" id={`card-content-label-${contentId}`}>
        Content
      </span>
      <CardContentEditor
        id={`card-content-editor-${contentId}`}
        labelId={`card-content-label-${contentId}`}
        onChange={onContentChange}
        value={content}
      />
    </div>
  );
};

export default CardContentField;
