import type {
  ArchivedBoardCard,
  BoardCard,
  BoardColumn,
  CompletedWorkCycle,
} from './types.ts';

export type ActiveCardRouteTarget = {
  card: BoardCard;
  column: BoardColumn;
};

export type ArchivedCardRouteTarget = {
  card: ArchivedBoardCard;
  cycle: CompletedWorkCycle;
};

export const findActiveCardRouteTarget = (
  columns: BoardColumn[],
  cardId: string
): ActiveCardRouteTarget | null => {
  for (const column of columns) {
    const card = column.cards.find((card) => card.id === cardId);

    if (card) {
      return { card, column };
    }
  }

  return null;
};

export const findArchivedCardRouteTarget = (
  cycles: CompletedWorkCycle[],
  cycleId: string,
  cardId: string
): ArchivedCardRouteTarget | null => {
  const cycle = cycles.find((cycle) => cycle.id === cycleId);
  const card = cycle?.cards.find((card) => card.id === cardId);

  return cycle && card ? { card, cycle } : null;
};
