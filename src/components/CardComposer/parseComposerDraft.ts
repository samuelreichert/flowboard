export type ParsedComposerDraft = {
  content: string;
  title: string;
};

export const parseComposerDraft = (draft: string): ParsedComposerDraft => {
  const lines = draft.replace(/\r\n?/g, '\n').split('\n');
  const titleLineIndex = lines.findIndex((line) => line.trim().length > 0);

  if (titleLineIndex === -1) {
    return { content: '', title: '' };
  }

  return {
    content: lines.slice(titleLineIndex + 1).join('\n').trim(),
    title: lines[titleLineIndex].trim(),
  };
};
