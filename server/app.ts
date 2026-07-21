import type { IncomingMessage, ServerResponse } from 'node:http';

import { createPrincipalResolver } from './auth/principal.ts';
import { createSupabaseAuthVerifier } from './auth/supabaseAuth.ts';
import { createServerConfig, type ServerConfig } from './config.ts';
import { createFlowboardPrismaClient } from './db/prismaClient.ts';
import { sendInternalError } from './http/apiErrors.ts';
import { serveProductionFile } from './http/static.ts';
import { handleAuthenticatedBoardApiRequest } from './routes/authenticatedBoard.ts';
import { handleAuthenticatedProfileApiRequest } from './routes/authenticatedProfile.ts';

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
