import { describe, expect, test } from 'vitest';

import { protectTelemetryEvent } from './telemetryPrivacy';

describe('protectTelemetryEvent', () => {
  test.each([
    'https://flowboard.example/auth/callback?code=synthetic-pkce-code&next=%2Fhistory',
    'https://flowboard.example/auth/callback#access_token=synthetic-access-token&refresh_token=synthetic-refresh-token',
    'https://flowboard.example/auth/callback?error=access_denied&error_description=synthetic-provider-error',
    'https://flowboard.example/auth/callback#provider_token=synthetic-provider-token',
  ])('suppresses a parameterized auth callback: %s', (url) => {
    expect(protectTelemetryEvent({ url })).toBeNull();
  });

  test('strips query strings and fragments from an ordinary route', () => {
    expect(
      protectTelemetryEvent({
        route: '/board',
        url: 'https://flowboard.example/board?focus=title#editor',
      })
    ).toEqual({
      route: '/board',
      url: 'https://flowboard.example/board',
    });
  });

  test('preserves unrelated event fields', () => {
    const event = {
      dsn: 'synthetic-dsn',
      route: '/history',
      timestamp: 42,
      url: 'https://flowboard.example/history?cycle=7#card',
    };

    expect(protectTelemetryEvent(event)).toEqual({
      ...event,
      url: 'https://flowboard.example/history',
    });
  });

  test('allows an unparameterized auth callback without adding data', () => {
    expect(
      protectTelemetryEvent({
        url: 'https://flowboard.example/auth/callback',
      })
    ).toEqual({
      url: 'https://flowboard.example/auth/callback',
    });
  });

  test('fails closed when the event URL is malformed', () => {
    expect(protectTelemetryEvent({ url: 'not an absolute URL' })).toBeNull();
  });
});
