import { NodeSelection } from '@tiptap/pm/state';
import type { EditorProps } from '@tiptap/pm/view';
import { useEditor } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';

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
  const lastLocallyEmittedValue = useRef<string | null>(null);
  const pendingExternalValue = useRef<string | null>(null);
  const restoreFocusAfterUpdate = useRef(false);
  const initialContent = useRef({
    content: normalizeMarkdownForEditor(value),
    contentType: getEditorContentType(value),
  });

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editorProps = useMemo<EditorProps>(
    () => ({
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
    }),
    [id, labelId]
  );
  const extensions = useMemo(
    () =>
      getCardContentExtensions({ fileHandling: true }, messages.contentEditor),
    [messages.contentEditor]
  );
  const onUpdate = useCallback(
    ({ editor: currentEditor }: { editor: Editor }) => {
      const markdown = getEditorMarkdown(currentEditor);
      restoreFocusAfterUpdate.current = currentEditor.isFocused;

      if (markdown === lastSyncedValue.current) {
        return;
      }

      lastLocallyEmittedValue.current = markdown;
      lastSyncedValue.current = markdown;
      pendingExternalValue.current = null;
      onChangeRef.current(markdown);
    },
    []
  );

  const editor = useEditor({
    content: initialContent.current.content,
    contentType: initialContent.current.contentType,
    editorProps,
    extensions,
    immediatelyRender: false,
    onUpdate,
    shouldRerenderOnTransaction: false,
  });

  useLayoutEffect(() => {
    if (!editor || !restoreFocusAfterUpdate.current) {
      return;
    }

    restoreFocusAfterUpdate.current = false;
    editor.view.focus();
  }, [editor, value]);

  const applyExternalValue = useCallback(
    (nextValue: string) => {
      if (!editor) {
        return;
      }

      lastSyncedValue.current = nextValue;
      editor.commands.setContent(normalizeMarkdownForEditor(nextValue), {
        contentType: getEditorContentType(nextValue),
        emitUpdate: false,
      });
    },
    [editor]
  );

  useEffect(() => {
    if (!editor || value === lastSyncedValue.current) {
      return;
    }

    if (value === lastLocallyEmittedValue.current) {
      lastSyncedValue.current = value;
      return;
    }

    if (editor.isFocused) {
      pendingExternalValue.current = value;
      return;
    }

    applyExternalValue(value);
  }, [applyExternalValue, editor, value]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const applyPendingExternalValue = () => {
      const nextValue = pendingExternalValue.current;

      if (!nextValue || nextValue === lastSyncedValue.current) {
        return;
      }

      pendingExternalValue.current = null;
      applyExternalValue(nextValue);
    };

    editor.on('blur', applyPendingExternalValue);

    return () => {
      editor.off('blur', applyPendingExternalValue);
    };
  }, [applyExternalValue, editor]);

  return editor;
};
