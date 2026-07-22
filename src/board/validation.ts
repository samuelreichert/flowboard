import { CARD_PRIORITIES } from './cardPriority.js';
import { CARD_CONTENT_LIMIT, DEFAULT_CARD_PRIORITY } from './constants.js';
import {
  type ArchivedBoardCard,
  type ArchivedCardTagSnapshot,
  type BoardActiveWorkCycle,
  type BoardBackground,
  type BoardCard,
  type BoardColumn,
  type BoardState,
  type BoardTag,
  type CardPriority,
  type CompletedWorkCycle,
} from './types.js';

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

export const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
};

export const isValidDateString = (value: unknown): value is string => {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
};

export const isCardPriority = (value: unknown): value is CardPriority => {
  return (
    typeof value === 'string' && CARD_PRIORITIES.includes(value as CardPriority)
  );
};

export const normalizeCardMetadata = <
  T extends Record<string, unknown> & {
    priority?: unknown;
    tagIds?: unknown;
  },
>(
  card: T
) => ({
  ...card,
  priority: isCardPriority(card.priority)
    ? card.priority
    : DEFAULT_CARD_PRIORITY,
  tagIds: Array.isArray(card.tagIds)
    ? card.tagIds.filter((tagId): tagId is string => typeof tagId === 'string')
    : [],
});

export const isSafeImageUrl = (value: string) => {
  if (value.length > 2048) {
    return false;
  }

  if (value.startsWith('/') && !value.startsWith('//')) {
    return true;
  }

  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

export const isBoardCard = (value: unknown): value is BoardCard => {
  return (
    isRecord(value) &&
    typeof value.content === 'string' &&
    value.content.length <= CARD_CONTENT_LIMIT &&
    isValidDateString(value.createdAt) &&
    typeof value.id === 'string' &&
    isCardPriority(value.priority) &&
    Array.isArray(value.tagIds) &&
    value.tagIds.every((tagId) => typeof tagId === 'string') &&
    typeof value.title === 'string'
  );
};

export const isBoardTag = (value: unknown): value is BoardTag => {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    value.name.trim().length > 0
  );
};

export const isArchivedCardTagSnapshot = (
  value: unknown
): value is ArchivedCardTagSnapshot => {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string'
  );
};

export const isArchivedBoardCard = (
  value: unknown
): value is ArchivedBoardCard => {
  return (
    isRecord(value) &&
    isValidDateString(value.archivedAt) &&
    typeof value.content === 'string' &&
    value.content.length <= CARD_CONTENT_LIMIT &&
    isValidDateString(value.createdAt) &&
    typeof value.id === 'string' &&
    isCardPriority(value.priority) &&
    Array.isArray(value.tagIds) &&
    value.tagIds.every((tagId) => typeof tagId === 'string') &&
    Array.isArray(value.tagSnapshots) &&
    value.tagSnapshots.every(isArchivedCardTagSnapshot) &&
    typeof value.title === 'string'
  );
};

export const isBoardActiveWorkCycle = (
  value: unknown
): value is BoardActiveWorkCycle => {
  return (
    isRecord(value) &&
    (typeof value.completedColumnId === 'string' ||
      value.completedColumnId === null) &&
    isValidDateString(value.startDate)
  );
};

export const isCompletedWorkCycle = (
  value: unknown
): value is CompletedWorkCycle => {
  return (
    isRecord(value) &&
    Array.isArray(value.cards) &&
    value.cards.every(isArchivedBoardCard) &&
    (typeof value.completedColumnId === 'string' ||
      value.completedColumnId === null) &&
    (typeof value.completedColumnTitle === 'string' ||
      value.completedColumnTitle === null) &&
    isValidDateString(value.endDate) &&
    typeof value.id === 'string' &&
    isValidDateString(value.startDate)
  );
};

const isCardWithContent = (
  value: unknown
): value is Omit<BoardCard, 'createdAt' | 'priority' | 'tagIds'> & {
  createdAt?: unknown;
  priority?: unknown;
  tagIds?: unknown;
} => {
  return (
    isRecord(value) &&
    typeof value.content === 'string' &&
    value.content.length <= CARD_CONTENT_LIMIT &&
    typeof value.id === 'string' &&
    typeof value.title === 'string'
  );
};

const isLegacyDescriptionCard = (
  value: unknown
): value is Omit<BoardCard, 'content' | 'createdAt' | 'priority' | 'tagIds'> & {
  createdAt?: unknown;
  description: string;
  priority?: unknown;
  tagIds?: unknown;
} => {
  return (
    isRecord(value) &&
    typeof value.description === 'string' &&
    value.description.length <= CARD_CONTENT_LIMIT &&
    typeof value.id === 'string' &&
    typeof value.title === 'string'
  );
};

export const isCardWithoutContent = (
  value: unknown
): value is Omit<BoardCard, 'content' | 'createdAt' | 'priority' | 'tagIds'> & {
  createdAt?: unknown;
  priority?: unknown;
  tagIds?: unknown;
} => {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string'
  );
};

export const isBoardColumn = (value: unknown): value is BoardColumn => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const column = value as BoardColumn;

  return (
    typeof column.id === 'string' &&
    typeof column.title === 'string' &&
    Array.isArray(column.cards) &&
    column.cards.every(isBoardCard) &&
    typeof column.position === 'number'
  );
};

export const isBoardBackground = (value: unknown): value is BoardBackground => {
  return (
    isRecord(value) &&
    typeof value.value === 'string' &&
    ((value.type === 'color' && HEX_COLOR_PATTERN.test(value.value)) ||
      (value.type === 'image' && isSafeImageUrl(value.value)))
  );
};

export const isBoardState = (value: unknown): value is BoardState => {
  return (
    isRecord(value) &&
    isBoardActiveWorkCycle(value.activeWorkCycle) &&
    Array.isArray(value.columns) &&
    value.columns.every(isBoardColumn) &&
    Array.isArray(value.completedWorkCycles) &&
    value.completedWorkCycles.every(isCompletedWorkCycle) &&
    isBoardBackground(value.background) &&
    Array.isArray(value.tags) &&
    value.tags.every(isBoardTag)
  );
};

export const isLegacyColumn = (
  value: unknown
): value is { title: string; cards: string[]; position: number } => {
  return (
    isRecord(value) &&
    typeof value.title === 'string' &&
    Array.isArray(value.cards) &&
    value.cards.every((card) => typeof card === 'string') &&
    typeof value.position === 'number'
  );
};

export const isColumnWithoutDescriptions = (
  value: unknown
): value is Omit<BoardColumn, 'cards'> & {
  cards: (Omit<BoardCard, 'content' | 'createdAt' | 'priority' | 'tagIds'> & {
    createdAt?: unknown;
    priority?: unknown;
    tagIds?: unknown;
  })[];
} => {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    Array.isArray(value.cards) &&
    value.cards.every(isCardWithoutContent) &&
    typeof value.position === 'number'
  );
};

export const isColumnWithLegacyDescriptions = (
  value: unknown
): value is Omit<BoardColumn, 'cards'> & {
  cards: (
    | BoardCard
    | (Omit<BoardCard, 'createdAt' | 'priority' | 'tagIds'> & {
        createdAt?: unknown;
        priority?: unknown;
        tagIds?: unknown;
      })
    | (Omit<BoardCard, 'content' | 'createdAt' | 'priority' | 'tagIds'> & {
        createdAt?: unknown;
        description: string;
        priority?: unknown;
        tagIds?: unknown;
      })
  )[];
} => {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    Array.isArray(value.cards) &&
    value.cards.every(
      (card) =>
        isBoardCard(card) ||
        isCardWithContent(card) ||
        isLegacyDescriptionCard(card)
    ) &&
    typeof value.position === 'number'
  );
};

export const normalizeStoredCard = (
  card: unknown,
  migratedCreatedAt: string
): unknown => {
  if (!isRecord(card)) {
    return card;
  }

  if (typeof card.content === 'string') {
    return normalizeCardMetadata({
      ...card,
      createdAt: isValidDateString(card.createdAt)
        ? card.createdAt
        : migratedCreatedAt,
    });
  }

  if (typeof card.description === 'string') {
    return normalizeCardMetadata({
      content: card.description,
      createdAt: isValidDateString(card.createdAt)
        ? card.createdAt
        : migratedCreatedAt,
      id: card.id,
      priority: card.priority,
      tagIds: card.tagIds,
      title: card.title,
    });
  }

  return normalizeCardMetadata({
    ...card,
    content: '',
    createdAt: isValidDateString(card.createdAt)
      ? card.createdAt
      : migratedCreatedAt,
  });
};

const getOldestCardDate = (column: BoardColumn | undefined) => {
  let oldestDate: string | undefined;

  for (const card of column?.cards ?? []) {
    if (
      isValidDateString(card.createdAt) &&
      (!oldestDate || Date.parse(card.createdAt) < Date.parse(oldestDate))
    ) {
      oldestDate = card.createdAt;
    }
  }

  return oldestDate;
};

export const normalizeActiveWorkCycle = (
  value: unknown,
  columns: BoardColumn[],
  migratedStartDate: string
): BoardActiveWorkCycle => {
  const columnIds = new Set(columns.map((column) => column.id));

  if (isBoardActiveWorkCycle(value)) {
    return {
      completedColumnId:
        value.completedColumnId && columnIds.has(value.completedColumnId)
          ? value.completedColumnId
          : null,
      startDate: value.startDate,
    };
  }

  const inferredDoneColumn = columns.find(
    (column) => column.title.trim().toLowerCase() === 'done'
  );

  return {
    completedColumnId: inferredDoneColumn?.id ?? null,
    startDate: getOldestCardDate(inferredDoneColumn) ?? migratedStartDate,
  };
};

export const normalizeBoardState = (value: unknown): unknown => {
  if (!isRecord(value) || !Array.isArray(value.columns)) {
    return value;
  }

  const migratedCreatedAt = new Date().toISOString();
  const columns = value.columns.map((column) =>
    isRecord(column) && Array.isArray(column.cards)
      ? {
          ...column,
          cards: column.cards.map((card) =>
            normalizeStoredCard(card, migratedCreatedAt)
          ),
        }
      : column
  );
  const normalizedTags = Array.isArray(value.tags)
    ? value.tags.filter(isBoardTag)
    : [];

  return {
    ...value,
    activeWorkCycle: columns.every(isBoardColumn)
      ? normalizeActiveWorkCycle(
          value.activeWorkCycle,
          columns,
          migratedCreatedAt
        )
      : value.activeWorkCycle,
    columns,
    completedWorkCycles: Array.isArray(value.completedWorkCycles)
      ? value.completedWorkCycles.filter(isCompletedWorkCycle)
      : [],
    tags: normalizedTags,
  };
};

export const normalizeBoardStateForColumns = (
  state: BoardState,
  columns: BoardColumn[]
): BoardState => {
  return {
    ...state,
    activeWorkCycle: normalizeActiveWorkCycle(
      state.activeWorkCycle,
      columns,
      new Date().toISOString()
    ),
    columns,
  };
};
