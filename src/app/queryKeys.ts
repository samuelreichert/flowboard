export const queryKeys = {
  board: {
    bootstrap: ['board', 'bootstrap'] as const,
    card: (cardId: string) => ['board', 'cards', cardId] as const,
  },
  profile: ['profile'] as const,
};

export const isPersistableFlowboardQueryKey = (queryKey: readonly unknown[]) => {
  if (queryKey.length === 1 && queryKey[0] === 'profile') {
    return true;
  }

  if (queryKey[0] !== 'board') {
    return false;
  }

  if (queryKey.length === 2 && queryKey[1] === 'bootstrap') {
    return true;
  }

  return (
    queryKey.length === 3 &&
    queryKey[1] === 'cards' &&
    typeof queryKey[2] === 'string'
  );
};
