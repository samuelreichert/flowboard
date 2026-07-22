import type { IncomingMessage, ServerResponse } from 'node:http';

import { createPrincipalResolver } from './auth/principal.js';
import { createSupabaseAuthVerifier } from './auth/supabaseAuth.js';
import { createServerConfig, type ServerConfig } from './config.js';
import { sendInternalError } from './http/apiErrors.js';
import { serveProductionFile } from './http/static.js';
import { handleAuthenticatedBoardApiRequest } from './routes/authenticatedBoard.js';
import { handleAuthenticatedProfileApiRequest } from './routes/authenticatedProfile.js';

export type FlowboardRequestHandler = (
  request: IncomingMessage,
  response: ServerResponse
) => Promise<void>;

export type FlowboardApp = {
  config: ServerConfig;
  handleRequest: FlowboardRequestHandler;
};

export const createFlowboardApp = async (): Promise<FlowboardApp> => {
  const config = createServerConfig();
  const vite = config.isDevelopment
    ? await import('vite').then(({ createServer: createViteServer }) =>
        createViteServer({
          appType: 'spa',
          server: { middlewareMode: true },
        })
      )
    : null;
  const { createFlowboardPrismaClient } = await import('./db/prismaClient.js');
  const prisma = createFlowboardPrismaClient(config);
  const authVerifier = createSupabaseAuthVerifier(config);
  const principalResolver = createPrincipalResolver(config, authVerifier);

  return {
    config,
    handleRequest: async (request, response) => {
      try {
        if (
          await handleAuthenticatedProfileApiRequest(
            request,
            response,
            prisma,
            principalResolver
          )
        ) {
          return;
        }

        if (
          await handleAuthenticatedBoardApiRequest(
            request,
            response,
            prisma,
            principalResolver
          )
        ) {
          return;
        }

        if (vite) {
          vite.middlewares(request, response);
          return;
        }

        serveProductionFile(request, response, config.distDirectory);
      } catch (error) {
        console.error(error);
        sendInternalError(response);
      }
    },
  };
};
