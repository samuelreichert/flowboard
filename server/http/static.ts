import { createReadStream, existsSync, statSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { extname, join, normalize } from 'node:path';

const contentTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

export const serveProductionFile = (
  request: IncomingMessage,
  response: ServerResponse,
  distDirectory: string
) => {
  const requestedPath = normalize(
    decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname)
  );
  const relativePath =
    requestedPath === '/' ? 'index.html' : requestedPath.replace(/^\/+/, '');
  const candidatePath = join(distDirectory, relativePath);
  const filePath =
    candidatePath.startsWith(`${distDirectory}/`) &&
    existsSync(candidatePath) &&
    statSync(candidatePath).isFile()
      ? candidatePath
      : join(distDirectory, 'index.html');

  response.writeHead(200, {
    'Content-Type':
      contentTypes[extname(filePath)] ?? 'application/octet-stream',
  });
  createReadStream(filePath).pipe(response);
};
