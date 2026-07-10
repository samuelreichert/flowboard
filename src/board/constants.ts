import { DEFAULT_CARD_PRIORITY } from './cardPriority.ts';
import type { BoardBackground } from './types.ts';

export const CARD_CONTENT_LIMIT = 100_000;

export const DEFAULT_BACKGROUND: BoardBackground = {
  type: 'image',
  value: '/flowboard-background.png',
};

export { DEFAULT_CARD_PRIORITY };
