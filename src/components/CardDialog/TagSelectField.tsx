import { ChevronDown } from 'lucide-react';

import { useLocalization } from '../../LocalizationProvider';
import type { BoardTag } from '../../types';
import { InlineEmptyState } from '../EmptyState';
import TagMultiSelect from '../TagMultiSelect';

type TagSelectFieldProps = {
  creatingTag: boolean;
  newTagName: string;
  onCreateTag: () => void;
  onCreateTagClick: () => void;
  onNewTagNameChange: (value: string) => void;
  onTagsOpenChange: (open: boolean) => void;
  onValueChange: (tagIds: string[]) => void;
  selectedTagIds: string[];
  tagError: string;
  tagSummary: string;
  tags: BoardTag[];
  tagsOpen: boolean;
};

const TagSelectField = ({
  creatingTag,
  newTagName,
  onCreateTag,
  onCreateTagClick,
  onNewTagNameChange,
  onTagsOpenChange,
  onValueChange,
  selectedTagIds,
  tagError,
  tagSummary,
  tags,
  tagsOpen,
}: TagSelectFieldProps) => {
  const { messages } = useLocalization();

  return (
    <div className="dialog-field">
      <span className="dialog-label">{messages.card.tags}</span>
      <TagMultiSelect
        ariaLabel={messages.card.tags}
        createButtonClassName="tag-select__create-button"
        createClassName="tag-select__create"
        creatingTag={creatingTag}
        emptyState={
          <InlineEmptyState variant="dropdown">
            {messages.composer.noTagsYet}
          </InlineEmptyState>
        }
        errorClassName="tag-select__error"
        newTagName={newTagName}
        onCreateTag={onCreateTag}
        onNewTagNameChange={onNewTagNameChange}
        onOpenChange={onTagsOpenChange}
        onStartCreatingTag={onCreateTagClick}
        onValueChange={onValueChange}
        open={tagsOpen}
        optionClassName="tag-select__option"
        popupClassName="tag-select__dropdown"
        positionerClassName="tag-select__positioner"
        selectedTagIds={selectedTagIds}
        tagError={tagError}
        tags={tags}
        trigger={
          <>
            <span>{tagSummary}</span>
            <ChevronDown size={17} />
          </>
        }
        triggerClassName="dialog-input tag-select__trigger"
      />
    </div>
  );
};

export default TagSelectField;
