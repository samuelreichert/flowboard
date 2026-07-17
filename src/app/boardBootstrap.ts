import type { BoardBootstrapResponse } from '../storage/authenticatedApi';
import type { BoardCard, BoardState } from '../types';

export const BOOTSTRAP_CARD_CREATED_AT_PLACEHOLDER =
  '1970-01-01T00:00:00.000Z';

export const createBoardStateFromBootstrap = (
  bootstrap: BoardBootstrapResponse
): BoardState => {
  const cardsByColumnId = new Map<string, BoardCard[]>();

  for (const card of bootstrap.cards) {
    const columnCards = cardsByColumnId.get(card.columnId) ?? [];
    columnCards.push({
      content: '',
      createdAt: BOOTSTRAP_CARD_CREATED_AT_PLACEHOLDER,
      id: card.id,
      priority: card.priority,
      tagIds: card.tagIds,
      title: card.title,
    });
    cardsByColumnId.set(card.columnId, columnCards);
  }

  return {
    activeWorkCycle: bootstrap.workCycle,
    background: bootstrap.board.background,
    columns: bootstrap.columns.map((column, index) => ({
      cards: cardsByColumnId.get(column.id) ?? [],
      id: column.id,
      position: index * 10,
      title: column.title,
    })),
    completedWorkCycles: [],
    tags: bootstrap.tags,
  };
};
