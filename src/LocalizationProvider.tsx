import { createContext, type ReactNode, useContext, useMemo } from 'react';

import {
  formatDate,
  getMessages,
  type Messages,
  type ResolvedLanguage,
} from './localization';

type LocalizationContextValue = {
  formatDate: (value: string, options?: Intl.DateTimeFormatOptions) => string;
  language: ResolvedLanguage;
  messages: Messages;
};

const defaultLanguage: ResolvedLanguage = 'en';

const LocalizationContext = createContext<LocalizationContextValue>({
  formatDate: (value, options) => formatDate(defaultLanguage, value, options),
  language: defaultLanguage,
  messages: getMessages(defaultLanguage),
});

type LocalizationProviderProps = {
  children: ReactNode;
  language: ResolvedLanguage;
};

export const LocalizationProvider = ({
  children,
  language,
}: LocalizationProviderProps) => {
  const value = useMemo<LocalizationContextValue>(
    () => ({
      formatDate: (dateValue, options) =>
        formatDate(language, dateValue, options),
      language,
      messages: getMessages(language),
    }),
    [language]
  );

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => useContext(LocalizationContext);
