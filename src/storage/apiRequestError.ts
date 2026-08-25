export class ApiRequestError extends Error {
  readonly code: string | null;
  readonly status: number;

  constructor({
    code,
    message,
    status,
  }: {
    code: string | null;
    message: string;
    status: number;
  }) {
    super(message);
    this.name = 'ApiRequestError';
    this.code = code;
    this.status = status;
  }
}

const readApiErrorCode = async (response: Response) => {
  try {
    const body: unknown = await response.json();

    if (
      typeof body === 'object' &&
      body !== null &&
      'error' in body &&
      typeof body.error === 'object' &&
      body.error !== null &&
      'code' in body.error &&
      typeof body.error.code === 'string'
    ) {
      return body.error.code;
    }
  } catch {
    // The status and safe fallback remain available when the body is unreadable.
  }

  return null;
};

export const createApiRequestError = async (
  response: Response,
  fallbackMessage: string
) =>
  new ApiRequestError({
    code: await readApiErrorCode(response),
    message: fallbackMessage,
    status: response.status,
  });

export const isApiRequestErrorWithStatus = (
  error: unknown,
  status: number
): error is ApiRequestError =>
  error instanceof ApiRequestError && error.status === status;

export const shouldRetryApiRequest = (failureCount: number, error: unknown) => {
  if (
    error instanceof ApiRequestError &&
    error.status >= 400 &&
    error.status < 500 &&
    error.status !== 408 &&
    error.status !== 429
  ) {
    return false;
  }

  return failureCount < 3;
};
