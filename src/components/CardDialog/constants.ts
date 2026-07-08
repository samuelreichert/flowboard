import type { CardPriority } from '../../types';

export const DEFAULT_CARD_PRIORITY: CardPriority = 'medium';

export const PRIORITY_OPTIONS: { label: string; value: CardPriority }[] = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];
