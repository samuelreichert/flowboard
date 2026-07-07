const THEME_PREFERENCES = ['system', 'light', 'dark'] as const;

export type ThemePreference = (typeof THEME_PREFERENCES)[number];
export type ResolvedTheme = Exclude<ThemePreference, 'system'>;

const THEME_STORAGE_KEY = 'flowboardThemePreference';

export const DEFAULT_THEME_PREFERENCE: ThemePreference = 'system';

export const isThemePreference = (value: unknown): value is ThemePreference =>
  typeof value === 'string' &&
  THEME_PREFERENCES.includes(value as ThemePreference);

export const fetchThemePreference = (): ThemePreference => {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(value) ? value : DEFAULT_THEME_PREFERENCE;
  } catch {
    return DEFAULT_THEME_PREFERENCE;
  }
};

export const updateThemePreference = (preference: ThemePreference) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // The app remains usable if browser storage is unavailable.
  }
};

export const getSystemTheme = (): ResolvedTheme => {
  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }

  return 'light';
};

export const resolveThemePreference = (
  preference: ThemePreference,
  systemTheme: ResolvedTheme = getSystemTheme()
): ResolvedTheme => (preference === 'system' ? systemTheme : preference);
