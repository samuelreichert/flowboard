import { createServer } from 'node:http';

import { createPrincipalResolver } from './auth/principal.ts';
import { createSupabaseAuthVerifier } from './auth/supabaseAuth.ts';
import { createServerConfig } from './config.ts';
import { sendInternalError } from './http/apiErrors.ts';
import { serveProductionFile } from './http/static.ts';
import { handleAuthenticatedBoardApiRequest } from './routes/authenticatedBoard.ts';
import { handleAuthenticatedProfileApiRequest } from './routes/authenticatedProfile.ts';

const config = createServerConfig();

const vite = config.isDevelopment
  ? await import('vite').then(({ createServer: createViteServer }) =>
      createViteServer({
        appType: 'spa',
        server: { middlewareMode: true },
      })
    )
  : null;

const { createFlowboardPrismaClient } = await import('./db/prismaClient.ts');
const prisma = createFlowboardPrismaClient(config);
const authVerifier = createSupabaseAuthVerifier(config);
const principalResolver = createPrincipalResolver(config, authVerifier);

const server = createServer(async (request, response) => {
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
});

server.listen(config.port, '127.0.0.1', () => {
  console.log(`Flowboard running at http://127.0.0.1:${config.port}`);
  console.log(`Prisma database: ${config.databaseProvider}`);
  console.log(
    `Local development principal: ${config.localDevAuthEnabled ? 'on' : 'off'}`
  );
});
