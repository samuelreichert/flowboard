import type { IncomingMessage, ServerResponse } from 'node:http';

import {
  getProfile,
  updateProfile,
  type ProfileUpdateInput,
} from '../auth/profileService.js';
import type { AuthVerifier } from '../auth/supabaseAuth.js';
import type { FlowboardPrismaClient } from '../db/prismaClient.js';
import { sendBadRequest, sendUnauthenticated } from '../http/apiErrors.js';
import { readRequestBody, sendJson } from '../http/json.js';

export const handleAuthenticatedProfileApiRequest = async (
  request: IncomingMessage,
  response: ServerResponse,
  prisma: FlowboardPrismaClient,
  authVerifier: AuthVerifier
) => {
  const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;

  if (pathname !== '/api/profile') {
    return false;
  }

  const user = await authVerifier.verifyRequest(request);

  if (!user) {
    sendUnauthenticated(response);
    return true;
  }

  if (request.method === 'GET') {
    sendJson(response, 200, {
      profile: await getProfile(prisma, user),
    });
    return true;
  }

  if (request.method === 'PUT') {
    let body: ProfileUpdateInput;

    try {
      body = JSON.parse(await readRequestBody(request)) as ProfileUpdateInput;
    } catch {
      sendBadRequest(response, 'Invalid JSON payload.');
      return true;
    }

    try {
      sendJson(response, 200, {
        profile: await updateProfile(prisma, user, body),
      });
    } catch (error) {
      sendBadRequest(
        response,
        error instanceof Error ? error.message : 'Invalid profile payload.'
      );
    }

    return true;
  }

  sendBadRequest(response, 'Unsupported profile API method.');
  return true;
};
