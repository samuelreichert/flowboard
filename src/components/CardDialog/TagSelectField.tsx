import { Button } from '@base-ui/react/button';
import { Field } from '@base-ui/react/field';
import { Popover } from '@base-ui/react/popover';
import { Check, ChevronDown, Plus } from 'lucide-react';

import { useLocalization } from '../../LocalizationProvider';
import { InlineEmptyState } from '../EmptyState';
import type { BoardTag } from '../../types';

type TagSelectFieldProps = {
  creatingTag: boolean;
  newTagName: string;
  onCreateTag: () => void;
  onCreateTagClick: () => void;
  onNewTagNameChange: (value: string) => void;
  onTagToggle: (tagId: string) => void;
  onTagsOpenChange: (open: boolean) => void;
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
  onTagToggle,
  onTagsOpenChange,
  selectedTagIds,
  tagError,
  tagSummary,
  tags,
  tagsOpen,
}: TagSelectFieldProps) => {
  const { messages } = useLocalization();
  const selectedTagIdSet = new Set(selectedTagIds);

  return (
    <div className="dialog-field">
      <span className="dialog-label">{messages.card.tags}</span>
      <Popover.Root
        modal={false}
        onOpenChange={onTagsOpenChange}
        open={tagsOpen}
      >
        <Popover.Trigger
          className="dialog-input tag-select__trigger"
          render={<Button />}
        >
          <span>{tagSummary}</span>
          <ChevronDown size={17} />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner
            align="start"
            className="tag-select__positioner"
            sideOffset={5}
          >
            <Popover.Popup
              className="tag-select__dropdown"
              initialFocus={false}
              role="listbox"
            >
              {tags.length > 0 ? (
                tags.map((tag) => {
                  const selected = selectedTagIdSet.has(tag.id);

                  return (
                    <Button
                      aria-selected={selected}
                      className="tag-select__option"
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
                <InlineEmptyState variant="dropdown">
                  {messages.composer.noTagsYet}
                </InlineEmptyState>
              )}
              <div className="tag-select__create">
                {creatingTag ? (
                  <Field.Root invalid={Boolean(tagError)}>
                    <Field.Control
                      aria-label={messages.composer.newTagName}
                      autoFocus
                      maxLength={60}
                      onChange={(event) =>
                        onNewTagNameChange(event.currentTarget.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          onCreateTag();
                        }

                        if (event.key === 'Escape') {
                          event.preventDefault();
                          onTagsOpenChange(false);
                        }
                      }}
                      placeholder={messages.composer.newTagName}
                      type="text"
                      value={newTagName}
                    />
                    <Field.Error
                      className="tag-select__error"
                      match={Boolean(tagError)}
                    >
                      {tagError}
                    </Field.Error>
                  </Field.Root>
                ) : (
                  <Button
                    className="tag-select__create-button"
                    onClick={onCreateTagClick}
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
    </div>
  );
};

export default TagSelectField;
