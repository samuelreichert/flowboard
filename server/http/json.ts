import type { IncomingMessage, ServerResponse } from 'node:http';

export const readRequestBody = async (request: IncomingMessage) => {
  let body = '';

  for await (const chunk of request) {
    body += chunk;

    if (body.length > 1_000_000) {
      throw new Error('Request body is too large.');
    }
  }

  return body;
};

export const sendJson = (
  response: ServerResponse,
  statusCode: number,
  payload: unknown
) => {
  response.writeHead(statusCode, {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(JSON.stringify(payload));
};
