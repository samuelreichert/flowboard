import { Plus } from 'lucide-react';

import { useLocalization } from '../../LocalizationProvider';
import TagMultiSelect from '../TagMultiSelect';
import type { BoardTag } from '../../types';

type TagPickerProps = {
  creatingTag: boolean;
  newTagName: string;
  onCreateTag: () => void;
  onNewTagNameChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onStartCreatingTag: () => void;
  onValueChange: (tagIds: string[]) => void;
  selectedTagIds: string[];
  tagError: string;
  tagSummary: string;
  tags: BoardTag[];
  tagsOpen: boolean;
};

const TagPicker = ({
  creatingTag,
  newTagName,
  onCreateTag,
  onNewTagNameChange,
  onOpenChange,
  onStartCreatingTag,
  onValueChange,
  selectedTagIds,
  tagError,
  tagSummary,
  tags,
  tagsOpen,
}: TagPickerProps) => {
  const { messages } = useLocalization();

  return (
    <TagMultiSelect
      ariaLabel={messages.card.tags}
      createButtonClassName="card-composer__tag-create-button"
      createClassName="card-composer__tag-create"
      creatingTag={creatingTag}
      emptyState={
        <div className="card-composer__empty-tags">
          {messages.composer.noTagsYet}
        </div>
      }
      errorClassName="card-composer__tag-error"
      newTagName={newTagName}
      onCreateTag={onCreateTag}
      onNewTagNameChange={onNewTagNameChange}
      onOpenChange={onOpenChange}
      onStartCreatingTag={onStartCreatingTag}
      onValueChange={onValueChange}
      open={tagsOpen}
      optionClassName="card-composer__option"
      popupClassName="card-composer__popup card-composer__tags"
      positionerClassName="card-composer__select-positioner"
      selectedTagIds={selectedTagIds}
      tagError={tagError}
      tags={tags}
      trigger={
        <span className="card-composer__tag-trigger-content">
          <Plus size={18} />
          {tagSummary && <span>{tagSummary}</span>}
        </span>
      }
      triggerClassName={`card-composer__tag-trigger${tagSummary ? ' card-composer__tag-trigger--selected' : ''}`}
      triggerValueClassName="card-composer__tag-trigger-value"
    />
  );
};

export default TagPicker;
