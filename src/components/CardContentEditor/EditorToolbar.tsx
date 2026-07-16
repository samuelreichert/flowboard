import { Button } from '@base-ui/react/button';
import { Popover } from '@base-ui/react/popover';
import { Toolbar } from '@base-ui/react/toolbar';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
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
import type { FormEvent } from 'react';

import { useLocalization } from '../../LocalizationProvider';
import type { Messages } from '../../localization';
import {
  ToolbarButton,
  ToolbarHint,
  ToolbarSelect,
} from './EditorToolbarControls';
import EditorUrlPopoverForm from './EditorUrlPopoverForm';
import type {
  AlignValue,
  EditorToolbarState,
  HeadingValue,
  ListValue,
  ToolbarSelectOption,
} from './types';

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
  toolbarState: EditorToolbarState;
};

type ContentEditorMessages = Messages['contentEditor'];

const getHeadingOptions = (
  messages: ContentEditorMessages
): ToolbarSelectOption<HeadingValue>[] => [
  { icon: <Pilcrow size={15} />, label: messages.paragraph, value: 'paragraph' },
  { icon: <Heading1 size={15} />, label: messages.heading1, value: 'heading-1' },
  { icon: <Heading2 size={15} />, label: messages.heading2, value: 'heading-2' },
  { icon: <Heading3 size={15} />, label: messages.heading3, value: 'heading-3' },
  { icon: <Heading4 size={15} />, label: messages.heading4, value: 'heading-4' },
];

const getListOptions = (
  messages: ContentEditorMessages
): ToolbarSelectOption<ListValue>[] => [
  { icon: <List size={15} />, label: messages.bulletList, value: 'bullet' },
  { icon: <ListOrdered size={15} />, label: messages.orderedList, value: 'ordered' },
  { icon: <ListChecks size={15} />, label: messages.taskList, value: 'task' },
];

const getAlignOptions = (
  messages: ContentEditorMessages
): ToolbarSelectOption<AlignValue>[] => [
  { icon: <AlignLeft size={15} />, label: messages.alignLeft, value: 'left' },
  { icon: <AlignCenter size={15} />, label: messages.alignCenter, value: 'center' },
  { icon: <AlignRight size={15} />, label: messages.alignRight, value: 'right' },
  { icon: <AlignJustify size={15} />, label: messages.justify, value: 'justify' },
];

const getDefaultListOption = (
  messages: ContentEditorMessages
): ToolbarSelectOption<ListValue> => ({
  icon: <List size={15} />,
  label: messages.listStyle,
  value: 'none',
});

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
  toolbarState,
}: EditorToolbarProps) => {
  const { messages } = useLocalization();
  const editorMessages = messages.contentEditor;
  const headingOptions = getHeadingOptions(editorMessages);
  const listOptions = getListOptions(editorMessages);
  const alignOptions = getAlignOptions(editorMessages);
  const defaultListOption = getDefaultListOption(editorMessages);

  return (
    <Toolbar.Root
      className="editor-toolbar"
      aria-label={editorMessages.contentFormatting}
    >
    <ToolbarButton
      disabled={!toolbarState.canUndo}
      label={editorMessages.undo}
      onClick={onUndo}
    >
      <Undo2 size={16} />
    </ToolbarButton>
    <ToolbarButton
      disabled={!toolbarState.canRedo}
      label={editorMessages.redo}
      onClick={onRedo}
    >
      <Redo2 size={16} />
    </ToolbarButton>
    <ToolbarSelect
      active={toolbarState.headingValue !== 'paragraph'}
      disabled={!editorReady}
      label={editorMessages.textStyle}
      onValueChange={onHeadingChange}
      options={headingOptions}
      value={toolbarState.headingValue}
    />
    <ToolbarButton
      active={toolbarState.isBold}
      disabled={!editorReady}
      label={editorMessages.bold}
      onClick={onBold}
    >
      <Bold size={16} />
    </ToolbarButton>
    <ToolbarButton
      active={toolbarState.isItalic}
      disabled={!editorReady}
      label={editorMessages.italic}
      onClick={onItalic}
    >
      <Italic size={16} />
    </ToolbarButton>
    <ToolbarButton
      active={toolbarState.isStrike}
      disabled={!editorReady}
      label={editorMessages.strike}
      onClick={onStrike}
    >
      <Strikethrough size={16} />
    </ToolbarButton>
    <ToolbarSelect
      active={toolbarState.listValue !== 'none'}
      disabled={!editorReady}
      label={editorMessages.listStyle}
      onValueChange={onListChange}
      options={listOptions}
      value={toolbarState.listValue}
      fallbackOption={defaultListOption}
    />
    <ToolbarSelect
      active={toolbarState.alignValue !== 'left'}
      disabled={!editorReady}
      label={editorMessages.textAlignment}
      onValueChange={onAlignChange}
      options={alignOptions}
      value={toolbarState.alignValue}
    />
    <ToolbarButton
      active={toolbarState.isBlockquote}
      disabled={!editorReady}
      label={editorMessages.quote}
      onClick={onBlockquote}
    >
      <Quote size={16} />
    </ToolbarButton>
    <ToolbarButton
      active={toolbarState.isCode}
      disabled={!editorReady}
      label={editorMessages.inlineCode}
      onClick={onCode}
    >
      <Code size={16} />
    </ToolbarButton>
    <ToolbarButton
      active={toolbarState.isCodeBlock}
      disabled={!editorReady}
      label={editorMessages.codeBlock}
      onClick={onCodeBlock}
    >
      <Code2 size={16} />
    </ToolbarButton>
    <Popover.Root onOpenChange={onLinkPopoverOpenChange} open={linkPopoverOpen}>
      <ToolbarHint label={editorMessages.link}>
        {({ hint, hintTriggerProps }) => (
          <Toolbar.Button
            aria-label={editorMessages.link}
            aria-pressed={toolbarState.isLink}
            className={`editor-toolbar__button ${toolbarState.isLink ? 'editor-toolbar__button--active' : ''}`}
            disabled={!editorReady}
            onClick={onLinkPopoverOpen}
            onMouseDown={(event) => {
              event.preventDefault();
              onLinkMouseDown();
            }}
            render={<Popover.Trigger />}
            {...hintTriggerProps}
          >
            <LinkIcon size={16} />
            {hint}
          </Toolbar.Button>
        )}
      </ToolbarHint>
      <Popover.Portal>
        <Popover.Positioner
          align="start"
          className="editor-url-popover__positioner"
          sideOffset={6}
        >
          <EditorUrlPopoverForm
            error={linkError}
            label={editorMessages.linkUrl}
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onApplyLink();
            }}
            onValueChange={onSetLinkUrl}
            placeholder="https://tiptap.dev"
            submitLabel={editorMessages.apply}
            value={linkUrl}
          />
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
    <Popover.Root onOpenChange={onImagePopoverOpenChange} open={imagePopoverOpen}>
      <ToolbarHint label={editorMessages.insertImageUrl}>
        {({ hint, hintTriggerProps }) => (
          <Toolbar.Button
            aria-label={editorMessages.insertImageUrl}
            className={`editor-toolbar__button ${toolbarState.isImage ? 'editor-toolbar__button--active' : ''}`}
            disabled={!editorReady}
            aria-pressed={toolbarState.isImage}
            onMouseDown={(event) => event.preventDefault()}
            render={<Popover.Trigger />}
            {...hintTriggerProps}
          >
            <ImageIcon size={16} />
            {hint}
          </Toolbar.Button>
        )}
      </ToolbarHint>
      <Popover.Portal>
        <Popover.Positioner
          align="start"
          className="editor-url-popover__positioner"
          sideOffset={6}
        >
          <EditorUrlPopoverForm
            error={imageError}
            label={editorMessages.imageUrl}
            onSubmit={onApplyImage}
            onValueChange={onSetImageUrl}
            placeholder="https://images.example.com/diagram.png"
            submitLabel={editorMessages.insert}
            value={imageUrl}
          />
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
    <ToolbarHint label={editorMessages.copyMarkdown}>
      {({ hint, hintTriggerProps }) => (
        <Button
          aria-label={editorMessages.copyMarkdown}
          className="editor-toolbar__copy"
          disabled={!editorReady}
          onClick={onCopyMarkdown}
          type="button"
          {...hintTriggerProps}
        >
          <Copy size={16} />
          <strong>.MD</strong>
          {copyStatus && <span className="editor-toolbar__copy-status">{copyStatus}</span>}
          {hint}
        </Button>
      )}
    </ToolbarHint>
    </Toolbar.Root>
  );
};
