import type { IncomingMessage, ServerResponse } from 'node:http';

import { createFlowboardApp } from '../server/app.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

const app = createFlowboardApp();

export default async function handler(
  request: IncomingMessage,
  response: ServerResponse
) {
  const { handleRequest } = await app;
  await handleRequest(request, response);
}
