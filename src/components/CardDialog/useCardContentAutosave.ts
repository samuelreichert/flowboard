import { useCallback, useEffect, useRef } from 'react';

export const CARD_CONTENT_SAVE_IDLE_MS = 750;

export const useCardContentAutosave = ({
  onFlush,
}: {
  onFlush: (content: string) => void;
}) => {
  const onFlushRef = useRef(onFlush);
  const pendingContentRef = useRef<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    onFlushRef.current = onFlush;
  }, [onFlush]);

  const clearPendingTimeout = useCallback(() => {
    if (timeoutRef.current === null) {
      return;
    }

    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  const flushPendingContentSave = useCallback(() => {
    clearPendingTimeout();

    const pendingContent = pendingContentRef.current;

    if (pendingContent === null) {
      return;
    }

    pendingContentRef.current = null;
    onFlushRef.current(pendingContent);
  }, [clearPendingTimeout]);

  const queueContentSave = useCallback(
    (content: string) => {
      pendingContentRef.current = content;
      clearPendingTimeout();
      timeoutRef.current = window.setTimeout(
        flushPendingContentSave,
        CARD_CONTENT_SAVE_IDLE_MS
      );
    },
    [clearPendingTimeout, flushPendingContentSave]
  );

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushPendingContentSave();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      flushPendingContentSave();
    };
  }, [flushPendingContentSave]);

  return {
    flushPendingContentSave,
    queueContentSave,
  };
};
