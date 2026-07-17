import type { BoardCard, BoardColumn, BoardState } from '../types';
import { BOOTSTRAP_CARD_CREATED_AT_PLACEHOLDER } from './boardBootstrap';

const mergeCard = (
  summaryCard: BoardCard,
  completeCardsById: Map<string, BoardCard>
): BoardCard => {
  const completeCard = completeCardsById.get(summaryCard.id);

  return {
    ...summaryCard,
    content: summaryCard.content || completeCard?.content || '',
    createdAt:
      summaryCard.createdAt === BOOTSTRAP_CARD_CREATED_AT_PLACEHOLDER
        ? completeCard?.createdAt || summaryCard.createdAt
        : summaryCard.createdAt,
  };
};

const createCompleteCardMap = (columns: BoardColumn[]) =>
  new Map(
    columns.flatMap((column) => column.cards.map((card) => [card.id, card]))
  );

export const mergeBoardSurfaceIntoCompleteState = (
  surfaceState: BoardState,
  completeState: BoardState
): BoardState => {
  const completeCardsById = createCompleteCardMap(completeState.columns);

  return {
    ...completeState,
    activeWorkCycle: surfaceState.activeWorkCycle,
    background: surfaceState.background,
    columns: surfaceState.columns.map((column) => ({
      ...column,
      cards: column.cards.map((card) => mergeCard(card, completeCardsById)),
    })),
    tags: surfaceState.tags,
  };
};

export const needsCompleteBoardSnapshotForSave = (state: BoardState) =>
  state.completedWorkCycles.length === 0 ||
  state.columns.some((column) =>
    column.cards.some(
      (card) =>
        card.createdAt === BOOTSTRAP_CARD_CREATED_AT_PLACEHOLDER &&
        !card.content
    )
  );
