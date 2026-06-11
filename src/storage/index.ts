import type {
  BoardBackground,
  BoardColumn,
  BoardState,
  BoardTag,
} from '../types';
import {
  DEFAULT_BACKGROUND,
  DEFAULT_CARD_PRIORITY,
} from '../board/constants';
import {
  isBoardBackground,
  isBoardColumn,
  isBoardState,
  isBoardTag,
  isColumnWithLegacyDescriptions,
  isColumnWithoutDescriptions,
  isLegacyColumn,
  isRecord,
  isSafeImageUrl,
  isValidDateString,
  normalizeBoardState,
  normalizeCardMetadata,
} from '../board/validation';

const STORAGE_KEY = 'columnsList';
const BACKGROUND_STORAGE_KEY = 'boardBackground';
const TAGS_STORAGE_KEY = 'boardTags';
const BOARD_API_URL = import.meta.env.VITE_BOARD_API_URL?.trim();

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

export { DEFAULT_BACKGROUND, DEFAULT_CARD_PRIORITY, isSafeImageUrl };

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
