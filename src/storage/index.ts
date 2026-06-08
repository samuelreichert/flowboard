import type {
  BoardBackground,
  BoardCard,
  BoardColumn,
  BoardState,
  BoardTag,
  CardPriority,
} from '../types';
import { CARD_PRIORITIES } from '../types';

const STORAGE_KEY = 'columnsList';
const BACKGROUND_STORAGE_KEY = 'boardBackground';
const TAGS_STORAGE_KEY = 'boardTags';
const BOARD_API_URL = import.meta.env.VITE_BOARD_API_URL?.trim();
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;
const CARD_CONTENT_LIMIT = 100_000;
export const DEFAULT_CARD_PRIORITY: CardPriority = 'medium';

export const DEFAULT_BACKGROUND: BoardBackground = {
  type: 'image',
  value: '/flowboard-background.png',
};

const createId = () => crypto.randomUUID();
let databaseReady = false;
let pendingDatabaseWrite = Promise.resolve();

const readStorage = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // The board remains usable when storage is unavailable or full.
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
};

const isValidDateString = (value: unknown): value is string => {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
};

const isCardPriority = (value: unknown): value is CardPriority => {
  return (
    typeof value === 'string' && CARD_PRIORITIES.includes(value as CardPriority)
  );
};

const normalizeCardMetadata = <
  T extends { priority?: unknown; tagIds?: unknown },
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

const isBoardCard = (value: unknown): value is BoardCard => {
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

const isBoardTag = (value: unknown): value is BoardTag => {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    value.name.trim().length > 0
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

const isCardWithoutContent = (
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

const isBoardColumn = (value: unknown): value is BoardColumn => {
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

const isBoardBackground = (value: unknown): value is BoardBackground => {
  return (
    isRecord(value) &&
    typeof value.value === 'string' &&
    ((value.type === 'color' && HEX_COLOR_PATTERN.test(value.value)) ||
      (value.type === 'image' && isSafeImageUrl(value.value)))
  );
};

const isBoardState = (value: unknown): value is BoardState => {
  return (
    isRecord(value) &&
    Array.isArray(value.columns) &&
    value.columns.every(isBoardColumn) &&
    isBoardBackground(value.background) &&
    Array.isArray(value.tags) &&
    value.tags.every(isBoardTag)
  );
};

const isLegacyColumn = (
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

const isColumnWithoutDescriptions = (
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

const isColumnWithLegacyDescriptions = (
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

const normalizeStoredCard = (
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

const normalizeBoardState = (value: unknown): unknown => {
  if (!isRecord(value) || !Array.isArray(value.columns)) {
    return value;
  }

  const migratedCreatedAt = new Date().toISOString();

  return {
    ...value,
    columns: value.columns.map((column) =>
      isRecord(column) && Array.isArray(column.cards)
        ? {
            ...column,
            cards: column.cards.map((card) =>
              normalizeStoredCard(card, migratedCreatedAt)
            ),
          }
        : column
    ),
    tags: Array.isArray(value.tags) ? value.tags.filter(isBoardTag) : [],
  };
};

const updateStorageCache = (data: BoardColumn[]) => {
  const jsonData = JSON.stringify(data);
  writeStorage(STORAGE_KEY, jsonData);
};

const updateBackgroundStorageCache = (background: BoardBackground) => {
  writeStorage(BACKGROUND_STORAGE_KEY, JSON.stringify(background));
};

const updateTagStorageCache = (tags: BoardTag[]) => {
  writeStorage(TAGS_STORAGE_KEY, JSON.stringify(tags));
};

export const fetchBackgroundStorage = (): BoardBackground => {
  const data = readStorage(BACKGROUND_STORAGE_KEY);

  if (!data) {
    return DEFAULT_BACKGROUND;
  }

  try {
    const parsedData: unknown = JSON.parse(data);

    return isBoardBackground(parsedData) ? parsedData : DEFAULT_BACKGROUND;
  } catch {
    return DEFAULT_BACKGROUND;
  }
};

const fetchBoardCache = (): BoardState => ({
  background: fetchBackgroundStorage(),
  columns: fetchStorage(),
  tags: fetchTagStorage(),
});

const persistBoardState = (state = fetchBoardCache()) => {
  if (!BOARD_API_URL || !databaseReady || typeof fetch !== 'function') {
    return Promise.resolve();
  }

  pendingDatabaseWrite = pendingDatabaseWrite
    .catch(() => undefined)
    .then(async () => {
      const response = await fetch(BOARD_API_URL, {
        body: JSON.stringify(state),
        headers: { 'Content-Type': 'application/json' },
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Unable to save board state.');
      }
    });

  pendingDatabaseWrite.catch((error) => console.error(error));
  return pendingDatabaseWrite;
};

export const updateStorage = (data: BoardColumn[]) => {
  updateStorageCache(data);
  void persistBoardState();
};

export const updateBackgroundStorage = (background: BoardBackground) => {
  updateBackgroundStorageCache(background);
  void persistBoardState();
};

export const updateTagStorage = (tags: BoardTag[]) => {
  updateTagStorageCache(tags);
  void persistBoardState();
};

export const hydrateStorageFromDatabase =
  async (): Promise<BoardState | null> => {
    if (!BOARD_API_URL || typeof fetch !== 'function') {
      return null;
    }

    try {
      const response = await fetch(BOARD_API_URL);

      if (!response.ok) {
        return null;
      }

      const payload: unknown = await response.json();
      const state = isRecord(payload)
        ? payload.state === null
          ? null
          : normalizeBoardState(payload.state)
        : undefined;

      if (!isRecord(payload) || state === undefined) {
        return null;
      }

      if (state !== null && !isBoardState(state)) {
        return null;
      }

      databaseReady = true;

      if (state === null) {
        await persistBoardState();
        return null;
      }

      updateStorageCache(state.columns);
      updateBackgroundStorageCache(state.background);
      updateTagStorageCache(state.tags);
      return state;
    } catch {
      return null;
    }
  };

export const fetchTagStorage = (): BoardTag[] => {
  const data = readStorage(TAGS_STORAGE_KEY);

  if (!data) {
    return [];
  }

  try {
    const parsedData: unknown = JSON.parse(data);

    return Array.isArray(parsedData) && parsedData.every(isBoardTag)
      ? parsedData
      : [];
  } catch {
    return [];
  }
};

export const fetchStorage = (): BoardColumn[] => {
  const data = readStorage(STORAGE_KEY);

  if (!data) {
    return [];
  }

  try {
    const parsedData: unknown = JSON.parse(data);
    const migratedCreatedAt = new Date().toISOString();

    if (Array.isArray(parsedData) && parsedData.every(isBoardColumn)) {
      return parsedData;
    }

    if (
      Array.isArray(parsedData) &&
      parsedData.every(isColumnWithLegacyDescriptions)
    ) {
      const migratedColumns = parsedData.map((column) => ({
        ...column,
        cards: column.cards.map((card) =>
          'content' in card
            ? normalizeCardMetadata({
                ...card,
                createdAt: isValidDateString(card.createdAt)
                  ? card.createdAt
                  : migratedCreatedAt,
              })
            : normalizeCardMetadata({
                content: card.description,
                createdAt: isValidDateString(card.createdAt)
                  ? card.createdAt
                  : migratedCreatedAt,
                id: card.id,
                priority: card.priority,
                tagIds: card.tagIds,
                title: card.title,
              })
        ),
      }));

      updateStorage(migratedColumns);
      return migratedColumns;
    }

    if (
      Array.isArray(parsedData) &&
      parsedData.every(isColumnWithoutDescriptions)
    ) {
      const migratedColumns = parsedData.map((column) => ({
        ...column,
        cards: column.cards.map((card) =>
          normalizeCardMetadata({
            ...card,
            content: '',
            createdAt: isValidDateString(card.createdAt)
              ? card.createdAt
              : migratedCreatedAt,
          })
        ),
      }));

      updateStorage(migratedColumns);
      return migratedColumns;
    }

    if (Array.isArray(parsedData) && parsedData.every(isLegacyColumn)) {
      const migratedColumns = parsedData.map((column) => ({
        ...column,
        id: createId(),
        cards: column.cards.map((title) => ({
          content: '',
          createdAt: migratedCreatedAt,
          id: createId(),
          priority: DEFAULT_CARD_PRIORITY,
          tagIds: [],
          title,
        })),
      }));

      updateStorage(migratedColumns);
      return migratedColumns;
    }

    return [];
  } catch {
    return [];
  }
};
