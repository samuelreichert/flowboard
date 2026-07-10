import { Button } from '@base-ui/react/button';
import { Dialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';

import ConfirmDialog from '../ConfirmDialog';
import DialogSelect from '../DialogSelect';
import CardContentField from './CardContentField';
import CardDialogFooter from './CardDialogFooter';
import CardTitleField from './CardTitleField';
import { PRIORITY_OPTIONS } from './constants';
import { formatPriorityLabel } from './formatters';
import TagSelectField from './TagSelectField';
import type { CardDialogProps, CardDialogValues } from './types';
import useCardDialogController from './useCardDialogController';
import '../IconButton/IconButton.css';

const CardDialog = (props: CardDialogProps) => {
  const dialogKey = props.open ? props.card.id : 'closed';

  return <CardDialogContent key={dialogKey} {...props} />;
};

const CardDialogContent = (props: CardDialogProps) => {
  const {
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
  } = useCardDialogController(props);

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onCardOpenChange}>
        <Dialog.Portal>
          <Dialog.Backdrop className="dialog-backdrop" />
          <Dialog.Viewport className="dialog-viewport">
            <Dialog.Popup
              className="dialog-popup dialog-popup--card"
              role="dialog"
            >
                <form>
                  <div className="dialog-header">
                    <Dialog.Title className="dialog-title">
                      Card
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
                    content={content}
                    onContentChange={onContentChange}
                  />
                  <CardDialogFooter
                    error={error}
                    onDeleteClick={openDeleteConfirmation}
                  />
                </form>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
      <ConfirmDialog
        confirmLabel="Delete card"
        description={`This will permanently delete ${title.trim() || lastValidTitle || 'this card'}.`}
        onConfirm={onConfirmDeleteCard}
        onOpenChange={onDeleteOpenChange}
        open={deleteOpen}
        title="Delete this card?"
      />
    </>
  );
};

export default CardDialog;
export type { CardDialogValues };
