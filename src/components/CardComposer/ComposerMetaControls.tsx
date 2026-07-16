import { Button } from '@base-ui/react/button';
import { Popover } from '@base-ui/react/popover';
import { Select } from '@base-ui/react/select';
import { ArrowUp, Check, ChevronDown, Plus } from 'lucide-react';
import type { KeyboardEvent } from 'react';

import { useLocalization } from '../../LocalizationProvider';
import type { BoardColumn, BoardTag, CardPriority } from '../../types';

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

type ColumnSelectProps = {
  columns: BoardColumn[];
  onValueChange: (value: string) => void;
  value: string;
};

const ColumnSelect = ({ columns, onValueChange, value }: ColumnSelectProps) => (
  <ColumnSelectContent
    columns={columns}
    onValueChange={onValueChange}
    value={value}
  />
);

const ColumnSelectContent = ({
  columns,
  onValueChange,
  value,
}: ColumnSelectProps) => {
  const { messages } = useLocalization();

  return (
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
        aria-label={messages.composer.destinationColumn}
        className="card-composer__chip"
      >
        <Select.Value className="card-composer__chip-value">
          {(selectedValue: string | null) =>
            columns.find((column) => column.id === selectedValue)?.title ??
            messages.common.chooseColumn
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
};

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
  <PrioritySelectContent
    onValueChange={onValueChange}
    options={options}
    value={value}
  />
);

const PrioritySelectContent = ({
  onValueChange,
  options,
  value,
}: PrioritySelectProps) => {
  const { messages } = useLocalization();

  return (
    <Select.Root
      name="composer-priority"
      onValueChange={(nextValue) => onValueChange(nextValue as CardPriority)}
      value={value}
    >
      <Select.Trigger
        aria-label={messages.card.priority}
        className={`card-composer__chip card-composer__priority card-composer__priority--${value}`}
      >
        <Select.Value className="card-composer__chip-value">
          {(selectedValue: CardPriority | null) =>
            selectedValue
              ? messages.priority[selectedValue]
              : messages.common.choosePriority
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
};

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

export default ComposerMetaControls;
