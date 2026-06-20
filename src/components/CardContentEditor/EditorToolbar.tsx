import { Button } from '@base-ui/react/button';
import { Field } from '@base-ui/react/field';
import { Popover } from '@base-ui/react/popover';
import { Select } from '@base-ui/react/select';
import { Tooltip } from '@base-ui/react/tooltip';
import { Toolbar } from '@base-ui/react/toolbar';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  ChevronDown,
  Code,
  Code2,
  Copy,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListChecks,
  ListOrdered,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from 'lucide-react';
import { useId } from 'react';
import type { FormEvent, ReactNode, RefObject } from 'react';

import type {
  AlignValue,
  EditorToolbarState,
  HeadingValue,
  ListValue,
  ToolbarSelectOption,
} from './types';

type ToolbarButtonProps = {
  active?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
};

type ToolbarSelectProps<TValue extends string> = {
  active?: boolean;
  disabled?: boolean;
  fallbackOption?: ToolbarSelectOption<TValue>;
  label: string;
  onValueChange: (value: TValue) => void;
  options: ToolbarSelectOption<TValue>[];
  value: TValue;
};

type EditorToolbarProps = {
  copyStatus: string;
  editorReady: boolean;
  imageError: string;
  imagePopoverOpen: boolean;
  imageUrl: string;
  linkError: string;
  linkPopoverOpen: boolean;
  linkUrl: string;
  onAlignChange: (value: AlignValue) => void;
  onApplyImage: (event: FormEvent<HTMLFormElement>) => void;
  onApplyLink: () => void;
  onBlockquote: () => void;
  onBold: () => void;
  onCode: () => void;
  onCodeBlock: () => void;
  onCopyMarkdown: () => void;
  onHeadingChange: (value: HeadingValue) => void;
  onImagePopoverOpenChange: (open: boolean) => void;
  onItalic: () => void;
  onLinkMouseDown: () => void;
  onLinkPopoverOpen: () => void;
  onLinkPopoverOpenChange: (open: boolean) => void;
  onListChange: (value: ListValue) => void;
  onRedo: () => void;
  onSetImageUrl: (value: string) => void;
  onSetLinkUrl: (value: string) => void;
  onStrike: () => void;
  onUndo: () => void;
  popoverPortalContainer: RefObject<HTMLDivElement | null>;
  toolbarState: EditorToolbarState;
};

const headingOptions: ToolbarSelectOption<HeadingValue>[] = [
  { icon: <Pilcrow size={15} />, label: 'Paragraph', value: 'paragraph' },
  { icon: <Heading1 size={15} />, label: 'Heading 1', value: 'heading-1' },
  { icon: <Heading2 size={15} />, label: 'Heading 2', value: 'heading-2' },
  { icon: <Heading3 size={15} />, label: 'Heading 3', value: 'heading-3' },
  { icon: <Heading4 size={15} />, label: 'Heading 4', value: 'heading-4' },
];

const listOptions: ToolbarSelectOption<ListValue>[] = [
  { icon: <List size={15} />, label: 'Bullet list', value: 'bullet' },
  { icon: <ListOrdered size={15} />, label: 'Ordered list', value: 'ordered' },
  { icon: <ListChecks size={15} />, label: 'Task list', value: 'task' },
];

const alignOptions: ToolbarSelectOption<AlignValue>[] = [
  { icon: <AlignLeft size={15} />, label: 'Align left', value: 'left' },
  { icon: <AlignCenter size={15} />, label: 'Align center', value: 'center' },
  { icon: <AlignRight size={15} />, label: 'Align right', value: 'right' },
  { icon: <AlignJustify size={15} />, label: 'Justify', value: 'justify' },
];

const defaultListOption: ToolbarSelectOption<ListValue> = {
  icon: <List size={15} />,
  label: 'List style',
  value: 'none',
};

const ToolbarButton = ({
  active = false,
  disabled = false,
  label,
  onClick,
  children,
}: ToolbarButtonProps) => (
  <Tooltip.Root>
    <Tooltip.Trigger
      aria-label={label}
      aria-disabled={disabled}
      aria-pressed={active}
      className={`editor-toolbar__button ${active ? 'editor-toolbar__button--active' : ''}`}
      data-disabled={disabled ? '' : undefined}
      onClick={(event) => {
        if (disabled) {
          event.preventDefault();
          return;
        }

        onClick();
      }}
      onMouseDown={(event) => event.preventDefault()}
      render={<Toolbar.Button />}
      tabIndex={disabled ? -1 : undefined}
      type="button"
    >
      {children}
    </Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Positioner sideOffset={8}>
        <Tooltip.Popup className="tooltip-popup">{label}</Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>
);

const ToolbarSelect = <TValue extends string>({
  active = false,
  disabled = false,
  fallbackOption,
  label,
  onValueChange,
  options,
  value,
}: ToolbarSelectProps<TValue>) => {
  const selectLabelId = useId();
  const selectedOption =
    options.find((option) => option.value === value) ?? fallbackOption ?? options[0];
  const triggerLabel = selectedOption.triggerLabel ?? selectedOption.label;

  return (
    <Select.Root
      onValueChange={(nextValue) => {
        if (nextValue) {
          onValueChange(nextValue as TValue);
        }
      }}
      value={value}
    >
      <span className="editor-toolbar__accessible-label" id={selectLabelId}>
        {label}
      </span>
      <Tooltip.Root>
        <Tooltip.Trigger
          aria-labelledby={selectLabelId}
          aria-pressed={active}
          aria-label={`${label}: ${triggerLabel}`}
          className={`editor-toolbar__select-trigger ${active ? 'editor-toolbar__button--active' : ''}`}
          disabled={disabled}
          render={<Toolbar.Button disabled={disabled} render={<Select.Trigger />} />}
        >
          <span className="editor-toolbar__select-trigger-icon" title={triggerLabel}>
            {selectedOption.icon}
          </span>
          <Select.Icon className="editor-toolbar__select-icon">
            <ChevronDown size={14} />
          </Select.Icon>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner sideOffset={8}>
            <Tooltip.Popup className="tooltip-popup">{triggerLabel}</Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
      <Select.Portal>
        <Select.Positioner
          align="start"
          className="editor-toolbar__select-positioner"
          sideOffset={5}
        >
          <Select.Popup className="editor-toolbar__select-popup">
            <Select.List>
              {options.map((option) => (
                <Select.Item
                  className="editor-toolbar__select-item"
                  key={option.value}
                  value={option.value}
                >
                  <Select.ItemText>
                    <span className="editor-toolbar__select-label">
                      {option.icon}
                      <span>{option.label}</span>
                    </span>
                  </Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={14} />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
};

export const EditorToolbar = ({
  copyStatus,
  editorReady,
  imageError,
  imagePopoverOpen,
  imageUrl,
  linkError,
  linkPopoverOpen,
  linkUrl,
  onAlignChange,
  onApplyImage,
  onApplyLink,
  onBlockquote,
  onBold,
  onCode,
  onCodeBlock,
  onCopyMarkdown,
  onHeadingChange,
  onImagePopoverOpenChange,
  onItalic,
  onLinkMouseDown,
  onLinkPopoverOpen,
  onLinkPopoverOpenChange,
  onListChange,
  onRedo,
  onSetImageUrl,
  onSetLinkUrl,
  onStrike,
  onUndo,
  popoverPortalContainer,
  toolbarState,
}: EditorToolbarProps) => (
  <Toolbar.Root className="editor-toolbar" aria-label="Content formatting">
    <ToolbarButton disabled={!toolbarState.canUndo} label="Undo" onClick={onUndo}>
      <Undo2 size={16} />
    </ToolbarButton>
    <ToolbarButton disabled={!toolbarState.canRedo} label="Redo" onClick={onRedo}>
      <Redo2 size={16} />
    </ToolbarButton>
    <ToolbarSelect
      active={toolbarState.headingValue !== 'paragraph'}
      disabled={!editorReady}
      label="Text style"
      onValueChange={onHeadingChange}
      options={headingOptions}
      value={toolbarState.headingValue}
    />
    <ToolbarButton
      active={toolbarState.isBold}
      disabled={!editorReady}
      label="Bold"
      onClick={onBold}
    >
      <Bold size={16} />
    </ToolbarButton>
    <ToolbarButton
      active={toolbarState.isItalic}
      disabled={!editorReady}
      label="Italic"
      onClick={onItalic}
    >
      <Italic size={16} />
    </ToolbarButton>
    <ToolbarButton
      active={toolbarState.isStrike}
      disabled={!editorReady}
      label="Strike"
      onClick={onStrike}
    >
      <Strikethrough size={16} />
    </ToolbarButton>
    <ToolbarSelect
      active={toolbarState.listValue !== 'none'}
      disabled={!editorReady}
      label="List style"
      onValueChange={onListChange}
      options={listOptions}
      value={toolbarState.listValue}
      fallbackOption={defaultListOption}
    />
    <ToolbarSelect
      active={toolbarState.alignValue !== 'left'}
      disabled={!editorReady}
      label="Text alignment"
      onValueChange={onAlignChange}
      options={alignOptions}
      value={toolbarState.alignValue}
    />
    <ToolbarButton
      active={toolbarState.isBlockquote}
      disabled={!editorReady}
      label="Quote"
      onClick={onBlockquote}
    >
      <Quote size={16} />
    </ToolbarButton>
    <ToolbarButton
      active={toolbarState.isCode}
      disabled={!editorReady}
      label="Inline code"
      onClick={onCode}
    >
      <Code size={16} />
    </ToolbarButton>
    <ToolbarButton
      active={toolbarState.isCodeBlock}
      disabled={!editorReady}
      label="Code block"
      onClick={onCodeBlock}
    >
      <Code2 size={16} />
    </ToolbarButton>
    <Popover.Root onOpenChange={onLinkPopoverOpenChange} open={linkPopoverOpen}>
      <Tooltip.Root>
        <Tooltip.Trigger
          aria-label="Link"
          aria-pressed={toolbarState.isLink}
          className={`editor-toolbar__button ${toolbarState.isLink ? 'editor-toolbar__button--active' : ''}`}
          disabled={!editorReady}
          onClick={onLinkPopoverOpen}
          onMouseDown={(event) => {
            event.preventDefault();
            onLinkMouseDown();
          }}
          render={<Popover.Trigger render={<Toolbar.Button disabled={!editorReady} />} />}
        >
          <LinkIcon size={16} />
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner sideOffset={8}>
            <Tooltip.Popup className="tooltip-popup">Link</Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
      <Popover.Portal container={popoverPortalContainer}>
        <Popover.Positioner
          align="start"
          className="editor-url-popover__positioner"
          sideOffset={6}
        >
          <Popover.Popup className="editor-url-popover">
            <form
              className="editor-url-popover__form"
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onApplyLink();
              }}
            >
              <Field.Root invalid={Boolean(linkError)}>
                <Field.Label className="editor-url-popover__label">Link URL</Field.Label>
                <Field.Control
                  autoFocus
                  className="editor-url-popover__input"
                  inputMode="url"
                  maxLength={2048}
                  onValueChange={onSetLinkUrl}
                  placeholder="https://tiptap.dev"
                  type="text"
                  value={linkUrl}
                />
                <Field.Error className="editor-url-popover__error" match={Boolean(linkError)}>
                  {linkError}
                </Field.Error>
              </Field.Root>
              <div className="editor-url-popover__actions">
                <Popover.Close
                  className="editor-url-popover__button"
                  render={<Button />}
                  type="button"
                >
                  Cancel
                </Popover.Close>
                <Button
                  className="editor-url-popover__button editor-url-popover__button--primary"
                  type="submit"
                >
                  Apply
                </Button>
              </div>
            </form>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
    <Popover.Root onOpenChange={onImagePopoverOpenChange} open={imagePopoverOpen}>
      <Tooltip.Root>
        <Tooltip.Trigger
          aria-label="Insert image URL"
          className={`editor-toolbar__button ${toolbarState.isImage ? 'editor-toolbar__button--active' : ''}`}
          disabled={!editorReady}
          aria-pressed={toolbarState.isImage}
          onMouseDown={(event) => event.preventDefault()}
          render={<Popover.Trigger render={<Toolbar.Button disabled={!editorReady} />} />}
        >
          <ImageIcon size={16} />
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner sideOffset={8}>
            <Tooltip.Popup className="tooltip-popup">Insert image URL</Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
      <Popover.Portal container={popoverPortalContainer}>
        <Popover.Positioner
          align="start"
          className="editor-url-popover__positioner"
          sideOffset={6}
        >
          <Popover.Popup className="editor-url-popover">
            <form className="editor-url-popover__form" onSubmit={onApplyImage}>
              <Field.Root invalid={Boolean(imageError)}>
                <Field.Label className="editor-url-popover__label">Image URL</Field.Label>
                <Field.Control
                  autoFocus
                  className="editor-url-popover__input"
                  inputMode="url"
                  maxLength={2048}
                  onValueChange={onSetImageUrl}
                  placeholder="https://images.example.com/diagram.png"
                  type="text"
                  value={imageUrl}
                />
                <Field.Error className="editor-url-popover__error" match={Boolean(imageError)}>
                  {imageError}
                </Field.Error>
              </Field.Root>
              <div className="editor-url-popover__actions">
                <Popover.Close
                  className="editor-url-popover__button"
                  render={<Button />}
                  type="button"
                >
                  Cancel
                </Popover.Close>
                <Button
                  className="editor-url-popover__button editor-url-popover__button--primary"
                  type="submit"
                >
                  Insert
                </Button>
              </div>
            </form>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
    <Tooltip.Root>
      <Tooltip.Trigger
        aria-label="Copy Markdown"
        className="editor-toolbar__copy"
        disabled={!editorReady}
        onClick={onCopyMarkdown}
        render={<Button disabled={!editorReady} />}
        type="button"
      >
        <Copy size={16} />
        <strong>.MD</strong>
        {copyStatus && <span className="editor-toolbar__copy-status">{copyStatus}</span>}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner sideOffset={8}>
          <Tooltip.Popup className="tooltip-popup">Copy Markdown</Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Toolbar.Root>
);
