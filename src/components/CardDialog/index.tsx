import { useLocalization } from '../../LocalizationProvider';
import ConfirmDialog from '../ConfirmDialog';
import DialogSelect from '../DialogSelect';
import DialogShell from '../DialogShell';
import { CARD_PRIORITIES } from '../../types';
import CardContentField from './CardContentField';
import CardDialogFooter from './CardDialogFooter';
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
      <DialogShell
        actions={
          <CardDialogFooter
            error={error}
            onDeleteClick={openDeleteConfirmation}
          />
        }
        actionsClassName="dialog-actions--spread dialog-actions--sticky"
        closeLabel={messages.card.closeCard}
        onOpenChange={onCardOpenChange}
        open={open}
        popupClassName="dialog-popup--card"
        title={messages.card.card}
      >
        <form>
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
              value ? messages.priority[value] : messages.common.choosePriority
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
