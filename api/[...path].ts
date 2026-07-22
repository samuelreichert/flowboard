import type { IncomingMessage, ServerResponse } from 'node:http';

// Vercel runs the API adapter after `npm run build` has emitted the server's
// TypeScript output. Loading that output keeps the deployed function and the
// local Node server on the same module graph without committing JavaScript
// source files.
type FlowboardApp = ReturnType<
  typeof import('../server/app.ts').createFlowboardApp
>;

// Keep this path dynamic: a static import makes TypeScript treat the generated
// declaration files in dist-server as source inputs and prevents the build
// from emitting them. Vercel explicitly includes dist-server for this function.
const serverAppModule = new URL(
  '../dist-server/server/app.js',
  import.meta.url
).href;

const app: FlowboardApp = import(serverAppModule).then(({ createFlowboardApp }) =>
  createFlowboardApp()
);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  request: IncomingMessage,
  response: ServerResponse
) {
  const { handleRequest } = await app;
  await handleRequest(request, response);
}
