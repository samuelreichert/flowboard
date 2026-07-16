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
  isBoardState,
  isSafeImageUrl,
  normalizeActiveWorkCycle,
  normalizeBoardState,
  normalizeBoardStateForColumns,
} from '../board/validation';
import { fetchDefaultBoard, saveBoard } from './authenticatedApi';

let localBoardId: string | null = null;
let databaseReady = false;
let pendingDatabaseWrite = Promise.resolve();

const createEmptyBoardState = (now = new Date()): BoardState => ({
  activeWorkCycle: {
    completedColumnId: null,
    startDate: now.toISOString(),
  },
  background: DEFAULT_BACKGROUND,
  columns: [],
  completedWorkCycles: [],
  tags: [],
});

let boardCache = createEmptyBoardState();

export { DEFAULT_BACKGROUND, DEFAULT_CARD_PRIORITY, isSafeImageUrl };

const normalizeMemoryState = (state: BoardState) => {
  const normalizedState = normalizeBoardState(state);

  if (!isBoardState(normalizedState)) {
    return createEmptyBoardState();
  }

  const columns = normalizeColumnOrder(normalizedState.columns);

  return {
    ...normalizedState,
    activeWorkCycle: normalizeActiveWorkCycle(
      normalizedState.activeWorkCycle,
      columns,
      new Date().toISOString()
    ),
    columns,
  };
};

const updateBoardCache = (state: BoardState) => {
  boardCache = state;
};

const persistBoardState = (state = boardCache) => {
  if (!databaseReady || !localBoardId || typeof fetch !== 'function') {
    return Promise.resolve();
  }

  const boardId = localBoardId;

  pendingDatabaseWrite = pendingDatabaseWrite
    .catch(() => undefined)
    .then(async () => {
      const payload = await saveBoard(boardId, state);
      const nextState = normalizeMemoryState(payload.state);

      localBoardId = payload.board.id;
      updateBoardCache(nextState);
    });

  pendingDatabaseWrite.catch((error) => console.error(error));
  return pendingDatabaseWrite;
};

export const fetchBackgroundStorage = (): BoardBackground =>
  boardCache.background;

export const fetchBoardState = (): BoardState => boardCache;

export const fetchStorage = (): BoardColumn[] => boardCache.columns;

export const fetchTagStorage = (): BoardTag[] => boardCache.tags;

export const fetchActiveWorkCycleStorage = (): BoardActiveWorkCycle =>
  boardCache.activeWorkCycle;

export const fetchCompletedWorkCyclesStorage = (): CompletedWorkCycle[] =>
  boardCache.completedWorkCycles;

export const updateStorage = (data: BoardColumn[]) => {
  const columns = normalizeColumnOrder(data);
  const state = normalizeBoardStateForColumns(
    {
      ...boardCache,
      activeWorkCycle: normalizeActiveWorkCycle(
        boardCache.activeWorkCycle,
        columns,
        new Date().toISOString()
      ),
    },
    columns
  );

  updateBoardCache(state);
  void persistBoardState(state);
};

export const updateBackgroundStorage = (background: BoardBackground) => {
  const state = {
    ...boardCache,
    background,
  };

  updateBoardCache(state);
  void persistBoardState(state);
};

export const updateTagStorage = (tags: BoardTag[]) => {
  const state = {
    ...boardCache,
    tags,
  };

  updateBoardCache(state);
  void persistBoardState(state);
};

export const updateActiveWorkCycleStorage = (
  activeWorkCycle: BoardActiveWorkCycle
) => {
  const state = {
    ...boardCache,
    activeWorkCycle: normalizeActiveWorkCycle(
      activeWorkCycle,
      boardCache.columns,
      new Date().toISOString()
    ),
  };

  updateBoardCache(state);
  void persistBoardState(state);
};

export const updateCompletedWorkCyclesStorage = (
  completedWorkCycles: CompletedWorkCycle[]
) => {
  const state = {
    ...boardCache,
    completedWorkCycles,
  };

  updateBoardCache(state);
  void persistBoardState(state);
};

export const updateBoardStateStorage = (state: BoardState) => {
  const normalizedState = normalizeMemoryState(state);

  updateBoardCache(normalizedState);
  void persistBoardState(normalizedState);
};

export const hydrateStorageFromDatabase =
  async (): Promise<BoardState | null> => {
    if (typeof fetch !== 'function') {
      return null;
    }

    try {
      const payload = await fetchDefaultBoard();
      const state = normalizeMemoryState(payload.state);

      localBoardId = payload.board.id;
      databaseReady = true;
      updateBoardCache(state);
      return state;
    } catch {
      databaseReady = false;
      localBoardId = null;
      return null;
    }
  };
