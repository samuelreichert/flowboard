import { Button } from '@base-ui/react/button';
import { Dialog } from '@base-ui/react/dialog';
import { Field } from '@base-ui/react/field';
import { Check, Pencil, Plus, Tag, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';

import ConfirmDialog from '../ConfirmDialog';
import type { BoardTag } from '../../types';
import '../IconButton/IconButton.css';
import './TagManagerDialog.css';

type TagManagerDialogProps = {
  getTagUsageCount: (tagId: string) => number;
  onDeleteTag: (tagId: string) => void;
  onOpenChange: (open: boolean) => void;
  onTagsChange: (tags: BoardTag[]) => void;
  open: boolean;
  tags: BoardTag[];
};

const isDuplicateName = (
  tags: BoardTag[],
  name: string,
  ignoredTagId?: string
) =>
  tags.some(
    (tag) =>
      tag.id !== ignoredTagId && tag.name.toLowerCase() === name.toLowerCase()
  );

const TagManagerDialog = ({
  getTagUsageCount,
  onDeleteTag,
  onOpenChange,
  onTagsChange,
  open,
  tags,
}: TagManagerDialogProps) => {
  const [newTagName, setNewTagName] = useState('');
  const [createError, setCreateError] = useState('');
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState('');
  const [editError, setEditError] = useState('');
  const [pendingDelete, setPendingDelete] = useState<BoardTag | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setNewTagName('');
    setCreateError('');
    setEditingTagId(null);
    setEditingTagName('');
    setEditError('');
    setPendingDelete(null);
  }, [open]);

  const createTag = () => {
    const name = newTagName.trim();

    if (!name) {
      setCreateError('Enter a tag name.');
      return;
    }

    if (isDuplicateName(tags, name)) {
      setCreateError('Tag names must be unique.');
      return;
    }

    onTagsChange([...tags, { id: crypto.randomUUID(), name }]);
    setNewTagName('');
    setCreateError('');
  };

  const saveRename = (tagId: string) => {
    const name = editingTagName.trim();

    if (!name) {
      setEditError('Enter a tag name.');
      return;
    }

    if (isDuplicateName(tags, name, tagId)) {
      setEditError('Tag names must be unique.');
      return;
    }

    onTagsChange(
      tags.map((tag) => (tag.id === tagId ? { ...tag, name } : tag))
    );
    setEditingTagId(null);
    setEditingTagName('');
    setEditError('');
  };

  const onCreateKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      createTag();
    }
  };

  const requestDelete = (tag: BoardTag) => {
    if (getTagUsageCount(tag.id) > 0) {
      setPendingDelete(tag);
      return;
    }

    onDeleteTag(tag.id);
  };

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Backdrop className="dialog-backdrop" />
          <Dialog.Viewport className="dialog-viewport">
            <Dialog.Popup className="dialog-popup">
              <div className="dialog-header">
                <div>
                  <Dialog.Title className="dialog-title">
                    Manage tags
                  </Dialog.Title>
                  <Dialog.Description className="dialog-description">
                    Create reusable tags for cards on this board.
                  </Dialog.Description>
                </div>
                <Dialog.Close
                  aria-label="Close tag manager"
                  className="icon-button dialog-close"
                  render={<Button />}
                >
                  <X size={17} />
                </Dialog.Close>
              </div>
              <div className="tag-manager__create">
                <Field.Root
                  className="dialog-field"
                  invalid={Boolean(createError)}
                >
                  <Field.Label>New tag</Field.Label>
                  <div className="tag-manager__create-row">
                    <div className="tag-manager__input">
                      <Tag size={15} />
                      <Field.Control
                        maxLength={60}
                        onValueChange={(value) => {
                          setNewTagName(value);
                          setCreateError('');
                        }}
                        onKeyDown={onCreateKeyDown}
                        placeholder="Design"
                        type="text"
                        value={newTagName}
                      />
                    </div>
                    <Button
                      className="button button--primary tag-manager__create-button"
                      onClick={createTag}
                      type="button"
                    >
                      <Plus size={16} />
                      Create
                    </Button>
                  </div>
                  <Field.Error
                    className="dialog-error"
                    match={Boolean(createError)}
                  >
                    {createError}
                  </Field.Error>
                </Field.Root>
              </div>
              <div className="tag-manager__list">
                {tags.length > 0 ? (
                  tags.map((tag) => {
                    const isEditing = editingTagId === tag.id;

                    return (
                      <div className="tag-manager__item" key={tag.id}>
                        {isEditing ? (
                          <Field.Root
                            className="tag-manager__edit-field"
                            invalid={Boolean(editError)}
                          >
                            <div className="tag-manager__edit">
                              <Field.Control
                                aria-label={`Edit ${tag.name} tag`}
                                className="dialog-input"
                                maxLength={60}
                                onValueChange={(value) => {
                                  setEditingTagName(value);
                                  setEditError('');
                                }}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter') {
                                    event.preventDefault();
                                    saveRename(tag.id);
                                  }

                                  if (event.key === 'Escape') {
                                    event.preventDefault();
                                    setEditingTagId(null);
                                    setEditingTagName('');
                                    setEditError('');
                                  }
                                }}
                                type="text"
                                value={editingTagName}
                              />
                              <Button
                                aria-label={`Save ${tag.name} tag`}
                                className="icon-button"
                                onClick={() => saveRename(tag.id)}
                                type="button"
                              >
                                <Check size={16} />
                              </Button>
                            </div>
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
                              <span className="tag-manager__name">
                                {tag.name}
                              </span>
                              <span className="tag-manager__usage">
                                {getTagUsageCount(tag.id)} cards
                              </span>
                            </div>
                            <div className="tag-manager__actions">
                              <Button
                                aria-label={`Rename ${tag.name} tag`}
                                className="icon-button"
                                onClick={() => {
                                  setEditingTagId(tag.id);
                                  setEditingTagName(tag.name);
                                  setEditError('');
                                }}
                                type="button"
                              >
                                <Pencil size={15} />
                              </Button>
                              <Button
                                aria-label={`Remove ${tag.name} tag`}
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
                  <p className="tag-manager__empty">No tags yet.</p>
                )}
              </div>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
      {pendingDelete && (
        <ConfirmDialog
          confirmLabel="Remove tag"
          description={`${pendingDelete.name} is assigned to ${getTagUsageCount(pendingDelete.id)} cards. Removing it will clear the tag from those cards.`}
          onConfirm={() => {
            onDeleteTag(pendingDelete.id);
            setPendingDelete(null);
          }}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              setPendingDelete(null);
            }
          }}
          open={Boolean(pendingDelete)}
          title="Remove this tag?"
        />
      )}
    </>
  );
};

export default TagManagerDialog;
