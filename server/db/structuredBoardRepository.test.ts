import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import { afterEach, describe, expect, test } from 'vitest';

import { ensureProfile } from '../auth/profileService.js';
import { PrismaClient } from '../generated/prisma/sqlite/client.js';
import {
  assignActiveCardTag,
  createActiveColumn,
  createActiveCard,
  createBoardTag,
  deleteActiveColumn,
  deleteActiveCard,
  deleteBoardTag,
  ensureDefaultBoard,
  loadActiveCardDetail,
  loadBoard,
  loadMainBoardBootstrap,
  moveActiveColumn,
  moveActiveCard,
  renameActiveColumn,
  renameBoardTag,
  unassignActiveCardTag,
  updateActiveCard,
  updateBoardSettings,
  updateWorkCycleSettings,
  writeBoardState,
} from './structuredBoardRepository.js';
import type { BoardState } from '../../src/board/types.js';

const migrationSql = readFileSync(
  'prisma/migrations/sqlite/20260706231500_initial_structured_board_model/migration.sql',
  'utf8'
);
const profileAvatarMigrationSql = readFileSync(
  'prisma/migrations/sqlite/20260713120000_add_profile_avatar_fields/migration.sql',
  'utf8'
);

const cleanupCallbacks: Array<() => Promise<void>> = [];

const createTestPrisma = () => {
  const directory = mkdtempSync(join(tmpdir(), 'flowboard-prisma-'));
  const databasePath = join(directory, 'test.db');
  const database = new Database(databasePath);

  database.exec(migrationSql);
  database.exec(profileAvatarMigrationSql);
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

    await ensureProfile(prisma, {
      avatarUrl: null,
      displayName: null,
      email: 'user@example.com',
      id: 'user-1',
    });
    const board = await ensureDefaultBoard(prisma, 'user-1', sampleState);
    const loaded = await loadBoard(prisma, 'user-1', board.id);

    expect(loaded?.state).toEqual(sampleState);
  });

  test('round-trips saved column order through structured tables', async () => {
    const prisma = createTestPrisma();
    const reorderedState: BoardState = {
      ...sampleState,
      columns: [
        {
          cards: [],
          id: 'done',
          position: 0,
          title: 'Done',
        },
        {
          ...sampleState.columns[0],
          position: 10,
        },
      ],
    };

    await ensureProfile(prisma, {
      avatarUrl: null,
      displayName: null,
      email: 'user@example.com',
      id: 'user-1',
    });
    const board = await ensureDefaultBoard(prisma, 'user-1', sampleState);
    await writeBoardState(prisma, 'user-1', board.id, reorderedState);
    const loaded = await loadBoard(prisma, 'user-1', board.id);

    expect(loaded?.state.columns.map((column) => column.id)).toEqual([
      'done',
      'todo',
    ]);
  });

  test('blocks cross-user board reads and writes', async () => {
    const prisma = createTestPrisma();

    await ensureProfile(prisma, {
      avatarUrl: null,
      displayName: null,
      email: 'one@example.com',
      id: 'user-1',
    });
    await ensureProfile(prisma, {
      avatarUrl: null,
      displayName: null,
      email: 'two@example.com',
      id: 'user-2',
    });
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

  test('loads lean bootstrap without rich content or completed history', async () => {
    const prisma = createTestPrisma();

    await ensureProfile(prisma, {
      avatarUrl: null,
      displayName: null,
      email: 'user@example.com',
      id: 'user-1',
    });
    await ensureDefaultBoard(prisma, 'user-1', sampleState);

    const bootstrap = await loadMainBoardBootstrap(prisma, 'user-1');

    expect(bootstrap.board).toEqual({
      background: sampleState.background,
      id: expect.any(String),
      title: 'Flowboard',
      version: expect.any(Number),
    });
    expect(bootstrap.columns).toEqual([
      { id: 'todo', title: 'Todo' },
      { id: 'done', title: 'Done' },
    ]);
    expect(bootstrap.cards).toEqual([
      {
        columnId: 'todo',
        id: 'card-1',
        priority: 'high',
        tagIds: ['tag-1'],
        title: 'Explore database strategy',
      },
    ]);
    expect(bootstrap.tags).toEqual([{ id: 'tag-1', name: 'Architecture' }]);
    expect(bootstrap.workCycle).toEqual(sampleState.activeWorkCycle);
    expect(bootstrap.cards[0]).not.toHaveProperty('content');
    expect(bootstrap).not.toHaveProperty('completedWorkCycles');
  });

  test('loads lean bootstrap for a new user with an empty board', async () => {
    const prisma = createTestPrisma();

    await ensureProfile(prisma, {
      avatarUrl: null,
      displayName: null,
      email: 'user@example.com',
      id: 'user-1',
    });

    const bootstrap = await loadMainBoardBootstrap(prisma, 'user-1');

    expect(bootstrap.board.id).toEqual(expect.any(String));
    expect(bootstrap.columns).toEqual([]);
    expect(bootstrap.cards).toEqual([]);
    expect(bootstrap.tags).toEqual([]);
    expect(bootstrap.workCycle.completedColumnId).toBeNull();
    expect(bootstrap.workCycle.startDate).toEqual(expect.any(String));
  });

  test('loads rich active card detail for an owned card', async () => {
    const prisma = createTestPrisma();

    await ensureProfile(prisma, {
      avatarUrl: null,
      displayName: null,
      email: 'user@example.com',
      id: 'user-1',
    });
    await ensureDefaultBoard(prisma, 'user-1', sampleState);

    const card = await loadActiveCardDetail(prisma, 'user-1', 'card-1');

    expect(card).toEqual({
      content: 'Think deeply',
      createdAt: '2026-07-02T00:00:00.000Z',
      id: 'card-1',
      priority: 'high',
      tagIds: ['tag-1'],
      title: 'Explore database strategy',
    });
  });

  test('does not load active card detail across owners', async () => {
    const prisma = createTestPrisma();

    await ensureProfile(prisma, {
      avatarUrl: null,
      displayName: null,
      email: 'one@example.com',
      id: 'user-1',
    });
    await ensureProfile(prisma, {
      avatarUrl: null,
      displayName: null,
      email: 'two@example.com',
      id: 'user-2',
    });
    await ensureDefaultBoard(prisma, 'user-1', sampleState);

    await expect(
      loadActiveCardDetail(prisma, 'user-2', 'card-1')
    ).resolves.toBeNull();
    await expect(
      loadActiveCardDetail(prisma, 'user-1', 'missing-card')
    ).resolves.toBeNull();
  });

  test('creates an active card without rewriting unrelated board data', async () => {
    const prisma = createTestPrisma();

    await ensureProfile(prisma, {
      avatarUrl: null,
      displayName: null,
      email: 'user@example.com',
      id: 'user-1',
    });
    const board = await ensureDefaultBoard(prisma, 'user-1', sampleState);
    const previousBoard = await prisma.board.findUniqueOrThrow({
      where: { id: board.id },
    });

    const result = await createActiveCard(prisma, 'user-1', {
      columnId: 'done',
      content: 'A focused insert',
      id: 'card-2',
      priority: 'medium',
      tagIds: ['tag-1'],
      title: 'Create via resource route',
    });
    const loaded = await loadBoard(prisma, 'user-1', board.id);

    expect(result).toEqual({
      boardVersion: previousBoard.version + 1,
      card: {
        columnId: 'done',
        content: 'A focused insert',
        createdAt: expect.any(String),
        id: 'card-2',
        priority: 'medium',
        tagIds: ['tag-1'],
        title: 'Create via resource route',
      },
    });
    expect(loaded?.state.columns[0].cards[0]).toEqual(
      sampleState.columns[0].cards[0]
    );
    expect(loaded?.state.completedWorkCycles).toEqual(
      sampleState.completedWorkCycles
    );
    await expect(prisma.tag.count()).resolves.toBe(1);
    await expect(prisma.card.count()).resolves.toBe(2);
    await expect(prisma.cardTag.count()).resolves.toBe(2);
  });

  test('updates active card fields and tags without rewriting unrelated board data', async () => {
    const prisma = createTestPrisma();

    await ensureProfile(prisma, {
      avatarUrl: null,
      displayName: null,
      email: 'user@example.com',
      id: 'user-1',
    });
    const board = await ensureDefaultBoard(prisma, 'user-1', sampleState);
    const previousBoard = await prisma.board.findUniqueOrThrow({
      where: { id: board.id },
    });

    const result = await updateActiveCard(prisma, 'user-1', 'card-1', {
      content: 'Updated rich content',
      priority: 'low',
      tagIds: [],
      title: 'Updated title',
    });
    const loaded = await loadBoard(prisma, 'user-1', board.id);

    expect(result).toEqual({
      boardVersion: previousBoard.version + 1,
      card: {
        columnId: 'todo',
        content: 'Updated rich content',
        createdAt: '2026-07-02T00:00:00.000Z',
        id: 'card-1',
        priority: 'low',
        tagIds: [],
        title: 'Updated title',
      },
    });
    expect(loaded?.state.columns[0].cards[0]).toMatchObject({
      content: 'Updated rich content',
      priority: 'low',
      tagIds: [],
      title: 'Updated title',
    });
    expect(loaded?.state.tags).toEqual(sampleState.tags);
    expect(loaded?.state.completedWorkCycles).toEqual(
      sampleState.completedWorkCycles
    );
  });

  test('moves active cards within and across columns while preserving unrelated data', async () => {
    const prisma = createTestPrisma();
    const state: BoardState = {
      ...sampleState,
      columns: [
        {
          ...sampleState.columns[0],
          cards: [
            sampleState.columns[0].cards[0],
            {
              content: 'Second content',
              createdAt: '2026-07-02T01:00:00.000Z',
              id: 'card-2',
              priority: 'medium',
              tagIds: [],
              title: 'Second card',
            },
          ],
        },
        {
          ...sampleState.columns[1],
          cards: [
            {
              content: 'Done content',
              createdAt: '2026-07-02T02:00:00.000Z',
              id: 'card-3',
              priority: 'low',
              tagIds: [],
              title: 'Done card',
            },
          ],
        },
      ],
    };

    await ensureProfile(prisma, {
      avatarUrl: null,
      displayName: null,
      email: 'user@example.com',
      id: 'user-1',
    });
    const board = await ensureDefaultBoard(prisma, 'user-1', state);

    await moveActiveCard(prisma, 'user-1', 'card-2', {
      afterCardId: null,
      beforeCardId: 'card-1',
      columnId: 'todo',
    });
    await moveActiveCard(prisma, 'user-1', 'card-2', {
      afterCardId: 'card-3',
      beforeCardId: null,
      columnId: 'done',
    });

    const loaded = await loadBoard(prisma, 'user-1', board.id);

    expect(loaded?.state.columns[0].cards.map((card) => card.id)).toEqual([
      'card-1',
    ]);
    expect(loaded?.state.columns[1].cards.map((card) => card.id)).toEqual([
      'card-3',
      'card-2',
    ]);
    expect(
      loaded?.state.columns[1].cards.find((card) => card.id === 'card-2')
    ).toMatchObject({
      content: 'Second content',
      title: 'Second card',
    });
    expect(loaded?.state.completedWorkCycles).toEqual(
      sampleState.completedWorkCycles
    );
  });

  test('deletes active card without deleting archived snapshots', async () => {
    const prisma = createTestPrisma();

    await ensureProfile(prisma, {
      avatarUrl: null,
      displayName: null,
      email: 'user@example.com',
      id: 'user-1',
    });
    const board = await ensureDefaultBoard(prisma, 'user-1', sampleState);
    const previousBoard = await prisma.board.findUniqueOrThrow({
      where: { id: board.id },
    });

    const result = await deleteActiveCard(prisma, 'user-1', 'card-1');
    const loaded = await loadBoard(prisma, 'user-1', board.id);

    expect(result).toEqual({
      boardVersion: previousBoard.version + 1,
      cardId: 'card-1',
      columnId: 'todo',
    });
    expect(loaded?.state.columns[0].cards).toEqual([]);
    expect(loaded?.state.completedWorkCycles).toEqual(
      sampleState.completedWorkCycles
    );
    await expect(prisma.completedWorkCycleCard.count()).resolves.toBe(1);
  });

  test('creates, renames, and moves active columns without rewriting unrelated data', async () => {
    const prisma = createTestPrisma();

    await ensureProfile(prisma, {
      avatarUrl: null,
      displayName: null,
      email: 'user@example.com',
      id: 'user-1',
    });
    const board = await ensureDefaultBoard(prisma, 'user-1', sampleState);
    const previousBoard = await prisma.board.findUniqueOrThrow({
      where: { id: board.id },
    });

    const created = await createActiveColumn(prisma, 'user-1', {
      id: 'doing',
      title: 'Doing',
    });
    const renamed = await renameActiveColumn(prisma, 'user-1', 'doing', {
      title: 'In Progress',
    });
    const moved = await moveActiveColumn(prisma, 'user-1', 'doing', {
      afterColumnId: null,
      beforeColumnId: 'todo',
    });
    const loaded = await loadBoard(prisma, 'user-1', board.id);

    expect(created?.boardVersion).toBe(previousBoard.version + 1);
    expect(renamed?.column).toEqual({ id: 'doing', title: 'In Progress' });
    expect(moved?.columns.map((column) => column.id)).toEqual([
      'doing',
      'todo',
      'done',
    ]);
    expect(loaded?.state.columns.map((column) => column.id)).toEqual([
      'doing',
      'todo',
      'done',
    ]);
    expect(loaded?.state.columns[1].cards).toEqual(
      sampleState.columns[0].cards
    );
    expect(loaded?.state.tags).toEqual(sampleState.tags);
    expect(loaded?.state.completedWorkCycles).toEqual(
      sampleState.completedWorkCycles
    );
  });

  test('deletes active column and clears completed-column setting without deleting archived snapshots', async () => {
    const prisma = createTestPrisma();

    await ensureProfile(prisma, {
      avatarUrl: null,
      displayName: null,
      email: 'user@example.com',
      id: 'user-1',
    });
    const state: BoardState = {
      ...sampleState,
      columns: [
        sampleState.columns[0],
        {
          ...sampleState.columns[1],
          cards: [
            {
              content: 'Done content',
              createdAt: '2026-07-02T01:00:00.000Z',
              id: 'done-card',
              priority: 'medium',
              tagIds: ['tag-1'],
              title: 'Done card',
            },
          ],
        },
      ],
    };
    const board = await ensureDefaultBoard(prisma, 'user-1', state);

    const result = await deleteActiveColumn(prisma, 'user-1', 'done');
    const loaded = await loadBoard(prisma, 'user-1', board.id);

    expect(result).toEqual({
      boardVersion: expect.any(Number),
      cardIds: ['done-card'],
      columnId: 'done',
      columns: [{ id: 'todo', title: 'Todo' }],
      workCycle: {
        completedColumnId: null,
        startDate: '2026-07-01T00:00:00.000Z',
      },
    });
    expect(loaded?.state.activeWorkCycle.completedColumnId).toBeNull();
    expect(loaded?.state.columns.map((column) => column.id)).toEqual(['todo']);
    expect(loaded?.state.completedWorkCycles).toEqual(
      sampleState.completedWorkCycles
    );
    await expect(prisma.completedWorkCycleCard.count()).resolves.toBe(1);
  });

  test('creates, renames, and deletes board tags without touching archived tag snapshots', async () => {
    const prisma = createTestPrisma();

    await ensureProfile(prisma, {
      avatarUrl: null,
      displayName: null,
      email: 'user@example.com',
      id: 'user-1',
    });
    const board = await ensureDefaultBoard(prisma, 'user-1', sampleState);

    const created = await createBoardTag(prisma, 'user-1', {
      id: 'tag-2',
      name: 'Focus',
    });
    const renamed = await renameBoardTag(prisma, 'user-1', 'tag-2', {
      name: 'Deep Focus',
    });
    await assignActiveCardTag(prisma, 'user-1', 'card-1', 'tag-2');
    const deleted = await deleteBoardTag(prisma, 'user-1', 'tag-2');
    const loaded = await loadBoard(prisma, 'user-1', board.id);

    expect(created?.tags.map((tag) => tag.name)).toEqual([
      'Architecture',
      'Focus',
    ]);
    expect(renamed?.tag).toEqual({ id: 'tag-2', name: 'Deep Focus' });
    expect(deleted).toMatchObject({
      affectedCardIds: ['card-1'],
      tagId: 'tag-2',
      tags: [{ id: 'tag-1', name: 'Architecture' }],
    });
    expect(loaded?.state.columns[0].cards[0].tagIds).toEqual(['tag-1']);
    expect(loaded?.state.completedWorkCycles[0].cards[0].tagSnapshots).toEqual([
      { id: 'tag-1', name: 'Architecture' },
    ]);
  });

  test('assigns and unassigns one active card tag without rewriting card row', async () => {
    const prisma = createTestPrisma();

    await ensureProfile(prisma, {
      avatarUrl: null,
      displayName: null,
      email: 'user@example.com',
      id: 'user-1',
    });
    await ensureDefaultBoard(prisma, 'user-1', {
      ...sampleState,
      tags: [
        ...sampleState.tags,
        {
          id: 'tag-2',
          name: 'Focus',
        },
      ],
    });
    const previousCard = await prisma.card.findUniqueOrThrow({
      where: { id: 'card-1' },
    });

    const assigned = await assignActiveCardTag(
      prisma,
      'user-1',
      'card-1',
      'tag-2'
    );
    const unassigned = await unassignActiveCardTag(
      prisma,
      'user-1',
      'card-1',
      'tag-2'
    );
    const currentCard = await prisma.card.findUniqueOrThrow({
      where: { id: 'card-1' },
    });

    expect(assigned?.card.tagIds).toEqual(['tag-1', 'tag-2']);
    expect(unassigned?.card.tagIds).toEqual(['tag-1']);
    expect(currentCard).toMatchObject({
      content: previousCard.content,
      createdAt: previousCard.createdAt,
      title: previousCard.title,
    });
  });

  test('updates board background and completed-column settings without touching history', async () => {
    const prisma = createTestPrisma();

    await ensureProfile(prisma, {
      avatarUrl: null,
      displayName: null,
      email: 'user@example.com',
      id: 'user-1',
    });
    const board = await ensureDefaultBoard(prisma, 'user-1', sampleState);

    const settings = await updateBoardSettings(prisma, 'user-1', {
      background: { type: 'color', value: '#ffffff' },
    });
    const workCycle = await updateWorkCycleSettings(prisma, 'user-1', {
      completedColumnId: null,
    });
    const loaded = await loadBoard(prisma, 'user-1', board.id);

    expect(settings.board.background).toEqual({
      type: 'color',
      value: '#ffffff',
    });
    expect(workCycle?.workCycle.completedColumnId).toBeNull();
    expect(loaded?.state.background).toEqual({
      type: 'color',
      value: '#ffffff',
    });
    expect(loaded?.state.activeWorkCycle.completedColumnId).toBeNull();
    expect(loaded?.state.completedWorkCycles).toEqual(
      sampleState.completedWorkCycles
    );
  });
});
