import { Button } from '@base-ui/react/button';
import { Field } from '@base-ui/react/field';
import { Select } from '@base-ui/react/select';
import { Check, Plus } from 'lucide-react';
import { useRef, type KeyboardEvent, type ReactNode } from 'react';

import { useLocalization } from '../../LocalizationProvider';
import type { BoardTag } from '../../types';

type TagMultiSelectProps = {
  ariaLabel: string;
  createButtonClassName: string;
  createClassName: string;
  creatingTag: boolean;
  emptyState: ReactNode;
  errorClassName?: string;
  newTagName: string;
  onCreateTag: () => void;
  onNewTagNameChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onStartCreatingTag: () => void;
  onValueChange: (tagIds: string[]) => void;
  open: boolean;
  optionClassName: string;
  popupClassName: string;
  positionerClassName: string;
  selectedTagIds: string[];
  tagError: string;
  tags: BoardTag[];
  trigger: ReactNode;
  triggerIcon?: ReactNode;
  triggerIconClassName?: string;
  triggerClassName: string;
  triggerValueClassName?: string;
};

const TagMultiSelect = ({
  ariaLabel,
  createButtonClassName,
  createClassName,
  creatingTag,
  emptyState,
  errorClassName,
  newTagName,
  onCreateTag,
  onNewTagNameChange,
  onOpenChange,
  onStartCreatingTag,
  onValueChange,
  open,
  optionClassName,
  popupClassName,
  positionerClassName,
  selectedTagIds,
  tagError,
  tags,
  trigger,
  triggerIcon,
  triggerIconClassName,
  triggerClassName,
  triggerValueClassName,
}: TagMultiSelectProps) => {
  const { messages } = useLocalization();
  const wasOpenOnPointerDownRef = useRef(false);

  const onTagCreateKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation();

    if (event.key === 'Enter') {
      event.preventDefault();
      onCreateTag();
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      onOpenChange(false);
    }
  };

  return (
    <Select.Root
      multiple
      onOpenChange={onOpenChange}
      onValueChange={(nextTagIds) => onValueChange(nextTagIds)}
      open={open}
      value={selectedTagIds}
    >
      <Select.Trigger
        aria-label={ariaLabel}
        className={triggerClassName}
        data-has-selection={selectedTagIds.length > 0 || undefined}
        onPointerDown={() => {
          wasOpenOnPointerDownRef.current = open;
        }}
        onClick={() => {
          onOpenChange(!wasOpenOnPointerDownRef.current);
        }}
      >
        <Select.Value className={triggerValueClassName}>
          {() => trigger}
        </Select.Value>
        {triggerIcon && (
          <Select.Icon className={triggerIconClassName}>
            {triggerIcon}
          </Select.Icon>
        )}
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner
          align="start"
          alignItemWithTrigger={false}
          className={positionerClassName}
          collisionPadding={8}
          sideOffset={6}
        >
          <Select.Popup className={popupClassName} finalFocus>
            {tags.length > 0 ? (
              <Select.List>
                {tags.map((tag) => (
                  <Select.Item
                    className={optionClassName}
                    key={tag.id}
                    value={tag.id}
                  >
                    <Select.ItemText>{tag.name}</Select.ItemText>
                    <Select.ItemIndicator>
                      <Check size={15} />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.List>
            ) : (
              emptyState
            )}
            <div className={createClassName}>
              {creatingTag ? (
                <Field.Root invalid={Boolean(tagError)}>
                  <Field.Control
                    aria-label={messages.composer.newTagName}
                    autoFocus
                    maxLength={60}
                    onKeyDownCapture={onTagCreateKeyDown}
                    onValueChange={onNewTagNameChange}
                    placeholder={messages.composer.newTagName}
                    type="text"
                    value={newTagName}
                  />
                  <Field.Error
                    className={errorClassName}
                    match={Boolean(tagError)}
                  >
                    {tagError}
                  </Field.Error>
                </Field.Root>
              ) : (
                <Button
                  className={createButtonClassName}
                  onClick={onStartCreatingTag}
                  type="button"
                >
                  <Plus size={15} />
                  {messages.composer.createTag}
                </Button>
              )}
            </div>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
};

export default TagMultiSelect;
