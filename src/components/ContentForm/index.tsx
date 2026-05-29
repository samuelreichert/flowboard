import { useState } from 'react';

import './ContentForm.css';

type ContentFormProps = {
  contentType: 'card' | 'column';
  dark?: boolean;
  defaultContent?: string;
  isEdit?: boolean;
  isTextArea?: boolean;
  onClose: () => void;
  onSaveContent: (content: string) => void;
};

const ContentForm = ({
  contentType,
  dark = false,
  defaultContent = '',
  isEdit = false,
  isTextArea = false,
  onClose,
  onSaveContent,
}: ContentFormProps) => {
  const [content, setContent] = useState(defaultContent);

  return (
    <div className="content-form">
      <div className="content-input-container">
        {isTextArea ? (
          <textarea
            className="content-input"
            value={content}
            onChange={(e) => setContent(e.currentTarget.value)}
            placeholder={`Enter ${contentType} title...`}
            rows={4}
          />
        ) : (
          <input
            className="content-input"
            value={content}
            onChange={(e) => setContent(e.currentTarget.value)}
            placeholder={`Enter ${contentType} title...`}
            type="text"
          />
        )}

        <span
          className={`close-button ${dark ? 'close-button--dark' : ''}`}
          onClick={onClose}
        >
          &times;
        </span>
      </div>
      <button
        className="add-content-button add-content-button--save"
        onClick={() => onSaveContent(content)}
      >
        {isEdit ? 'Edit' : 'Add'} {contentType}
      </button>
    </div>
  );
};

export default ContentForm;
