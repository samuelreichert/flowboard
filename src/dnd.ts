import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';

import type { BoardColumn } from './types';

export type CardDragData = {
  cardId: string;
  columnId: string;
  type: 'card';
};

export type CardDropTargetData = {
  cardId: string;
  columnId: string;
  type: 'card';
};

export type ColumnDropTargetData = {
  columnId: string;
  type: 'column';
};

type CardMove = {
  cardId: string;
  closestEdge: Edge | null;
  fromColumnId: string;
  targetCardId?: string;
  toColumnId: string;
};

export const isCardDragData = (
  data: Record<string, unknown>
): data is CardDragData =>
  data.type === 'card' &&
  typeof data.cardId === 'string' &&
  typeof data.columnId === 'string';

export const isCardDropTargetData = (
  data: Record<string | symbol, unknown>
): data is CardDropTargetData =>
  data.type === 'card' &&
  typeof data.cardId === 'string' &&
  typeof data.columnId === 'string';

export const isColumnDropTargetData = (
  data: Record<string | symbol, unknown>
): data is ColumnDropTargetData =>
  data.type === 'column' && typeof data.columnId === 'string';

export const reorderCard = (columns: BoardColumn[], move: CardMove) => {
  const sourceColumn = columns.find(
    (column) => column.id === move.fromColumnId
  );
  const card = sourceColumn?.cards.find((item) => item.id === move.cardId);

  if (!sourceColumn || !card) {
    return columns;
  }

  const destinationColumn = columns.find(
    (column) => column.id === move.toColumnId
  );

  if (!destinationColumn) {
    return columns;
  }

  const destinationCards = destinationColumn.cards.filter(
    (item) => item.id !== move.cardId
  );
  const targetIndex = move.targetCardId
    ? destinationCards.findIndex((item) => item.id === move.targetCardId)
    : destinationCards.length;

  if (targetIndex === -1) {
    return columns;
  }

  const insertAt =
    move.closestEdge === 'bottom' ? targetIndex + 1 : targetIndex;
  const reorderedCards = [...destinationCards];
  reorderedCards.splice(insertAt, 0, card);

  return columns.map((column) => {
    if (column.id === move.fromColumnId && column.id === move.toColumnId) {
      return { ...column, cards: reorderedCards };
    }

    if (column.id === move.fromColumnId) {
      return {
        ...column,
        cards: column.cards.filter((item) => item.id !== move.cardId),
      };
    }

    if (column.id === move.toColumnId) {
      return { ...column, cards: reorderedCards };
    }

    return column;
  });
};
