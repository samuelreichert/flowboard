import { Button } from '@base-ui/react/button';
import { Popover } from '@base-ui/react/popover';
import { Check, Plus } from 'lucide-react';
import type { KeyboardEvent } from 'react';

import { useLocalization } from '../../LocalizationProvider';
import type { BoardTag } from '../../types';

type TagPickerProps = {
  creatingTag: boolean;
  newTagName: string;
  onCreateTag: () => void;
  onNewTagNameChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onStartCreatingTag: () => void;
  onTagToggle: (tagId: string) => void;
  selectedTagIdSet: Set<string>;
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
  onTagToggle,
  selectedTagIdSet,
  tagError,
  tagSummary,
  tags,
  tagsOpen,
}: TagPickerProps) => {
  const { messages } = useLocalization();

  const onTagCreateKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onCreateTag();
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      onOpenChange(false);
    }
  };

  return (
    <Popover.Root modal={false} onOpenChange={onOpenChange} open={tagsOpen}>
      <Popover.Trigger
        aria-label={messages.card.tags}
        className="card-composer__tag-trigger"
        render={<Button />}
      >
        <Plus size={18} />
        {tagSummary && <span>{tagSummary}</span>}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner
          align="start"
          className="card-composer__select-positioner"
          sideOffset={6}
        >
          <Popover.Popup
            className="card-composer__popup card-composer__tags"
            initialFocus={false}
            role="listbox"
          >
            {tags.length > 0 ? (
              tags.map((tag) => {
                const selected = selectedTagIdSet.has(tag.id);

                return (
                  <Button
                    aria-selected={selected}
                    className="card-composer__option"
                    key={tag.id}
                    onClick={() => onTagToggle(tag.id)}
                    role="option"
                    type="button"
                  >
                    <span>{tag.name}</span>
                    {selected && <Check size={15} />}
                  </Button>
                );
              })
            ) : (
              <div className="card-composer__empty-tags">
                {messages.composer.noTagsYet}
              </div>
            )}
            <div className="card-composer__tag-create">
              {creatingTag ? (
                <>
                  <input
                    aria-invalid={Boolean(tagError)}
                    aria-label={messages.composer.newTagName}
                    autoFocus
                    maxLength={60}
                    onChange={(event) => onNewTagNameChange(event.target.value)}
                    onKeyDown={onTagCreateKeyDown}
                    placeholder={messages.composer.newTagName}
                    type="text"
                    value={newTagName}
                  />
                  {tagError && (
                    <p className="card-composer__tag-error">{tagError}</p>
                  )}
                </>
              ) : (
                <Button
                  className="card-composer__tag-create-button"
                  onClick={onStartCreatingTag}
                  type="button"
                >
                  <Plus size={15} />
                  {messages.composer.createTag}
                </Button>
              )}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default TagPicker;
