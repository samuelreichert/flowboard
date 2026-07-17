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
import { getTagSummary, toggleSelectedTagId } from './tagSelection';
import type { CardDialogProps } from './types';
import { useCardDialogAutosave } from './useCardDialogAutosave';

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
  const contentEditedRef = useRef(false);
  const hydratedContentRef = useRef(card.content);
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
  const { lastValidTitle, saveExistingCard } = useCardDialogAutosave({
    dispatch,
    initialTitle: card.title,
    onSave,
    state: {
      content,
      priority,
      selectedColumnId,
      selectedTagIds,
      title,
    },
    titleRequiredMessage: messages.card.titleRequired,
  });

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

  useEffect(() => {
    if (card.content === hydratedContentRef.current) {
      return;
    }

    hydratedContentRef.current = card.content;

    if (!contentEditedRef.current) {
      dispatch({ type: 'fieldsChanged', values: { content: card.content } });
    }
  }, [card.content]);

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

  const onConfirmDeleteCard = () => {
    onDelete();
    closeCardDialog();
  };

  const onTitleChange = (value: string) => {
    dispatch({ type: 'fieldsChanged', values: { title: value } });
    saveExistingCard({ title: value });
  };

  const onContentChange = (value: string) => {
    contentEditedRef.current = true;
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
    const nextTagIds = toggleSelectedTagId(selectedTagIds, tagId);

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
    if (!title.trim() && !lastValidTitle) {
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
  const tagSummary = getTagSummary(tags, selectedTagIds, messages.card.noTags);

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
    lastValidTitle,
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
