import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { CardMutationCoordinator } from './cardMutationCoordinator';
import { createFlowboardQueryClient } from './queryClient';
import { queryKeys } from './queryKeys';
import { useFlowboardBoardMutations } from './useFlowboardBoardMutations';
import { useFlowboardCardMutations } from './useFlowboardCardMutations';
import type {
  ActiveCardDetailResponse,
  BoardBootstrapResponse,
} from '../storage/authenticatedApi';
import {
  assignActiveCardTag,
  createActiveCard,
  deleteActiveCard,
  moveActiveCard,
  unassignActiveCardTag,
  updateActiveCard,
} from '../storage/authenticatedApi';

vi.mock('../storage/authenticatedApi', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../storage/authenticatedApi')>();

  return {
    ...actual,
    assignActiveCardTag: vi.fn(),
    createActiveCard: vi.fn(),
    deleteActiveCard: vi.fn(),
    moveActiveCard: vi.fn(),
    unassignActiveCardTag: vi.fn(),
    updateActiveCard: vi.fn(),
  };
});

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
    {
      columnId: 'todo',
      id: 'card-2',
      priority: 'medium',
      tagIds: [],
      title: 'Second',
    },
  ],
  columns: [{ id: 'todo', title: 'Todo' }],
  tags: [{ id: 'tag-1', name: 'Focus' }],
  workCycle: {
    completedColumnId: null,
    startDate: '2026-07-17T10:00:00.000Z',
  },
};

const details: Record<string, ActiveCardDetailResponse> = {
  'card-1': {
    content: 'First content',
    createdAt: '2026-07-17T10:00:00.000Z',
    id: 'card-1',
    priority: 'medium',
    tagIds: [],
    title: 'First',
  },
  'card-2': {
    content: 'Second content',
    createdAt: '2026-07-17T10:00:00.000Z',
    id: 'card-2',
    priority: 'medium',
    tagIds: [],
    title: 'Second',
  },
};

const createDeferred = <T,>() => {
  let reject!: (error: Error) => void;
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((nextResolve, nextReject) => {
    reject = nextReject;
    resolve = nextResolve;
  });

  return { promise, reject, resolve };
};

const cardResult = (
  cardId: string,
  title: string,
  tagIds: string[] = [],
  boardVersion = 2
) => ({
  boardVersion,
  card: {
    ...details[cardId],
    columnId: 'todo',
    tagIds,
    title,
  },
});

const renderMutations = (queryClient = createFlowboardQueryClient()) => {
  const coordinator = new CardMutationCoordinator();
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  queryClient.setQueryData(queryKeys.board.bootstrap, bootstrap);
  queryClient.setQueryData(queryKeys.board.card('card-1'), details['card-1']);
  queryClient.setQueryData(queryKeys.board.card('card-2'), details['card-2']);

  const hook = renderHook(
    () => ({
      board: useFlowboardBoardMutations({
        accessToken: 'token-1',
        cardMutationCoordinator: coordinator,
      }),
      card: useFlowboardCardMutations({
        accessToken: 'token-1',
        cardMutationCoordinator: coordinator,
      }),
    }),
    { wrapper }
  );

  return { ...hook, queryClient };
};

describe('shared card mutation lifecycle', () => {
  beforeEach(() => {
    vi.mocked(assignActiveCardTag).mockReset();
    vi.mocked(createActiveCard).mockReset();
    vi.mocked(deleteActiveCard).mockReset();
    vi.mocked(moveActiveCard).mockReset();
    vi.mocked(unassignActiveCardTag).mockReset();
    vi.mocked(updateActiveCard).mockReset();
  });

  test('serializes an update and tag assignment for the same card', async () => {
    const update = createDeferred<ReturnType<typeof cardResult>>();
    const assign = createDeferred<{
      boardVersion: number;
      card: BoardBootstrapResponse['cards'][number];
    }>();
    vi.mocked(updateActiveCard).mockReturnValue(update.promise);
    vi.mocked(assignActiveCardTag).mockReturnValue(assign.promise);
    const { queryClient, result } = renderMutations();

    act(() => {
      result.current.card.updateCard({
        card: { title: 'Updated' },
        cardId: 'card-1',
      });
      result.current.board.assignCardTag({
        cardId: 'card-1',
        tagId: 'tag-1',
      });
    });

    await waitFor(() => expect(updateActiveCard).toHaveBeenCalledTimes(1));
    expect(assignActiveCardTag).not.toHaveBeenCalled();
    expect(
      queryClient.getQueryData<ActiveCardDetailResponse>(
        queryKeys.board.card('card-1')
      )
    ).toEqual({ ...details['card-1'], tagIds: ['tag-1'], title: 'Updated' });

    update.resolve(cardResult('card-1', 'Updated'));
    await waitFor(() => expect(assignActiveCardTag).toHaveBeenCalledTimes(1));
    expect(
      queryClient.getQueryData<ActiveCardDetailResponse>(
        queryKeys.board.card('card-1')
      )
    ).toEqual({ ...details['card-1'], tagIds: ['tag-1'], title: 'Updated' });

    assign.resolve({
      boardVersion: 3,
      card: {
        ...bootstrap.cards[0],
        tagIds: ['tag-1'],
        title: 'Updated',
      },
    });
    await waitFor(() =>
      expect(
        queryClient.getQueryData<BoardBootstrapResponse>(
          queryKeys.board.bootstrap
        )?.board.version
      ).toBe(3)
    );
  });

  test('retains a later tag edit when the earlier update fails', async () => {
    const update = createDeferred<ReturnType<typeof cardResult>>();
    vi.mocked(updateActiveCard).mockReturnValue(update.promise);
    vi.mocked(assignActiveCardTag).mockResolvedValue({
      boardVersion: 2,
      card: { ...bootstrap.cards[0], tagIds: ['tag-1'] },
    });
    const { queryClient, result } = renderMutations();

    act(() => {
      result.current.card.updateCard({
        card: { title: 'Will fail' },
        cardId: 'card-1',
      });
      result.current.board.assignCardTag({
        cardId: 'card-1',
        tagId: 'tag-1',
      });
    });

    await waitFor(() => expect(updateActiveCard).toHaveBeenCalledTimes(1));
    update.reject(new Error('Nope'));

    await waitFor(() => expect(assignActiveCardTag).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(
        queryClient.getQueryData<ActiveCardDetailResponse>(
          queryKeys.board.card('card-1')
        )
      ).toEqual({ ...details['card-1'], tagIds: ['tag-1'] })
    );
  });

  test('serializes tag assignment and unassignment for the same card', async () => {
    const assign = createDeferred<{
      boardVersion: number;
      card: BoardBootstrapResponse['cards'][number];
    }>();
    const unassign = createDeferred<{
      boardVersion: number;
      card: BoardBootstrapResponse['cards'][number];
    }>();
    vi.mocked(assignActiveCardTag).mockReturnValue(assign.promise);
    vi.mocked(unassignActiveCardTag).mockReturnValue(unassign.promise);
    const { queryClient, result } = renderMutations();

    act(() => {
      result.current.board.assignCardTag({
        cardId: 'card-1',
        tagId: 'tag-1',
      });
      result.current.board.unassignCardTag({
        cardId: 'card-1',
        tagId: 'tag-1',
      });
    });

    await waitFor(() => expect(assignActiveCardTag).toHaveBeenCalledTimes(1));
    expect(unassignActiveCardTag).not.toHaveBeenCalled();

    assign.resolve({
      boardVersion: 2,
      card: { ...bootstrap.cards[0], tagIds: ['tag-1'] },
    });
    await waitFor(() => expect(unassignActiveCardTag).toHaveBeenCalledTimes(1));

    unassign.resolve({ boardVersion: 3, card: bootstrap.cards[0] });
    await waitFor(() =>
      expect(
        queryClient.getQueryData<ActiveCardDetailResponse>(
          queryKeys.board.card('card-1')
        )?.tagIds
      ).toEqual([])
    );
  });

  test('serializes create, update, move, and delete operations for one card', async () => {
    const create = createDeferred<ReturnType<typeof cardResult>>();
    const update = createDeferred<ReturnType<typeof cardResult>>();
    const move = createDeferred<ReturnType<typeof cardResult>>();
    const remove = createDeferred<{
      boardVersion: number;
      cardId: string;
      columnId: string;
    }>();
    vi.mocked(createActiveCard).mockReturnValue(create.promise);
    vi.mocked(updateActiveCard).mockReturnValue(update.promise);
    vi.mocked(moveActiveCard).mockReturnValue(move.promise);
    vi.mocked(deleteActiveCard).mockReturnValue(remove.promise);
    const { result } = renderMutations();
    const createdCard = {
      columnId: 'todo',
      content: 'Created content',
      createdAt: '2026-07-17T11:00:00.000Z',
      id: 'card-3',
      priority: 'medium' as const,
      tagIds: [],
      title: 'Created',
    };

    act(() => {
      result.current.card.createCard(createdCard);
      result.current.card.updateCard({
        card: { title: 'Updated' },
        cardId: 'card-3',
      });
      result.current.card.moveCard({
        cardId: 'card-3',
        placement: {
          afterCardId: null,
          beforeCardId: null,
          columnId: 'todo',
        },
      });
      result.current.card.deleteCard({ cardId: 'card-3' });
    });

    await waitFor(() => expect(createActiveCard).toHaveBeenCalledTimes(1));
    expect(updateActiveCard).not.toHaveBeenCalled();
    expect(moveActiveCard).not.toHaveBeenCalled();
    expect(deleteActiveCard).not.toHaveBeenCalled();

    create.resolve({ boardVersion: 2, card: createdCard });
    await waitFor(() => expect(updateActiveCard).toHaveBeenCalledTimes(1));

    update.resolve({
      ...cardResult('card-1', 'Updated', [], 3),
      card: {
        ...createdCard,
        title: 'Updated',
      },
    });
    await waitFor(() => expect(moveActiveCard).toHaveBeenCalledTimes(1));

    move.resolve({
      ...cardResult('card-1', 'Updated', [], 4),
      card: {
        ...createdCard,
        title: 'Updated',
      },
    });
    await waitFor(() => expect(deleteActiveCard).toHaveBeenCalledTimes(1));

    remove.resolve({ boardVersion: 5, cardId: 'card-3', columnId: 'todo' });
    await waitFor(() => expect(deleteActiveCard).toHaveBeenCalledTimes(1));
  });

  test('allows different cards to save concurrently and isolates rollback', async () => {
    const cardOne = createDeferred<ReturnType<typeof cardResult>>();
    const cardTwo = createDeferred<ReturnType<typeof cardResult>>();
    vi.mocked(updateActiveCard).mockImplementation((cardId) =>
      cardId === 'card-1' ? cardOne.promise : cardTwo.promise
    );
    const { queryClient, result } = renderMutations();

    act(() => {
      result.current.card.updateCard({
        card: { title: 'Card one fails' },
        cardId: 'card-1',
      });
      result.current.card.updateCard({
        card: { title: 'Card two persists' },
        cardId: 'card-2',
      });
    });

    await waitFor(() => expect(updateActiveCard).toHaveBeenCalledTimes(2));
    cardTwo.resolve(cardResult('card-2', 'Card two persists', [], 4));
    cardOne.reject(new Error('Nope'));

    await waitFor(() => {
      const cached = queryClient.getQueryData<BoardBootstrapResponse>(
        queryKeys.board.bootstrap
      );

      expect(cached?.cards.find((card) => card.id === 'card-1')?.title).toBe(
        'First'
      );
      expect(cached?.cards.find((card) => card.id === 'card-2')?.title).toBe(
        'Card two persists'
      );
      expect(cached?.board.version).toBe(4);
    });
  });
});
