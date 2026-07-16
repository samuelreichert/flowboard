import { formatDate, type ResolvedLanguage } from '../../localization';

export const formatCreatedAt = (value: string, language: ResolvedLanguage) =>
  formatDate(language, value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
