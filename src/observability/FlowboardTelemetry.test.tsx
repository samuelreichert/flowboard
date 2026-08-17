import { render } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

type SyntheticTelemetryEvent = {
  type: 'pageview' | 'vital';
  url: string;
};

type BeforeSend = (
  event: SyntheticTelemetryEvent
) => SyntheticTelemetryEvent | null;

const mocks = vi.hoisted(() => ({
  analyticsBeforeSend: undefined as BeforeSend | undefined,
  speedInsightsBeforeSend: undefined as BeforeSend | undefined,
}));

vi.mock('@vercel/analytics/react', () => ({
  Analytics: ({ beforeSend }: { beforeSend: BeforeSend }) => {
    mocks.analyticsBeforeSend = beforeSend;
    return null;
  },
}));

vi.mock('@vercel/speed-insights/react', () => ({
  SpeedInsights: ({ beforeSend }: { beforeSend: BeforeSend }) => {
    mocks.speedInsightsBeforeSend = beforeSend;
    return null;
  },
}));

import FlowboardTelemetry from './FlowboardTelemetry';

test('protects both telemetry collectors at their beforeSend boundary', () => {
  render(<FlowboardTelemetry />);

  expect(mocks.analyticsBeforeSend).toBeDefined();
  expect(mocks.speedInsightsBeforeSend).toBeDefined();
  expect(mocks.analyticsBeforeSend).toBe(mocks.speedInsightsBeforeSend);

  const callbackUrl =
    'https://flowboard.example/auth/callback?code=synthetic-pkce-code&next=%2Fhistory';

  expect(
    mocks.analyticsBeforeSend?.({ type: 'pageview', url: callbackUrl })
  ).toBeNull();
  expect(
    mocks.speedInsightsBeforeSend?.({ type: 'vital', url: callbackUrl })
  ).toBeNull();

  expect(
    mocks.analyticsBeforeSend?.({
      type: 'pageview',
      url: 'https://flowboard.example/board?focus=title#editor',
    })
  ).toEqual({
    type: 'pageview',
    url: 'https://flowboard.example/board',
  });
  expect(
    mocks.speedInsightsBeforeSend?.({
      type: 'vital',
      url: 'https://flowboard.example/history?cycle=7#card',
    })
  ).toEqual({
    type: 'vital',
    url: 'https://flowboard.example/history',
  });
});
