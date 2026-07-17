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
