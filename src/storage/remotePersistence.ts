import type { BoardState } from '../types';
import { fetchDefaultBoard, saveBoard } from './authenticatedApi';

let localBoardId: string | null = null;
let databaseReady = false;
let pendingDatabaseWrite = Promise.resolve();

export const persistRemoteBoardState = (
  state: BoardState,
  updateCache: (state: BoardState) => BoardState
) => {
  if (!databaseReady || !localBoardId || typeof fetch !== 'function') {
    return Promise.resolve();
  }

  const boardId = localBoardId;

  pendingDatabaseWrite = pendingDatabaseWrite
    .catch(() => undefined)
    .then(async () => {
      const payload = await saveBoard(boardId, state);

      localBoardId = payload.board.id;
      updateCache(payload.state);
    });

  pendingDatabaseWrite.catch((error) => console.error(error));
  return pendingDatabaseWrite;
};

export const hydrateRemoteBoardState = async ({
  updateCache,
}: {
  updateCache: (state: BoardState) => BoardState;
}): Promise<BoardState | null> => {
  if (typeof fetch !== 'function') {
    return null;
  }

  try {
    const payload = await fetchDefaultBoard();
    const state = updateCache(payload.state);

    localBoardId = payload.board.id;
    databaseReady = true;
    return state;
  } catch {
    databaseReady = false;
    localBoardId = null;
    return null;
  }
};
