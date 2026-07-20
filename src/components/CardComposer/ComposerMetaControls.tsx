import { Button } from '@base-ui/react/button';
import { ArrowUp } from 'lucide-react';

import { useLocalization } from '../../LocalizationProvider';
import ColumnSelect from './ColumnSelect';
import PrioritySelect, { type PriorityOption } from './PrioritySelect';
import TagPicker from './TagPicker';
import type { BoardColumn, BoardTag, CardPriority } from '../../types';

type ComposerMetaControlsProps = {
  canSubmit: boolean;
  columns: BoardColumn[];
  creatingTag: boolean;
  hasColumns: boolean;
  newTagName: string;
  onAddColumnClick: () => void;
  onCreateTag: () => void;
  onNewTagNameChange: (value: string) => void;
  onPriorityChange: (value: CardPriority) => void;
  onSelectedColumnChange: (value: string) => void;
  onStartCreatingTag: () => void;
  onSelectedTagIdsChange: (tagIds: string[]) => void;
  onTagsOpenChange: (open: boolean) => void;
  priority: CardPriority;
  priorityOptions: PriorityOption[];
  selectedColumnId: string;
  selectedTagIds: string[];
  tagError: string;
  tagSummary: string;
  tags: BoardTag[];
  tagsOpen: boolean;
};

const ComposerMetaControls = ({
  canSubmit,
  columns,
  creatingTag,
  hasColumns,
  newTagName,
  onAddColumnClick,
  onCreateTag,
  onNewTagNameChange,
  onPriorityChange,
  onSelectedColumnChange,
  onStartCreatingTag,
  onSelectedTagIdsChange,
  onTagsOpenChange,
  priority,
  priorityOptions,
  selectedColumnId,
  selectedTagIds,
  tagError,
  tagSummary,
  tags,
  tagsOpen,
}: ComposerMetaControlsProps) => {
  const { messages } = useLocalization();

  return (
    <div className="card-composer__meta-row">
      <div className="card-composer__meta-controls">
        {hasColumns ? (
          <>
            <ColumnSelect
              columns={columns}
              onValueChange={onSelectedColumnChange}
              value={selectedColumnId}
            />
            <PrioritySelect
              onValueChange={onPriorityChange}
              options={priorityOptions}
              value={priority}
            />
            <TagPicker
              creatingTag={creatingTag}
              newTagName={newTagName}
              onCreateTag={onCreateTag}
              onNewTagNameChange={onNewTagNameChange}
              onOpenChange={onTagsOpenChange}
              onStartCreatingTag={onStartCreatingTag}
              onValueChange={onSelectedTagIdsChange}
              selectedTagIds={selectedTagIds}
              tagError={tagError}
              tagSummary={tagSummary}
              tags={tags}
              tagsOpen={tagsOpen}
            />
          </>
        ) : (
          <Button
            className="card-composer__add-column"
            onClick={onAddColumnClick}
            type="button"
          >
            {messages.composer.addColumnFirst}
          </Button>
        )}
      </div>
      <Button
        aria-label={messages.composer.addCard}
        className="card-composer__submit"
        disabled={!canSubmit}
        title={messages.composer.addCard}
        type="submit"
      >
        <ArrowUp size={17} />
      </Button>
    </div>
  );
};

export default ComposerMetaControls;
