import { describe, expect, test, vi } from 'vitest';

import {
  CardMutationCoordinator,
  captureCardCacheProjection,
} from './cardMutationCoordinator';
import { upsertBootstrapCard } from './flowboardMutationCache';
import type {
  ActiveCardDetailResponse,
  BoardBootstrapResponse,
} from '../storage/authenticatedApi';

const bootstrap: BoardBootstrapResponse = {
  board: {
    background: { type: 'color', value: '#ffffff' },
    id: 'board-1',
    title: 'Flowboard',
    version: 1,
  },
  cards: [
    {
      columnId: 'todo',
      id: 'card-1',
      priority: 'medium',
      tagIds: [],
      title: 'First',
    },
  ],
  columns: [{ id: 'todo', title: 'Todo' }],
  tags: [{ id: 'tag-1', name: 'Focus' }],
  workCycle: {
    completedColumnId: null,
    startDate: '2026-07-17T10:00:00.000Z',
  },
};

const detail: ActiveCardDetailResponse = {
  content: 'Original content',
  createdAt: '2026-07-17T10:00:00.000Z',
  id: 'card-1',
  priority: 'medium',
  tagIds: [],
  title: 'First',
};

const createDeferred = <T>() => {
  let reject!: (error: Error) => void;
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((nextResolve, nextReject) => {
    reject = nextReject;
    resolve = nextResolve;
  });

  return { promise, reject, resolve };
};

const updateResult = (title: string, content = detail.content) => ({
  boardVersion: 2,
  card: {
    ...detail,
    columnId: 'todo',
    content,
    title,
  },
});

describe('CardMutationCoordinator', () => {
  test('runs same-card requests in FIFO order through settlement', async () => {
    const coordinator = new CardMutationCoordinator();
    const first = coordinator.createOperation({
      card: { title: 'First update' },
      cardId: 'card-1',
      type: 'update',
    });
    const second = coordinator.createOperation({
      card: { title: 'Second update' },
      cardId: 'card-1',
      type: 'update',
    });
    const firstRequest = createDeferred<string>();
    const firstStarted = createDeferred<void>();
    const secondStarted = vi.fn();

    const firstRun = coordinator.execute(first, () => {
      firstStarted.resolve();
      return firstRequest.promise;
    });
    const secondRun = coordinator.execute(second, async () => {
      secondStarted();
      return 'second';
    });

    await firstStarted.promise;
    expect(secondStarted).not.toHaveBeenCalled();

    firstRequest.resolve('first');
    await firstRun;
    expect(secondStarted).not.toHaveBeenCalled();

    coordinator.release(first);
    await secondRun;
    expect(secondStarted).toHaveBeenCalledTimes(1);

    coordinator.release(second);
  });

  test('runs different-card requests concurrently and continues after failure', async () => {
    const coordinator = new CardMutationCoordinator();
    const first = coordinator.createOperation({
      card: { title: 'First update' },
      cardId: 'card-1',
      type: 'update',
    });
    const second = coordinator.createOperation({
      card: { title: 'Second update' },
      cardId: 'card-2',
      type: 'update',
    });
    const firstRequest = createDeferred<void>();
    const secondRequest = createDeferred<void>();
    const firstRun = coordinator.execute(first, () => firstRequest.promise);
    const secondRun = coordinator.execute(second, () => secondRequest.promise);

    await Promise.resolve();
    firstRequest.resolve();
    secondRequest.resolve();
    await Promise.all([firstRun, secondRun]);
    coordinator.release(first);
    coordinator.release(second);

    const failed = coordinator.createOperation({
      card: { title: 'Failed update' },
      cardId: 'card-1',
      type: 'update',
    });
    const next = coordinator.createOperation({
      card: { title: 'Next update' },
      cardId: 'card-1',
      type: 'update',
    });
    const nextStarted = vi.fn();
    const failedRun = coordinator.execute(failed, async () => {
      throw new Error('Nope');
    });
    const nextRun = coordinator.execute(next, async () => {
      nextStarted();
    });

    await expect(failedRun).rejects.toThrow('Nope');
    expect(nextStarted).not.toHaveBeenCalled();
    coordinator.release(failed);
    await nextRun;
    expect(nextStarted).toHaveBeenCalledTimes(1);
    coordinator.release(next);
  });

  test('resets queued work before it can cross an identity boundary', async () => {
    const coordinator = new CardMutationCoordinator();
    const first = coordinator.createOperation({
      card: { title: 'First update' },
      cardId: 'card-1',
      type: 'update',
    });
    const second = coordinator.createOperation({
      card: { title: 'Second update' },
      cardId: 'card-1',
      type: 'update',
    });
    const firstRequest = createDeferred<void>();
    const firstRun = coordinator.execute(first, () => firstRequest.promise);
    const secondRun = coordinator.execute(second, async () => undefined);

    await Promise.resolve();
    coordinator.reset();
    firstRequest.resolve();

    await firstRun;
    await expect(secondRun).rejects.toThrow('Card mutation queue was reset.');
  });

  test('replays newer title, content, priority, tag, and placement after an older result', () => {
    const coordinator = new CardMutationCoordinator();
    const first = coordinator.createOperation({
      card: { title: 'First saved title' },
      cardId: 'card-1',
      type: 'update',
    });
    const second = coordinator.createOperation({
      card: {
        content: 'Latest content',
        priority: 'high',
        title: 'Latest title',
      },
      cardId: 'card-1',
      type: 'update',
    });
    const third = coordinator.createOperation({
      cardId: 'card-1',
      tagId: 'tag-1',
      type: 'assign-tag',
    });
    const fourth = coordinator.createOperation({
      cardId: 'card-1',
      placement: {
        afterCardId: null,
        beforeCardId: null,
        columnId: 'done',
      },
      type: 'move',
    });
    const initial = captureCardCacheProjection(bootstrap, detail, 'card-1');

    coordinator.begin(first, initial);
    coordinator.begin(second, initial);
    coordinator.begin(third, initial);
    coordinator.begin(fourth, initial);

    const afterFirstSuccess = coordinator.settleSuccess(
      first,
      updateResult('First saved title')
    );

    expect(afterFirstSuccess?.detail).toEqual({
      detail: {
        ...detail,
        content: 'Latest content',
        priority: 'high',
        tagIds: ['tag-1'],
        title: 'Latest title',
      },
      kind: 'value',
    });
    expect(afterFirstSuccess).toMatchObject({
      placement: {
        afterCardId: null,
        beforeCardId: null,
        columnId: 'done',
      },
      summary: {
        columnId: 'done',
        priority: 'high',
        tagIds: ['tag-1'],
        title: 'Latest title',
      },
    });
  });

  test('retains later title, content, priority, tag, and placement after an older failure', () => {
    const coordinator = new CardMutationCoordinator();
    const first = coordinator.createOperation({
      card: { title: 'Will fail' },
      cardId: 'card-1',
      type: 'update',
    });
    const second = coordinator.createOperation({
      card: {
        content: 'Latest content',
        priority: 'high',
        title: 'Latest title',
      },
      cardId: 'card-1',
      type: 'update',
    });
    const third = coordinator.createOperation({
      cardId: 'card-1',
      tagId: 'tag-1',
      type: 'assign-tag',
    });
    const fourth = coordinator.createOperation({
      cardId: 'card-1',
      placement: {
        afterCardId: null,
        beforeCardId: null,
        columnId: 'done',
      },
      type: 'move',
    });
    const initial = captureCardCacheProjection(bootstrap, detail, 'card-1');

    coordinator.begin(first, initial);
    coordinator.begin(second, initial);
    coordinator.begin(third, initial);
    coordinator.begin(fourth, initial);

    const afterFirstFailure = coordinator.settleFailure(first);

    expect(afterFirstFailure).toMatchObject({
      detail: {
        detail: {
          content: 'Latest content',
          priority: 'high',
          tagIds: ['tag-1'],
          title: 'Latest title',
        },
        kind: 'value',
      },
      placement: {
        afterCardId: null,
        beforeCardId: null,
        columnId: 'done',
      },
      summary: {
        columnId: 'done',
        priority: 'high',
        tagIds: ['tag-1'],
        title: 'Latest title',
      },
    });
  });

  test('replays later content after an earlier content save fails', () => {
    const coordinator = new CardMutationCoordinator();
    const first = coordinator.createOperation({
      card: { content: 'First content' },
      cardId: 'card-1',
      type: 'update',
    });
    const second = coordinator.createOperation({
      card: { content: 'Second content' },
      cardId: 'card-1',
      type: 'update',
    });
    const initial = captureCardCacheProjection(bootstrap, detail, 'card-1');

    coordinator.begin(first, initial);
    coordinator.begin(second, initial);

    const afterFirstFailure = coordinator.settleFailure(first);
    expect(afterFirstFailure?.detail).toEqual({
      detail: { ...detail, content: 'Second content' },
      kind: 'value',
    });

    const afterSecondFailure = coordinator.settleFailure(second);
    expect(afterSecondFailure?.detail).toEqual({
      detail,
      kind: 'value',
    });
  });

  test('never applies a lower board version after a newer result', () => {
    const withNewerVersion = upsertBootstrapCard(
      bootstrap,
      {
        ...detail,
        columnId: 'todo',
      },
      5
    );
    const withOlderVersion = upsertBootstrapCard(
      withNewerVersion,
      {
        ...detail,
        columnId: 'todo',
        title: 'Older result',
      },
      3
    );

    expect(withOlderVersion?.board.version).toBe(5);
  });
});
