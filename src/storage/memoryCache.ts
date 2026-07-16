import type { BoardState } from '../types';
import { normalizeColumnOrder } from '../board/columns';
import { DEFAULT_BACKGROUND } from '../board/constants';
import {
  isBoardState,
  normalizeActiveWorkCycle,
  normalizeBoardState,
} from '../board/validation';

export const createEmptyBoardState = (now = new Date()): BoardState => ({
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

export const normalizeMemoryState = (state: BoardState) => {
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

export const getBoardCache = (): BoardState => boardCache;

export const updateBoardCache = (state: BoardState) => {
  const normalizedState = normalizeMemoryState(state);

  boardCache = normalizedState;
  return normalizedState;
};
