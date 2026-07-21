import type { Editor } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import { EditorContent, useEditorState } from '@tiptap/react';
import { useRef } from 'react';

import { EditorBubbleMenus } from './EditorBubbleMenus';
import { EditorToolbar } from './EditorToolbar';
import {
  applyAlignChange,
  applyHeadingChange,
  applyListChange,
  selectImageElement,
} from './commands';
import { headingLevels } from './extensions';
import type {
  AlignValue,
  EditorToolbarState,
  HeadingValue,
  ListValue,
} from './types';
import { useCardContentEditor } from './useCardContentEditor';
import { useCardContentInteractions } from './useCardContentInteractions';

import './CardContentEditor.css';

export { default as CardContentViewer } from './CardContentViewer';

type CardContentEditorProps = {
  id: string;
  labelId: string;
  onChange: (value: string) => void;
  value: string;
};

const alignValues: AlignValue[] = ['left', 'center', 'right', 'justify'];
const defaultToolbarState: EditorToolbarState = {
  alignValue: 'left' as AlignValue,
  canRedo: false,
  canUndo: false,
  headingValue: 'paragraph' as HeadingValue,
  imageSrc: '',
  isBlockquote: false,
  isBold: false,
  isCode: false,
  isCodeBlock: false,
  isImage: false,
  isItalic: false,
  isLink: false,
  isStrike: false,
  linkHref: '',
  listValue: 'none' as ListValue,
};

const getToolbarState = (currentEditor: Editor): EditorToolbarState => {
  const headingValue =
    headingLevels
      .map((level) => `heading-${level}` as HeadingValue)
      .find((option) =>
        currentEditor.isActive('heading', {
          level: Number(option.replace('heading-', '')),
        })
      ) ?? 'paragraph';
  const listValue = currentEditor.isActive('taskList')
    ? 'task'
    : currentEditor.isActive('bulletList')
      ? 'bullet'
      : currentEditor.isActive('orderedList')
        ? 'ordered'
        : 'none';
  const alignValue =
    alignValues.find((alignment) =>
      currentEditor.isActive({ textAlign: alignment })
    ) ?? 'left';
  const linkHref = currentEditor.getAttributes('link').href as
    string | undefined;
  const selectedNode =
    currentEditor.state.selection instanceof NodeSelection
      ? currentEditor.state.selection.node
      : null;
  const selectedImage =
    selectedNode?.type.name === 'image' ? selectedNode : null;
  const imageSrc =
    (selectedImage?.attrs.src as string | undefined) ??
    (currentEditor.getAttributes('image').src as string | undefined);

  return {
    alignValue,
    canRedo: currentEditor.can().redo(),
    canUndo: currentEditor.can().undo(),
    headingValue,
    imageSrc: imageSrc ?? '',
    isBlockquote: currentEditor.isActive('blockquote'),
    isBold: currentEditor.isActive('bold'),
    isCode: currentEditor.isActive('code'),
    isCodeBlock: currentEditor.isActive('codeBlock'),
    isImage: Boolean(selectedImage),
    isItalic: currentEditor.isActive('italic'),
    isLink: currentEditor.isActive('link'),
    isStrike: currentEditor.isActive('strike'),
    linkHref: linkHref ?? '',
    listValue,
  };
};

const CardContentEditor = ({
  id,
  labelId,
  onChange,
  value,
}: CardContentEditorProps) => {
  const editorRootRef = useRef<HTMLDivElement | null>(null);
  const editor = useCardContentEditor({ id, labelId, onChange, value });
  const toolbarState =
    useEditorState({
      editor,
      selector: ({ editor: currentEditor }) => {
        if (!currentEditor) {
          return defaultToolbarState;
        }

        return getToolbarState(currentEditor);
      },
    }) ?? defaultToolbarState;
  const headingValueRef = useRef(toolbarState.headingValue);
  const interactions = useCardContentInteractions(editor, toolbarState);

  return (
    <div
      className="card-content-editor"
      onDrop={interactions.onFileDrop}
      onPaste={interactions.onFilePaste}
      ref={editorRootRef}
    >
      <EditorToolbar
        copyStatus={interactions.copyStatus}
        editorReady={Boolean(editor)}
        imageError={interactions.imageError}
        imagePopoverOpen={interactions.imagePopoverOpen}
        imageUrl={interactions.imageUrl}
        linkError={interactions.linkError}
        linkPopoverOpen={interactions.linkPopoverOpen}
        linkUrl={interactions.linkUrl}
        onAlignChange={(nextValue) =>
          applyAlignChange(editor, nextValue, headingValueRef.current)
        }
        onApplyImage={interactions.applyImageValue}
        onApplyLink={interactions.applyLinkPopoverValue}
        onBlockquote={() => editor?.chain().focus().toggleBlockquote().run()}
        onBold={() => editor?.chain().focus().toggleBold().run()}
        onCode={() => editor?.chain().focus().toggleCode().run()}
        onCodeBlock={() => editor?.chain().focus().toggleCodeBlock().run()}
        onCopyMarkdown={interactions.copyMarkdown}
        onHeadingChange={(nextValue) => {
          headingValueRef.current = nextValue;
          applyHeadingChange(editor, nextValue);
        }}
        onImagePopoverOpenChange={interactions.onImagePopoverOpenChange}
        onItalic={() => editor?.chain().focus().toggleItalic().run()}
        onLinkMouseDown={interactions.onLinkMouseDown}
        onLinkPopoverOpen={interactions.onLinkPopoverOpen}
        onLinkPopoverOpenChange={interactions.onLinkPopoverOpenChange}
        onListChange={(nextValue) => applyListChange(editor, nextValue)}
        onRedo={() => editor?.chain().focus().redo().run()}
        onSetImageUrl={interactions.setImageUrl}
        onSetLinkUrl={interactions.setLinkUrl}
        onStrike={() => editor?.chain().focus().toggleStrike().run()}
        onUndo={() => editor?.chain().focus().undo().run()}
        toolbarState={toolbarState}
      />
      <EditorBubbleMenus
        currentHref={interactions.currentHref}
        currentImageSrc={interactions.currentImageSrc}
        editor={editor}
        imageBubbleEditing={interactions.imageBubbleEditing}
        imageBubbleError={interactions.imageBubbleError}
        imageBubbleUrl={interactions.imageBubbleUrl}
        linkBubbleEditing={interactions.linkBubbleEditing}
        linkBubbleError={interactions.linkBubbleError}
        linkBubbleUrl={interactions.linkBubbleUrl}
        onApplyImageBubble={interactions.applyImageBubbleValue}
        onApplyLinkBubble={interactions.applyLinkBubbleValue}
        onCancelImageEdit={interactions.onCancelImageEdit}
        onCancelLinkEdit={interactions.onCancelLinkEdit}
        onEditImage={interactions.onEditImage}
        onEditLink={interactions.onEditLink}
        onOpenImage={interactions.onOpenImage}
        onOpenLink={interactions.onOpenLink}
        onRemoveImage={interactions.onRemoveImage}
        onRemoveLink={interactions.onRemoveLink}
        onSetImageBubbleUrl={interactions.setImageBubbleUrl}
        onSetLinkBubbleUrl={interactions.setLinkBubbleUrl}
      />
      <EditorContent
        editor={editor}
        onMouseDown={(event) => {
          if (editor) {
            selectImageElement(editor.view, event.target);
          }
        }}
        onClick={(event) => {
          if (editor) {
            selectImageElement(editor.view, event.target);
          }
        }}
      />
    </div>
  );
};

export default CardContentEditor;
