import type { ResolvedTheme } from '../theme';

export const getThemeIconSrc = (theme: ResolvedTheme) =>
  theme === 'dark' ? '/icon-dark.svg' : '/icon-light.svg';
