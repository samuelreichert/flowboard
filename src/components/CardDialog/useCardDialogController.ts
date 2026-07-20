import { useEffect, useReducer, useRef, useState } from 'react';

import { useLocalization } from '../../LocalizationProvider';
import {
  createTag as createBoardTag,
  getTagNameError,
  TAG_NAME_REQUIRED_MESSAGE,
} from '../../board/tags';
import type { BoardTag, CardPriority } from '../../types';
import { cardDialogReducer, createCardDialogState } from './cardDialogReducer';
import { formatCreatedAt } from './formatters';
import { getTagSummary } from './tagSelection';
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
  const [localTags, setLocalTags] = useState(tags);
  const [state, dispatch] = useReducer(
    cardDialogReducer,
    createCardDialogState(card, columnId)
  );
  const contentEditedRef = useRef(false);
  const hydratedContentRef = useRef(card.content);
  const titleDirtyRef = useRef(false);
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
  const [localSelectedTagIds, setLocalSelectedTagIds] =
    useState(selectedTagIds);
  const currentValuesRef = useRef({
    content,
    priority,
    selectedColumnId,
    selectedTagIds: localSelectedTagIds,
    title,
  });
  const currentNewTagNameRef = useRef(newTagName);

  const { lastValidTitle, saveExistingCard } = useCardDialogAutosave({
    dispatch,
    initialTitle: card.title,
    onSave,
    state: currentValuesRef,
    titleRequiredMessage: messages.card.titleRequired,
  });

  useEffect(() => {
    currentValuesRef.current = {
      content,
      priority,
      selectedColumnId,
      selectedTagIds: localSelectedTagIds,
      title,
    };
  }, [content, localSelectedTagIds, priority, selectedColumnId, title]);

  useEffect(() => {
    currentNewTagNameRef.current = newTagName;
  }, [newTagName]);

  useEffect(() => {
    setLocalTags((currentTags) => {
      const currentTagById = new Map(
        currentTags.map((tag) => [tag.id, tag])
      );

      for (const tag of tags) {
        currentTagById.set(tag.id, tag);
      }

      return Array.from(currentTagById.values());
    });
  }, [tags]);

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
    if (titleDirtyRef.current) {
      saveExistingCard({ title: currentValuesRef.current.title });
      titleDirtyRef.current = false;
    }

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
    currentValuesRef.current.title = value;
    titleDirtyRef.current = true;
    dispatch({ type: 'fieldsChanged', values: { title: value } });
  };

  const onContentChange = (value: string) => {
    contentEditedRef.current = true;
    currentValuesRef.current.content = value;
    const pendingTitle = currentValuesRef.current.title;
    const nextValues =
      titleDirtyRef.current && pendingTitle.trim()
        ? { content: value, title: pendingTitle }
        : { content: value };

    if ('title' in nextValues) {
      titleDirtyRef.current = false;
    }

    dispatch({ type: 'fieldsChanged', values: { content: value } });
    saveExistingCard(nextValues);
  };

  const onColumnChange = (value: string) => {
    currentValuesRef.current.selectedColumnId = value;
    dispatch({ type: 'fieldsChanged', values: { selectedColumnId: value } });
    saveExistingCard({ columnId: value });
  };

  const onPriorityChange = (value: CardPriority) => {
    currentValuesRef.current.priority = value;
    dispatch({ type: 'fieldsChanged', values: { priority: value } });
    saveExistingCard({ priority: value });
  };

  const onSelectedTagIdsChange = (nextTagIds: string[]) => {
    setLocalSelectedTagIds(nextTagIds);
    currentValuesRef.current.selectedTagIds = nextTagIds;
    dispatch({ type: 'fieldsChanged', values: { selectedTagIds: nextTagIds } });
    saveExistingCard({ tagIds: nextTagIds });
  };

  const createTag = () => {
    const nextTagName = currentNewTagNameRef.current;
    const error = getTagNameError(localTags, nextTagName);

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
      localTags,
      nextTagName,
      crypto.randomUUID()
    );
    const nextTagIds = [...localSelectedTagIds, tag.id];

    setLocalTags(nextTags);
    setLocalSelectedTagIds(nextTagIds);
    currentValuesRef.current.selectedTagIds = nextTagIds;
    dispatch({ selectedTagIds: nextTagIds, type: 'tagCreated' });
    onTagsChange(nextTags);
    saveExistingCard({ tagIds: nextTagIds });
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

    saveExistingCard({ title: currentValuesRef.current.title });
    titleDirtyRef.current = false;
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

  const onNewTagNameChange = (value: string) => {
    currentNewTagNameRef.current = value;
    dispatch({
      type: 'fieldsChanged',
      values: {
        newTagName: value,
        tagError: '',
      },
    });
  };

  const startCreatingTag = () =>
    dispatch({
      type: 'fieldsChanged',
      values: {
        creatingTag: true,
        tagError: '',
      },
    });

  const createdAtLabel = formatCreatedAt(card.createdAt, language);
  const tagSummary = getTagSummary(
    localTags,
    localSelectedTagIds,
    messages.card.noTags
  );

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
    selectedTagIds: localSelectedTagIds,
    startCreatingTag,
    tagError,
    tagSummary,
    tags: localTags,
    tagsOpen,
    title,
    titleEditing,
    titleInputRef,
    onSelectedTagIdsChange,
  };
};

export default useCardDialogController;
