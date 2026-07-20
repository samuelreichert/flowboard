export const getEditorPortalContainer = () => {
  if (typeof document === 'undefined') {
    return null;
  }

  return document.querySelector<HTMLElement>('.dialog-popup--card');
};

export const getEditorBubbleMenuAppendTarget = () =>
  getEditorPortalContainer() ?? document.body;
