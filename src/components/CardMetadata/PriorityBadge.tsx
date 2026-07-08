import type { CardPriority } from '../../types';
import { formatPriorityLabel } from './formatPriorityLabel';

type PriorityBadgeProps = {
  priority: CardPriority;
};

const PriorityBadge = ({ priority }: PriorityBadgeProps) => (
  <span className={`card__priority card__priority--${priority}`}>
    {formatPriorityLabel(priority)}
  </span>
);

export default PriorityBadge;
