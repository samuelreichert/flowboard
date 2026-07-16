import type {
  BoardActiveWorkCycle,
  BoardBackground,
  BoardColumn,
  BoardState,
  BoardTag,
  CompletedWorkCycle,
} from '../types';

export const STORAGE_KEY = 'columnsList';
export const BACKGROUND_STORAGE_KEY = 'boardBackground';
export const TAGS_STORAGE_KEY = 'boardTags';
export const ACTIVE_WORK_CYCLE_STORAGE_KEY = 'activeWorkCycle';
export const COMPLETED_WORK_CYCLES_STORAGE_KEY = 'completedWorkCycles';

export const readStorage = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const writeStorage = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // The board remains usable when storage is unavailable or full.
  }
};

export const updateStorageCache = (data: BoardColumn[]) => {
  writeStorage(STORAGE_KEY, JSON.stringify(data));
};

export const updateBackgroundStorageCache = (background: BoardBackground) => {
  writeStorage(BACKGROUND_STORAGE_KEY, JSON.stringify(background));
};

export const updateTagStorageCache = (tags: BoardTag[]) => {
  writeStorage(TAGS_STORAGE_KEY, JSON.stringify(tags));
};

export const updateActiveWorkCycleStorageCache = (
  activeWorkCycle: BoardActiveWorkCycle
) => {
  writeStorage(ACTIVE_WORK_CYCLE_STORAGE_KEY, JSON.stringify(activeWorkCycle));
};

export const updateCompletedWorkCyclesStorageCache = (
  completedWorkCycles: CompletedWorkCycle[]
) => {
  writeStorage(
    COMPLETED_WORK_CYCLES_STORAGE_KEY,
    JSON.stringify(completedWorkCycles)
  );
};

export const updateBoardStateStorageCache = (state: BoardState) => {
  updateStorageCache(state.columns);
  updateBackgroundStorageCache(state.background);
  updateTagStorageCache(state.tags);
  updateActiveWorkCycleStorageCache(state.activeWorkCycle);
  updateCompletedWorkCyclesStorageCache(state.completedWorkCycles);
};

export const readActiveWorkCyclePayload = () => {
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
