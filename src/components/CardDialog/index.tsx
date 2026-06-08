import { Button } from '@base-ui/react/button';
import { Dialog } from '@base-ui/react/dialog';
import { Popover } from '@base-ui/react/popover';
import { Check, ChevronDown, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';

import CardContentEditor from '../CardContentEditor';
import ConfirmDialog from '../ConfirmDialog';
import type {
  BoardCard,
  BoardColumn,
  BoardTag,
  CardPriority,
} from '../../types';
import '../IconButton/IconButton.css';

type CardDialogProps = {
  card?: BoardCard;
  columnId: string;
  columns: BoardColumn[];
  onDelete?: () => void;
  onOpenChange: (open: boolean) => void;
  onSave: (values: CardDialogValues) => string | void;
  onTagsChange: (tags: BoardTag[]) => void;
  open: boolean;
  tags: BoardTag[];
};

export type CardDialogValues = {
  columnId: string;
  content: string;
  priority: CardPriority;
  tagIds: string[];
  title: string;
};

const DEFAULT_CARD_PRIORITY: CardPriority = 'medium';

const formatPriorityLabel = (priority: CardPriority) =>
  priority.charAt(0).toUpperCase() + priority.slice(1);

const formatCreatedAt = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const CardDialog = ({
  card,
  columnId,
  columns,
  onDelete,
  onOpenChange,
  onSave,
  onTagsChange,
  open,
  tags,
}: CardDialogProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColumnId, setSelectedColumnId] = useState(columnId);
  const [priority, setPriority] = useState<CardPriority>(DEFAULT_CARD_PRIORITY);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [creatingTag, setCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [tagError, setTagError] = useState('');
  const [error, setError] = useState('');
  const [titleEditing, setTitleEditing] = useState(!card);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const lastValidTitleRef = useRef('');
  const openCardIdRef = useRef<string | undefined>(undefined);
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    const didJustOpen = open && !wasOpenRef.current;
    const didSwitchCards = open && openCardIdRef.current !== card?.id;

    if (didJustOpen || didSwitchCards) {
      setTitle(card?.title ?? '');
      setContent(card?.content ?? '');
      setSelectedColumnId(columnId);
      setPriority(card?.priority ?? DEFAULT_CARD_PRIORITY);
      setSelectedTagIds(card?.tagIds ?? []);
      setTagsOpen(false);
      setCreatingTag(false);
      setNewTagName('');
      setTagError('');
      lastValidTitleRef.current = card?.title ?? '';
      openCardIdRef.current = card?.id;
      setTitleEditing(!card);
      setDeleteOpen(false);
      setError('');
    }

    if (!open) {
      openCardIdRef.current = undefined;
      setDeleteOpen(false);
      setTagsOpen(false);
      setCreatingTag(false);
    }

    wasOpenRef.current = open;
  }, [
    card?.content,
    card?.id,
    card?.priority,
    card?.tagIds,
    card?.title,
    columnId,
    open,
  ]);

  useEffect(() => {
    if (!open || !titleEditing) {
      return;
    }

    const focusTitle = window.setTimeout(() => {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }, 0);

    return () => window.clearTimeout(focusTitle);
  }, [open, titleEditing]);

  const saveExistingCard = (
    nextValues: Partial<Omit<CardDialogValues, 'title'>> & {
      title?: string;
    }
  ) => {
    if (!card) {
      return;
    }

    const nextTitle = nextValues.title ?? title;
    const trimmedTitle = nextTitle.trim();
    const titleToSave = trimmedTitle || lastValidTitleRef.current;

    if (!trimmedTitle) {
      setError('Enter a card title.');
    } else {
      lastValidTitleRef.current = trimmedTitle;
      setError('');
    }

    if (!titleToSave) {
      return;
    }

    const message = onSave({
      columnId: nextValues.columnId ?? selectedColumnId,
      content: nextValues.content ?? content,
      priority: nextValues.priority ?? priority,
      tagIds: nextValues.tagIds ?? selectedTagIds,
      title: titleToSave,
    });

    if (message) {
      setError(message);
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (card) {
      onOpenChange(false);
      return;
    }

    const message = onSave({
      columnId: selectedColumnId,
      content: content.trim(),
      priority,
      tagIds: selectedTagIds,
      title: title.trim(),
    });

    if (message) {
      setError(message);
      return;
    }

    onOpenChange(false);
  };

  const onConfirmDeleteCard = () => {
    onDelete?.();
    onOpenChange(false);
  };

  const onTitleChange = (value: string) => {
    setTitle(value);
    saveExistingCard({ title: value });
  };

  const onContentChange = (value: string) => {
    setContent(value);
    saveExistingCard({ content: value });
  };

  const onColumnChange = (value: string) => {
    setSelectedColumnId(value);
    saveExistingCard({ columnId: value });
  };

  const onPriorityChange = (value: string) => {
    const nextPriority = value as CardPriority;

    setPriority(nextPriority);
    saveExistingCard({ priority: nextPriority });
  };

  const toggleTag = (tagId: string) => {
    const nextTagIds = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter((selectedTagId) => selectedTagId !== tagId)
      : [...selectedTagIds, tagId];

    setSelectedTagIds(nextTagIds);
    saveExistingCard({ tagIds: nextTagIds });
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
    const nextTags = [...tags, tag];
    const nextTagIds = [...selectedTagIds, tag.id];

    onTagsChange(nextTags);
    setSelectedTagIds(nextTagIds);
    saveExistingCard({ tagIds: nextTagIds });
    setNewTagName('');
    setTagError('');
    setCreatingTag(false);
    setTagsOpen(false);
  };

  const onTagsOpenChange = (nextOpen: boolean) => {
    setTagsOpen(nextOpen);

    if (!nextOpen) {
      setCreatingTag(false);
      setNewTagName('');
      setTagError('');
    }
  };

  const onTitleBlur = () => {
    if (!title.trim() && !lastValidTitleRef.current) {
      return;
    }

    setTitleEditing(false);
  };

  const createdAtLabel = card?.createdAt ? formatCreatedAt(card.createdAt) : '';
  const selectedTags = selectedTagIds
    .map((tagId) => tags.find((tag) => tag.id === tagId))
    .filter((tag): tag is BoardTag => Boolean(tag));
  const tagSummary =
    selectedTags.length > 0
      ? selectedTags.map((tag) => tag.name).join(', ')
      : 'No tags';

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Backdrop className="dialog-backdrop" />
          <Dialog.Viewport className="dialog-viewport">
            <Dialog.Popup className="dialog-popup dialog-popup--card">
              <form onSubmit={onSubmit}>
                <div className="dialog-header">
                  <Dialog.Title className="dialog-title">
                    {card ? 'Card' : 'New card'}
                  </Dialog.Title>
                  <Dialog.Close
                    aria-label="Close card"
                    className="icon-button dialog-close"
                    render={<Button />}
                  >
                    <X size={17} />
                  </Dialog.Close>
                </div>
                <div className="card-title-row">
                  <h2 className="card-title-field">
                    {titleEditing ? (
                      <input
                        aria-label="Card title"
                        className="card-title-field__input"
                        maxLength={120}
                        onBlur={onTitleBlur}
                        onChange={(event) =>
                          onTitleChange(event.currentTarget.value)
                        }
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            onTitleBlur();
                          }
                        }}
                        ref={titleInputRef}
                        type="text"
                        value={title}
                      />
                    ) : (
                      <button
                        aria-label="Edit card title"
                        className="card-title-field__display"
                        onClick={() => setTitleEditing(true)}
                        type="button"
                      >
                        {title.trim() ||
                          lastValidTitleRef.current ||
                          'Untitled card'}
                      </button>
                    )}
                  </h2>
                  {createdAtLabel && (
                    <time
                      className="card-created-at"
                      dateTime={card?.createdAt}
                    >
                      Created {createdAtLabel}
                    </time>
                  )}
                </div>
                <label className="dialog-field">
                  <span>Column</span>
                  <span className="dialog-select">
                    <select
                      className="dialog-input dialog-input--select"
                      onChange={(event) =>
                        onColumnChange(event.currentTarget.value)
                      }
                      value={selectedColumnId}
                    >
                      {columns.map((column) => (
                        <option key={column.id} value={column.id}>
                          {column.title}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      aria-hidden="true"
                      className="dialog-select__icon"
                      size={17}
                    />
                  </span>
                </label>
                <label className="dialog-field">
                  <span>Priority</span>
                  <span className="dialog-select">
                    <select
                      className="dialog-input dialog-input--select"
                      onChange={(event) =>
                        onPriorityChange(event.currentTarget.value)
                      }
                      value={priority}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <ChevronDown
                      aria-hidden="true"
                      className="dialog-select__icon"
                      size={17}
                    />
                  </span>
                </label>
                <div className="dialog-field">
                  <span>Tags</span>
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
                              const selected = selectedTagIds.includes(tag.id);

                              return (
                                <button
                                  aria-selected={selected}
                                  className="tag-select__option"
                                  key={tag.id}
                                  onClick={() => toggleTag(tag.id)}
                                  role="option"
                                  type="button"
                                >
                                  <span>{tag.name}</span>
                                  {selected && <Check size={15} />}
                                </button>
                              );
                            })
                          ) : (
                            <p className="tag-select__empty">No tags yet</p>
                          )}
                          <div className="tag-select__create">
                            {creatingTag ? (
                              <div>
                                <input
                                  aria-label="New tag name"
                                  autoFocus
                                  maxLength={60}
                                  onChange={(event) => {
                                    setNewTagName(event.currentTarget.value);
                                    setTagError('');
                                  }}
                                  onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                      event.preventDefault();
                                      createTag();
                                    }

                                    if (event.key === 'Escape') {
                                      event.preventDefault();
                                      onTagsOpenChange(false);
                                    }
                                  }}
                                  placeholder="New tag name"
                                  type="text"
                                  value={newTagName}
                                />
                                {tagError && (
                                  <p className="tag-select__error">
                                    {tagError}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <button
                                className="tag-select__create-button"
                                onClick={() => {
                                  setCreatingTag(true);
                                  setTagError('');
                                }}
                                type="button"
                              >
                                <Plus size={15} />
                                Create tag
                              </button>
                            )}
                          </div>
                        </Popover.Popup>
                      </Popover.Positioner>
                    </Popover.Portal>
                  </Popover.Root>
                </div>
                <div className="dialog-field">
                  <span id={`card-content-label-${card?.id ?? columnId}`}>
                    Content
                  </span>
                  <CardContentEditor
                    id={`card-content-editor-${card?.id ?? columnId}`}
                    labelId={`card-content-label-${card?.id ?? columnId}`}
                    onChange={onContentChange}
                    value={content}
                  />
                </div>
                {error && <p className="dialog-error">{error}</p>}
                {card ? (
                  <div className="dialog-actions dialog-actions--spread">
                    <div />
                    <div className="dialog-actions__group">
                      <Button
                        className="button button--danger"
                        onClick={() => setDeleteOpen(true)}
                        type="button"
                      >
                        <Trash2 size={16} />
                        Delete card
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="dialog-actions">
                    <Dialog.Close
                      className="button button--subtle"
                      render={<Button />}
                    >
                      Cancel
                    </Dialog.Close>
                    <Button className="button button--primary" type="submit">
                      Create
                    </Button>
                  </div>
                )}
              </form>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
      {card && (
        <ConfirmDialog
          confirmLabel="Delete card"
          description={`This will permanently delete ${title.trim() || lastValidTitleRef.current || 'this card'}.`}
          onConfirm={onConfirmDeleteCard}
          onOpenChange={setDeleteOpen}
          open={deleteOpen}
          title="Delete this card?"
        />
      )}
    </>
  );
};

export default CardDialog;
