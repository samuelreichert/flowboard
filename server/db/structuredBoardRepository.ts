import { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';

import { CARD_PRIORITIES } from '../../src/board/cardPriority.js';
import { DEFAULT_BACKGROUND } from '../../src/board/constants.js';
import type {
  ArchivedBoardCard,
  BoardActiveWorkCycle,
  BoardBackground,
  BoardCard,
  BoardColumn,
  BoardState,
  BoardTag,
  CompletedWorkCycle,
} from '../../src/board/types.js';
import type { FlowboardPrismaClient } from './prismaClient.js';

const DEFAULT_PROJECT_NAME = 'Personal';
const DEFAULT_BOARD_TITLE = 'Flowboard';
const BOARD_WRITE_TRANSACTION_TIMEOUT_MS = 15_000;

type BoardRecord = Awaited<
  ReturnType<FlowboardPrismaClient['board']['findFirst']>
>;
type ProjectWithBoards = Awaited<
  ReturnType<FlowboardPrismaClient['project']['findMany']>
>[number] & {
  boards?: Array<{
    id: string;
    title: string;
    updatedAt: Date;
  }>;
};

export type BoardSummary = {
  id: string;
  title: string;
  updatedAt: string;
};

export type ProjectSummary = {
  boards: BoardSummary[];
  id: string;
  name: string;
};

export type LoadedBoard = {
  board: BoardSummary;
  state: BoardState;
};

export type BoardBootstrapSummary = {
  id: string;
  title: string;
  background: BoardState['background'];
  version: number;
};

export type BoardBootstrapColumn = {
  id: string;
  title: string;
};

export type BoardBootstrapCard = {
  columnId: string;
  id: string;
  priority: BoardCard['priority'];
  tagIds: string[];
  title: string;
};

export type BoardBootstrap = {
  board: BoardBootstrapSummary;
  cards: BoardBootstrapCard[];
  columns: BoardBootstrapColumn[];
  tags: BoardTag[];
  workCycle: BoardState['activeWorkCycle'];
};

export type ActiveCardDetail = {
  content: string;
  createdAt: string;
  id: string;
  priority: BoardCard['priority'];
  tagIds: string[];
  title: string;
};

export type ActiveCardMutationCard = ActiveCardDetail & {
  columnId: string;
};

export type ActiveCardMutationResult = {
  boardVersion: number;
  card: ActiveCardMutationCard;
};

export type ActiveCardDeleteResult = {
  boardVersion: number;
  cardId: string;
  columnId: string;
};

export type ActiveCardCreateInput = {
  columnId: string;
  content: string;
  id: string;
  priority: BoardCard['priority'];
  tagIds: string[];
  title: string;
};

export type ActiveCardUpdateInput = {
  content?: string;
  priority?: BoardCard['priority'];
  tagIds?: string[];
  title?: string;
};

export type ActiveCardMoveInput = {
  afterCardId?: string | null;
  beforeCardId?: string | null;
  columnId: string;
};

export type ActiveColumnMutationColumn = BoardBootstrapColumn;

export type ActiveColumnMutationResult = {
  boardVersion: number;
  column: ActiveColumnMutationColumn;
  columns: ActiveColumnMutationColumn[];
};

export type ActiveColumnDeleteResult = {
  boardVersion: number;
  cardIds: string[];
  columnId: string;
  columns: ActiveColumnMutationColumn[];
  workCycle: BoardActiveWorkCycle;
};

export type ActiveColumnCreateInput = {
  id: string;
  title: string;
};

export type ActiveColumnUpdateInput = {
  title: string;
};

export type ActiveColumnMoveInput = {
  afterColumnId?: string | null;
  beforeColumnId?: string | null;
};

export type BoardTagMutationResult = {
  boardVersion: number;
  tag: BoardTag;
  tags: BoardTag[];
};

export type BoardTagDeleteResult = {
  affectedCardIds: string[];
  boardVersion: number;
  tagId: string;
  tags: BoardTag[];
};

export type BoardTagCreateInput = {
  id: string;
  name: string;
};

export type BoardTagUpdateInput = {
  name: string;
};

export type ActiveCardTagMutationResult = {
  boardVersion: number;
  card: BoardBootstrapCard;
};

export type BoardSettingsMutationResult = {
  board: {
    background: BoardBackground;
    version: number;
  };
};

export type BoardSettingsUpdateInput = {
  background: BoardBackground;
};

export type WorkCycleSettingsMutationResult = {
  boardVersion: number;
  workCycle: BoardActiveWorkCycle;
};

export type WorkCycleSettingsUpdateInput = {
  completedColumnId: string | null;
};

export const COMPLETED_HISTORY_DEFAULT_LIMIT = 20;
export const COMPLETED_HISTORY_MAX_LIMIT = 50;

export type CompletedHistoryCardSummary = Omit<ArchivedBoardCard, 'content'> & {
  hasContent: boolean;
};

export type CompletedHistoryCycleSummary = Omit<CompletedWorkCycle, 'cards'> & {
  cards: CompletedHistoryCardSummary[];
};

export type CompletedHistoryPageInfo = {
  hasMore: boolean;
  nextCursor: string | null;
};

export type CompletedHistoryPage = {
  cycles: CompletedHistoryCycleSummary[];
  pageInfo: CompletedHistoryPageInfo;
};

export type CompletedHistoryPageInput = {
  cursor?: string | null;
  limit?: number;
};

export type CompleteWorkCycleResult = {
  boardVersion: number;
  cardIds: string[];
  columnId: string;
  cycle: CompletedHistoryCycleSummary;
  workCycle: BoardActiveWorkCycle;
};

export type ArchivedCardDetail = ArchivedBoardCard;

const createId = () => randomUUID();

const toDate = (value: string) => new Date(value);

const toIso = (value: Date) => value.toISOString();

const isCardPriority = (value: string): value is BoardCard['priority'] =>
  CARD_PRIORITIES.includes(value as BoardCard['priority']);

const toBoardBackground = (board: {
  backgroundType: string;
  backgroundValue: string;
}): BoardBackground => ({
  type: board.backgroundType as BoardBackground['type'],
  value: board.backgroundValue,
});

const createEmptyBoardState = (now = new Date()): BoardState => ({
  activeWorkCycle: {
    completedColumnId: null,
    startDate: now.toISOString(),
  },
  background: DEFAULT_BACKGROUND,
  columns: [],
  completedWorkCycles: [],
  tags: [],
});

const toBoardSummary = (board: {
  id: string;
  title: string;
  updatedAt: Date;
}): BoardSummary => ({
  id: board.id,
  title: board.title,
  updatedAt: toIso(board.updatedAt),
});

export const listProjects = async (
  prisma: FlowboardPrismaClient,
  ownerId: string
): Promise<ProjectSummary[]> => {
  const projects = (await prisma.project.findMany({
    include: {
      boards: {
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        select: {
          id: true,
          title: true,
          updatedAt: true,
        },
      },
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    where: { ownerId },
  })) as ProjectWithBoards[];

  return projects.map((project) => ({
    boards: (project.boards ?? []).map(toBoardSummary),
    id: project.id,
    name: project.name,
  }));
};

export const ensureDefaultBoard = async (
  prisma: FlowboardPrismaClient,
  ownerId: string,
  state = createEmptyBoardState()
) => {
  const existingBoard = await prisma.board.findFirst({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    where: { ownerId },
  });

  if (existingBoard) {
    return existingBoard;
  }

  const project =
    (await prisma.project.findFirst({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      where: { ownerId },
    })) ??
    (await prisma.project.create({
      data: {
        id: createId(),
        name: DEFAULT_PROJECT_NAME,
        ownerId,
      },
    }));
  const board = await prisma.board.create({
    data: {
      backgroundType: state.background.type,
      backgroundValue: state.background.value,
      id: createId(),
      ownerId,
      projectId: project.id,
      title: DEFAULT_BOARD_TITLE,
    },
  });

  await writeBoardState(prisma, ownerId, board.id, state);

  return board;
};

export const loadBoard = async (
  prisma: FlowboardPrismaClient,
  ownerId: string,
  boardId: string | null
): Promise<LoadedBoard | null> => {
  const board = boardId
    ? await prisma.board.findFirst({
        where: {
          id: boardId,
          ownerId,
        },
      })
    : await ensureDefaultBoard(prisma, ownerId);

  if (!board) {
    return null;
  }

  return {
    board: toBoardSummary(board),
    state: await readBoardState(prisma, board),
  };
};

const getTagIdsByCard = (
  cardTags: Array<{ cardId: string; tagId: string }>
) => {
  const tagIdsByCard = new Map<string, string[]>();

  for (const cardTag of cardTags) {
    tagIdsByCard.set(cardTag.cardId, [
      ...(tagIdsByCard.get(cardTag.cardId) ?? []),
      cardTag.tagId,
    ]);
  }

  return tagIdsByCard;
};

const getBoardScopedTags = async (
  prisma: FlowboardPrismaClient,
  boardId: string,
  tagIds: string[]
) => {
  const uniqueTagIds = [...new Set(tagIds)];

  if (uniqueTagIds.length === 0) {
    return [];
  }

  const tags = await prisma.tag.findMany({
    select: { id: true },
    where: {
      boardId,
      id: { in: uniqueTagIds },
    },
  });

  return tags.length === uniqueTagIds.length ? uniqueTagIds : null;
};

const getBoardScopedColumn = async (
  prisma: FlowboardPrismaClient,
  boardId: string,
  columnId: string
) =>
  prisma.boardColumn.findFirst({
    select: { id: true },
    where: {
      boardId,
      id: columnId,
    },
  });

const getBoardScopedTag = async (
  prisma: FlowboardPrismaClient,
  boardId: string,
  tagId: string
) =>
  prisma.tag.findFirst({
    select: { id: true },
    where: {
      boardId,
      id: tagId,
    },
  });

const toBootstrapColumn = (column: {
  id: string;
  title: string;
}): BoardBootstrapColumn => ({
  id: column.id,
  title: column.title,
});

const toBootstrapTag = (tag: { id: string; name: string }): BoardTag => ({
  id: tag.id,
  name: tag.name,
});

const toBootstrapCard = (
  card: {
    columnId: string;
    id: string;
    priority: string;
    title: string;
  },
  tagIds: string[]
): BoardBootstrapCard => ({
  columnId: card.columnId,
  id: card.id,
  priority: isCardPriority(card.priority) ? card.priority : 'medium',
  tagIds,
  title: card.title,
});

const toArchivedTagSnapshot = (tag: {
  id: string;
  name: string;
  originalTagId?: string | null;
}): BoardTag => ({
  id: tag.originalTagId ?? tag.id,
  name: tag.name,
});

const toCompletedHistoryCardSummary = (card: {
  archivedAt: Date;
  content?: string;
  createdAt: Date;
  id: string;
  priority: string;
  tagSnapshots: Array<{
    id: string;
    name: string;
    originalTagId?: string | null;
  }>;
  title: string;
}): CompletedHistoryCardSummary => ({
  archivedAt: toIso(card.archivedAt),
  createdAt: toIso(card.createdAt),
  hasContent: Boolean(card.content),
  id: card.id,
  priority: isCardPriority(card.priority) ? card.priority : 'medium',
  tagIds: card.tagSnapshots
    .map((tag) => tag.originalTagId)
    .filter((tagId): tagId is string => Boolean(tagId)),
  tagSnapshots: card.tagSnapshots.map(toArchivedTagSnapshot),
  title: card.title,
});

const toCompletedHistoryCycleSummary = (cycle: {
  cards: Array<{
    archivedAt: Date;
    content?: string;
    createdAt: Date;
    id: string;
    priority: string;
    tagSnapshots: Array<{
      id: string;
      name: string;
      originalTagId?: string | null;
    }>;
    title: string;
  }>;
  completedColumnId: string | null;
  completedColumnTitle: string | null;
  endDate: Date;
  id: string;
  startDate: Date;
}): CompletedHistoryCycleSummary => ({
  cards: cycle.cards.map(toCompletedHistoryCardSummary),
  completedColumnId: cycle.completedColumnId,
  completedColumnTitle: cycle.completedColumnTitle,
  endDate: toIso(cycle.endDate),
  id: cycle.id,
  startDate: toIso(cycle.startDate),
});

type CompletedHistoryCursor = {
  endDate: string;
  id: string;
};

const encodeCompletedHistoryCursor = (
  cycle: Pick<CompletedHistoryCycleSummary, 'endDate' | 'id'>
) =>
  Buffer.from(
    JSON.stringify({ endDate: cycle.endDate, id: cycle.id }),
    'utf8'
  ).toString('base64url');

export const decodeCompletedHistoryCursor = (
  cursor: string
): CompletedHistoryCursor | null => {
  try {
    const value = JSON.parse(
      Buffer.from(cursor, 'base64url').toString('utf8')
    ) as unknown;

    if (
      typeof value !== 'object' ||
      value === null ||
      !('endDate' in value) ||
      !('id' in value) ||
      typeof value.endDate !== 'string' ||
      typeof value.id !== 'string' ||
      Number.isNaN(Date.parse(value.endDate)) ||
      value.id.trim().length === 0
    ) {
      return null;
    }

    return { endDate: value.endDate, id: value.id };
  } catch {
    return null;
  }
};

const toActiveCardMutationCard = (
  card: {
    columnId: string;
    content: string;
    createdAt: Date;
    id: string;
    priority: string;
    title: string;
  },
  tagIds: string[]
): ActiveCardMutationCard => ({
  columnId: card.columnId,
  content: card.content,
  createdAt: toIso(card.createdAt),
  id: card.id,
  priority: isCardPriority(card.priority) ? card.priority : 'medium',
  tagIds,
  title: card.title,
});

const replaceCardTags = async (
  transaction: FlowboardPrismaClient,
  cardId: string,
  tagIds: string[]
) => {
  await transaction.cardTag.deleteMany({ where: { cardId } });

  if (tagIds.length > 0) {
    await transaction.cardTag.createMany({
      data: tagIds.map((tagId) => ({ cardId, tagId })),
    });
  }
};

const getColumnCards = async (
  transaction: FlowboardPrismaClient,
  columnId: string
) =>
  transaction.card.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: { id: true },
    where: { columnId },
  });

const getBoardColumns = async (
  transaction: FlowboardPrismaClient,
  boardId: string
) =>
  transaction.boardColumn.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, title: true },
    where: { boardId },
  });

const getBoardTags = async (
  transaction: FlowboardPrismaClient,
  boardId: string
) =>
  transaction.tag.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, name: true },
    where: { boardId },
  });

const hasDuplicateTitle = (
  items: Array<{ id: string; title: string }>,
  title: string,
  excludedId?: string
) =>
  items.some(
    (item) =>
      item.id !== excludedId && item.title.toLowerCase() === title.toLowerCase()
  );

const hasDuplicateTagName = (
  items: Array<{ id: string; name: string }>,
  name: string,
  excludedId?: string
) =>
  items.some(
    (item) =>
      item.id !== excludedId && item.name.toLowerCase() === name.toLowerCase()
  );

const getColumnCardIdsExcept = async (
  transaction: FlowboardPrismaClient,
  columnId: string,
  excludedCardId: string
) => {
  const cards = await getColumnCards(transaction, columnId);
  const cardIds: string[] = [];

  for (const card of cards) {
    if (card.id !== excludedCardId) {
      cardIds.push(card.id);
    }
  }

  return cardIds;
};

const updateColumnCardOrder = async (
  transaction: FlowboardPrismaClient,
  columnId: string,
  cardIds: string[]
) => {
  await Promise.all(
    cardIds.map((cardId, sortOrder) =>
      transaction.card.update({
        data: { sortOrder },
        where: { id: cardId },
      })
    )
  );
};

const updateBoardColumnOrder = async (
  transaction: FlowboardPrismaClient,
  columnIds: string[]
) => {
  await Promise.all(
    columnIds.map((columnId, sortOrder) =>
      transaction.boardColumn.update({
        data: { sortOrder },
        where: { id: columnId },
      })
    )
  );
};

export const loadMainBoardBootstrap = async (
  prisma: FlowboardPrismaClient,
  ownerId: string
): Promise<BoardBootstrap> => {
  const board = await ensureDefaultBoard(prisma, ownerId);
  const [columns, cards, tags, cardTags, workCycle] = await Promise.all([
    prisma.boardColumn.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        title: true,
      },
      where: { boardId: board.id },
    }),
    prisma.card.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: {
        columnId: true,
        id: true,
        priority: true,
        title: true,
      },
      where: { boardId: board.id },
    }),
    prisma.tag.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        name: true,
      },
      where: { boardId: board.id },
    }),
    prisma.cardTag.findMany({
      select: {
        cardId: true,
        tagId: true,
      },
      where: {
        card: {
          boardId: board.id,
        },
      },
    }),
    prisma.boardWorkCycle.findUnique({
      select: {
        completedColumnId: true,
        startDate: true,
      },
      where: { boardId: board.id },
    }),
  ]);
  const tagIdsByCard = getTagIdsByCard(cardTags);

  return {
    board: {
      background: {
        type: board.backgroundType as BoardState['background']['type'],
        value: board.backgroundValue,
      },
      id: board.id,
      title: board.title,
      version: board.version,
    },
    cards: cards.map((card) => ({
      columnId: card.columnId,
      id: card.id,
      priority: card.priority as BoardCard['priority'],
      tagIds: tagIdsByCard.get(card.id) ?? [],
      title: card.title,
    })),
    columns: columns.map((column) => ({
      id: column.id,
      title: column.title,
    })),
    tags: tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
    })),
    workCycle: {
      completedColumnId: workCycle?.completedColumnId ?? null,
      startDate: toIso(workCycle?.startDate ?? board.createdAt),
    },
  };
};

export const loadActiveCardDetail = async (
  prisma: FlowboardPrismaClient,
  ownerId: string,
  cardId: string
): Promise<ActiveCardDetail | null> => {
  const board = await ensureDefaultBoard(prisma, ownerId);
  const card = await prisma.card.findFirst({
    select: {
      content: true,
      createdAt: true,
      id: true,
      priority: true,
      title: true,
    },
    where: {
      boardId: board.id,
      id: cardId,
    },
  });

  if (!card) {
    return null;
  }

  const cardTags = await prisma.cardTag.findMany({
    select: {
      tagId: true,
    },
    where: { cardId: card.id },
  });

  return {
    content: card.content,
    createdAt: toIso(card.createdAt),
    id: card.id,
    priority: card.priority as BoardCard['priority'],
    tagIds: cardTags.map((cardTag) => cardTag.tagId),
    title: card.title,
  };
};

export const createActiveCard = async (
  prisma: FlowboardPrismaClient,
  ownerId: string,
  input: ActiveCardCreateInput
): Promise<ActiveCardMutationResult | null> => {
  const board = await ensureDefaultBoard(prisma, ownerId);
  const [column, validTagIds] = await Promise.all([
    getBoardScopedColumn(prisma, board.id, input.columnId),
    getBoardScopedTags(prisma, board.id, input.tagIds),
  ]);

  if (!column || !validTagIds) {
    return null;
  }

  const existingCard = await prisma.card.findFirst({
    select: { id: true },
    where: {
      boardId: board.id,
      id: input.id,
    },
  });

  if (existingCard) {
    const card = await loadActiveCardDetail(prisma, ownerId, input.id);

    if (!card) {
      return null;
    }

    return {
      boardVersion: board.version,
      card: {
        ...card,
        columnId: input.columnId,
      },
    };
  }

  const lastCard = await prisma.card.findFirst({
    orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
    select: { sortOrder: true },
    where: { columnId: input.columnId },
  });
  const saved = await prisma.$transaction(async (transaction) => {
    const card = await transaction.card.create({
      data: {
        boardId: board.id,
        columnId: input.columnId,
        content: input.content,
        id: input.id,
        priority: input.priority,
        sortOrder: (lastCard?.sortOrder ?? -1) + 1,
        title: input.title,
      },
    });

    if (validTagIds.length > 0) {
      await transaction.cardTag.createMany({
        data: validTagIds.map((tagId) => ({ cardId: card.id, tagId })),
      });
    }

    const updatedBoard = await transaction.board.update({
      data: { version: { increment: 1 } },
      where: { id: board.id },
    });

    return { boardVersion: updatedBoard.version, card };
  });

  return {
    boardVersion: saved.boardVersion,
    card: toActiveCardMutationCard(saved.card, validTagIds),
  };
};

export const updateActiveCard = async (
  prisma: FlowboardPrismaClient,
  ownerId: string,
  cardId: string,
  input: ActiveCardUpdateInput
): Promise<ActiveCardMutationResult | null> => {
  const board = await ensureDefaultBoard(prisma, ownerId);
  const [card, validTagIds, existingCardTags] = await Promise.all([
    prisma.card.findFirst({
      where: {
        boardId: board.id,
        id: cardId,
      },
    }),
    input.tagIds
      ? getBoardScopedTags(prisma, board.id, input.tagIds)
      : Promise.resolve(undefined),
    prisma.cardTag.findMany({
      select: { tagId: true },
      where: { cardId },
    }),
  ]);

  if (!card || validTagIds === null) {
    return null;
  }

  const nextTagIds =
    validTagIds ?? existingCardTags.map((cardTag) => cardTag.tagId);

  const saved = await prisma.$transaction(async (transaction) => {
    const updatedCard = await transaction.card.update({
      data: {
        ...(input.content !== undefined ? { content: input.content } : {}),
        ...(input.priority !== undefined ? { priority: input.priority } : {}),
        ...(input.title !== undefined ? { title: input.title } : {}),
      },
      where: { id: card.id },
    });

    if (validTagIds !== undefined) {
      await replaceCardTags(transaction, card.id, validTagIds);
    }

    const updatedBoard = await transaction.board.update({
      data: { version: { increment: 1 } },
      where: { id: board.id },
    });

    return { boardVersion: updatedBoard.version, card: updatedCard };
  });

  return {
    boardVersion: saved.boardVersion,
    card: toActiveCardMutationCard(saved.card, nextTagIds),
  };
};

export const moveActiveCard = async (
  prisma: FlowboardPrismaClient,
  ownerId: string,
  cardId: string,
  input: ActiveCardMoveInput
): Promise<ActiveCardMutationResult | null> => {
  const board = await ensureDefaultBoard(prisma, ownerId);
  const [card, targetColumn] = await Promise.all([
    prisma.card.findFirst({
      where: {
        boardId: board.id,
        id: cardId,
      },
    }),
    getBoardScopedColumn(prisma, board.id, input.columnId),
  ]);

  if (!card || !targetColumn) {
    return null;
  }

  const placementCardId = input.beforeCardId ?? input.afterCardId ?? null;

  if (placementCardId) {
    const placementCard = await prisma.card.findFirst({
      select: { id: true },
      where: {
        boardId: board.id,
        columnId: input.columnId,
        id: placementCardId,
      },
    });

    if (!placementCard) {
      return null;
    }
  }

  const tagIds = (
    await prisma.cardTag.findMany({
      select: { tagId: true },
      where: { cardId: card.id },
    })
  ).map((cardTag) => cardTag.tagId);

  const saved = await prisma.$transaction(async (transaction) => {
    const sourceColumnId = card.columnId;
    const sourceCardIds = await getColumnCardIdsExcept(
      transaction,
      sourceColumnId,
      card.id
    );
    const destinationCardIds =
      sourceColumnId === input.columnId
        ? sourceCardIds
        : await getColumnCardIdsExcept(transaction, input.columnId, card.id);
    const targetIndex = placementCardId
      ? destinationCardIds.findIndex((id) => id === placementCardId)
      : destinationCardIds.length;

    if (targetIndex === -1) {
      return null;
    }

    const insertAt = input.afterCardId ? targetIndex + 1 : targetIndex;
    const nextDestinationCardIds = [...destinationCardIds];

    nextDestinationCardIds.splice(insertAt, 0, card.id);

    const movedCard = await transaction.card.update({
      data: {
        columnId: input.columnId,
        sortOrder: insertAt,
      },
      where: { id: card.id },
    });

    if (sourceColumnId !== input.columnId) {
      await updateColumnCardOrder(transaction, sourceColumnId, sourceCardIds);
    }

    await updateColumnCardOrder(
      transaction,
      input.columnId,
      nextDestinationCardIds
    );

    const updatedBoard = await transaction.board.update({
      data: { version: { increment: 1 } },
      where: { id: board.id },
    });

    return { boardVersion: updatedBoard.version, card: movedCard };
  });

  if (!saved) {
    return null;
  }

  return {
    boardVersion: saved.boardVersion,
    card: toActiveCardMutationCard(
      { ...saved.card, columnId: input.columnId },
      tagIds
    ),
  };
};

export const deleteActiveCard = async (
  prisma: FlowboardPrismaClient,
  ownerId: string,
  cardId: string
): Promise<ActiveCardDeleteResult | null> => {
  const board = await ensureDefaultBoard(prisma, ownerId);
  const card = await prisma.card.findFirst({
    select: {
      columnId: true,
      id: true,
    },
    where: {
      boardId: board.id,
      id: cardId,
    },
  });

  if (!card) {
    return null;
  }

  const saved = await prisma.$transaction(async (transaction) => {
    await transaction.cardTag.deleteMany({ where: { cardId: card.id } });
    await transaction.card.delete({ where: { id: card.id } });

    const remainingCardIds = await getColumnCardIdsExcept(
      transaction,
      card.columnId,
      card.id
    );

    await updateColumnCardOrder(transaction, card.columnId, remainingCardIds);

    const updatedBoard = await transaction.board.update({
      data: { version: { increment: 1 } },
      where: { id: board.id },
    });

    return updatedBoard.version;
  });

  return {
    boardVersion: saved,
    cardId: card.id,
    columnId: card.columnId,
  };
};

export const createActiveColumn = async (
  prisma: FlowboardPrismaClient,
  ownerId: string,
  input: ActiveColumnCreateInput
): Promise<ActiveColumnMutationResult | null> => {
  const board = await ensureDefaultBoard(prisma, ownerId);
  const columns = await getBoardColumns(prisma, board.id);

  if (
    columns.some((column) => column.id === input.id) ||
    hasDuplicateTitle(columns, input.title)
  ) {
    return null;
  }

  const saved = await prisma.$transaction(async (transaction) => {
    const [column, updatedBoard] = await Promise.all([
      transaction.boardColumn.create({
        data: {
          boardId: board.id,
          id: input.id,
          sortOrder: columns.length,
          title: input.title,
        },
      }),
      transaction.board.update({
        data: { version: { increment: 1 } },
        where: { id: board.id },
      }),
    ]);

    return {
      boardVersion: updatedBoard.version,
      column,
      columns: await getBoardColumns(transaction, board.id),
    };
  });

  return {
    boardVersion: saved.boardVersion,
    column: toBootstrapColumn(saved.column),
    columns: saved.columns.map(toBootstrapColumn),
  };
};

export const renameActiveColumn = async (
  prisma: FlowboardPrismaClient,
  ownerId: string,
  columnId: string,
  input: ActiveColumnUpdateInput
): Promise<ActiveColumnMutationResult | null> => {
  const board = await ensureDefaultBoard(prisma, ownerId);
  const columns = await getBoardColumns(prisma, board.id);
  const column = columns.find((item) => item.id === columnId);

  if (!column || hasDuplicateTitle(columns, input.title, columnId)) {
    return null;
  }

  const saved = await prisma.$transaction(async (transaction) => {
    const [updatedColumn, updatedBoard] = await Promise.all([
      transaction.boardColumn.update({
        data: { title: input.title },
        where: { id: columnId },
      }),
      transaction.board.update({
        data: { version: { increment: 1 } },
        where: { id: board.id },
      }),
    ]);

    return {
      boardVersion: updatedBoard.version,
      column: updatedColumn,
      columns: await getBoardColumns(transaction, board.id),
    };
  });

  return {
    boardVersion: saved.boardVersion,
    column: toBootstrapColumn(saved.column),
    columns: saved.columns.map(toBootstrapColumn),
  };
};

export const moveActiveColumn = async (
  prisma: FlowboardPrismaClient,
  ownerId: string,
  columnId: string,
  input: ActiveColumnMoveInput
): Promise<ActiveColumnMutationResult | null> => {
  const board = await ensureDefaultBoard(prisma, ownerId);
  const columns = await getBoardColumns(prisma, board.id);
  const column = columns.find((item) => item.id === columnId);

  if (!column) {
    return null;
  }

  const placementColumnId = input.beforeColumnId ?? input.afterColumnId ?? null;
  const remainingColumnIds = columns.reduce<string[]>((ids, item) => {
    if (item.id !== columnId) {
      ids.push(item.id);
    }

    return ids;
  }, []);
  const targetIndex = placementColumnId
    ? remainingColumnIds.findIndex((id) => id === placementColumnId)
    : remainingColumnIds.length;

  if (targetIndex === -1) {
    return null;
  }

  const insertAt = input.afterColumnId ? targetIndex + 1 : targetIndex;
  const nextColumnIds = [...remainingColumnIds];

  nextColumnIds.splice(insertAt, 0, columnId);

  const saved = await prisma.$transaction(async (transaction) => {
    const [, updatedBoard] = await Promise.all([
      updateBoardColumnOrder(transaction, nextColumnIds),
      transaction.board.update({
        data: { version: { increment: 1 } },
        where: { id: board.id },
      }),
    ]);

    return {
      boardVersion: updatedBoard.version,
      columns: await getBoardColumns(transaction, board.id),
    };
  });
  const movedColumn =
    saved.columns.find((item) => item.id === columnId) ?? column;

  return {
    boardVersion: saved.boardVersion,
    column: toBootstrapColumn(movedColumn),
    columns: saved.columns.map(toBootstrapColumn),
  };
};

export const deleteActiveColumn = async (
  prisma: FlowboardPrismaClient,
  ownerId: string,
  columnId: string
): Promise<ActiveColumnDeleteResult | null> => {
  const board = await ensureDefaultBoard(prisma, ownerId);
  const [columns, cards, workCycle] = await Promise.all([
    getBoardColumns(prisma, board.id),
    prisma.card.findMany({
      select: { id: true },
      where: { boardId: board.id, columnId },
    }),
    prisma.boardWorkCycle.findUnique({
      where: { boardId: board.id },
    }),
  ]);
  const column = columns.find((item) => item.id === columnId);

  if (!column) {
    return null;
  }

  const remainingColumnIds = columns.reduce<string[]>((ids, item) => {
    if (item.id !== columnId) {
      ids.push(item.id);
    }

    return ids;
  }, []);
  const deletedCardIds = cards.map((card) => card.id);
  const shouldClearCompletedColumn = workCycle?.completedColumnId === columnId;

  const saved = await prisma.$transaction(async (transaction) => {
    await transaction.cardTag.deleteMany({
      where: {
        card: {
          boardId: board.id,
          columnId,
        },
      },
    });
    await transaction.card.deleteMany({
      where: { boardId: board.id, columnId },
    });
    await transaction.boardColumn.delete({ where: { id: columnId } });
    await updateBoardColumnOrder(transaction, remainingColumnIds);

    const nextWorkCycle = shouldClearCompletedColumn
      ? await transaction.boardWorkCycle.update({
          data: { completedColumnId: null },
          where: { boardId: board.id },
        })
      : await transaction.boardWorkCycle.findUniqueOrThrow({
          where: { boardId: board.id },
        });
    const updatedBoard = await transaction.board.update({
      data: { version: { increment: 1 } },
      where: { id: board.id },
    });

    return {
      boardVersion: updatedBoard.version,
      columns: await getBoardColumns(transaction, board.id),
      workCycle: nextWorkCycle,
    };
  });

  return {
    boardVersion: saved.boardVersion,
    cardIds: deletedCardIds,
    columnId,
    columns: saved.columns.map(toBootstrapColumn),
    workCycle: {
      completedColumnId: saved.workCycle.completedColumnId,
      startDate: toIso(saved.workCycle.startDate),
    },
  };
};

export const createBoardTag = async (
  prisma: FlowboardPrismaClient,
  ownerId: string,
  input: BoardTagCreateInput
): Promise<BoardTagMutationResult | null> => {
  const board = await ensureDefaultBoard(prisma, ownerId);
  const tags = await getBoardTags(prisma, board.id);

  if (
    tags.some((tag) => tag.id === input.id) ||
    hasDuplicateTagName(tags, input.name)
  ) {
    return null;
  }

  const saved = await prisma.$transaction(async (transaction) => {
    const [tag, updatedBoard] = await Promise.all([
      transaction.tag.create({
        data: {
          boardId: board.id,
          id: input.id,
          name: input.name,
          sortOrder: tags.length,
        },
      }),
      transaction.board.update({
        data: { version: { increment: 1 } },
        where: { id: board.id },
      }),
    ]);

    return {
      boardVersion: updatedBoard.version,
      tag,
      tags: await getBoardTags(transaction, board.id),
    };
  });

  return {
    boardVersion: saved.boardVersion,
    tag: toBootstrapTag(saved.tag),
    tags: saved.tags.map(toBootstrapTag),
  };
};

export const renameBoardTag = async (
  prisma: FlowboardPrismaClient,
  ownerId: string,
  tagId: string,
  input: BoardTagUpdateInput
): Promise<BoardTagMutationResult | null> => {
  const board = await ensureDefaultBoard(prisma, ownerId);
  const tags = await getBoardTags(prisma, board.id);
  const tag = tags.find((item) => item.id === tagId);

  if (!tag || hasDuplicateTagName(tags, input.name, tagId)) {
    return null;
  }

  const saved = await prisma.$transaction(async (transaction) => {
    const [updatedTag, updatedBoard] = await Promise.all([
      transaction.tag.update({
        data: { name: input.name },
        where: { id: tagId },
      }),
      transaction.board.update({
        data: { version: { increment: 1 } },
        where: { id: board.id },
      }),
    ]);

    return {
      boardVersion: updatedBoard.version,
      tag: updatedTag,
      tags: await getBoardTags(transaction, board.id),
    };
  });

  return {
    boardVersion: saved.boardVersion,
    tag: toBootstrapTag(saved.tag),
    tags: saved.tags.map(toBootstrapTag),
  };
};

export const deleteBoardTag = async (
  prisma: FlowboardPrismaClient,
  ownerId: string,
  tagId: string
): Promise<BoardTagDeleteResult | null> => {
  const board = await ensureDefaultBoard(prisma, ownerId);
  const tag = await getBoardScopedTag(prisma, board.id, tagId);

  if (!tag) {
    return null;
  }

  const affectedCardTags = await prisma.cardTag.findMany({
    select: { cardId: true },
    where: {
      tagId,
      card: {
        boardId: board.id,
      },
    },
  });
  const affectedCardIds = affectedCardTags.map((cardTag) => cardTag.cardId);

  const saved = await prisma.$transaction(async (transaction) => {
    await transaction.cardTag.deleteMany({ where: { tagId } });
    await transaction.tag.delete({ where: { id: tagId } });

    const updatedBoard = await transaction.board.update({
      data: { version: { increment: 1 } },
      where: { id: board.id },
    });

    return {
      boardVersion: updatedBoard.version,
      tags: await getBoardTags(transaction, board.id),
    };
  });

  return {
    affectedCardIds,
    boardVersion: saved.boardVersion,
    tagId,
    tags: saved.tags.map(toBootstrapTag),
  };
};

const mutateActiveCardTag = async (
  prisma: FlowboardPrismaClient,
  ownerId: string,
  cardId: string,
  tagId: string,
  assigned: boolean
): Promise<ActiveCardTagMutationResult | null> => {
  const board = await ensureDefaultBoard(prisma, ownerId);
  const [card, tag] = await Promise.all([
    prisma.card.findFirst({
      select: {
        columnId: true,
        id: true,
        priority: true,
        title: true,
      },
      where: {
        boardId: board.id,
        id: cardId,
      },
    }),
    getBoardScopedTag(prisma, board.id, tagId),
  ]);

  if (!card || !tag) {
    return null;
  }

  const existing = await prisma.cardTag.findUnique({
    where: {
      cardId_tagId: {
        cardId,
        tagId,
      },
    },
  });

  if ((assigned && existing) || (!assigned && !existing)) {
    const tagIds = (
      await prisma.cardTag.findMany({
        select: { tagId: true },
        where: { cardId },
      })
    ).map((cardTag) => cardTag.tagId);

    return {
      boardVersion: board.version,
      card: toBootstrapCard(card, tagIds),
    };
  }

  const saved = await prisma.$transaction(async (transaction) => {
    if (assigned) {
      await transaction.cardTag.create({ data: { cardId, tagId } });
    } else {
      await transaction.cardTag.delete({
        where: {
          cardId_tagId: {
            cardId,
            tagId,
          },
        },
      });
    }

    const tagIds = (
      await transaction.cardTag.findMany({
        select: { tagId: true },
        where: { cardId },
      })
    ).map((cardTag) => cardTag.tagId);
    const updatedBoard = await transaction.board.update({
      data: { version: { increment: 1 } },
      where: { id: board.id },
    });

    return { boardVersion: updatedBoard.version, tagIds };
  });

  return {
    boardVersion: saved.boardVersion,
    card: toBootstrapCard(card, saved.tagIds),
  };
};

export const assignActiveCardTag = (
  prisma: FlowboardPrismaClient,
  ownerId: string,
  cardId: string,
  tagId: string
) => mutateActiveCardTag(prisma, ownerId, cardId, tagId, true);

export const unassignActiveCardTag = (
  prisma: FlowboardPrismaClient,
  ownerId: string,
  cardId: string,
  tagId: string
) => mutateActiveCardTag(prisma, ownerId, cardId, tagId, false);

export const updateBoardSettings = async (
  prisma: FlowboardPrismaClient,
  ownerId: string,
  input: BoardSettingsUpdateInput
): Promise<BoardSettingsMutationResult> => {
  const board = await ensureDefaultBoard(prisma, ownerId);
  const updatedBoard = await prisma.board.update({
    data: {
      backgroundType: input.background.type,
      backgroundValue: input.background.value,
      version: { increment: 1 },
    },
    where: { id: board.id },
  });

  return {
    board: {
      background: toBoardBackground(updatedBoard),
      version: updatedBoard.version,
    },
  };
};

export const updateWorkCycleSettings = async (
  prisma: FlowboardPrismaClient,
  ownerId: string,
  input: WorkCycleSettingsUpdateInput
): Promise<WorkCycleSettingsMutationResult | null> => {
  const board = await ensureDefaultBoard(prisma, ownerId);

  if (
    input.completedColumnId &&
    !(await getBoardScopedColumn(prisma, board.id, input.completedColumnId))
  ) {
    return null;
  }

  const saved = await prisma.$transaction(async (transaction) => {
    const [workCycle, updatedBoard] = await Promise.all([
      transaction.boardWorkCycle.upsert({
        create: {
          boardId: board.id,
          completedColumnId: input.completedColumnId,
          id: createId(),
          startDate: board.createdAt,
        },
        update: {
          completedColumnId: input.completedColumnId,
        },
        where: { boardId: board.id },
      }),
      transaction.board.update({
        data: { version: { increment: 1 } },
        where: { id: board.id },
      }),
    ]);

    return { boardVersion: updatedBoard.version, workCycle };
  });

  return {
    boardVersion: saved.boardVersion,
    workCycle: {
      completedColumnId: saved.workCycle.completedColumnId,
      startDate: toIso(saved.workCycle.startDate),
    },
  };
};

export const completeActiveWorkCycle = async (
  prisma: FlowboardPrismaClient,
  ownerId: string,
  completedAt = new Date()
): Promise<CompleteWorkCycleResult | null> => {
  const board = await ensureDefaultBoard(prisma, ownerId);
  const workCycle = await prisma.boardWorkCycle.findUnique({
    select: {
      completedColumnId: true,
      startDate: true,
    },
    where: { boardId: board.id },
  });

  if (!workCycle?.completedColumnId) {
    return null;
  }

  const [completedColumn, activeCards] = await Promise.all([
    prisma.boardColumn.findFirst({
      select: {
        id: true,
        title: true,
      },
      where: {
        boardId: board.id,
        id: workCycle.completedColumnId,
      },
    }),
    prisma.card.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: {
        content: true,
        createdAt: true,
        id: true,
        priority: true,
        sortOrder: true,
        title: true,
      },
      where: {
        boardId: board.id,
        columnId: workCycle.completedColumnId,
      },
    }),
  ]);

  if (!completedColumn || activeCards.length === 0) {
    return null;
  }

  const activeCardIds = activeCards.map((card) => card.id);
  const activeCardTags = await prisma.cardTag.findMany({
    include: {
      tag: {
        select: {
          id: true,
          name: true,
          sortOrder: true,
        },
      },
    },
    where: {
      cardId: { in: activeCardIds },
      tag: {
        boardId: board.id,
      },
    },
  });
  const tagsByCardId = new Map<
    string,
    Array<{ id: string; name: string; sortOrder: number }>
  >();

  for (const cardTag of activeCardTags) {
    tagsByCardId.set(cardTag.cardId, [
      ...(tagsByCardId.get(cardTag.cardId) ?? []),
      cardTag.tag,
    ]);
  }

  for (const [cardId, tags] of tagsByCardId) {
    tagsByCardId.set(
      cardId,
      tags.sort((first, second) => first.sortOrder - second.sortOrder)
    );
  }

  const cycleId = createId();
  const archivedCycle = {
    cards: activeCards.map((card): CompletedHistoryCardSummary => {
      const tagSnapshots = (tagsByCardId.get(card.id) ?? []).map((tag) => ({
        id: tag.id,
        name: tag.name,
      }));

      return {
        archivedAt: toIso(completedAt),
        createdAt: toIso(card.createdAt),
        hasContent: Boolean(card.content),
        id: card.id,
        priority: isCardPriority(card.priority) ? card.priority : 'medium',
        tagIds: tagSnapshots.map((tag) => tag.id),
        tagSnapshots,
        title: card.title,
      };
    }),
    completedColumnId: completedColumn.id,
    completedColumnTitle: completedColumn.title,
    endDate: toIso(completedAt),
    id: cycleId,
    startDate: toIso(workCycle.startDate),
  };

  const saved = await prisma.$transaction(
    async (transaction) => {
      await transaction.completedWorkCycle.create({
        data: {
          boardId: board.id,
          completedColumnId: completedColumn.id,
          completedColumnTitle: completedColumn.title,
          endDate: completedAt,
          id: cycleId,
          startDate: workCycle.startDate,
        },
      });
      await transaction.completedWorkCycleCard.createMany({
        data: activeCards.map((card) => ({
          archivedAt: completedAt,
          content: card.content,
          createdAt: card.createdAt,
          cycleId,
          id: card.id,
          originalCardId: card.id,
          priority: isCardPriority(card.priority) ? card.priority : 'medium',
          sortOrder: card.sortOrder,
          title: card.title,
        })),
      });

      const archivedTagRows = activeCards.flatMap((card) =>
        (tagsByCardId.get(card.id) ?? []).map((tag, sortOrder) => ({
          archivedCardId: card.id,
          id: createId(),
          name: tag.name,
          originalTagId: tag.id,
          sortOrder,
        }))
      );

      if (archivedTagRows.length > 0) {
        await transaction.completedWorkCycleCardTag.createMany({
          data: archivedTagRows,
        });
      }

      await transaction.cardTag.deleteMany({
        where: {
          cardId: { in: activeCardIds },
        },
      });
      await transaction.card.deleteMany({
        where: {
          boardId: board.id,
          id: { in: activeCardIds },
        },
      });

      const [nextWorkCycle, updatedBoard] = await Promise.all([
        transaction.boardWorkCycle.update({
          data: { startDate: completedAt },
          where: { boardId: board.id },
        }),
        transaction.board.update({
          data: { version: { increment: 1 } },
          where: { id: board.id },
        }),
      ]);

      return {
        boardVersion: updatedBoard.version,
        workCycle: nextWorkCycle,
      };
    },
    { timeout: BOARD_WRITE_TRANSACTION_TIMEOUT_MS }
  );

  return {
    boardVersion: saved.boardVersion,
    cardIds: activeCardIds,
    columnId: completedColumn.id,
    cycle: archivedCycle,
    workCycle: {
      completedColumnId: saved.workCycle.completedColumnId,
      startDate: toIso(saved.workCycle.startDate),
    },
  };
};

export const loadCompletedHistoryPage = async (
  prisma: FlowboardPrismaClient,
  ownerId: string,
  input: CompletedHistoryPageInput = {}
): Promise<CompletedHistoryPage | null> => {
  const board = await ensureDefaultBoard(prisma, ownerId);
  const limit = Math.min(
    Math.max(input.limit ?? COMPLETED_HISTORY_DEFAULT_LIMIT, 1),
    COMPLETED_HISTORY_MAX_LIMIT
  );
  const decodedCursor = input.cursor
    ? decodeCompletedHistoryCursor(input.cursor)
    : null;

  if (input.cursor && !decodedCursor) {
    return null;
  }

  const cycles = await prisma.completedWorkCycle.findMany({
    include: {
      cards: {
        include: {
          tagSnapshots: {
            orderBy: [{ sortOrder: 'asc' }],
          },
        },
        orderBy: [{ sortOrder: 'asc' }, { archivedAt: 'asc' }],
      },
    },
    orderBy: [{ endDate: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    where: {
      boardId: board.id,
      ...(decodedCursor
        ? {
            OR: [
              { endDate: { lt: toDate(decodedCursor.endDate) } },
              {
                endDate: toDate(decodedCursor.endDate),
                id: { lt: decodedCursor.id },
              },
            ],
          }
        : {}),
    },
  });
  const pageCycles = cycles.slice(0, limit).map(toCompletedHistoryCycleSummary);
  const hasMore = cycles.length > limit;
  const nextCursor =
    hasMore && pageCycles.length > 0
      ? encodeCompletedHistoryCursor(pageCycles[pageCycles.length - 1])
      : null;

  return {
    cycles: pageCycles,
    pageInfo: {
      hasMore,
      nextCursor,
    },
  };
};

export const loadArchivedCardDetail = async (
  prisma: FlowboardPrismaClient,
  ownerId: string,
  cycleId: string,
  cardId: string
): Promise<ArchivedCardDetail | null> => {
  const board = await ensureDefaultBoard(prisma, ownerId);
  const card = await prisma.completedWorkCycleCard.findFirst({
    include: {
      tagSnapshots: {
        orderBy: [{ sortOrder: 'asc' }],
      },
    },
    where: {
      id: cardId,
      cycle: {
        boardId: board.id,
        id: cycleId,
      },
    },
  });

  if (!card) {
    return null;
  }

  return {
    archivedAt: toIso(card.archivedAt),
    content: card.content,
    createdAt: toIso(card.createdAt),
    id: card.id,
    priority: isCardPriority(card.priority) ? card.priority : 'medium',
    tagIds: card.tagSnapshots
      .map((tag) => tag.originalTagId)
      .filter((tagId): tagId is string => Boolean(tagId)),
    tagSnapshots: card.tagSnapshots.map(toArchivedTagSnapshot),
    title: card.title,
  };
};

export const writeBoardState = async (
  prisma: FlowboardPrismaClient,
  ownerId: string,
  boardId: string,
  state: BoardState
): Promise<LoadedBoard | null> => {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      ownerId,
    },
  });

  if (!board) {
    return null;
  }

  const columnRows = state.columns.map((column, sortOrder) => ({
    boardId,
    createdAt: toDate(
      column.cards[0]?.createdAt ?? board.createdAt.toISOString()
    ),
    id: column.id,
    sortOrder,
    title: column.title,
  }));
  const tagRows = state.tags.map((tag, sortOrder) => ({
    boardId,
    id: tag.id,
    name: tag.name,
    sortOrder,
  }));
  const validTagIds = new Set(state.tags.map((tag) => tag.id));
  const cardRows = state.columns.flatMap((column) =>
    column.cards.map((card, sortOrder) => ({
      boardId,
      columnId: column.id,
      content: card.content,
      createdAt: toDate(card.createdAt),
      id: card.id,
      priority: card.priority,
      sortOrder,
      title: card.title,
    }))
  );
  const cardTagRows = state.columns.flatMap((column) =>
    column.cards.flatMap((card) =>
      card.tagIds.reduce<Array<{ cardId: string; tagId: string }>>(
        (rows, tagId) => {
          if (validTagIds.has(tagId)) {
            rows.push({
              cardId: card.id,
              tagId,
            });
          }

          return rows;
        },
        []
      )
    )
  );
  const completedWorkCycleRows = state.completedWorkCycles.map((cycle) => ({
    boardId,
    completedColumnId: cycle.completedColumnId,
    completedColumnTitle: cycle.completedColumnTitle,
    endDate: toDate(cycle.endDate),
    id: cycle.id,
    startDate: toDate(cycle.startDate),
  }));
  const completedWorkCycleCardRows = state.completedWorkCycles.flatMap(
    (cycle) =>
      cycle.cards.map((card, sortOrder) => ({
        archivedAt: toDate(card.archivedAt),
        content: card.content,
        createdAt: toDate(card.createdAt),
        cycleId: cycle.id,
        id: card.id,
        originalCardId: card.id,
        priority: card.priority,
        sortOrder,
        title: card.title,
      }))
  );
  const completedWorkCycleCardTagRows = state.completedWorkCycles.flatMap(
    (cycle) =>
      cycle.cards.flatMap((card) =>
        card.tagSnapshots.map((tag, sortOrder) => ({
          archivedCardId: card.id,
          id: createId(),
          name: tag.name,
          originalTagId: tag.id,
          sortOrder,
        }))
      )
  );
  const savedBoard = await prisma.$transaction(
    async (transaction) => {
      await transaction.completedWorkCycleCardTag.deleteMany({
        where: {
          archivedCard: {
            cycle: {
              boardId,
            },
          },
        },
      });
      await transaction.completedWorkCycleCard.deleteMany({
        where: {
          cycle: {
            boardId,
          },
        },
      });
      await transaction.completedWorkCycle.deleteMany({ where: { boardId } });
      await transaction.cardTag.deleteMany({
        where: {
          card: {
            boardId,
          },
        },
      });
      await transaction.card.deleteMany({ where: { boardId } });
      await transaction.tag.deleteMany({ where: { boardId } });
      await transaction.boardWorkCycle.deleteMany({ where: { boardId } });
      await transaction.boardColumn.deleteMany({ where: { boardId } });

      const updatedBoard = await transaction.board.update({
        data: {
          backgroundType: state.background.type,
          backgroundValue: state.background.value,
          version: {
            increment: 1,
          },
        },
        where: { id: boardId },
      });

      if (columnRows.length > 0) {
        await transaction.boardColumn.createMany({ data: columnRows });
      }
      if (tagRows.length > 0) {
        await transaction.tag.createMany({ data: tagRows });
      }
      if (cardRows.length > 0) {
        await transaction.card.createMany({ data: cardRows });
      }
      if (cardTagRows.length > 0) {
        await transaction.cardTag.createMany({ data: cardTagRows });
      }

      await transaction.boardWorkCycle.create({
        data: {
          boardId,
          completedColumnId: state.activeWorkCycle.completedColumnId,
          id: createId(),
          startDate: toDate(state.activeWorkCycle.startDate),
        },
      });

      if (completedWorkCycleRows.length > 0) {
        await transaction.completedWorkCycle.createMany({
          data: completedWorkCycleRows,
        });
      }
      if (completedWorkCycleCardRows.length > 0) {
        await transaction.completedWorkCycleCard.createMany({
          data: completedWorkCycleCardRows,
        });
      }
      if (completedWorkCycleCardTagRows.length > 0) {
        await transaction.completedWorkCycleCardTag.createMany({
          data: completedWorkCycleCardTagRows,
        });
      }

      return updatedBoard;
    },
    { timeout: BOARD_WRITE_TRANSACTION_TIMEOUT_MS }
  );

  return {
    board: toBoardSummary(savedBoard),
    state: await readBoardState(prisma, savedBoard),
  };
};

const readBoardState = async (
  prisma: FlowboardPrismaClient,
  board: NonNullable<BoardRecord>
): Promise<BoardState> => {
  const [columns, cards, tags, cardTags, workCycle, completedWorkCycles] =
    await Promise.all([
      prisma.boardColumn.findMany({
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        where: { boardId: board.id },
      }),
      prisma.card.findMany({
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        where: { boardId: board.id },
      }),
      prisma.tag.findMany({
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        where: { boardId: board.id },
      }),
      prisma.cardTag.findMany({
        where: {
          card: {
            boardId: board.id,
          },
        },
      }),
      prisma.boardWorkCycle.findUnique({
        where: { boardId: board.id },
      }),
      prisma.completedWorkCycle.findMany({
        include: {
          cards: {
            include: {
              tagSnapshots: {
                orderBy: [{ sortOrder: 'asc' }],
              },
            },
            orderBy: [{ sortOrder: 'asc' }, { archivedAt: 'asc' }],
          },
        },
        orderBy: [{ endDate: 'desc' }, { createdAt: 'desc' }],
        where: { boardId: board.id },
      }),
    ]);
  const tagIdsByCard = getTagIdsByCard(cardTags);

  const cardsByColumn = new Map<string, BoardCard[]>();

  for (const card of cards) {
    cardsByColumn.set(card.columnId, [
      ...(cardsByColumn.get(card.columnId) ?? []),
      {
        content: card.content,
        createdAt: toIso(card.createdAt),
        id: card.id,
        priority: card.priority as BoardCard['priority'],
        tagIds: tagIdsByCard.get(card.id) ?? [],
        title: card.title,
      },
    ]);
  }

  return {
    activeWorkCycle: {
      completedColumnId: workCycle?.completedColumnId ?? null,
      startDate: toIso(workCycle?.startDate ?? board.createdAt),
    },
    background: {
      type: board.backgroundType as BoardState['background']['type'],
      value: board.backgroundValue,
    },
    columns: columns.map(
      (column): BoardColumn => ({
        cards: cardsByColumn.get(column.id) ?? [],
        id: column.id,
        position: column.sortOrder,
        title: column.title,
      })
    ),
    completedWorkCycles: completedWorkCycles.map(
      (cycle): CompletedWorkCycle => ({
        cards: cycle.cards.map(
          (card): ArchivedBoardCard => ({
            archivedAt: toIso(card.archivedAt),
            content: card.content,
            createdAt: toIso(card.createdAt),
            id: card.id,
            priority: card.priority as ArchivedBoardCard['priority'],
            tagIds: card.tagSnapshots
              .map((tag) => tag.originalTagId)
              .filter((tagId): tagId is string => Boolean(tagId)),
            tagSnapshots: card.tagSnapshots.map((tag) => ({
              id: tag.originalTagId ?? tag.id,
              name: tag.name,
            })),
            title: card.title,
          })
        ),
        completedColumnId: cycle.completedColumnId,
        completedColumnTitle: cycle.completedColumnTitle,
        endDate: toIso(cycle.endDate),
        id: cycle.id,
        startDate: toIso(cycle.startDate),
      })
    ),
    tags: tags.map(
      (tag): BoardTag => ({
        id: tag.id,
        name: tag.name,
      })
    ),
  };
};
