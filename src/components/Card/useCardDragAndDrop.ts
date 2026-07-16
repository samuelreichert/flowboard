import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import {
  attachClosestEdge,
  extractClosestEdge,
  type Edge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

import { isCardDragData } from '../../dnd';

const hasSelectionInside = (element: HTMLElement) => {
  const selection = window.getSelection();

  if (
    !selection ||
    selection.isCollapsed ||
    selection.toString().trim().length === 0
  ) {
    return false;
  }

  return Boolean(
    (selection.anchorNode && element.contains(selection.anchorNode)) ||
    (selection.focusNode && element.contains(selection.focusNode))
  );
};

type UseCardDragAndDropProps = {
  cardId: string;
  cardRef: RefObject<HTMLElement | null>;
  columnId: string;
  titleRef: RefObject<HTMLElement | null>;
};

export const useCardDragAndDrop = ({
  cardId,
  cardRef,
  columnId,
  titleRef,
}: UseCardDragAndDropProps) => {
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const ignoreNextClickRef = useRef(false);
  const resetIgnoreClickTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const cardElement = cardRef.current;

    if (!cardElement) {
      return;
    }

    const cleanup = combine(
      draggable({
        element: cardElement,
        getInitialData: () => ({ cardId, columnId, type: 'card' }),
        onDragStart: () => {
          ignoreNextClickRef.current = true;
          setIsDragging(true);
        },
        onDrop: () => {
          setIsDragging(false);

          if (resetIgnoreClickTimerRef.current) {
            window.clearTimeout(resetIgnoreClickTimerRef.current);
          }

          resetIgnoreClickTimerRef.current = window.setTimeout(() => {
            ignoreNextClickRef.current = false;
            resetIgnoreClickTimerRef.current = null;
          }, 0);
        },
      }),
      dropTargetForElements({
        element: cardElement,
        canDrop: ({ source }) =>
          isCardDragData(source.data) && source.data.cardId !== cardId,
        getData: ({ element, input }) =>
          attachClosestEdge(
            { cardId, columnId, type: 'card' },
            { allowedEdges: ['top', 'bottom'], element, input }
          ),
        onDrag: ({ self }) => setClosestEdge(extractClosestEdge(self.data)),
        onDragEnter: ({ self }) =>
          setClosestEdge(extractClosestEdge(self.data)),
        onDragLeave: () => setClosestEdge(null),
        onDrop: () => setClosestEdge(null),
      })
    );

    return cleanup;
  }, [cardId, cardRef, columnId]);

  useEffect(() => {
    const titleElement = titleRef.current;

    if (!titleElement) {
      return;
    }

    const setCardDraggingEnabled = (enabled: boolean) => {
      const cardElement = cardRef.current;

      if (cardElement) {
        cardElement.draggable = enabled;
      }
    };
    const disableDragging = () => setCardDraggingEnabled(false);
    const enableDragging = () => setCardDraggingEnabled(true);

    titleElement.addEventListener('mouseenter', disableDragging);
    titleElement.addEventListener('mousedown', disableDragging);
    titleElement.addEventListener('mouseleave', enableDragging);

    return () => {
      titleElement.removeEventListener('mouseenter', disableDragging);
      titleElement.removeEventListener('mousedown', disableDragging);
      titleElement.removeEventListener('mouseleave', enableDragging);
    };
  }, [cardRef, titleRef]);

  useEffect(
    () => () => {
      if (resetIgnoreClickTimerRef.current) {
        window.clearTimeout(resetIgnoreClickTimerRef.current);
      }
    },
    []
  );

  const shouldSuppressCardClick = () => {
    const cardElement = cardRef.current;

    if (!cardElement) {
      return false;
    }

    if (ignoreNextClickRef.current || hasSelectionInside(cardElement)) {
      ignoreNextClickRef.current = false;
      return true;
    }

    return false;
  };

  return {
    closestEdge,
    isDragging,
    shouldSuppressCardClick,
  };
};
