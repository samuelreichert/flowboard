import { randomUUID } from 'node:crypto';

import { DEFAULT_BACKGROUND } from '../../src/board/constants.js';
import type {
  ArchivedBoardCard,
  BoardCard,
  BoardColumn,
  BoardState,
  BoardTag,
  CompletedWorkCycle,
} from '../../src/board/types.js';
import type { FlowboardPrismaClient } from './prismaClient.js';

const DEFAULT_PROJECT_NAME = 'Personal';
const DEFAULT_BOARD_TITLE = 'Flowboard';

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

const createId = () => randomUUID();

const toDate = (value: string) => new Date(value);

const toIso = (value: Date) => value.toISOString();

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

  const savedBoard = await prisma.$transaction(async (transaction) => {
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

    for (const [sortOrder, column] of state.columns.entries()) {
      await transaction.boardColumn.create({
        data: {
          boardId,
          createdAt: toDate(
            column.cards[0]?.createdAt ?? updatedBoard.createdAt.toISOString()
          ),
          id: column.id,
          sortOrder,
          title: column.title,
        },
      });
    }

    for (const [sortOrder, tag] of state.tags.entries()) {
      await transaction.tag.create({
        data: {
          boardId,
          id: tag.id,
          name: tag.name,
          sortOrder,
        },
      });
    }

    const validTagIds = new Set(state.tags.map((tag) => tag.id));

    for (const column of state.columns) {
      for (const [sortOrder, card] of column.cards.entries()) {
        await transaction.card.create({
          data: {
            boardId,
            columnId: column.id,
            content: card.content,
            createdAt: toDate(card.createdAt),
            id: card.id,
            priority: card.priority,
            sortOrder,
            title: card.title,
          },
        });

        for (const tagId of card.tagIds.filter((id) => validTagIds.has(id))) {
          await transaction.cardTag.create({
            data: {
              cardId: card.id,
              tagId,
            },
          });
        }
      }
    }

    await transaction.boardWorkCycle.create({
      data: {
        boardId,
        completedColumnId: state.activeWorkCycle.completedColumnId,
        id: createId(),
        startDate: toDate(state.activeWorkCycle.startDate),
      },
    });

    for (const cycle of state.completedWorkCycles) {
      await transaction.completedWorkCycle.create({
        data: {
          boardId,
          completedColumnId: cycle.completedColumnId,
          completedColumnTitle: cycle.completedColumnTitle,
          endDate: toDate(cycle.endDate),
          id: cycle.id,
          startDate: toDate(cycle.startDate),
        },
      });

      for (const [sortOrder, card] of cycle.cards.entries()) {
        await transaction.completedWorkCycleCard.create({
          data: {
            archivedAt: toDate(card.archivedAt),
            content: card.content,
            createdAt: toDate(card.createdAt),
            cycleId: cycle.id,
            id: card.id,
            originalCardId: card.id,
            priority: card.priority,
            sortOrder,
            title: card.title,
          },
        });

        for (const [tagOrder, tag] of card.tagSnapshots.entries()) {
          await transaction.completedWorkCycleCardTag.create({
            data: {
              archivedCardId: card.id,
              id: createId(),
              name: tag.name,
              originalTagId: tag.id,
              sortOrder: tagOrder,
            },
          });
        }
      }
    }

    return updatedBoard;
  });

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
  const tagIdsByCard = new Map<string, string[]>();

  for (const cardTag of cardTags) {
    tagIdsByCard.set(cardTag.cardId, [
      ...(tagIdsByCard.get(cardTag.cardId) ?? []),
      cardTag.tagId,
    ]);
  }

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
