import { useEffect, useReducer, useRef } from 'react';

import { useLocalization } from '../../LocalizationProvider';
import {
  createTag as createBoardTag,
  getTagNameError,
  TAG_NAME_REQUIRED_MESSAGE,
} from '../../board/tags';
import type { BoardTag, CardPriority } from '../../types';
import { cardDialogReducer, createCardDialogState } from './cardDialogReducer';
import { formatCreatedAt } from './formatters';
import type { CardDialogProps, CardDialogValues } from './types';

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
  const { language, messages } = useLocalization();
  const [state, dispatch] = useReducer(
    cardDialogReducer,
    createCardDialogState(card, columnId)
  );
  const lastValidTitleRef = useRef(card.title);
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const {
    content,
    creatingTag,
    deleteOpen,
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

  const closeCardDialog = () => {
    onOpenChange(false);
  };

  const onCardOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      onOpenChange(true);
      return;
    }

    closeCardDialog();
  };

  const saveExistingCard = (
    nextValues: Partial<Omit<CardDialogValues, 'title'>> & {
      title?: string;
    }
  ) => {
    const nextTitle = nextValues.title ?? title;
    const trimmedTitle = nextTitle.trim();
    const titleToSave = trimmedTitle || lastValidTitleRef.current;

    if (!trimmedTitle) {
      dispatch({
        type: 'fieldsChanged',
        values: { error: messages.card.titleRequired },
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

  const onConfirmDeleteCard = () => {
    onDelete();
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
    const error = getTagNameError(tags, newTagName);

    if (error) {
      dispatch({
        type: 'fieldsChanged',
        values: {
          tagError:
            error === TAG_NAME_REQUIRED_MESSAGE
              ? messages.card.tagNameRequired
              : messages.card.tagNamesUnique,
        },
      });
      return;
    }

    const { tag, tags: nextTags } = createBoardTag(
      tags,
      newTagName,
      crypto.randomUUID()
    );
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

  const createdAtLabel = formatCreatedAt(card.createdAt, language);
  const tagNameById = new Map(tags.map((tag) => [tag.id, tag.name]));
  const selectedTagNames = selectedTagIds
    .map((tagId) => tagNameById.get(tagId))
    .filter((tagName): tagName is string => Boolean(tagName));
  const tagSummary =
    selectedTagNames.length > 0
      ? selectedTagNames.join(', ')
      : messages.card.noTags;

  return {
    card,
    columns,
    content,
    createdAtLabel,
    createTag,
    creatingTag,
    deleteOpen,
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

export default useCardDialogController;
