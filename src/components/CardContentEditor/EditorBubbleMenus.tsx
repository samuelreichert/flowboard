import type { Editor } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import { BubbleMenu } from '@tiptap/react/menus';
import type { FormEvent } from 'react';

import { useLocalization } from '../../LocalizationProvider';
import EditorAssetBubble from './EditorAssetBubble';
import { getEditorBubbleMenuAppendTarget } from './editorPortalTarget';

type EditorBubbleMenusProps = {
  currentHref: string;
  currentImageSrc: string;
  editor: Editor | null;
  imageBubbleEditing: boolean;
  imageBubbleError: string;
  imageBubbleUrl: string;
  linkBubbleEditing: boolean;
  linkBubbleError: string;
  linkBubbleUrl: string;
  onApplyImageBubble: (event: FormEvent<HTMLFormElement>) => void;
  onApplyLinkBubble: () => void;
  onCancelImageEdit: () => void;
  onCancelLinkEdit: () => void;
  onEditImage: () => void;
  onEditLink: () => void;
  onOpenImage: () => void;
  onOpenLink: () => void;
  onRemoveImage: () => void;
  onRemoveLink: () => void;
  onSetImageBubbleUrl: (value: string) => void;
  onSetLinkBubbleUrl: (value: string) => void;
};

const editorBubbleMenuOptions = {
  flip: {
    padding: 12,
  },
  inline: true,
  offset: 8,
  shift: {
    padding: 12,
  },
  strategy: 'fixed' as const,
};

export const EditorBubbleMenus = ({
  currentHref,
  currentImageSrc,
  editor,
  imageBubbleEditing,
  imageBubbleError,
  imageBubbleUrl,
  linkBubbleEditing,
  linkBubbleError,
  linkBubbleUrl,
  onApplyImageBubble,
  onApplyLinkBubble,
  onCancelImageEdit,
  onCancelLinkEdit,
  onEditImage,
  onEditLink,
  onOpenImage,
  onOpenLink,
  onRemoveImage,
  onRemoveLink,
  onSetImageBubbleUrl,
  onSetLinkBubbleUrl,
}: EditorBubbleMenusProps) => {
  const { messages } = useLocalization();

  if (!editor) {
    return null;
  }

  return (
    <>
      <BubbleMenu
        appendTo={getEditorBubbleMenuAppendTarget}
        className="editor-link-bubble"
        editor={editor}
        options={editorBubbleMenuOptions}
        pluginKey="linkBubbleMenu"
        shouldShow={({ editor: currentEditor }) =>
          currentEditor.isActive('link')
        }
        style={{ zIndex: 60 }}
      >
        <EditorAssetBubble
          assetLabel={messages.contentEditor.link}
          currentUrl={currentHref}
          editing={linkBubbleEditing}
          error={linkBubbleError}
          onCancelEdit={onCancelLinkEdit}
          onEdit={onEditLink}
          onOpen={onOpenLink}
          onRemove={onRemoveLink}
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onApplyLinkBubble();
          }}
          onUrlChange={onSetLinkBubbleUrl}
          url={linkBubbleUrl}
        />
      </BubbleMenu>
      <BubbleMenu
        appendTo={getEditorBubbleMenuAppendTarget}
        className="editor-link-bubble editor-image-bubble"
        editor={editor}
        options={editorBubbleMenuOptions}
        pluginKey="imageBubbleMenu"
        shouldShow={({ editor: currentEditor }) => {
          const { selection } = currentEditor.state;
          return (
            selection instanceof NodeSelection &&
            selection.node.type.name === 'image'
          );
        }}
        style={{ zIndex: 60 }}
      >
        <EditorAssetBubble
          assetLabel={messages.contentEditor.image}
          currentUrl={currentImageSrc}
          editing={imageBubbleEditing}
          error={imageBubbleError}
          onCancelEdit={onCancelImageEdit}
          onEdit={onEditImage}
          onOpen={onOpenImage}
          onRemove={onRemoveImage}
          onSubmit={onApplyImageBubble}
          onUrlChange={onSetImageBubbleUrl}
          url={imageBubbleUrl}
        />
      </BubbleMenu>
    </>
  );
};
