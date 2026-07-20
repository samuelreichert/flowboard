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

export { DEFAULT_BACKGROUND, DEFAULT_CARD_PRIORITY, isSafeImageUrl };

const updateColumnsCache = (data: BoardColumn[]) => {
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

  return updateBoardCache(state);
};

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
  updateColumnsCache(data);
};

export const updateStorageLocal = (data: BoardColumn[]) =>
  updateColumnsCache(data);

export const updateBackgroundStorage = (background: BoardBackground) => {
  updateBoardCache({
    ...getBoardCache(),
    background,
  });
};

export const updateTagStorage = (tags: BoardTag[]) => {
  updateBoardCache({
    ...getBoardCache(),
    tags,
  });
};

export const updateActiveWorkCycleStorage = (
  activeWorkCycle: BoardActiveWorkCycle
) => {
  const boardCache = getBoardCache();
  updateBoardCache({
    ...boardCache,
    activeWorkCycle: normalizeActiveWorkCycle(
      activeWorkCycle,
      boardCache.columns,
      new Date().toISOString()
    ),
  });
};

export const updateCompletedWorkCyclesStorage = (
  completedWorkCycles: CompletedWorkCycle[]
) => {
  updateBoardCache({
    ...getBoardCache(),
    completedWorkCycles,
  });
};

export const updateBoardStateStorage = (state: BoardState) => {
  updateBoardCache(state);
};
