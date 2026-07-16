import { InlineEmptyState } from '../EmptyState';
import { useLocalization } from '../../LocalizationProvider';

type ActiveCardMissingStateProps = {
  activeCardId: string | null;
  boardLoading: boolean;
  hasActiveCardTarget: boolean;
};

const ActiveCardMissingState = ({
  activeCardId,
  boardLoading,
  hasActiveCardTarget,
}: ActiveCardMissingStateProps) => {
  const { messages } = useLocalization();

  if (!activeCardId || hasActiveCardTarget || boardLoading) {
    return null;
  }

  return (
    <InlineEmptyState
      className="columns-board__route-missing"
      variant="surface"
    >
      {messages.board.cardNotFound}
    </InlineEmptyState>
  );
};

export default ActiveCardMissingState;
