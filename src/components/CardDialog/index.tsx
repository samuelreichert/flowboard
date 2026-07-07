import { Button } from '@base-ui/react/button';
import { Dialog } from '@base-ui/react/dialog';
import { Field } from '@base-ui/react/field';
import { Popover } from '@base-ui/react/popover';
import { Check, ChevronDown, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useReducer, useRef } from 'react';
import type { FormEvent } from 'react';

import CardContentEditor from '../CardContentEditor';
import ConfirmDialog from '../ConfirmDialog';
import DialogSelect from '../DialogSelect';
import { InlineEmptyState } from '../EmptyState';
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

const PRIORITY_OPTIONS: { label: string; value: CardPriority }[] = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

const formatPriorityLabel = (priority: CardPriority) =>
  priority.charAt(0).toUpperCase() + priority.slice(1);

const createdAtFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const formatCreatedAt = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return createdAtFormatter.format(date);
};

type CardDialogState = {
  content: string;
  creatingTag: boolean;
  deleteOpen: boolean;
  discardOpen: boolean;
  error: string;
  newTagName: string;
  priority: CardPriority;
  selectedColumnId: string;
  selectedTagIds: string[];
  tagError: string;
  tagsOpen: boolean;
  title: string;
  titleEditing: boolean;
};

type CardDialogAction =
  | { type: 'closed' }
  | { type: 'fieldsChanged'; values: Partial<CardDialogState> }
  | { type: 'opened'; state: CardDialogState }
  | { type: 'tagCreated'; selectedTagIds: string[] }
  | { type: 'tagsClosed' };

const createCardDialogState = (
  card: BoardCard | undefined,
  columnId: string
): CardDialogState => ({
  content: card?.content ?? '',
  creatingTag: false,
  deleteOpen: false,
  discardOpen: false,
  error: '',
  newTagName: '',
  priority: card?.priority ?? DEFAULT_CARD_PRIORITY,
  selectedColumnId: columnId,
  selectedTagIds: card?.tagIds ?? [],
  tagError: '',
  tagsOpen: false,
  title: card?.title ?? '',
  titleEditing: !card,
});

const cardDialogReducer = (
  state: CardDialogState,
  action: CardDialogAction
): CardDialogState => {
  switch (action.type) {
    case 'closed':
      return {
        ...state,
        creatingTag: false,
        deleteOpen: false,
        discardOpen: false,
        newTagName: '',
        tagError: '',
        tagsOpen: false,
      };
    case 'fieldsChanged':
      return { ...state, ...action.values };
    case 'opened':
      return action.state;
    case 'tagCreated':
      return {
        ...state,
        creatingTag: false,
        newTagName: '',
        selectedTagIds: action.selectedTagIds,
        tagError: '',
        tagsOpen: false,
      };
    case 'tagsClosed':
      return {
        ...state,
        creatingTag: false,
        newTagName: '',
        tagError: '',
        tagsOpen: false,
      };
  }
};

const CardDialog = (props: CardDialogProps) => {
  const dialogKey = props.open
    ? (props.card?.id ?? `new-${props.columnId}`)
    : 'closed';

  return <CardDialogContent key={dialogKey} {...props} />;
};

const CardDialogContent = ({
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
  const [state, dispatch] = useReducer(
    cardDialogReducer,
    createCardDialogState(card, columnId)
  );
  const lastValidTitleRef = useRef(card?.title ?? '');
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const {
    content,
    creatingTag,
    deleteOpen,
    discardOpen,
    error,
    newTagName,
    priority,
    selectedColumnId,
    selectedTagIds,
    tagError,
    tagsOpen,
    title,
    titleEditing,
  } = state;

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

  const isNewCardDraftDirty = () =>
    !card &&
    (title.trim().length > 0 ||
      content.trim().length > 0 ||
      selectedTagIds.length > 0);

  const closeCardDialog = () => {
    dispatch({ type: 'fieldsChanged', values: { discardOpen: false } });
    onOpenChange(false);
  };

  const onCardOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      onOpenChange(true);
      return;
    }

    if (discardOpen) {
      dispatch({ type: 'fieldsChanged', values: { discardOpen: false } });
      return;
    }

    if (isNewCardDraftDirty()) {
      dispatch({
        type: 'fieldsChanged',
        values: {
          creatingTag: false,
          discardOpen: true,
          newTagName: '',
          tagError: '',
          tagsOpen: false,
        },
      });
      return;
    }

    closeCardDialog();
  };

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
      dispatch({
        type: 'fieldsChanged',
        values: { error: 'Enter a card title.' },
      });
    } else {
      lastValidTitleRef.current = trimmedTitle;
      dispatch({ type: 'fieldsChanged', values: { error: '' } });
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
      dispatch({ type: 'fieldsChanged', values: { error: message } });
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (card) {
      closeCardDialog();
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
      dispatch({ type: 'fieldsChanged', values: { error: message } });
      return;
    }

    closeCardDialog();
  };

  const onConfirmDeleteCard = () => {
    onDelete?.();
    closeCardDialog();
  };

  const onTitleChange = (value: string) => {
    dispatch({ type: 'fieldsChanged', values: { title: value } });
    saveExistingCard({ title: value });
  };

  const onContentChange = (value: string) => {
    dispatch({ type: 'fieldsChanged', values: { content: value } });
    saveExistingCard({ content: value });
  };

  const onColumnChange = (value: string) => {
    dispatch({ type: 'fieldsChanged', values: { selectedColumnId: value } });
    saveExistingCard({ columnId: value });
  };

  const onPriorityChange = (value: CardPriority) => {
    dispatch({ type: 'fieldsChanged', values: { priority: value } });
    saveExistingCard({ priority: value });
  };

  const toggleTag = (tagId: string) => {
    const nextTagIds = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter((selectedTagId) => selectedTagId !== tagId)
      : [...selectedTagIds, tagId];

    dispatch({ type: 'fieldsChanged', values: { selectedTagIds: nextTagIds } });
    saveExistingCard({ tagIds: nextTagIds });
  };

  const createTag = () => {
    const name = newTagName.trim();

    if (!name) {
      dispatch({
        type: 'fieldsChanged',
        values: { tagError: 'Enter a tag name.' },
      });
      return;
    }

    if (tags.some((tag) => tag.name.toLowerCase() === name.toLowerCase())) {
      dispatch({
        type: 'fieldsChanged',
        values: { tagError: 'Tag names must be unique.' },
      });
      return;
    }

    const tag = { id: crypto.randomUUID(), name };
    const nextTags = [...tags, tag];
    const nextTagIds = [...selectedTagIds, tag.id];

    onTagsChange(nextTags);
    saveExistingCard({ tagIds: nextTagIds });
    dispatch({ selectedTagIds: nextTagIds, type: 'tagCreated' });
  };

  const onTagsOpenChange = (nextOpen: boolean) => {
    dispatch({ type: 'fieldsChanged', values: { tagsOpen: nextOpen } });

    if (!nextOpen) {
      dispatch({ type: 'tagsClosed' });
    }
  };

  const onTitleBlur = () => {
    if (!title.trim() && !lastValidTitleRef.current) {
      return;
    }

    dispatch({ type: 'fieldsChanged', values: { titleEditing: false } });
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
      <Dialog.Root open={open} onOpenChange={onCardOpenChange}>
        <Dialog.Portal>
          <Dialog.Backdrop className="dialog-backdrop" />
          <Dialog.Viewport className="dialog-viewport">
            <Dialog.Popup
              className={`dialog-popup dialog-popup--card ${discardOpen ? 'dialog-popup--card-confirm' : ''}`}
              role={discardOpen ? 'alertdialog' : 'dialog'}
            >
              {discardOpen ? (
                <>
                  <Dialog.Title className="dialog-title">
                    Discard new card?
                  </Dialog.Title>
                  <Dialog.Description className="dialog-description">
                    This will close the new card without saving its title,
                    content, or tags.
                  </Dialog.Description>
                  <div className="dialog-actions">
                    <Button
                      className="button button--subtle"
                      onClick={() =>
                        dispatch({
                          type: 'fieldsChanged',
                          values: { discardOpen: false },
                        })
                      }
                      type="button"
                    >
                      Cancel
                    </Button>
                    <Button
                      className="button button--danger"
                      onClick={closeCardDialog}
                      type="button"
                    >
                      Discard card
                    </Button>
                  </div>
                </>
              ) : (
                <form onSubmit={onSubmit}>
                  <div className="dialog-header">
                    <Dialog.Title className="dialog-title">
                      {card ? 'Card' : 'New card'}
                    </Dialog.Title>
                    <Button
                      aria-label="Close card"
                      className="icon-button dialog-close"
                      onClick={() => onCardOpenChange(false)}
                      type="button"
                    >
                      <X size={17} />
                    </Button>
                  </div>
                  <div className="card-title-row">
                    <h2 className="card-title-field">
                      {titleEditing ? (
                        <Field.Control
                          aria-label="Card title"
                          className="card-title-field__input"
                          maxLength={120}
                          onBlur={onTitleBlur}
                          onValueChange={onTitleChange}
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
                        <Button
                          aria-label="Edit card title"
                          className="card-title-field__display"
                          onClick={() =>
                            dispatch({
                              type: 'fieldsChanged',
                              values: { titleEditing: true },
                            })
                          }
                          type="button"
                        >
                          {title.trim() ||
                            lastValidTitleRef.current ||
                            'Untitled card'}
                        </Button>
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
                  <DialogSelect
                    label="Column"
                    name="column"
                    onValueChange={onColumnChange}
                    options={columns.map((column) => ({
                      label: column.title,
                      value: column.id,
                    }))}
                    renderValue={(value) =>
                      columns.find((column) => column.id === value)?.title ??
                      'Choose column'
                    }
                    value={selectedColumnId}
                  />
                  <DialogSelect
                    label="Priority"
                    name="priority"
                    onValueChange={onPriorityChange}
                    options={PRIORITY_OPTIONS}
                    renderValue={(value) =>
                      value ? formatPriorityLabel(value) : 'Choose priority'
                    }
                    value={priority}
                  />
                  <div className="dialog-field">
                    <span className="dialog-label">Tags</span>
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
                                const selected = selectedTagIds.includes(
                                  tag.id
                                );

                                return (
                                  <Button
                                    aria-selected={selected}
                                    className="tag-select__option"
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
                              <InlineEmptyState variant="dropdown">
                                No tags yet
                              </InlineEmptyState>
                            )}
                            <div className="tag-select__create">
                              {creatingTag ? (
                                <Field.Root invalid={Boolean(tagError)}>
                                  <Field.Control
                                    aria-label="New tag name"
                                    autoFocus
                                    maxLength={60}
                                    onValueChange={(value) => {
                                      dispatch({
                                        type: 'fieldsChanged',
                                        values: {
                                          newTagName: value,
                                          tagError: '',
                                        },
                                      });
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
                                  onClick={() => {
                                    dispatch({
                                      type: 'fieldsChanged',
                                      values: {
                                        creatingTag: true,
                                        tagError: '',
                                      },
                                    });
                                  }}
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
                  </div>
                  <div className="dialog-field">
                    <span
                      className="dialog-label"
                      id={`card-content-label-${card?.id ?? columnId}`}
                    >
                      Content
                    </span>
                    <CardContentEditor
                      id={`card-content-editor-${card?.id ?? columnId}`}
                      labelId={`card-content-label-${card?.id ?? columnId}`}
                      onChange={onContentChange}
                      value={content}
                    />
                  </div>
                  <Field.Root
                    className="dialog-form-error"
                    invalid={Boolean(error)}
                  >
                    <Field.Error
                      className="dialog-error"
                      match={Boolean(error)}
                    >
                      {error}
                    </Field.Error>
                  </Field.Root>
                  {card ? (
                    <div className="dialog-actions dialog-actions--spread">
                      <div />
                      <div className="dialog-actions__group">
                        <Button
                          className="button button--danger"
                          onClick={() =>
                            dispatch({
                              type: 'fieldsChanged',
                              values: { deleteOpen: true },
                            })
                          }
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
              )}
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
      {card && (
        <ConfirmDialog
          confirmLabel="Delete card"
          description={`This will permanently delete ${title.trim() || lastValidTitleRef.current || 'this card'}.`}
          onConfirm={onConfirmDeleteCard}
          onOpenChange={(nextOpen) =>
            dispatch({
              type: 'fieldsChanged',
              values: { deleteOpen: nextOpen },
            })
          }
          open={deleteOpen}
          title="Delete this card?"
        />
      )}
    </>
  );
};

export default CardDialog;
