import { useState } from 'react';

import ContentForm from '../ContentForm';
import './AddContent.css';

type AddContentProps = {
  contentType: 'card' | 'column';
  dark?: boolean;
  defaultContent?: string;
  hasContent: boolean;
  isOpen?: boolean;
  isTextArea?: boolean;
  onSaveContent: (content: string) => void;
};

const AddContent = ({
  contentType,
  dark = false,
  defaultContent,
  hasContent,
  isOpen = false,
  isTextArea = false,
  onSaveContent,
}: AddContentProps) => {
  const [inputOpen, setInputOpen] = useState(isOpen);

  const onClickSave = (content: string) => {
    onSaveContent(content);
    setInputOpen(false);
  };

  if (inputOpen === false) {
    return (
      <button
        className={`add-content-button ${dark ? 'add-content-button--dark' : ''}`}
        onClick={() => setInputOpen(true)}
      >
        + Add {hasContent ? 'another' : 'a'} {contentType}
      </button>
    );
  }

  return (
    <ContentForm
      contentType={contentType}
      dark={dark}
      defaultContent={defaultContent}
      isTextArea={isTextArea}
      onClose={() => setInputOpen(false)}
      onSaveContent={onClickSave}
    />
  );
};

export default AddContent;
