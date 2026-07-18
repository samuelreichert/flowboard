import type {
  ActiveCardDetailResponse,
  BoardBootstrapResponse,
  CardMutationCard,
  DeleteColumnMutationResponse,
  DeleteTagMutationResponse,
} from '../storage/authenticatedApi';

export const toBootstrapCard = (card: CardMutationCard) => ({
  columnId: card.columnId,
  id: card.id,
  priority: card.priority,
  tagIds: card.tagIds,
  title: card.title,
});

export const toCardDetail = (
  card: CardMutationCard
): ActiveCardDetailResponse => ({
  content: card.content,
  createdAt: card.createdAt,
  id: card.id,
  priority: card.priority,
  tagIds: card.tagIds,
  title: card.title,
});

const withBoardVersion = (
  bootstrap: BoardBootstrapResponse,
  boardVersion?: number
) => ({
  ...bootstrap.board,
  version: boardVersion ?? bootstrap.board.version,
});

export const upsertBootstrapCard = (
  bootstrap: BoardBootstrapResponse | undefined,
  card: CardMutationCard,
  boardVersion?: number
) => {
  if (!bootstrap) {
    return bootstrap;
  }

  const nextCard = toBootstrapCard(card);
  const existingIndex = bootstrap.cards.findIndex(
    (item) => item.id === card.id
  );
  const cards =
    existingIndex === -1
      ? [...bootstrap.cards, nextCard]
      : bootstrap.cards.map((item) =>
          item.id === card.id ? { ...item, ...nextCard } : item
        );

  return {
    ...bootstrap,
    board: withBoardVersion(bootstrap, boardVersion),
    cards,
  };
};

export const upsertBootstrapCardSummary = (
  bootstrap: BoardBootstrapResponse | undefined,
  card: BoardBootstrapResponse['cards'][number],
  boardVersion?: number
) => {
  if (!bootstrap) {
    return bootstrap;
  }

  return {
    ...bootstrap,
    board: withBoardVersion(bootstrap, boardVersion),
    cards: bootstrap.cards.map((item) =>
      item.id === card.id ? { ...item, ...card } : item
    ),
  };
};

export const moveBootstrapCard = (
  bootstrap: BoardBootstrapResponse | undefined,
  {
    cardId,
    placement,
  }: {
    cardId: string;
    placement: {
      afterCardId?: string | null;
      beforeCardId?: string | null;
      columnId: string;
    };
  }
) => {
  if (!bootstrap) {
    return bootstrap;
  }

  const existingCard = bootstrap.cards.find((card) => card.id === cardId);

  if (!existingCard) {
    return bootstrap;
  }

  const movedCard = {
    ...existingCard,
    columnId: placement.columnId,
  };
  const destinationCards = bootstrap.cards.filter(
    (card) => card.id !== cardId && card.columnId === placement.columnId
  );
  const placementCardId = placement.beforeCardId ?? placement.afterCardId;
  const targetIndex = placementCardId
    ? destinationCards.findIndex((card) => card.id === placementCardId)
    : destinationCards.length;
  const insertAt =
    targetIndex === -1
      ? destinationCards.length
      : placement.afterCardId
        ? targetIndex + 1
        : targetIndex;
  const cards: BoardBootstrapResponse['cards'] = [];
  let inserted = false;

  for (const card of bootstrap.cards) {
    if (card.id === cardId) {
      continue;
    }

    if (card.columnId === placement.columnId) {
      const destinationIndex = cards.filter(
        (item) => item.columnId === placement.columnId
      ).length;

      if (!inserted && destinationIndex === insertAt) {
        cards.push(movedCard);
        inserted = true;
      }
    }

    cards.push(card);
  }

  if (!inserted) {
    cards.push(movedCard);
  }

  return {
    ...bootstrap,
    cards,
  };
};

export const removeBootstrapCard = (
  bootstrap: BoardBootstrapResponse | undefined,
  cardId: string,
  boardVersion?: number
) => {
  if (!bootstrap) {
    return bootstrap;
  }

  return {
    ...bootstrap,
    board: withBoardVersion(bootstrap, boardVersion),
    cards: bootstrap.cards.filter((card) => card.id !== cardId),
  };
};

export const updateBootstrapColumns = (
  bootstrap: BoardBootstrapResponse | undefined,
  columns: BoardBootstrapResponse['columns'],
  boardVersion?: number
) => {
  if (!bootstrap) {
    return bootstrap;
  }

  return {
    ...bootstrap,
    board: withBoardVersion(bootstrap, boardVersion),
    columns,
  };
};

export const applyDeletedColumn = (
  bootstrap: BoardBootstrapResponse | undefined,
  result: DeleteColumnMutationResponse
) => {
  if (!bootstrap) {
    return bootstrap;
  }

  const deletedCardIds = new Set(result.cardIds);

  return {
    ...bootstrap,
    board: withBoardVersion(bootstrap, result.boardVersion),
    cards: bootstrap.cards.filter((card) => !deletedCardIds.has(card.id)),
    columns: result.columns,
    workCycle: result.workCycle,
  };
};

export const updateBootstrapTags = (
  bootstrap: BoardBootstrapResponse | undefined,
  tags: BoardBootstrapResponse['tags'],
  boardVersion?: number
) => {
  if (!bootstrap) {
    return bootstrap;
  }

  return {
    ...bootstrap,
    board: withBoardVersion(bootstrap, boardVersion),
    tags,
  };
};

export const applyDeletedTag = (
  bootstrap: BoardBootstrapResponse | undefined,
  result: DeleteTagMutationResponse
) => {
  if (!bootstrap) {
    return bootstrap;
  }

  return {
    ...bootstrap,
    board: withBoardVersion(bootstrap, result.boardVersion),
    cards: bootstrap.cards.map((card) => ({
      ...card,
      tagIds: card.tagIds.filter((tagId) => tagId !== result.tagId),
    })),
    tags: result.tags,
  };
};

export const updateBootstrapBackground = (
  bootstrap: BoardBootstrapResponse | undefined,
  background: BoardBootstrapResponse['board']['background'],
  boardVersion?: number
) => {
  if (!bootstrap) {
    return bootstrap;
  }

  return {
    ...bootstrap,
    board: {
      ...withBoardVersion(bootstrap, boardVersion),
      background,
    },
  };
};

export const updateBootstrapWorkCycle = (
  bootstrap: BoardBootstrapResponse | undefined,
  workCycle: BoardBootstrapResponse['workCycle'],
  boardVersion?: number
) => {
  if (!bootstrap) {
    return bootstrap;
  }

  return {
    ...bootstrap,
    board: withBoardVersion(bootstrap, boardVersion),
    workCycle,
  };
};
