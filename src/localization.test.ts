import { beforeEach, expect, test, vi } from 'vitest';

import {
  DEFAULT_LANGUAGE_PREFERENCE,
  fetchLanguagePreference,
  getMessages,
  isLanguagePreference,
  isResolvedLanguage,
  resolveBrowserLanguage,
  resolveLanguagePreference,
  updateLanguagePreference,
} from './localization';

beforeEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});

test('validates language preferences and resolved languages', () => {
  expect(isLanguagePreference('system')).toBe(true);
  expect(isLanguagePreference('en')).toBe(true);
  expect(isLanguagePreference('pt-BR')).toBe(true);
  expect(isLanguagePreference('pt-PT')).toBe(false);

  expect(isResolvedLanguage('en')).toBe(true);
  expect(isResolvedLanguage('pt-BR')).toBe(true);
  expect(isResolvedLanguage('system')).toBe(false);
});

test('fetches the default language preference when storage is empty or invalid', () => {
  expect(fetchLanguagePreference()).toBe(DEFAULT_LANGUAGE_PREFERENCE);

  localStorage.setItem('flowboardLanguagePreference', 'pt-PT');

  expect(fetchLanguagePreference()).toBe(DEFAULT_LANGUAGE_PREFERENCE);
});

test('updates and fetches language preference from storage', () => {
  updateLanguagePreference('pt-BR');

  expect(fetchLanguagePreference()).toBe('pt-BR');
  expect(localStorage.getItem('flowboardLanguagePreference')).toBe('pt-BR');
});

test('resolves browser language with Portuguese locales mapped to Brazilian Portuguese', () => {
  expect(resolveBrowserLanguage(['pt-BR', 'en-US'])).toBe('pt-BR');
  expect(resolveBrowserLanguage(['pt-PT', 'en-US'])).toBe('pt-BR');
  expect(resolveBrowserLanguage(['pt', 'en-US'])).toBe('pt-BR');
  expect(resolveBrowserLanguage(['fr-FR', 'en-US'])).toBe('en');
  expect(resolveBrowserLanguage(['fr-FR'])).toBe('en');
  expect(resolveBrowserLanguage([])).toBe('en');
});

test('resolves language preference from explicit and system values', () => {
  expect(resolveLanguagePreference('system', 'pt-BR')).toBe('pt-BR');
  expect(resolveLanguagePreference('system', 'en')).toBe('en');
  expect(resolveLanguagePreference('pt-BR', 'en')).toBe('pt-BR');
  expect(resolveLanguagePreference('en', 'pt-BR')).toBe('en');
});

test('Brazilian Portuguese catalog matches English catalog shape', () => {
  expect(getMessages('pt-BR').settings.title).toBe('Configurações');
  expect(
    getMessages('pt-BR').language.browserOption('Português (Brasil)')
  ).toBe('Idioma do navegador (Português (Brasil))');
});
