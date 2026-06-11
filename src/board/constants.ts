import type { BoardBackground, CardPriority } from './types.js';

export const CARD_CONTENT_LIMIT = 100_000;
export const DEFAULT_CARD_PRIORITY: CardPriority = 'medium';

export const DEFAULT_BACKGROUND: BoardBackground = {
  type: 'image',
  value: '/flowboard-background.png',
};
