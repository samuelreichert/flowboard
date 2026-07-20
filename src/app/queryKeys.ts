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

export const isPersistableFlowboardQueryKey = (
  queryKey: readonly unknown[]
) => {
  if (queryKey.length === 1 && queryKey[0] === 'profile') {
    return true;
  }

  if (queryKey[0] !== 'board') {
    return false;
  }

  if (queryKey.length === 2 && queryKey[1] === 'bootstrap') {
    return true;
  }

  if (
    queryKey.length === 4 &&
    queryKey[1] === 'work-cycles' &&
    queryKey[2] === 'history' &&
    typeof queryKey[3] === 'number'
  ) {
    return true;
  }

  if (
    queryKey.length === 5 &&
    queryKey[1] === 'work-cycles' &&
    queryKey[2] === 'history' &&
    typeof queryKey[3] === 'number' &&
    (typeof queryKey[4] === 'string' || queryKey[4] === null)
  ) {
    return true;
  }

  if (
    queryKey.length === 5 &&
    queryKey[1] === 'work-cycles' &&
    typeof queryKey[2] === 'string' &&
    queryKey[3] === 'cards' &&
    typeof queryKey[4] === 'string'
  ) {
    return true;
  }

  return (
    queryKey.length === 3 &&
    queryKey[1] === 'cards' &&
    typeof queryKey[2] === 'string'
  );
};
