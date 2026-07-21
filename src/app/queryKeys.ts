export const queryKeys = {
  board: {
    bootstrap: ['board', 'bootstrap'] as const,
    card: (cardId: string) => ['board', 'cards', cardId] as const,
    history: (limit: number) =>
      ['board', 'work-cycles', 'history', limit] as const,
    historyPage: (limit: number, cursor: string | null = null) =>
      ['board', 'work-cycles', 'history', limit, cursor] as const,
    archivedCard: (cycleId: string, cardId: string) =>
      ['board', 'work-cycles', cycleId, 'cards', cardId] as const,
  },
  profile: ['profile'] as const,
};
