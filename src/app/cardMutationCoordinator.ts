import type {
  ActiveCardDetailResponse,
  BoardBootstrapResponse,
  CardMutationCard,
  CardMutationResponse,
  CardTagMutationResponse,
  DeleteCardMutationResponse,
  MoveCardMutationInput,
  UpdateCardMutationInput,
} from '../storage/authenticatedApi';
import {
  moveBootstrapCard,
  removeBootstrapCard,
  toBootstrapCard,
  toCardDetail,
} from './flowboardMutationCache';

type CardSummary = BoardBootstrapResponse['cards'][number];

type CardPlacement = {
  afterCardId: string | null;
  beforeCardId: string | null;
  columnId: string;
};

type CardDetailProjection =
  | { kind: 'preserve' }
  | { detail: ActiveCardDetailResponse; kind: 'value' }
  | { kind: 'remove' };

export type CardCacheProjection = {
  detail: CardDetailProjection;
  placement?: CardPlacement;
  summary?: CardSummary;
};

export type CardMutationOperation =
  | {
      card: CardMutationCard;
      cardId: string;
      type: 'create';
    }
  | {
      card: UpdateCardMutationInput;
      cardId: string;
      type: 'update';
    }
  | {
      cardId: string;
      placement: MoveCardMutationInput;
      type: 'move';
    }
  | {
      cardId: string;
      type: 'delete';
    }
  | {
      cardId: string;
      tagId: string;
      type: 'assign-tag';
    }
  | {
      cardId: string;
      tagId: string;
      type: 'unassign-tag';
    };

export type QueuedCardMutationOperation = CardMutationOperation & {
  generation: number;
  id: number;
};

export type CardMutationResult =
  CardMutationResponse | CardTagMutationResponse | DeleteCardMutationResponse;

type QueueEntry = {
  completed: Promise<void>;
  generation: number;
  release: () => void;
  waitFor: Promise<void>;
};

type CardMutationRecord = {
  confirmed: CardCacheProjection;
  pending: QueuedCardMutationOperation[];
};

const createDeferred = () => {
  let release: () => void = () => undefined;
  const completed = new Promise<void>((resolve) => {
    release = resolve;
  });

  return { completed, release };
};

const addTag = (tagIds: string[], tagId: string) =>
  tagIds.includes(tagId) ? tagIds : [...tagIds, tagId];

const removeTag = (tagIds: string[], tagId: string) =>
  tagIds.filter((currentTagId) => currentTagId !== tagId);

const updateDetailTags = (
  detail: CardDetailProjection,
  tagIds: string[]
): CardDetailProjection =>
  detail.kind === 'value'
    ? { detail: { ...detail.detail, tagIds }, kind: 'value' }
    : detail;

const updateCardProjection = (
  card: CardMutationCard,
  placement: CardPlacement | undefined
): CardCacheProjection => ({
  detail: { detail: toCardDetail(card), kind: 'value' },
  placement,
  summary: toBootstrapCard(card),
});

const applyOperation = (
  projection: CardCacheProjection,
  operation: CardMutationOperation
): CardCacheProjection => {
  switch (operation.type) {
    case 'create':
      return updateCardProjection(operation.card, {
        afterCardId: null,
        beforeCardId: null,
        columnId: operation.card.columnId,
      });
    case 'update':
      return {
        ...projection,
        detail:
          projection.detail.kind === 'value'
            ? {
                detail: { ...projection.detail.detail, ...operation.card },
                kind: 'value',
              }
            : projection.detail,
        summary: projection.summary
          ? {
              ...projection.summary,
              ...(operation.card.priority !== undefined
                ? { priority: operation.card.priority }
                : {}),
              ...(operation.card.tagIds !== undefined
                ? { tagIds: operation.card.tagIds }
                : {}),
              ...(operation.card.title !== undefined
                ? { title: operation.card.title }
                : {}),
            }
          : projection.summary,
      };
    case 'move':
      return {
        ...projection,
        placement: {
          afterCardId: operation.placement.afterCardId ?? null,
          beforeCardId: operation.placement.beforeCardId ?? null,
          columnId: operation.placement.columnId,
        },
        summary: projection.summary
          ? { ...projection.summary, columnId: operation.placement.columnId }
          : projection.summary,
      };
    case 'delete':
      return {
        detail: { kind: 'remove' },
        placement: undefined,
        summary: undefined,
      };
    case 'assign-tag':
      return {
        ...projection,
        detail: updateDetailTags(
          projection.detail,
          projection.detail.kind === 'value'
            ? addTag(projection.detail.detail.tagIds, operation.tagId)
            : []
        ),
        summary: projection.summary
          ? {
              ...projection.summary,
              tagIds: addTag(projection.summary.tagIds, operation.tagId),
            }
          : projection.summary,
      };
    case 'unassign-tag':
      return {
        ...projection,
        detail: updateDetailTags(
          projection.detail,
          projection.detail.kind === 'value'
            ? removeTag(projection.detail.detail.tagIds, operation.tagId)
            : []
        ),
        summary: projection.summary
          ? {
              ...projection.summary,
              tagIds: removeTag(projection.summary.tagIds, operation.tagId),
            }
          : projection.summary,
      };
  }
};

const applySuccess = (
  projection: CardCacheProjection,
  operation: QueuedCardMutationOperation,
  result: CardMutationResult
): CardCacheProjection => {
  switch (operation.type) {
    case 'create':
    case 'update': {
      const card = (result as CardMutationResponse).card;

      return updateCardProjection(card, projection.placement);
    }
    case 'move': {
      const card = (result as CardMutationResponse).card;

      return updateCardProjection(card, {
        afterCardId: operation.placement.afterCardId ?? null,
        beforeCardId: operation.placement.beforeCardId ?? null,
        columnId: card.columnId,
      });
    }
    case 'delete':
      return {
        detail: { kind: 'remove' },
        placement: undefined,
        summary: undefined,
      };
    case 'assign-tag':
    case 'unassign-tag': {
      const card = (result as CardTagMutationResponse).card;

      return {
        ...projection,
        detail: updateDetailTags(projection.detail, card.tagIds),
        summary: card,
      };
    }
  }
};

const replayOperations = (record: CardMutationRecord) =>
  record.pending.reduce<CardCacheProjection>(
    (projection, operation) => applyOperation(projection, operation),
    record.confirmed
  );

const getPlacement = (
  bootstrap: BoardBootstrapResponse | undefined,
  cardId: string
): CardPlacement | undefined => {
  const card = bootstrap?.cards.find((item) => item.id === cardId);

  if (!bootstrap || !card) {
    return undefined;
  }

  const columnCards = bootstrap.cards.filter(
    (item) => item.columnId === card.columnId
  );
  const index = columnCards.findIndex((item) => item.id === cardId);

  return {
    afterCardId: columnCards[index - 1]?.id ?? null,
    beforeCardId: columnCards[index + 1]?.id ?? null,
    columnId: card.columnId,
  };
};

export const captureCardCacheProjection = (
  bootstrap: BoardBootstrapResponse | undefined,
  detail: ActiveCardDetailResponse | undefined,
  cardId: string
): CardCacheProjection => ({
  detail: detail ? { detail, kind: 'value' } : { kind: 'preserve' },
  placement: getPlacement(bootstrap, cardId),
  summary: bootstrap?.cards.find((card) => card.id === cardId),
});

export const applyCardCacheProjection = (
  bootstrap: BoardBootstrapResponse | undefined,
  cardId: string,
  projection: CardCacheProjection
) => {
  if (!bootstrap) {
    return bootstrap;
  }

  if (!projection.summary) {
    return removeBootstrapCard(bootstrap, cardId);
  }

  const bootstrapWithCard = {
    ...bootstrap,
    cards: bootstrap.cards.some((card) => card.id === cardId)
      ? bootstrap.cards.map((card) =>
          card.id === cardId ? { ...card, ...projection.summary } : card
        )
      : [...bootstrap.cards, projection.summary],
  };

  return moveBootstrapCard(bootstrapWithCard, {
    cardId,
    placement: projection.placement ?? {
      afterCardId: null,
      beforeCardId: null,
      columnId: projection.summary.columnId,
    },
  });
};

export class CardMutationCoordinator {
  private generation = 0;
  private nextId = 0;
  private readonly queues = new Map<number, QueueEntry>();
  private readonly records = new Map<string, CardMutationRecord>();
  private readonly tails = new Map<string, QueueEntry>();

  createOperation(
    operation: CardMutationOperation
  ): QueuedCardMutationOperation {
    const queuedOperation = {
      ...operation,
      generation: this.generation,
      id: ++this.nextId,
    } as QueuedCardMutationOperation;
    const previous = this.tails.get(operation.cardId);
    const deferred = createDeferred();
    const entry: QueueEntry = {
      completed: deferred.completed,
      generation: this.generation,
      release: deferred.release,
      waitFor: previous?.completed ?? Promise.resolve(),
    };

    this.queues.set(queuedOperation.id, entry);
    this.tails.set(operation.cardId, entry);

    return queuedOperation;
  }

  begin(
    operation: QueuedCardMutationOperation,
    confirmed: CardCacheProjection
  ) {
    if (!this.isCurrent(operation)) {
      return undefined;
    }

    const record = this.records.get(operation.cardId) ?? {
      confirmed,
      pending: [],
    };

    if (!this.records.has(operation.cardId)) {
      this.records.set(operation.cardId, record);
    }

    if (!record.pending.some((item) => item.id === operation.id)) {
      record.pending.push(operation);
      record.pending.sort((first, second) => first.id - second.id);
    }

    return replayOperations(record);
  }

  async execute<T>(
    operation: QueuedCardMutationOperation,
    request: () => Promise<T>
  ): Promise<T> {
    const entry = this.queues.get(operation.id);

    if (!entry) {
      throw new Error('Card mutation queue entry is missing.');
    }

    await entry.waitFor;

    if (!this.isCurrent(operation)) {
      throw new Error('Card mutation queue was reset.');
    }

    return request();
  }

  settleFailure(operation: QueuedCardMutationOperation) {
    return this.settle(operation);
  }

  settleSuccess(
    operation: QueuedCardMutationOperation,
    result: CardMutationResult
  ) {
    const record = this.records.get(operation.cardId);

    if (!record || !this.isCurrent(operation)) {
      return undefined;
    }

    if (record.pending[0]?.id !== operation.id) {
      return undefined;
    }

    record.confirmed = applySuccess(record.confirmed, operation, result);

    return this.settle(operation);
  }

  release(operation: QueuedCardMutationOperation) {
    const entry = this.queues.get(operation.id);

    if (!entry) {
      return;
    }

    entry.release();
    this.queues.delete(operation.id);

    if (this.tails.get(operation.cardId) === entry) {
      this.tails.delete(operation.cardId);
    }
  }

  reset() {
    this.generation += 1;

    for (const entry of this.queues.values()) {
      entry.release();
    }

    this.queues.clear();
    this.records.clear();
    this.tails.clear();
  }

  isCurrent(operation: QueuedCardMutationOperation) {
    return operation.generation === this.generation;
  }

  private settle(operation: QueuedCardMutationOperation) {
    const record = this.records.get(operation.cardId);

    if (!record || !this.isCurrent(operation)) {
      return undefined;
    }

    if (record.pending[0]?.id !== operation.id) {
      return undefined;
    }

    record.pending.shift();
    const projection = replayOperations(record);

    if (record.pending.length === 0) {
      this.records.delete(operation.cardId);
    }

    return projection;
  }
}
