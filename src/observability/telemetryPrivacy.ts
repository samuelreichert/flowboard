import { APP_ROUTES } from '../app/routes';

type TelemetryUrlEvent = {
  url: string;
};

export const protectTelemetryEvent = <T extends TelemetryUrlEvent>(
  event: T
): T | null => {
  try {
    const url = new URL(event.url);

    if (
      url.pathname === APP_ROUTES.authCallback &&
      (url.search.length > 0 || url.hash.length > 0)
    ) {
      return null;
    }

    url.search = '';
    url.hash = '';

    return {
      ...event,
      url: url.toString(),
    };
  } catch {
    return null;
  }
};
