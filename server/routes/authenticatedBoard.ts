import type { IncomingMessage, ServerResponse } from 'node:http';

import {
  isBoardState,
  normalizeBoardState,
} from '../../src/board/validation.js';
import { ensureProfile } from '../auth/profileService.js';
import type { AuthVerifier } from '../auth/supabaseAuth.js';
import type { FlowboardPrismaClient } from '../db/prismaClient.js';
import {
  listProjects,
  loadBoard,
  writeBoardState,
} from '../db/structuredBoardRepository.js';
import {
  sendBadRequest,
  sendNotFound,
  sendUnauthenticated,
} from '../http/apiErrors.js';
import { readRequestBody, sendJson } from '../http/json.js';

const BOARD_PATH_PATTERN = /^\/api\/boards\/([^/]+)$/;

export const handleAuthenticatedBoardApiRequest = async (
  request: IncomingMessage,
  response: ServerResponse,
  prisma: FlowboardPrismaClient,
  authVerifier: AuthVerifier
) => {
  const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;

  if (
    pathname !== '/api/projects' &&
    pathname !== '/api/boards/default' &&
    !BOARD_PATH_PATTERN.test(pathname)
  ) {
    return false;
  }

  const user = await authVerifier.verifyRequest(request);

  if (!user) {
    sendUnauthenticated(response);
    return true;
  }

  await ensureProfile(prisma, user);

  if (pathname === '/api/projects') {
    if (request.method !== 'GET') {
      sendBadRequest(response, 'Unsupported project API method.');
      return true;
    }

    sendJson(response, 200, {
      projects: await listProjects(prisma, user.id),
    });
    return true;
  }

  if (pathname === '/api/boards/default') {
    if (request.method !== 'GET') {
      sendBadRequest(response, 'Unsupported board API method.');
      return true;
    }

    const board = await loadBoard(prisma, user.id, null);
    sendJson(response, 200, board);
    return true;
  }

  const boardId = pathname.match(BOARD_PATH_PATTERN)?.[1] ?? null;

  if (!boardId) {
    return false;
  }

  if (request.method === 'GET') {
    const board = await loadBoard(prisma, user.id, boardId);

    if (!board) {
      sendNotFound(response);
      return true;
    }

    sendJson(response, 200, board);
    return true;
  }

  if (request.method === 'PUT') {
    let body: unknown;

    try {
      body = JSON.parse(await readRequestBody(request));
    } catch {
      sendBadRequest(response, 'Invalid JSON payload.');
      return true;
    }

    const state = normalizeBoardState(body);

    if (!isBoardState(state)) {
      sendBadRequest(response, 'Invalid board state.');
      return true;
    }

    const board = await writeBoardState(prisma, user.id, boardId, state);

    if (!board) {
      sendNotFound(response);
      return true;
    }

    sendJson(response, 200, board);
    return true;
  }

  sendBadRequest(response, 'Unsupported board API method.');
  return true;
};
