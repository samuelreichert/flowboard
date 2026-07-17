import { useState } from 'react';

import type { ArchivedBoardCard, CompletedWorkCycle } from '../../types';

type HistoryDetailState = {
  copyStatus: string;
  selectedCardId: string | null;
  selectedCycleId: string | null;
};

export const useHistoryDetail = ({
  copiedMessage,
  routeCard,
  routeTargetCard,
  sortedCycles,
}: {
  copiedMessage: string;
  routeCard: { cardId: string; cycleId: string } | null;
  routeTargetCard: ArchivedBoardCard | null;
  sortedCycles: CompletedWorkCycle[];
}) => {
  const [detailState, setDetailState] = useState<HistoryDetailState>({
    copyStatus: '',
    selectedCardId: null,
    selectedCycleId: null,
  });
  const { copyStatus, selectedCardId, selectedCycleId } = detailState;
  const selectedCard =
    routeTargetCard ??
    sortedCycles
      .find((cycle) => cycle.id === selectedCycleId)
      ?.cards.find((card) => card.id === selectedCardId) ??
    null;

  const copySelectedCardMarkdown = async () => {
    if (!selectedCard) {
      return;
    }

    await navigator.clipboard.writeText(selectedCard.content);
    setDetailState((currentState) => ({
      ...currentState,
      copyStatus: copiedMessage,
    }));
    window.setTimeout(
      () =>
        setDetailState((currentState) => ({
          ...currentState,
          copyStatus: '',
        })),
      1600
    );
  };

  const clearSelectedCard = () => {
    if (routeCard) {
      return false;
    }

    setDetailState({
      copyStatus: '',
      selectedCardId: null,
      selectedCycleId: null,
    });
    return true;
  };

  return {
    clearSelectedCard,
    copySelectedCardMarkdown,
    copyStatus,
    selectedCard,
  };
};
