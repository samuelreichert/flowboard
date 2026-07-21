import type {
  ArchivedBoardCard,
  BoardState,
  BoardTag,
  CompletedWorkCycle,
} from './types.ts';

const createId = () => crypto.randomUUID();

const snapshotTags = (tagIds: string[], tags: BoardTag[]) =>
  tagIds
    .map((tagId) => tags.find((tag) => tag.id === tagId))
    .filter((tag): tag is BoardTag => Boolean(tag))
    .map((tag) => ({ id: tag.id, name: tag.name }));

export const createCompletedWorkCycle = (
  state: BoardState,
  completedAt: string
): CompletedWorkCycle | null => {
  const completedColumn = state.columns.find(
    (column) => column.id === state.activeWorkCycle.completedColumnId
  );

  if (!completedColumn) {
    return null;
  }

  return {
    cards: completedColumn.cards.map(
      (card): ArchivedBoardCard => ({
        archivedAt: completedAt,
        content: card.content,
        createdAt: card.createdAt,
        id: card.id,
        priority: card.priority,
        tagIds: card.tagIds,
        tagSnapshots: snapshotTags(card.tagIds, state.tags),
        title: card.title,
      })
    ),
    completedColumnId: completedColumn.id,
    completedColumnTitle: completedColumn.title,
    endDate: completedAt,
    id: createId(),
    startDate: state.activeWorkCycle.startDate,
  };
};

export const completeWorkCycle = (
  state: BoardState,
  completedAt: string
): BoardState | null => {
  const completedWorkCycle = createCompletedWorkCycle(state, completedAt);

  if (!completedWorkCycle?.completedColumnId) {
    return null;
  }

  return {
    ...state,
    activeWorkCycle: {
      completedColumnId: completedWorkCycle.completedColumnId,
      startDate: completedAt,
    },
    columns: state.columns.map((column) =>
      column.id === completedWorkCycle.completedColumnId
        ? { ...column, cards: [] }
        : column
    ),
    completedWorkCycles: [...state.completedWorkCycles, completedWorkCycle],
  };
};

export const resolveArchivedTagName = (
  tagId: string,
  card: Pick<ArchivedBoardCard, 'tagSnapshots'>,
  tags: BoardTag[]
) =>
  tags.find((tag) => tag.id === tagId)?.name ??
  card.tagSnapshots.find((tag) => tag.id === tagId)?.name ??
  null;
