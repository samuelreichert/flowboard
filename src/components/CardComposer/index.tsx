import { useId, useLayoutEffect, useMemo, useReducer, useRef } from 'react';
import type { FormEvent } from 'react';

import type { CardDialogValues } from '../CardDialog';
import type { BoardColumn, BoardTag, CardPriority } from '../../types';
import ComposerInput from './ComposerInput';
import ComposerMetaControls from './ComposerMetaControls';
import {
  cardComposerReducer,
  createCardComposerState,
} from './cardComposerState';
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
  const [state, dispatch] = useReducer(
    cardComposerReducer,
    getFallbackColumnId(columns),
    createCardComposerState
  );
  const {
    creatingTag,
    draft,
    error,
    focused,
    newTagName,
    preferredColumnId,
    priority,
    selectedTagIds,
    tagError,
    tagsOpen,
  } = state;

  const hasColumns = columns.length > 0;
  const selectedColumnId =
    hasColumns && columns.some((column) => column.id === preferredColumnId)
      ? preferredColumnId
      : getFallbackColumnId(columns);
  const selectedColumn = columns.find(
    (column) => column.id === selectedColumnId
  );
  const selectedAvailableTagIds = useMemo(
    () =>
      selectedTagIds.filter((tagId) => tags.some((tag) => tag.id === tagId)),
    [selectedTagIds, tags]
  );
  const selectedTagIdSet = useMemo(
    () => new Set(selectedAvailableTagIds),
    [selectedAvailableTagIds]
  );
  const selectedTags = selectedAvailableTagIds
    .map((tagId) => tags.find((tag) => tag.id === tagId))
    .filter((tag): tag is BoardTag => Boolean(tag));
  const tagSummary =
    selectedTags.length === 0
      ? ''
      : selectedTags.length === 1
        ? selectedTags[0].name
        : `${selectedTags[0].name} +${selectedTags.length - 1}`;
  const canSubmit = hasColumns && draft.trim().length > 0;

  useLayoutEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [draft]);

  const closeTags = () => dispatch({ type: 'tagsClosed' });

  const toggleTag = (tagId: string) => {
    const tagIds = selectedTagIdSet.has(tagId)
      ? selectedAvailableTagIds.filter(
          (selectedTagId) => selectedTagId !== tagId
        )
      : [...selectedAvailableTagIds, tagId];

    dispatch({ tagIds, type: 'selectedTagIdsChanged' });
  };

  const createTag = () => {
    const name = newTagName.trim();

    if (!name) {
      dispatch({ error: 'Enter a tag name.', type: 'tagErrorChanged' });
      return;
    }

    if (tags.some((tag) => tag.name.toLowerCase() === name.toLowerCase())) {
      dispatch({ error: 'Tag names must be unique.', type: 'tagErrorChanged' });
      return;
    }

    const tag = { id: crypto.randomUUID(), name };

    onTagsChange([...tags, tag]);
    dispatch({
      tagIds: [...selectedAvailableTagIds, tag.id],
      type: 'tagCreated',
    });
  };

  const submitDraft = () => {
    if (!hasColumns || !selectedColumn) {
      dispatch({
        error: 'Add a column before capturing cards.',
        type: 'submitFailed',
      });
      return;
    }

    const parsedDraft = parseComposerDraft(draft);

    if (!parsedDraft.title) {
      dispatch({ error: 'Enter a card title.', type: 'submitFailed' });
      return;
    }

    const message = onSave({
      columnId: selectedColumn.id,
      content: parsedDraft.content,
      priority,
      tagIds: selectedAvailableTagIds,
      title: parsedDraft.title,
    });

    if (message) {
      dispatch({ error: message, type: 'submitFailed' });
      return;
    }

    dispatch({ type: 'submitted' });
    textareaRef.current?.focus();
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitDraft();
  };

  return (
    <form
      aria-label="Card composer"
      className={`card-composer${focused || draft ? ' card-composer--active' : ''}`}
      onSubmit={onSubmit}
    >
      <ComposerInput
        disabled={!hasColumns}
        draft={draft}
        error={error}
        errorId={errorId}
        inputId={inputId}
        onBlur={() => dispatch({ focused: false, type: 'focusedChanged' })}
        onChange={(nextDraft) =>
          dispatch({ draft: nextDraft, type: 'draftChanged' })
        }
        onFocus={() => dispatch({ focused: true, type: 'focusedChanged' })}
        onSubmitShortcut={submitDraft}
        textareaRef={textareaRef}
      />
      {error && (
        <p className="card-composer__error" id={errorId}>
          {error}
        </p>
      )}
      <ComposerMetaControls
        canSubmit={canSubmit}
        columns={columns}
        creatingTag={creatingTag}
        hasColumns={hasColumns}
        newTagName={newTagName}
        onAddColumnClick={onAddColumnClick}
        onCreateTag={createTag}
        onNewTagNameChange={(name) =>
          dispatch({ name, type: 'newTagNameChanged' })
        }
        onPriorityChange={(nextPriority) =>
          dispatch({ priority: nextPriority, type: 'priorityChanged' })
        }
        onSelectedColumnChange={(columnId) =>
          dispatch({ columnId, type: 'preferredColumnChanged' })
        }
        onStartCreatingTag={() => dispatch({ type: 'tagCreateStarted' })}
        onTagToggle={toggleTag}
        onTagsOpenChange={(open) =>
          open ? dispatch({ type: 'tagsOpened' }) : closeTags()
        }
        priority={priority}
        priorityOptions={PRIORITY_OPTIONS}
        selectedColumnId={selectedColumnId}
        selectedTagIdSet={selectedTagIdSet}
        tagError={tagError}
        tagSummary={tagSummary}
        tags={tags}
        tagsOpen={tagsOpen}
      />
    </form>
  );
};

export default CardComposer;
