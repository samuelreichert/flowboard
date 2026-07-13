import { Button } from '@base-ui/react/button';
import { Popover } from '@base-ui/react/popover';
import { Select } from '@base-ui/react/select';
import { ArrowUp, Check, ChevronDown, Plus } from 'lucide-react';
import type { KeyboardEvent } from 'react';

import {
  formatPriorityLabel,
  type BoardColumn,
  type BoardTag,
  type CardPriority,
} from '../../types';

type PriorityOption = {
  label: string;
  value: CardPriority;
};

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
  onTagToggle: (tagId: string) => void;
  onTagsOpenChange: (open: boolean) => void;
  priority: CardPriority;
  priorityOptions: PriorityOption[];
  selectedColumnId: string;
  selectedTagIdSet: Set<string>;
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
  onTagToggle,
  onTagsOpenChange,
  priority,
  priorityOptions,
  selectedColumnId,
  selectedTagIdSet,
  tagError,
  tagSummary,
  tags,
  tagsOpen,
}: ComposerMetaControlsProps) => (
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
            onTagToggle={onTagToggle}
            selectedTagIdSet={selectedTagIdSet}
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
          Add column first
        </Button>
      )}
    </div>
    <Button
      aria-label="Add card"
      className="card-composer__submit"
      disabled={!canSubmit}
      title="Add card"
      type="submit"
    >
      <ArrowUp size={17} />
    </Button>
  </div>
);

type ColumnSelectProps = {
  columns: BoardColumn[];
  onValueChange: (value: string) => void;
  value: string;
};

const ColumnSelect = ({ columns, onValueChange, value }: ColumnSelectProps) => (
  <Select.Root
    name="composer-column"
    onValueChange={(nextValue) => {
      if (nextValue) {
        onValueChange(nextValue);
      }
    }}
    value={value}
  >
    <Select.Trigger
      aria-label="Destination column"
      className="card-composer__chip"
    >
      <Select.Value className="card-composer__chip-value">
        {(selectedValue: string | null) =>
          columns.find((column) => column.id === selectedValue)?.title ??
          'Choose column'
        }
      </Select.Value>
      <Select.Icon className="card-composer__chip-icon">
        <ChevronDown size={15} />
      </Select.Icon>
    </Select.Trigger>
    <Select.Portal>
      <Select.Positioner
        align="start"
        className="card-composer__select-positioner"
        sideOffset={6}
      >
        <Select.Popup className="card-composer__popup">
          <Select.List>
            {columns.map((column) => (
              <Select.Item
                className="card-composer__option"
                key={column.id}
                value={column.id}
              >
                <Select.ItemText>{column.title}</Select.ItemText>
                <Select.ItemIndicator>
                  <Check size={15} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.List>
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>
);

type PrioritySelectProps = {
  onValueChange: (value: CardPriority) => void;
  options: PriorityOption[];
  value: CardPriority;
};

const PrioritySelect = ({
  onValueChange,
  options,
  value,
}: PrioritySelectProps) => (
  <Select.Root
    name="composer-priority"
    onValueChange={(nextValue) => onValueChange(nextValue as CardPriority)}
    value={value}
  >
    <Select.Trigger
      aria-label="Priority"
      className={`card-composer__chip card-composer__priority card-composer__priority--${value}`}
    >
      <Select.Value className="card-composer__chip-value">
        {(selectedValue: CardPriority | null) =>
          selectedValue ? formatPriorityLabel(selectedValue) : 'Choose priority'
        }
      </Select.Value>
      <Select.Icon className="card-composer__chip-icon">
        <ChevronDown size={15} />
      </Select.Icon>
    </Select.Trigger>
    <Select.Portal>
      <Select.Positioner
        align="start"
        className="card-composer__select-positioner"
        sideOffset={6}
      >
        <Select.Popup className="card-composer__popup">
          <Select.List>
            {options.map((option) => (
              <Select.Item
                className="card-composer__option"
                key={option.value}
                value={option.value}
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <Check size={15} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.List>
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>
);

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
        aria-label="Tags"
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
              <div className="card-composer__empty-tags">No tags yet</div>
            )}
            <div className="card-composer__tag-create">
              {creatingTag ? (
                <>
                  <input
                    aria-invalid={Boolean(tagError)}
                    aria-label="New tag name"
                    autoFocus
                    maxLength={60}
                    onChange={(event) => onNewTagNameChange(event.target.value)}
                    onKeyDown={onTagCreateKeyDown}
                    placeholder="New tag name"
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
                  Create tag
                </Button>
              )}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default ComposerMetaControls;
