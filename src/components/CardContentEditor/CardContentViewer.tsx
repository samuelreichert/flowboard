import { EditorContent, useEditor } from '@tiptap/react';
import { useEffect } from 'react';

import { useLocalization } from '../../LocalizationProvider';
import { getCardContentExtensions } from './extensions';
import { getEditorContentType, normalizeMarkdownForEditor } from './markdown';

type CardContentViewerProps = {
  ariaLabel: string;
  value: string;
};

const CardContentViewer = ({ ariaLabel, value }: CardContentViewerProps) => {
  const { messages } = useLocalization();
  const editor = useEditor({
    content: normalizeMarkdownForEditor(value),
    contentType: getEditorContentType(value),
    editable: false,
    editorProps: {
      attributes: {
        'aria-label': ariaLabel,
        class:
          'card-content-editor__surface card-content-editor__surface--readonly',
      },
    },
    extensions: getCardContentExtensions(
      { fileHandling: false },
      messages.contentEditor
    ),
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.commands.setContent(normalizeMarkdownForEditor(value), {
      contentType: getEditorContentType(value),
      emitUpdate: false,
    });
  }, [editor, value]);

  return <EditorContent editor={editor} />;
};

export default CardContentViewer;
