import { describe, expect, test, vi } from 'vitest';

import {
  ApiRequestError,
  createApiRequestError,
  isApiRequestErrorWithStatus,
  shouldRetryApiRequest,
} from './apiRequestError';

describe('API request errors', () => {
  test('preserves structured response status and error code', async () => {
    const error = await createApiRequestError(
      new Response(
        JSON.stringify({
          error: { code: 'not_found', message: 'Resource not found.' },
        }),
        { status: 404 }
      ),
      'Unable to load archived card detail.'
    );

    expect(error).toMatchObject({
      code: 'not_found',
      message: 'Unable to load archived card detail.',
      name: 'ApiRequestError',
      status: 404,
    });
    expect(isApiRequestErrorWithStatus(error, 404)).toBe(true);
  });

  test('uses the safe fallback for unstructured responses', async () => {
    const error = await createApiRequestError(
      new Response(JSON.stringify({ error: 'Unavailable' }), { status: 503 }),
      'Unable to load completed work history.'
    );

    expect(error).toEqual(
      expect.objectContaining({
        code: null,
        message: 'Unable to load completed work history.',
        status: 503,
      })
    );
  });

  test('retains status when the response body is unreadable', async () => {
    const response = new Response(null, { status: 502 });

    vi.spyOn(response, 'json').mockRejectedValue(new Error('Unreadable body'));

    await expect(
      createApiRequestError(response, 'Unable to load completed work history.')
    ).resolves.toEqual(
      expect.objectContaining({
        code: null,
        message: 'Unable to load completed work history.',
        status: 502,
      })
    );
  });

  test('does not retry terminal client errors and bounds transient retries', () => {
    const notFound = new ApiRequestError({
      code: 'not_found',
      message: 'Missing',
      status: 404,
    });
    const unavailable = new ApiRequestError({
      code: 'internal_error',
      message: 'Unavailable',
      status: 500,
    });

    expect(shouldRetryApiRequest(0, notFound)).toBe(false);
    expect(shouldRetryApiRequest(2, unavailable)).toBe(true);
    expect(shouldRetryApiRequest(3, unavailable)).toBe(false);
  });
});
