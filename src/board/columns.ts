import type { BoardColumn } from './types.ts';

const COLUMN_POSITION_STEP = 10;

export type ColumnMoveDirection = 'first' | 'last' | 'next' | 'previous';

export const sortColumnsByPosition = (columns: BoardColumn[]) =>
  columns.toSorted((first, second) => first.position - second.position);

export const normalizeColumnPositions = (columns: BoardColumn[]) =>
  columns.map((column, index) => ({
    ...column,
    position: index * COLUMN_POSITION_STEP,
  }));

export const normalizeColumnOrder = (columns: BoardColumn[]) =>
  normalizeColumnPositions(sortColumnsByPosition(columns));

export const moveColumn = (
  columns: BoardColumn[],
  columnId: string,
  direction: ColumnMoveDirection
) => {
  const orderedColumns = normalizeColumnOrder(columns);
  const currentIndex = orderedColumns.findIndex(
    (column) => column.id === columnId
  );

  if (currentIndex === -1) {
    return orderedColumns;
  }

  const lastIndex = orderedColumns.length - 1;
  const nextIndex =
    direction === 'first'
      ? 0
      : direction === 'last'
        ? lastIndex
        : direction === 'previous'
          ? Math.max(0, currentIndex - 1)
          : Math.min(lastIndex, currentIndex + 1);

  if (nextIndex === currentIndex) {
    return orderedColumns;
  }

  const nextColumns = [...orderedColumns];
  const [movedColumn] = nextColumns.splice(currentIndex, 1);
  nextColumns.splice(nextIndex, 0, movedColumn);

  return normalizeColumnPositions(nextColumns);
};
