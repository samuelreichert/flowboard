import type {
  BoardActiveWorkCycle,
  BoardBackground,
  BoardColumn,
  BoardState,
  BoardTag,
  CompletedWorkCycle,
} from '../types';
import { normalizeColumnOrder } from '../board/columns';
import { DEFAULT_BACKGROUND, DEFAULT_CARD_PRIORITY } from '../board/constants';
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
  normalizeActiveWorkCycle,
  normalizeBoardState,
  normalizeBoardStateForColumns,
  normalizeCardMetadata,
} from '../board/validation';

const STORAGE_KEY = 'columnsList';
const BACKGROUND_STORAGE_KEY = 'boardBackground';
const TAGS_STORAGE_KEY = 'boardTags';
const ACTIVE_WORK_CYCLE_STORAGE_KEY = 'activeWorkCycle';
const COMPLETED_WORK_CYCLES_STORAGE_KEY = 'completedWorkCycles';
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
  const jsonData = JSON.stringify(normalizeColumnOrder(data));
  writeStorage(STORAGE_KEY, jsonData);
};

const updateBackgroundStorageCache = (background: BoardBackground) => {
  writeStorage(BACKGROUND_STORAGE_KEY, JSON.stringify(background));
};

const updateTagStorageCache = (tags: BoardTag[]) => {
  writeStorage(TAGS_STORAGE_KEY, JSON.stringify(tags));
};

const updateActiveWorkCycleStorageCache = (
  activeWorkCycle: BoardActiveWorkCycle
) => {
  writeStorage(ACTIVE_WORK_CYCLE_STORAGE_KEY, JSON.stringify(activeWorkCycle));
};

const updateCompletedWorkCyclesStorageCache = (
  completedWorkCycles: CompletedWorkCycle[]
) => {
  writeStorage(
    COMPLETED_WORK_CYCLES_STORAGE_KEY,
    JSON.stringify(completedWorkCycles)
  );
};

const readActiveWorkCyclePayload = () => {
  const data = readStorage(ACTIVE_WORK_CYCLE_STORAGE_KEY);

  if (!data) {
    return null;
  }

  try {
    return JSON.parse(data) as unknown;
  } catch {
    return null;
  }
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
  activeWorkCycle: fetchActiveWorkCycleStorage(),
  background: fetchBackgroundStorage(),
  columns: fetchStorage(),
  completedWorkCycles: fetchCompletedWorkCyclesStorage(),
  tags: fetchTagStorage(),
});

export const fetchBoardState = (): BoardState => fetchBoardCache();

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
  const columns = normalizeColumnOrder(data);

  updateStorageCache(columns);

  const state = normalizeBoardStateForColumns(
    {
      ...fetchBoardCache(),
      activeWorkCycle: normalizeActiveWorkCycle(
        readActiveWorkCyclePayload(),
        columns,
        new Date().toISOString()
      ),
    },
    columns
  );

  updateStorageCache(state.columns);
  updateActiveWorkCycleStorageCache(state.activeWorkCycle);
  void persistBoardState(state);
};

export const updateBackgroundStorage = (background: BoardBackground) => {
  updateBackgroundStorageCache(background);
  void persistBoardState();
};

export const updateTagStorage = (tags: BoardTag[]) => {
  updateTagStorageCache(tags);
  void persistBoardState();
};

export const updateActiveWorkCycleStorage = (
  activeWorkCycle: BoardActiveWorkCycle
) => {
  const state = {
    ...fetchBoardCache(),
    activeWorkCycle: normalizeActiveWorkCycle(
      activeWorkCycle,
      fetchStorage(),
      new Date().toISOString()
    ),
  };

  updateActiveWorkCycleStorageCache(state.activeWorkCycle);
  void persistBoardState(state);
};

export const updateCompletedWorkCyclesStorage = (
  completedWorkCycles: CompletedWorkCycle[]
) => {
  updateCompletedWorkCyclesStorageCache(completedWorkCycles);
  void persistBoardState();
};

export const updateBoardStateStorage = (state: BoardState) => {
  const columns = normalizeColumnOrder(state.columns);
  const activeWorkCycle = normalizeActiveWorkCycle(
    state.activeWorkCycle,
    columns,
    new Date().toISOString()
  );

  updateStorageCache(columns);
  updateBackgroundStorageCache(state.background);
  updateTagStorageCache(state.tags);
  updateActiveWorkCycleStorageCache(activeWorkCycle);
  updateCompletedWorkCyclesStorageCache(state.completedWorkCycles);
  void persistBoardState({ ...state, activeWorkCycle, columns });
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
      updateActiveWorkCycleStorageCache(state.activeWorkCycle);
      updateCompletedWorkCyclesStorageCache(state.completedWorkCycles);
      return { ...state, columns: normalizeColumnOrder(state.columns) };
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

export const fetchActiveWorkCycleStorage = (): BoardActiveWorkCycle => {
  const columns = fetchStorage();
  const parsedData = readActiveWorkCyclePayload();

  if (!parsedData) {
    return normalizeActiveWorkCycle(null, columns, new Date().toISOString());
  }

  return normalizeActiveWorkCycle(
    parsedData,
    columns,
    new Date().toISOString()
  );
};

export const fetchCompletedWorkCyclesStorage = (): CompletedWorkCycle[] => {
  const data = readStorage(COMPLETED_WORK_CYCLES_STORAGE_KEY);

  if (!data) {
    return [];
  }

  try {
    const parsedData: unknown = JSON.parse(data);
    const normalized = normalizeBoardState({
      activeWorkCycle: fetchActiveWorkCycleStorage(),
      background: fetchBackgroundStorage(),
      columns: fetchStorage(),
      completedWorkCycles: parsedData,
      tags: fetchTagStorage(),
    });

    return isBoardState(normalized) ? normalized.completedWorkCycles : [];
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
      return normalizeColumnOrder(parsedData);
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
