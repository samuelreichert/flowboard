import { NodeSelection } from '@tiptap/pm/state';
import { useEditor } from '@tiptap/react';
import { useEffect, useRef } from 'react';

import { useLocalization } from '../../LocalizationProvider';
import { getEditorMarkdown, selectImageElement } from './commands';
import { getCardContentExtensions } from './extensions';
import { getEditorContentType, normalizeMarkdownForEditor } from './markdown';

type UseCardContentEditorProps = {
  id: string;
  labelId: string;
  onChange: (value: string) => void;
  value: string;
};

export const useCardContentEditor = ({
  id,
  labelId,
  onChange,
  value,
}: UseCardContentEditorProps) => {
  const { messages } = useLocalization();
  const onChangeRef = useRef(onChange);
  const lastSyncedValue = useRef(value);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    content: normalizeMarkdownForEditor(value),
    contentType: getEditorContentType(value),
    editorProps: {
      attributes: {
        'aria-labelledby': labelId,
        class: 'card-content-editor__surface',
        id,
      },
      handleClick: (view, _position, event) => {
        return selectImageElement(view, event.target);
      },
      handleClickOn: (view, _position, node, nodePosition, event, direct) => {
        if (!direct || node.type.name !== 'image') {
          return false;
        }

        view.dispatch(
          view.state.tr.setSelection(
            NodeSelection.create(view.state.doc, nodePosition)
          )
        );
        view.focus();
        event.preventDefault();

        return true;
      },
    },
    extensions: getCardContentExtensions(
      { fileHandling: true },
      messages.contentEditor
    ),
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      const markdown = getEditorMarkdown(currentEditor);
      lastSyncedValue.current = markdown;
      onChangeRef.current(markdown);
    },
  });

  useEffect(() => {
    if (!editor || value === lastSyncedValue.current) {
      return;
    }

    lastSyncedValue.current = value;
    editor.commands.setContent(normalizeMarkdownForEditor(value), {
      contentType: getEditorContentType(value),
      emitUpdate: false,
    });
  }, [editor, value]);

  return editor;
};
