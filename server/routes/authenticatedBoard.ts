import type { IncomingMessage, ServerResponse } from 'node:http';

import {
  isBoardState,
  normalizeBoardState,
} from '../../src/board/validation.js';
import { CARD_PRIORITIES } from '../../src/board/cardPriority.js';
import { ensureProfile } from '../auth/profileService.js';
import type { PrincipalResolver } from '../auth/principal.js';
import type { FlowboardPrismaClient } from '../db/prismaClient.js';
import {
  createActiveCard,
  deleteActiveCard,
  listProjects,
  loadActiveCardDetail,
  loadBoard,
  loadMainBoardBootstrap,
  moveActiveCard,
  updateActiveCard,
  writeBoardState,
  type ActiveCardCreateInput,
  type ActiveCardMoveInput,
  type ActiveCardUpdateInput,
} from '../db/structuredBoardRepository.js';
import {
  sendBadRequest,
  sendNotFound,
  sendUnauthenticated,
} from '../http/apiErrors.js';
import { readRequestBody, sendJson } from '../http/json.js';

const BOARD_PATH_PATTERN = /^\/api\/boards\/([^/]+)$/;
const ACTIVE_CARD_COLLECTION_PATH = '/api/board/cards';
const ACTIVE_CARD_MOVE_PATH_PATTERN = /^\/api\/board\/cards\/([^/]+)\/move$/;
const ACTIVE_CARD_DETAIL_PATH_PATTERN = /^\/api\/board\/cards\/([^/]+)$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string =>
  typeof value === 'string';

const isNonEmptyString = (value: unknown): value is string =>
  isString(value) && value.trim().length > 0;

const isCardPriority = (
  value: unknown
): value is ActiveCardCreateInput['priority'] =>
  isString(value) &&
  CARD_PRIORITIES.includes(value as ActiveCardCreateInput['priority']);

const normalizeTagIds = (value: unknown) => {
  if (!Array.isArray(value) || value.some((item) => !isString(item))) {
    return null;
  }

  return [...new Set(value)];
};

const readJsonPayload = async (request: IncomingMessage) => {
  try {
    return JSON.parse(await readRequestBody(request)) as unknown;
  } catch {
    return null;
  }
};

const normalizeCardFields = (body: unknown) => {
  if (!isRecord(body)) {
    return null;
  }

  const tagIds = normalizeTagIds(body.tagIds);

  if (
    !isNonEmptyString(body.title) ||
    !isString(body.content) ||
    !isCardPriority(body.priority) ||
    !tagIds
  ) {
    return null;
  }

  return {
    content: body.content,
    priority: body.priority,
    tagIds,
    title: body.title.trim(),
  };
};

const normalizeCreateCardInput = (
  body: unknown
): ActiveCardCreateInput | null => {
  const fields = normalizeCardFields(body);

  if (
    !fields ||
    !isRecord(body) ||
    !isNonEmptyString(body.columnId) ||
    !isNonEmptyString(body.id)
  ) {
    return null;
  }

  return {
    ...fields,
    columnId: body.columnId,
    id: body.id,
  };
};

const normalizeUpdateCardInput = (
  body: unknown
): ActiveCardUpdateInput | null => {
  if (!isRecord(body)) {
    return null;
  }

  const input: ActiveCardUpdateInput = {};

  if (body.title !== undefined) {
    if (!isNonEmptyString(body.title)) {
      return null;
    }

    input.title = body.title.trim();
  }

  if (body.content !== undefined) {
    if (!isString(body.content)) {
      return null;
    }

    input.content = body.content;
  }

  if (body.priority !== undefined) {
    if (!isCardPriority(body.priority)) {
      return null;
    }

    input.priority = body.priority;
  }

  if (body.tagIds !== undefined) {
    const tagIds = normalizeTagIds(body.tagIds);

    if (!tagIds) {
      return null;
    }

    input.tagIds = tagIds;
  }

  return Object.keys(input).length > 0 ? input : null;
};

const normalizeNullableString = (value: unknown) => {
  if (value === undefined || value === null) {
    return null;
  }

  return isNonEmptyString(value) ? value : undefined;
};

const normalizeMoveCardInput = (
  body: unknown
): ActiveCardMoveInput | null => {
  if (!isRecord(body) || !isNonEmptyString(body.columnId)) {
    return null;
  }

  const beforeCardId = normalizeNullableString(body.beforeCardId);
  const afterCardId = normalizeNullableString(body.afterCardId);

  if (beforeCardId === undefined || afterCardId === undefined) {
    return null;
  }

  if (beforeCardId && afterCardId) {
    return null;
  }

  return {
    afterCardId,
    beforeCardId,
    columnId: body.columnId,
  };
};

const decodePathId = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export const handleAuthenticatedBoardApiRequest = async (
  request: IncomingMessage,
  response: ServerResponse,
  prisma: FlowboardPrismaClient,
  principalResolver: PrincipalResolver
) => {
  const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;

  if (
    pathname !== '/api/board/bootstrap' &&
    pathname !== ACTIVE_CARD_COLLECTION_PATH &&
    pathname !== '/api/projects' &&
    pathname !== '/api/boards/default' &&
    !ACTIVE_CARD_MOVE_PATH_PATTERN.test(pathname) &&
    !ACTIVE_CARD_DETAIL_PATH_PATTERN.test(pathname) &&
    !BOARD_PATH_PATTERN.test(pathname)
  ) {
    return false;
  }

  const user = await principalResolver.resolveRequest(request);

  if (!user) {
    sendUnauthenticated(response);
    return true;
  }

  await ensureProfile(prisma, user);

  if (pathname === '/api/board/bootstrap') {
    if (request.method !== 'GET') {
      sendBadRequest(response, 'Unsupported board API method.');
      return true;
    }

    sendJson(response, 200, await loadMainBoardBootstrap(prisma, user.id));
    return true;
  }

  if (pathname === ACTIVE_CARD_COLLECTION_PATH) {
    if (request.method !== 'POST') {
      sendBadRequest(response, 'Unsupported board API method.');
      return true;
    }

    const input = normalizeCreateCardInput(await readJsonPayload(request));

    if (!input) {
      sendBadRequest(response, 'Invalid card payload.');
      return true;
    }

    const result = await createActiveCard(prisma, user.id, input);

    if (!result) {
      sendNotFound(response);
      return true;
    }

    sendJson(response, 201, result);
    return true;
  }

  const activeCardMoveId = pathname.match(ACTIVE_CARD_MOVE_PATH_PATTERN)?.[1];

  if (activeCardMoveId) {
    if (request.method !== 'PATCH') {
      sendBadRequest(response, 'Unsupported board API method.');
      return true;
    }

    const input = normalizeMoveCardInput(await readJsonPayload(request));

    if (!input) {
      sendBadRequest(response, 'Invalid card move payload.');
      return true;
    }

    const result = await moveActiveCard(
      prisma,
      user.id,
      decodePathId(activeCardMoveId),
      input
    );

    if (!result) {
      sendNotFound(response);
      return true;
    }

    sendJson(response, 200, result);
    return true;
  }

  const activeCardId = pathname.match(ACTIVE_CARD_DETAIL_PATH_PATTERN)?.[1];

  if (activeCardId) {
    const decodedCardId = decodePathId(activeCardId);

    if (request.method === 'GET') {
      const card = await loadActiveCardDetail(prisma, user.id, decodedCardId);

      if (!card) {
        sendNotFound(response);
        return true;
      }

      sendJson(response, 200, card);
      return true;
    }

    if (request.method === 'PATCH') {
      const input = normalizeUpdateCardInput(await readJsonPayload(request));

      if (!input) {
        sendBadRequest(response, 'Invalid card payload.');
        return true;
      }

      const result = await updateActiveCard(
        prisma,
        user.id,
        decodedCardId,
        input
      );

      if (!result) {
        sendNotFound(response);
        return true;
      }

      sendJson(response, 200, result);
      return true;
    }

    if (request.method === 'DELETE') {
      const result = await deleteActiveCard(prisma, user.id, decodedCardId);

      if (!result) {
        sendNotFound(response);
        return true;
      }

      sendJson(response, 200, result);
      return true;
    }

    sendBadRequest(response, 'Unsupported board API method.');
    return true;
  }

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
