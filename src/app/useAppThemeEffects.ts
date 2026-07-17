import { useEffect } from 'react';
import type { Dispatch } from 'react';

import {
  getSystemTheme,
  updateThemePreference,
  type ResolvedTheme,
  type ThemePreference,
} from '../theme';
import {
  updateLanguagePreference,
  type LanguagePreference,
  type ResolvedLanguage,
} from '../localization';
import type { AppAction } from './appTypes';
import { getThemeIconSrc } from './appTheme';

const useAppThemeEffects = ({
  dispatch,
  resolvedLanguage,
  resolvedTheme,
  themePreference,
}: {
  dispatch: Dispatch<AppAction>;
  resolvedLanguage: ResolvedLanguage;
  resolvedTheme: ResolvedTheme;
  themePreference: ThemePreference;
}) => {
  useEffect(() => {
    if (
      themePreference !== 'system' ||
      typeof window.matchMedia !== 'function'
    ) {
      return;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystemThemeChange = () =>
      dispatch({
        resolvedTheme: getSystemTheme(),
        type: 'systemThemeChanged',
      });

    media.addEventListener('change', onSystemThemeChange);

    return () => media.removeEventListener('change', onSystemThemeChange);
  }, [dispatch, themePreference]);

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    let favicon = document.querySelector<HTMLLinkElement>('#flowboard-favicon');

    if (!favicon) {
      favicon = document.createElement('link');
      favicon.id = 'flowboard-favicon';
      favicon.rel = 'icon';
      favicon.type = 'image/svg+xml';
      document.head.append(favicon);
    }

    favicon.href = getThemeIconSrc(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    document.documentElement.lang = resolvedLanguage;
  }, [resolvedLanguage]);

  const chooseThemePreference = (preference: ThemePreference) => {
    dispatch({ preference, type: 'themePreferenceChanged' });
    updateThemePreference(preference);
  };

  const chooseLanguagePreference = (preference: LanguagePreference) => {
    dispatch({ preference, type: 'languagePreferenceChanged' });
    updateLanguagePreference(preference);
  };

  return {
    chooseLanguagePreference,
    chooseThemePreference,
  };
};

export default useAppThemeEffects;
