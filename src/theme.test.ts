import { beforeEach, expect, test, vi } from 'vitest';

import {
  DEFAULT_THEME_PREFERENCE,
  fetchThemePreference,
  getSystemTheme,
  isThemePreference,
  resolveThemePreference,
  updateThemePreference,
} from './theme';

beforeEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});

test('validates theme preferences', () => {
  expect(isThemePreference('system')).toBe(true);
  expect(isThemePreference('light')).toBe(true);
  expect(isThemePreference('dark')).toBe(true);
  expect(isThemePreference('auto')).toBe(false);
});

test('fetches the default theme preference when storage is empty or invalid', () => {
  expect(fetchThemePreference()).toBe(DEFAULT_THEME_PREFERENCE);

  localStorage.setItem('flowboardThemePreference', 'auto');

  expect(fetchThemePreference()).toBe(DEFAULT_THEME_PREFERENCE);
});

test('updates and fetches theme preference from storage', () => {
  updateThemePreference('dark');

  expect(fetchThemePreference()).toBe('dark');
  expect(localStorage.getItem('flowboardThemePreference')).toBe('dark');
});

test('resolves system theme from the provided system value', () => {
  expect(resolveThemePreference('system', 'dark')).toBe('dark');
  expect(resolveThemePreference('system', 'light')).toBe('light');
  expect(resolveThemePreference('dark', 'light')).toBe('dark');
  expect(resolveThemePreference('light', 'dark')).toBe('light');
});

test('reads system dark preference from matchMedia', () => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches: true,
    })
  );

  expect(getSystemTheme()).toBe('dark');
});
