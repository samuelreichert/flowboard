import type { BoardBootstrapResponse } from '../storage/authenticatedApi';
import type { BoardState } from '../types';

export const BOOTSTRAP_CARD_CREATED_AT_PLACEHOLDER =
  '1970-01-01T00:00:00.000Z';

export const createBoardStateFromBootstrap = (
  bootstrap: BoardBootstrapResponse
): BoardState => ({
  activeWorkCycle: bootstrap.workCycle,
  background: bootstrap.board.background,
  columns: bootstrap.columns.map((column, index) => ({
    cards: bootstrap.cards
      .filter((card) => card.columnId === column.id)
      .map((card) => ({
        content: '',
        createdAt: BOOTSTRAP_CARD_CREATED_AT_PLACEHOLDER,
        id: card.id,
        priority: card.priority,
        tagIds: card.tagIds,
        title: card.title,
      })),
    id: column.id,
    position: index * 10,
    title: column.title,
  })),
  completedWorkCycles: [],
  tags: bootstrap.tags,
});
