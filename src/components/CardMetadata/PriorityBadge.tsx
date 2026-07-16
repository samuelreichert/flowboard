import { useLocalization } from '../../LocalizationProvider';
import type { CardPriority } from '../../types';

type PriorityBadgeProps = {
  priority: CardPriority;
};

const PriorityBadge = ({ priority }: PriorityBadgeProps) => {
  const { messages } = useLocalization();

  return (
    <span className={`card__priority card__priority--${priority}`}>
      {messages.priority[priority]}
    </span>
  );
};

export default PriorityBadge;
