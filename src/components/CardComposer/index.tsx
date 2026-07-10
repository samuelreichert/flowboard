import { Button } from '@base-ui/react/button';
import { Popover } from '@base-ui/react/popover';
import { Select } from '@base-ui/react/select';
import { ArrowUp, Check, ChevronDown, Plus } from 'lucide-react';
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { FormEvent, KeyboardEvent } from 'react';

import type { CardDialogValues } from '../CardDialog';
import { DEFAULT_CARD_PRIORITY } from '../CardDialog/constants';
import { formatPriorityLabel } from '../CardMetadata/formatPriorityLabel';
import type { BoardColumn, BoardTag, CardPriority } from '../../types';
import { parseComposerDraft } from './parseComposerDraft';

import './CardComposer.css';

type CardComposerProps = {
  columns: BoardColumn[];
  onAddColumnClick: () => void;
  onSave: (values: CardDialogValues) => string | void;
  onTagsChange: (tags: BoardTag[]) => void;
  tags: BoardTag[];
};

const PRIORITY_OPTIONS: { label: string; value: CardPriority }[] = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

const getFallbackColumnId = (columns: BoardColumn[]) => columns[0]?.id ?? '';

const CardComposer = ({
  columns,
  onAddColumnClick,
  onSave,
  onTagsChange,
  tags,
}: CardComposerProps) => {
  const inputId = useId();
  const errorId = useId();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const [priority, setPriority] = useState<CardPriority>(DEFAULT_CARD_PRIORITY);
  const [creatingTag, setCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColumnId, setSelectedColumnId] = useState(() =>
    getFallbackColumnId(columns)
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [tagError, setTagError] = useState('');
  const [tagsOpen, setTagsOpen] = useState(false);

  const selectedColumn = columns.find(
    (column) => column.id === selectedColumnId
  );
  const hasColumns = columns.length > 0;
  const selectedTagIdSet = useMemo(
    () => new Set(selectedTagIds),
    [selectedTagIds]
  );
  const selectedTags = selectedTagIds
    .map((tagId) => tags.find((tag) => tag.id === tagId))
    .filter((tag): tag is BoardTag => Boolean(tag));
  const tagSummary =
    selectedTags.length === 0
      ? ''
      : selectedTags.length === 1
        ? selectedTags[0].name
        : `${selectedTags[0].name} +${selectedTags.length - 1}`;
  const canSubmit = hasColumns && draft.trim().length > 0;

  useEffect(() => {
    if (!hasColumns) {
      setSelectedColumnId('');
      return;
    }

    if (!columns.some((column) => column.id === selectedColumnId)) {
      setSelectedColumnId(getFallbackColumnId(columns));
    }
  }, [columns, hasColumns, selectedColumnId]);

  useEffect(() => {
    setSelectedTagIds((currentTagIds) =>
      currentTagIds.filter((tagId) => tags.some((tag) => tag.id === tagId))
    );
  }, [tags]);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [draft]);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((currentTagIds) =>
      currentTagIds.includes(tagId)
        ? currentTagIds.filter((selectedTagId) => selectedTagId !== tagId)
        : [...currentTagIds, tagId]
    );
  };

  const closeTags = () => {
    setCreatingTag(false);
    setNewTagName('');
    setTagError('');
    setTagsOpen(false);
  };

  const createTag = () => {
    const name = newTagName.trim();

    if (!name) {
      setTagError('Enter a tag name.');
      return;
    }

    if (tags.some((tag) => tag.name.toLowerCase() === name.toLowerCase())) {
      setTagError('Tag names must be unique.');
      return;
    }

    const tag = { id: crypto.randomUUID(), name };

    onTagsChange([...tags, tag]);
    setSelectedTagIds((currentTagIds) => [...currentTagIds, tag.id]);
    setCreatingTag(false);
    setNewTagName('');
    setTagError('');
    setTagsOpen(false);
  };

  const onTagCreateKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      createTag();
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeTags();
    }
  };

  const submitDraft = () => {
    if (!hasColumns || !selectedColumn) {
      setError('Add a column before capturing cards.');
      return;
    }

    const parsedDraft = parseComposerDraft(draft);

    if (!parsedDraft.title) {
      setError('Enter a card title.');
      return;
    }

    const message = onSave({
      columnId: selectedColumn.id,
      content: parsedDraft.content,
      priority,
      tagIds: selectedTagIds,
      title: parsedDraft.title,
    });

    if (message) {
      setError(message);
      return;
    }

    setDraft('');
    setError('');
    closeTags();
    textareaRef.current?.focus();
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitDraft();
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      submitDraft();
    }
  };

  return (
    <form
      aria-label="Card composer"
      className={`card-composer${focused || draft ? ' card-composer--active' : ''}`}
      onSubmit={onSubmit}
    >
      <div className="card-composer__input-row">
        <label className="card-composer__label" htmlFor={inputId}>
          New card
        </label>
        <textarea
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          className="card-composer__input"
          disabled={!hasColumns}
          id={inputId}
          maxLength={100_000}
          onBlur={() => setFocused(false)}
          onChange={(event) => {
            setDraft(event.target.value);
            setError('');
          }}
          onFocus={() => setFocused(true)}
          onKeyDown={onInputKeyDown}
          placeholder={
            hasColumns
              ? 'Capture a card...'
              : 'Add a column before capturing cards'
          }
          ref={textareaRef}
          rows={1}
          value={draft}
        />
      </div>
      {error && (
        <p className="card-composer__error" id={errorId}>
          {error}
        </p>
      )}
      <div className="card-composer__meta-row">
        <div className="card-composer__meta-controls">
          {hasColumns ? (
            <>
              <Select.Root
                name="composer-column"
                onValueChange={(value) => setSelectedColumnId(value)}
                value={selectedColumnId}
              >
                <Select.Trigger
                  aria-label="Destination column"
                  className="card-composer__chip"
                >
                  <Select.Value className="card-composer__chip-value">
                    {(value: string | null) =>
                      columns.find((column) => column.id === value)?.title ??
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
              <Select.Root
                name="composer-priority"
                onValueChange={(value) => setPriority(value as CardPriority)}
                value={priority}
              >
                <Select.Trigger
                  aria-label="Priority"
                  className={`card-composer__chip card-composer__priority card-composer__priority--${priority}`}
                >
                  <Select.Value className="card-composer__chip-value">
                    {(value: CardPriority | null) =>
                      value ? formatPriorityLabel(value) : 'Choose priority'
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
                        {PRIORITY_OPTIONS.map((option) => (
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
              <Popover.Root
                modal={false}
                onOpenChange={(nextOpen) => {
                  if (nextOpen) {
                    setTagsOpen(true);
                  } else {
                    closeTags();
                  }
                }}
                open={tagsOpen}
              >
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
                              onClick={() => toggleTag(tag.id)}
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
                          No tags yet
                        </div>
                      )}
                      <div className="card-composer__tag-create">
                        {creatingTag ? (
                          <>
                            <input
                              aria-invalid={Boolean(tagError)}
                              aria-label="New tag name"
                              autoFocus
                              maxLength={60}
                              onChange={(event) => {
                                setNewTagName(event.target.value);
                                setTagError('');
                              }}
                              onKeyDown={onTagCreateKeyDown}
                              placeholder="New tag name"
                              type="text"
                              value={newTagName}
                            />
                            {tagError && (
                              <p className="card-composer__tag-error">
                                {tagError}
                              </p>
                            )}
                          </>
                        ) : (
                          <Button
                            className="card-composer__tag-create-button"
                            onClick={() => setCreatingTag(true)}
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
    </form>
  );
};

export default CardComposer;
