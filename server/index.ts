import { createServer } from 'node:http';

import { createServerConfig } from './config.ts';
import { createBoardRepository } from './db/boardRepository.ts';
import { sendJson } from './http/json.ts';
import { serveProductionFile } from './http/static.ts';
import { handleBoardApiRequest } from './routes/board.ts';

const config = createServerConfig();
const boardRepository = createBoardRepository(config.databasePath);

const vite = config.isDevelopment
  ? await import('vite').then(({ createServer: createViteServer }) =>
      createViteServer({
        appType: 'spa',
        server: { middlewareMode: true },
      })
    )
  : null;

const server = createServer(async (request, response) => {
  try {
    if (await handleBoardApiRequest(request, response, boardRepository)) {
      return;
    }

    if (vite) {
      vite.middlewares(request, response);
      return;
    }

    serveProductionFile(request, response, config.distDirectory);
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: 'Internal server error.' });
  }
});

server.listen(config.port, '127.0.0.1', () => {
  console.log(`Flowboard running at http://127.0.0.1:${config.port}`);
  console.log(`SQLite database: ${config.databasePath}`);
});
