import type { ServerResponse } from 'node:http';

import { sendJson } from './json.js';

export type ApiErrorCode =
  | 'bad_request'
  | 'internal_error'
  | 'not_found'
  | 'unauthenticated'
  | 'unauthorized';

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  bad_request: 400,
  internal_error: 500,
  not_found: 404,
  unauthenticated: 401,
  unauthorized: 403,
};

export const sendApiError = (
  response: ServerResponse,
  code: ApiErrorCode,
  message: string
) => {
  sendJson(response, STATUS_BY_CODE[code], {
    error: {
      code,
      message,
    },
  });
};

export const sendBadRequest = (response: ServerResponse, message: string) => {
  sendApiError(response, 'bad_request', message);
};

export const sendInternalError = (response: ServerResponse) => {
  sendApiError(response, 'internal_error', 'Internal server error.');
};

export const sendNotFound = (response: ServerResponse) => {
  sendApiError(response, 'not_found', 'Resource not found.');
};

export const sendUnauthenticated = (response: ServerResponse) => {
  sendApiError(response, 'unauthenticated', 'Authentication is required.');
};

export const sendUnauthorized = (response: ServerResponse) => {
  sendApiError(response, 'unauthorized', 'You are not allowed to access this resource.');
};
