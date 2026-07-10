export const CARD_PRIORITIES = ['low', 'medium', 'high'] as const;

export type CardPriority = (typeof CARD_PRIORITIES)[number];

export const DEFAULT_CARD_PRIORITY: CardPriority = 'medium';

export const formatPriorityLabel = (priority: CardPriority) =>
  priority.charAt(0).toUpperCase() + priority.slice(1);

export const CARD_PRIORITY_OPTIONS: {
  label: string;
  value: CardPriority;
}[] = CARD_PRIORITIES.map((priority) => ({
  label: formatPriorityLabel(priority),
  value: priority,
}));
