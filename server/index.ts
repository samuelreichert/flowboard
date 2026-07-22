import { createServer } from 'node:http';

import { createFlowboardApp } from './app.js';

const { config, handleRequest } = await createFlowboardApp();
const server = createServer(handleRequest);

server.listen(config.port, '127.0.0.1', () => {
  console.log(`Flowboard running at http://127.0.0.1:${config.port}`);
  console.log(`Prisma database: ${config.databaseProvider}`);
  console.log(
    `Local development principal: ${config.localDevAuthEnabled ? 'on' : 'off'}`
  );
});
