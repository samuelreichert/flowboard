import { Button } from '@base-ui/react/button';
import { Field } from '@base-ui/react/field';
import type { Editor } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import { BubbleMenu } from '@tiptap/react/menus';
import { Check, Edit3, ExternalLink, Trash2, X } from 'lucide-react';
import type { FormEvent } from 'react';

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
  if (!editor) {
    return null;
  }

  return (
    <>
      <BubbleMenu
        className="editor-link-bubble"
        editor={editor}
        pluginKey="linkBubbleMenu"
        shouldShow={({ editor: currentEditor }) => currentEditor.isActive('link')}
      >
        {linkBubbleEditing ? (
          <form
            className="editor-link-bubble__form"
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onApplyLinkBubble();
            }}
          >
            <Field.Root invalid={Boolean(linkBubbleError)}>
              <Field.Label className="editor-link-bubble__label">Link URL</Field.Label>
              <Field.Control
                autoFocus
                className="editor-link-bubble__input"
                inputMode="url"
                maxLength={2048}
                onValueChange={onSetLinkBubbleUrl}
                type="text"
                value={linkBubbleUrl}
              />
              <Field.Error className="editor-link-bubble__error" match={Boolean(linkBubbleError)}>
                {linkBubbleError}
              </Field.Error>
            </Field.Root>
            <div className="editor-link-bubble__actions">
              <Button
                aria-label="Cancel link edit"
                className="editor-link-bubble__icon-button"
                onClick={onCancelLinkEdit}
                type="button"
              >
                <X size={14} />
              </Button>
              <Button
                aria-label="Apply link edit"
                className="editor-link-bubble__icon-button editor-link-bubble__icon-button--primary"
                type="submit"
              >
                <Check size={14} />
              </Button>
            </div>
          </form>
        ) : (
          <>
            <span className="editor-link-bubble__href">{currentHref}</span>
            <div className="editor-link-bubble__actions">
              <Button
                aria-label="Edit link"
                className="editor-link-bubble__icon-button"
                onClick={onEditLink}
                type="button"
              >
                <Edit3 size={14} />
              </Button>
              <Button
                aria-label="Open link"
                className="editor-link-bubble__icon-button"
                onClick={onOpenLink}
                type="button"
              >
                <ExternalLink size={14} />
              </Button>
              <Button
                aria-label="Remove link"
                className="editor-link-bubble__icon-button"
                onClick={onRemoveLink}
                type="button"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </>
        )}
      </BubbleMenu>
      <BubbleMenu
        className="editor-link-bubble editor-image-bubble"
        editor={editor}
        pluginKey="imageBubbleMenu"
        shouldShow={({ editor: currentEditor }) => {
          const { selection } = currentEditor.state;
          return selection instanceof NodeSelection && selection.node.type.name === 'image';
        }}
      >
        {imageBubbleEditing ? (
          <form className="editor-link-bubble__form" onSubmit={onApplyImageBubble}>
            <Field.Root invalid={Boolean(imageBubbleError)}>
              <Field.Label className="editor-link-bubble__label">Image URL</Field.Label>
              <Field.Control
                autoFocus
                className="editor-link-bubble__input"
                inputMode="url"
                maxLength={2048}
                onValueChange={onSetImageBubbleUrl}
                type="text"
                value={imageBubbleUrl}
              />
              <Field.Error className="editor-link-bubble__error" match={Boolean(imageBubbleError)}>
                {imageBubbleError}
              </Field.Error>
            </Field.Root>
            <div className="editor-link-bubble__actions">
              <Button
                aria-label="Cancel image edit"
                className="editor-link-bubble__icon-button"
                onClick={onCancelImageEdit}
                type="button"
              >
                <X size={14} />
              </Button>
              <Button
                aria-label="Apply image edit"
                className="editor-link-bubble__icon-button editor-link-bubble__icon-button--primary"
                type="submit"
              >
                <Check size={14} />
              </Button>
            </div>
          </form>
        ) : (
          <>
            <span className="editor-link-bubble__href">{currentImageSrc}</span>
            <div className="editor-link-bubble__actions">
              <Button
                aria-label="Edit image"
                className="editor-link-bubble__icon-button"
                onClick={onEditImage}
                type="button"
              >
                <Edit3 size={14} />
              </Button>
              <Button
                aria-label="Open image"
                className="editor-link-bubble__icon-button"
                onClick={onOpenImage}
                type="button"
              >
                <ExternalLink size={14} />
              </Button>
              <Button
                aria-label="Remove image"
                className="editor-link-bubble__icon-button"
                onClick={onRemoveImage}
                type="button"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </>
        )}
      </BubbleMenu>
    </>
  );
};
