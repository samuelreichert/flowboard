import { Button } from '@base-ui/react/button';
import { Field } from '@base-ui/react/field';
import { Pencil, Tag, Trash2 } from 'lucide-react';
import { useEffect, useReducer } from 'react';
import type { KeyboardEvent } from 'react';

import { useLocalization } from '../../LocalizationProvider';
import ConfirmDialog from '../ConfirmDialog';
import DialogShell from '../DialogShell';
import {
  createTag as createBoardTag,
  getTagNameError,
  renameTag,
  TAG_NAME_REQUIRED_MESSAGE,
} from '../../board/tags';
import { InlineEmptyState } from '../EmptyState';
import type { BoardTag } from '../../types';
import './TagManagerDialog.css';

type TagManagerDialogProps = {
  getTagUsageCount: (tagId: string) => number;
  onDeleteTag: (tagId: string) => void;
  onOpenChange: (open: boolean) => void;
  onTagsChange: (tags: BoardTag[]) => void;
  open: boolean;
  routeOwned?: boolean;
  tags: BoardTag[];
};

type TagManagerState = {
  createError: string;
  editError: string;
  editingTagId: string | null;
  editingTagName: string;
  newTagName: string;
  pendingDelete: BoardTag | null;
};

type TagManagerAction =
  | { type: 'createErrorChanged'; error: string }
  | { type: 'createNameChanged'; name: string }
  | { type: 'editErrorChanged'; error: string }
  | { type: 'editNameChanged'; name: string }
  | { type: 'editingCanceled' }
  | { type: 'renameStarted'; tag: BoardTag }
  | { type: 'reset' }
  | { type: 'tagCreated' }
  | { type: 'tagDeleteRequested'; tag: BoardTag | null }
  | { type: 'tagRenamed' };

const initialTagManagerState: TagManagerState = {
  createError: '',
  editError: '',
  editingTagId: null,
  editingTagName: '',
  newTagName: '',
  pendingDelete: null,
};

const tagManagerReducer = (
  state: TagManagerState,
  action: TagManagerAction
): TagManagerState => {
  switch (action.type) {
    case 'createErrorChanged':
      return { ...state, createError: action.error };
    case 'createNameChanged':
      return { ...state, createError: '', newTagName: action.name };
    case 'editErrorChanged':
      return { ...state, editError: action.error };
    case 'editNameChanged':
      return { ...state, editError: '', editingTagName: action.name };
    case 'editingCanceled':
      return {
        ...state,
        editError: '',
        editingTagId: null,
        editingTagName: '',
      };
    case 'renameStarted':
      return {
        ...state,
        editError: '',
        editingTagId: action.tag.id,
        editingTagName: action.tag.name,
      };
    case 'reset':
      return initialTagManagerState;
    case 'tagCreated':
      return { ...state, createError: '', newTagName: '' };
    case 'tagDeleteRequested':
      return { ...state, pendingDelete: action.tag };
    case 'tagRenamed':
      return {
        ...state,
        editError: '',
        editingTagId: null,
        editingTagName: '',
      };
  }
};

const TagManagerDialog = ({
  getTagUsageCount,
  onDeleteTag,
  onOpenChange,
  onTagsChange,
  open,
  routeOwned = false,
  tags,
}: TagManagerDialogProps) => {
  const { messages } = useLocalization();
  const [state, dispatch] = useReducer(
    tagManagerReducer,
    initialTagManagerState
  );
  const {
    createError,
    editError,
    editingTagId,
    editingTagName,
    newTagName,
    pendingDelete,
  } = state;

  useEffect(() => {
    if (!open) {
      return;
    }

    dispatch({ type: 'reset' });
  }, [open]);

  const createTag = () => {
    const error = getTagNameError(tags, newTagName);

    if (error) {
      dispatch({
        error:
          error === TAG_NAME_REQUIRED_MESSAGE
            ? messages.card.tagNameRequired
            : messages.card.tagNamesUnique,
        type: 'createErrorChanged',
      });
      return;
    }

    onTagsChange(createBoardTag(tags, newTagName, crypto.randomUUID()).tags);
    dispatch({ type: 'tagCreated' });
  };

  const saveRename = (tagId: string, options?: { revertInvalid?: boolean }) => {
    const error = getTagNameError(tags, editingTagName, tagId);
    const revertInvalid = Boolean(options?.revertInvalid);

    if (error) {
      if (revertInvalid) {
        dispatch({ type: 'editingCanceled' });
        return;
      }

      dispatch({
        error:
          error === TAG_NAME_REQUIRED_MESSAGE
            ? messages.card.tagNameRequired
            : messages.card.tagNamesUnique,
        type: 'editErrorChanged',
      });
      return;
    }

    onTagsChange(renameTag(tags, tagId, editingTagName));
    dispatch({ type: 'tagRenamed' });
  };

  const onCreateKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      createTag();
    }
  };

  const requestDelete = (tag: BoardTag) => {
    if (getTagUsageCount(tag.id) > 0) {
      dispatch({ tag, type: 'tagDeleteRequested' });
      return;
    }

    onDeleteTag(tag.id);
  };

  return (
    <>
      <DialogShell
        closeLabel={messages.tagManager.close}
        description={messages.tagManager.createDescription}
        onOpenChange={onOpenChange}
        open={open}
        popupClassName={
          routeOwned ? 'dialog-popup--route-management' : undefined
        }
        title={messages.tagManager.manageTags}
      >
        <div className="tag-manager__create">
          <Field.Root className="dialog-field" invalid={Boolean(createError)}>
            <Field.Label>{messages.tagManager.newTag}</Field.Label>
            <div className="tag-manager__create-row">
              <div className="tag-manager__input">
                <Tag size={15} />
                <Field.Control
                  autoFocus
                  maxLength={60}
                  onValueChange={(value) => {
                    dispatch({
                      name: value,
                      type: 'createNameChanged',
                    });
                  }}
                  onKeyDown={onCreateKeyDown}
                  placeholder="Design"
                  type="text"
                  value={newTagName}
                />
              </div>
            </div>
            <Field.Error className="dialog-error" match={Boolean(createError)}>
              {createError}
            </Field.Error>
          </Field.Root>
        </div>
        <div className="tag-manager__list">
          {tags.length > 0 ? (
            tags.map((tag) => {
              const isEditing = editingTagId === tag.id;

              return (
                <div
                  className={`tag-manager__item${isEditing ? ' tag-manager__item--editing' : ''}`}
                  key={tag.id}
                >
                  {isEditing ? (
                    <Field.Root
                      className="tag-manager__edit-field"
                      invalid={Boolean(editError)}
                    >
                      <Field.Control
                        aria-label={messages.tagManager.editTag(tag.name)}
                        autoFocus
                        className="dialog-input tag-manager__edit-input"
                        maxLength={60}
                        onBlur={() =>
                          saveRename(tag.id, { revertInvalid: true })
                        }
                        onValueChange={(value) => {
                          dispatch({
                            name: value,
                            type: 'editNameChanged',
                          });
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            saveRename(tag.id);
                          }

                          if (event.key === 'Escape') {
                            event.preventDefault();
                            dispatch({ type: 'editingCanceled' });
                          }
                        }}
                        type="text"
                        value={editingTagName}
                      />
                      <Field.Error
                        className="dialog-error tag-manager__edit-error"
                        match={Boolean(editError)}
                      >
                        {editError}
                      </Field.Error>
                    </Field.Root>
                  ) : (
                    <>
                      <div>
                        <span className="tag-manager__name">{tag.name}</span>
                        <span className="tag-manager__usage">
                          {messages.tagManager.usage(getTagUsageCount(tag.id))}
                        </span>
                      </div>
                      <div className="tag-manager__actions">
                        <Button
                          aria-label={messages.tagManager.renameTag(tag.name)}
                          className="icon-button"
                          onClick={() => {
                            dispatch({
                              tag,
                              type: 'renameStarted',
                            });
                          }}
                          type="button"
                        >
                          <Pencil size={15} />
                        </Button>
                        <Button
                          aria-label={messages.tagManager.removeTagAction(
                            tag.name
                          )}
                          className="icon-button tag-manager__delete"
                          onClick={() => requestDelete(tag)}
                          type="button"
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          ) : (
            <InlineEmptyState variant="list">
              {messages.tagManager.noTagsYet}
            </InlineEmptyState>
          )}
        </div>
      </DialogShell>
      {pendingDelete && (
        <ConfirmDialog
          confirmLabel={messages.tagManager.removeTag}
          description={messages.tagManager.removeTagDescription(
            pendingDelete.name,
            getTagUsageCount(pendingDelete.id)
          )}
          onConfirm={() => {
            onDeleteTag(pendingDelete.id);
            dispatch({ tag: null, type: 'tagDeleteRequested' });
          }}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              dispatch({ tag: null, type: 'tagDeleteRequested' });
            }
          }}
          open={Boolean(pendingDelete)}
          title={messages.tagManager.removeTagTitle}
        />
      )}
    </>
  );
};

export default TagManagerDialog;
