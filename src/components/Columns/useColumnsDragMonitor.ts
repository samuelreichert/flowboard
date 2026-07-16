import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { useEffect } from 'react';

import { reorderCard } from '../../board/commands';
import {
  isCardDragData,
  isCardDropTargetData,
  isColumnDropTargetData,
} from '../../dnd';
import type { BoardColumn } from '../../types';

export const useColumnsDragMonitor = ({
  columns,
  onColumnsChange,
}: {
  columns: BoardColumn[];
  onColumnsChange: (columns: BoardColumn[]) => void;
}) => {
  useEffect(
    () =>
      monitorForElements({
        canMonitor: ({ source }) => isCardDragData(source.data),
        onDrop: ({ location, source }) => {
          if (!isCardDragData(source.data)) {
            return;
          }

          const target = location.current.dropTargets[0];

          if (!target) {
            return;
          }

          if (isCardDropTargetData(target.data)) {
            onColumnsChange(
              reorderCard(columns, {
                cardId: source.data.cardId,
                closestEdge: extractClosestEdge(target.data),
                fromColumnId: source.data.columnId,
                targetCardId: target.data.cardId,
                toColumnId: target.data.columnId,
              })
            );
          }

          if (isColumnDropTargetData(target.data)) {
            onColumnsChange(
              reorderCard(columns, {
                cardId: source.data.cardId,
                closestEdge: null,
                fromColumnId: source.data.columnId,
                toColumnId: target.data.columnId,
              })
            );
          }
        },
      }),
    [columns, onColumnsChange]
  );
};
