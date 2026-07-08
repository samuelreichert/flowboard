import { Button } from '@base-ui/react/button';
import { Dialog } from '@base-ui/react/dialog';
import { Field } from '@base-ui/react/field';
import { Popover } from '@base-ui/react/popover';
import { Check, ChevronDown, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useReducer, useRef } from 'react';
import type { FormEvent, RefObject } from 'react';

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

type DiscardNewCardConfirmationProps = {
  onCancel: () => void;
  onDiscard: () => void;
};

const DiscardNewCardConfirmation = ({
  onCancel,
  onDiscard,
}: DiscardNewCardConfirmationProps) => (
  <>
    <Dialog.Title className="dialog-title">Discard new card?</Dialog.Title>
    <Dialog.Description className="dialog-description">
      This will close the new card without saving its title, content, or tags.
    </Dialog.Description>
    <div className="dialog-actions">
      <Button
        className="button button--subtle"
        onClick={onCancel}
        type="button"
      >
        Cancel
      </Button>
      <Button
        className="button button--danger"
        onClick={onDiscard}
        type="button"
      >
        Discard card
      </Button>
    </div>
  </>
);

type CardTitleFieldProps = {
  card: BoardCard | undefined;
  createdAtLabel: string;
  fallbackTitle: string;
  onEditClick: () => void;
  onTitleBlur: () => void;
  onTitleChange: (value: string) => void;
  title: string;
  titleEditing: boolean;
  titleInputRef: RefObject<HTMLInputElement | null>;
};

const CardTitleField = ({
  card,
  createdAtLabel,
  fallbackTitle,
  onEditClick,
  onTitleBlur,
  onTitleChange,
  title,
  titleEditing,
  titleInputRef,
}: CardTitleFieldProps) => (
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
          onClick={onEditClick}
          type="button"
        >
          {title.trim() || fallbackTitle || 'Untitled card'}
        </Button>
      )}
    </h2>
    {createdAtLabel && (
      <time className="card-created-at" dateTime={card?.createdAt}>
        Created {createdAtLabel}
      </time>
    )}
  </div>
);

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
  const selectedTagIdSet = new Set(selectedTagIds);

  return (
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
                      onValueChange={onNewTagNameChange}
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
                    onClick={onCreateTagClick}
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
  );
};

type CardContentFieldProps = {
  card: BoardCard | undefined;
  columnId: string;
  content: string;
  onContentChange: (value: string) => void;
};

const CardContentField = ({
  card,
  columnId,
  content,
  onContentChange,
}: CardContentFieldProps) => {
  const contentId = card?.id ?? columnId;

  return (
    <div className="dialog-field">
      <span className="dialog-label" id={`card-content-label-${contentId}`}>
        Content
      </span>
      <CardContentEditor
        id={`card-content-editor-${contentId}`}
        labelId={`card-content-label-${contentId}`}
        onChange={onContentChange}
        value={content}
      />
    </div>
  );
};

type CardDialogFooterProps = {
  card: BoardCard | undefined;
  error: string;
  onDeleteClick: () => void;
};

const CardDialogFooter = ({
  card,
  error,
  onDeleteClick,
}: CardDialogFooterProps) => (
  <>
    <Field.Root className="dialog-form-error" invalid={Boolean(error)}>
      <Field.Error className="dialog-error" match={Boolean(error)}>
        {error}
      </Field.Error>
    </Field.Root>
    {card ? (
      <div className="dialog-actions dialog-actions--spread">
        <div />
        <div className="dialog-actions__group">
          <Button
            className="button button--danger"
            onClick={onDeleteClick}
            type="button"
          >
            <Trash2 size={16} />
            Delete card
          </Button>
        </div>
      </div>
    ) : (
      <div className="dialog-actions">
        <Dialog.Close className="button button--subtle" render={<Button />}>
          Cancel
        </Dialog.Close>
        <Button className="button button--primary" type="submit">
          Create
        </Button>
      </div>
    )}
  </>
);

const useCardDialogController = ({
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

  const cancelDiscardNewCard = () =>
    dispatch({
      type: 'fieldsChanged',
      values: { discardOpen: false },
    });

  const editTitle = () =>
    dispatch({
      type: 'fieldsChanged',
      values: { titleEditing: true },
    });

  const openDeleteConfirmation = () =>
    dispatch({
      type: 'fieldsChanged',
      values: { deleteOpen: true },
    });

  const onDeleteOpenChange = (nextOpen: boolean) =>
    dispatch({
      type: 'fieldsChanged',
      values: { deleteOpen: nextOpen },
    });

  const onNewTagNameChange = (value: string) =>
    dispatch({
      type: 'fieldsChanged',
      values: {
        newTagName: value,
        tagError: '',
      },
    });

  const startCreatingTag = () =>
    dispatch({
      type: 'fieldsChanged',
      values: {
        creatingTag: true,
        tagError: '',
      },
    });

  const createdAtLabel = card?.createdAt ? formatCreatedAt(card.createdAt) : '';
  const selectedTags = selectedTagIds
    .map((tagId) => tags.find((tag) => tag.id === tagId))
    .filter((tag): tag is BoardTag => Boolean(tag));
  const tagSummary =
    selectedTags.length > 0
      ? selectedTags.map((tag) => tag.name).join(', ')
      : 'No tags';

  return {
    cancelDiscardNewCard,
    card,
    closeCardDialog,
    columnId,
    columns,
    content,
    createdAtLabel,
    createTag,
    creatingTag,
    deleteOpen,
    discardOpen,
    editTitle,
    error,
    lastValidTitle: lastValidTitleRef.current,
    newTagName,
    onCardOpenChange,
    onColumnChange,
    onConfirmDeleteCard,
    onContentChange,
    onDeleteOpenChange,
    onNewTagNameChange,
    onPriorityChange,
    onSubmit,
    onTagsOpenChange,
    onTitleBlur,
    onTitleChange,
    open,
    openDeleteConfirmation,
    priority,
    selectedColumnId,
    selectedTagIds,
    startCreatingTag,
    tagError,
    tagSummary,
    tags,
    tagsOpen,
    title,
    titleEditing,
    titleInputRef,
    toggleTag,
  };
};

const CardDialogContent = (props: CardDialogProps) => {
  const {
    cancelDiscardNewCard,
    card,
    closeCardDialog,
    columnId,
    columns,
    content,
    createdAtLabel,
    createTag,
    creatingTag,
    deleteOpen,
    discardOpen,
    editTitle,
    error,
    lastValidTitle,
    newTagName,
    onCardOpenChange,
    onColumnChange,
    onConfirmDeleteCard,
    onContentChange,
    onDeleteOpenChange,
    onNewTagNameChange,
    onPriorityChange,
    onSubmit,
    onTagsOpenChange,
    onTitleBlur,
    onTitleChange,
    open,
    openDeleteConfirmation,
    priority,
    selectedColumnId,
    selectedTagIds,
    startCreatingTag,
    tagError,
    tagSummary,
    tags,
    tagsOpen,
    title,
    titleEditing,
    titleInputRef,
    toggleTag,
  } = useCardDialogController(props);

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
                <DiscardNewCardConfirmation
                  onCancel={cancelDiscardNewCard}
                  onDiscard={closeCardDialog}
                />
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
                  <CardTitleField
                    card={card}
                    createdAtLabel={createdAtLabel}
                    fallbackTitle={lastValidTitle}
                    onEditClick={editTitle}
                    onTitleBlur={onTitleBlur}
                    onTitleChange={onTitleChange}
                    title={title}
                    titleEditing={titleEditing}
                    titleInputRef={titleInputRef}
                  />
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
                  <TagSelectField
                    creatingTag={creatingTag}
                    newTagName={newTagName}
                    onCreateTag={createTag}
                    onCreateTagClick={startCreatingTag}
                    onNewTagNameChange={onNewTagNameChange}
                    onTagToggle={toggleTag}
                    onTagsOpenChange={onTagsOpenChange}
                    selectedTagIds={selectedTagIds}
                    tagError={tagError}
                    tagSummary={tagSummary}
                    tags={tags}
                    tagsOpen={tagsOpen}
                  />
                  <CardContentField
                    card={card}
                    columnId={columnId}
                    content={content}
                    onContentChange={onContentChange}
                  />
                  <CardDialogFooter
                    card={card}
                    error={error}
                    onDeleteClick={openDeleteConfirmation}
                  />
                </form>
              )}
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
      {card && (
        <ConfirmDialog
          confirmLabel="Delete card"
          description={`This will permanently delete ${title.trim() || lastValidTitle || 'this card'}.`}
          onConfirm={onConfirmDeleteCard}
          onOpenChange={onDeleteOpenChange}
          open={deleteOpen}
          title="Delete this card?"
        />
      )}
    </>
  );
};

export default CardDialog;
