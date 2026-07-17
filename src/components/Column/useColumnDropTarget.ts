import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

import { isCardDragData } from '../../dnd';

export const useColumnDropTarget = ({
  columnId,
  columnRef,
}: {
  columnId: string;
  columnRef: RefObject<HTMLElement | null>;
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    const columnElement = columnRef.current;

    if (!columnElement) {
      return;
    }

    return dropTargetForElements({
      element: columnElement,
      canDrop: ({ source }) => isCardDragData(source.data),
      getData: () => ({ columnId, type: 'column' }),
      onDragEnter: () => setIsDragOver(true),
      onDragLeave: () => setIsDragOver(false),
      onDrop: () => setIsDragOver(false),
    });
  }, [columnId, columnRef]);

  return isDragOver;
};
