import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import { afterEach, describe, expect, test } from 'vitest';

import { ensureProfile } from '../auth/profileService.js';
import { PrismaClient } from '../generated/prisma/sqlite/client.js';
import {
  ensureDefaultBoard,
  loadBoard,
  writeBoardState,
} from './structuredBoardRepository.js';
import type { BoardState } from '../../src/board/types.js';

const migrationSql = readFileSync(
  'prisma/migrations/sqlite/20260706231500_initial_structured_board_model/migration.sql',
  'utf8'
);

const cleanupCallbacks: Array<() => Promise<void>> = [];

const createTestPrisma = () => {
  const directory = mkdtempSync(join(tmpdir(), 'flowboard-prisma-'));
  const databasePath = join(directory, 'test.db');
  const database = new Database(databasePath);

  database.exec(migrationSql);
  database.close();

  const prisma = new PrismaClient({
    adapter: new PrismaBetterSqlite3({
      url: `file:${databasePath}`,
    }),
  });

  cleanupCallbacks.push(async () => {
    await prisma.$disconnect();
    rmSync(directory, { force: true, recursive: true });
  });

  return prisma;
};

const sampleState: BoardState = {
  activeWorkCycle: {
    completedColumnId: 'done',
    startDate: '2026-07-01T00:00:00.000Z',
  },
  background: {
    type: 'image',
    value: '/flowboard-background.png',
  },
  columns: [
    {
      cards: [
        {
          content: 'Think deeply',
          createdAt: '2026-07-02T00:00:00.000Z',
          id: 'card-1',
          priority: 'high',
          tagIds: ['tag-1'],
          title: 'Explore database strategy',
        },
      ],
      id: 'todo',
      position: 0,
      title: 'Todo',
    },
    {
      cards: [],
      id: 'done',
      position: 1,
      title: 'Done',
    },
  ],
  completedWorkCycles: [
    {
      cards: [
        {
          archivedAt: '2026-07-03T00:00:00.000Z',
          content: 'Archived note',
          createdAt: '2026-07-02T00:00:00.000Z',
          id: 'archived-card-1',
          priority: 'medium',
          tagIds: ['tag-1'],
          tagSnapshots: [{ id: 'tag-1', name: 'Architecture' }],
          title: 'Archived card',
        },
      ],
      completedColumnId: 'done',
      completedColumnTitle: 'Done',
      endDate: '2026-07-03T00:00:00.000Z',
      id: 'cycle-1',
      startDate: '2026-07-01T00:00:00.000Z',
    },
  ],
  tags: [{ id: 'tag-1', name: 'Architecture' }],
};

afterEach(async () => {
  while (cleanupCallbacks.length > 0) {
    await cleanupCallbacks.pop()?.();
  }
});

describe('structured board repository', () => {
  test('round-trips current board features through structured tables', async () => {
    const prisma = createTestPrisma();

    await ensureProfile(prisma, { email: 'user@example.com', id: 'user-1' });
    const board = await ensureDefaultBoard(prisma, 'user-1', sampleState);
    const loaded = await loadBoard(prisma, 'user-1', board.id);

    expect(loaded?.state).toEqual(sampleState);
  });

  test('blocks cross-user board reads and writes', async () => {
    const prisma = createTestPrisma();

    await ensureProfile(prisma, { email: 'one@example.com', id: 'user-1' });
    await ensureProfile(prisma, { email: 'two@example.com', id: 'user-2' });
    const board = await ensureDefaultBoard(prisma, 'user-1', sampleState);

    await expect(loadBoard(prisma, 'user-2', board.id)).resolves.toBeNull();
    await expect(
      writeBoardState(prisma, 'user-2', board.id, {
        ...sampleState,
        columns: [],
      })
    ).resolves.toBeNull();

    const loaded = await loadBoard(prisma, 'user-1', board.id);
    expect(loaded?.state.columns).toHaveLength(2);
  });
});
