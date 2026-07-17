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
import type { MoveCardMutationVariables } from '../../app/useFlowboardCardMutations';

export const useColumnsDragMonitor = ({
  columns,
  onCardMove,
}: {
  columns: BoardColumn[];
  onCardMove: (
    move: MoveCardMutationVariables & { nextColumns: BoardColumn[] }
  ) => void;
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
            const closestEdge = extractClosestEdge(target.data);
            const nextColumns = reorderCard(columns, {
              cardId: source.data.cardId,
              closestEdge,
              fromColumnId: source.data.columnId,
              targetCardId: target.data.cardId,
              toColumnId: target.data.columnId,
            });

            onCardMove({
              cardId: source.data.cardId,
              nextColumns,
              placement: {
                afterCardId:
                  closestEdge === 'bottom' ? target.data.cardId : null,
                beforeCardId:
                  closestEdge === 'bottom' ? null : target.data.cardId,
                columnId: target.data.columnId,
              },
            });
          }

          if (isColumnDropTargetData(target.data)) {
            const nextColumns = reorderCard(columns, {
              cardId: source.data.cardId,
              closestEdge: null,
              fromColumnId: source.data.columnId,
              toColumnId: target.data.columnId,
            });

            onCardMove({
              cardId: source.data.cardId,
              nextColumns,
              placement: {
                afterCardId: null,
                beforeCardId: null,
                columnId: target.data.columnId,
              },
            });
          }
        },
      }),
    [columns, onCardMove]
  );
};
