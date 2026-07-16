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
  isSafeImageUrl,
  normalizeActiveWorkCycle,
  normalizeBoardStateForColumns,
} from '../board/validation';
import { getBoardCache, updateBoardCache } from './memoryCache';
import {
  hydrateRemoteBoardState,
  persistRemoteBoardState,
} from './remotePersistence';

export { DEFAULT_BACKGROUND, DEFAULT_CARD_PRIORITY, isSafeImageUrl };

const persistBoardState = (state = getBoardCache()) =>
  persistRemoteBoardState(state, updateBoardCache);

export const fetchBackgroundStorage = (): BoardBackground =>
  getBoardCache().background;

export const fetchBoardState = (): BoardState => getBoardCache();

export const fetchStorage = (): BoardColumn[] => getBoardCache().columns;

export const fetchTagStorage = (): BoardTag[] => getBoardCache().tags;

export const fetchActiveWorkCycleStorage = (): BoardActiveWorkCycle =>
  getBoardCache().activeWorkCycle;

export const fetchCompletedWorkCyclesStorage = (): CompletedWorkCycle[] =>
  getBoardCache().completedWorkCycles;

export const updateStorage = (data: BoardColumn[]) => {
  const boardCache = getBoardCache();
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

  const normalizedState = updateBoardCache(state);
  void persistBoardState(normalizedState);
};

export const updateBackgroundStorage = (background: BoardBackground) => {
  const normalizedState = updateBoardCache({
    ...getBoardCache(),
    background,
  });

  void persistBoardState(normalizedState);
};

export const updateTagStorage = (tags: BoardTag[]) => {
  const normalizedState = updateBoardCache({
    ...getBoardCache(),
    tags,
  });

  void persistBoardState(normalizedState);
};

export const updateActiveWorkCycleStorage = (
  activeWorkCycle: BoardActiveWorkCycle
) => {
  const boardCache = getBoardCache();
  const normalizedState = updateBoardCache({
    ...boardCache,
    activeWorkCycle: normalizeActiveWorkCycle(
      activeWorkCycle,
      boardCache.columns,
      new Date().toISOString()
    ),
  });

  void persistBoardState(normalizedState);
};

export const updateCompletedWorkCyclesStorage = (
  completedWorkCycles: CompletedWorkCycle[]
) => {
  const normalizedState = updateBoardCache({
    ...getBoardCache(),
    completedWorkCycles,
  });

  void persistBoardState(normalizedState);
};

export const updateBoardStateStorage = (state: BoardState) => {
  const normalizedState = updateBoardCache(state);

  void persistBoardState(normalizedState);
};

export const hydrateStorageFromDatabase =
  async (): Promise<BoardState | null> =>
    hydrateRemoteBoardState({
      updateCache: updateBoardCache,
    });
