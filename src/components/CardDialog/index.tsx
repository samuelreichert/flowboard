import { Button } from '@base-ui/react/button';
import { Menu } from '@base-ui/react/menu';
import { Ellipsis, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { useLocalization } from '../../LocalizationProvider';
import ConfirmDialog from '../ConfirmDialog';
import DialogSelect from '../DialogSelect';
import DialogShell from '../DialogShell';
import { CARD_PRIORITIES } from '../../types';
import CardContentField from './CardContentField';
import CardTitleField from './CardTitleField';
import TagSelectField from './TagSelectField';
import type {
  CardDialogProps,
  CardDialogSaveValues,
  CardDialogValues,
} from './types';
import useCardDialogController from './useCardDialogController';

const CardDialog = (props: CardDialogProps) => {
  const dialogKey = props.open ? props.card.id : 'closed';

  return <CardDialogContent key={dialogKey} {...props} />;
};

const CardDialogContent = (props: CardDialogProps) => {
  const { messages } = useLocalization();
  const [menuPortalContainer, setMenuPortalContainer] =
    useState<HTMLDivElement | null>(null);
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
    onSelectedTagIdsChange,
  } = useCardDialogController(props);

  return (
    <>
      <DialogShell
        closeLabel={messages.card.closeCard}
        headerActions={
          <Menu.Root>
            <Menu.Trigger
              aria-label={messages.card.moreActions}
              className="icon-button"
              render={<Button />}
            >
              <Ellipsis size={17} />
            </Menu.Trigger>
            <Menu.Portal container={menuPortalContainer}>
              <Menu.Positioner
                align="end"
                className="card-dialog__menu-positioner"
                sideOffset={6}
              >
                <Menu.Popup className="menu-popup">
                  <Menu.Item
                    className="menu-item menu-item--danger"
                    onClick={openDeleteConfirmation}
                  >
                    <Trash2 size={15} />
                    {messages.card.deleteCard}
                  </Menu.Item>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        }
        onOpenChange={onCardOpenChange}
        open={open}
        popupClassName="dialog-popup--card"
        size="wide"
        title={messages.card.card}
        viewportRef={setMenuPortalContainer}
      >
        <form className="card-dialog__form">
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
          <div className="card-dialog__metadata">
            <DialogSelect
              label={messages.card.column}
              name="column"
              onValueChange={onColumnChange}
              options={columns.map((column) => ({
                label: column.title,
                value: column.id,
              }))}
              renderValue={(value) =>
                columns.find((column) => column.id === value)?.title ??
                messages.common.chooseColumn
              }
              value={selectedColumnId}
            />
            <DialogSelect
              label={messages.card.priority}
              name="priority"
              onValueChange={onPriorityChange}
              options={CARD_PRIORITIES.map((nextPriority) => ({
                label: messages.priority[nextPriority],
                value: nextPriority,
              }))}
              renderValue={(value) =>
                value
                  ? messages.priority[value]
                  : messages.common.choosePriority
              }
              value={priority}
            />
            <TagSelectField
              className="card-dialog__metadata-tags"
              creatingTag={creatingTag}
              newTagName={newTagName}
              onCreateTag={createTag}
              onCreateTagClick={startCreatingTag}
              onNewTagNameChange={onNewTagNameChange}
              onTagsOpenChange={onTagsOpenChange}
              onValueChange={onSelectedTagIdsChange}
              selectedTagIds={selectedTagIds}
              tagError={tagError}
              tagSummary={tagSummary}
              tags={tags}
              tagsOpen={tagsOpen}
            />
          </div>
          {error && (
            <p className="card-dialog__error dialog-error" role="alert">
              {error}
            </p>
          )}
          <CardContentField
            card={card}
            content={content}
            onContentChange={onContentChange}
          />
        </form>
      </DialogShell>
      <ConfirmDialog
        confirmLabel={messages.card.deleteCard}
        description={messages.card.deleteDescription(
          title.trim() || lastValidTitle || messages.card.thisCard
        )}
        onConfirm={onConfirmDeleteCard}
        onOpenChange={onDeleteOpenChange}
        open={deleteOpen}
        title={messages.card.deleteTitle}
      />
    </>
  );
};

export default CardDialog;
export type { CardDialogSaveValues, CardDialogValues };
