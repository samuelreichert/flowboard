import type { ReactNode } from 'react';

import type { CardPriority } from '../../types';

type MetadataTag = {
  id: string;
  name: string;
};

type PriorityBadgeProps = {
  priority: CardPriority;
};

type TagChipProps = {
  children: ReactNode;
  overflow?: boolean;
};

type CardMetadataProps = {
  hiddenTagCount?: number;
  leading?: ReactNode;
  priority: CardPriority;
  tags: MetadataTag[];
};

export const formatPriorityLabel = (priority: CardPriority) =>
  priority.charAt(0).toUpperCase() + priority.slice(1);

export const PriorityBadge = ({ priority }: PriorityBadgeProps) => (
  <span className={`card__priority card__priority--${priority}`}>
    {formatPriorityLabel(priority)}
  </span>
);

export const TagChip = ({ children, overflow = false }: TagChipProps) => (
  <span className={`card__tag${overflow ? ' card__tag--overflow' : ''}`}>
    {children}
  </span>
);

const CardMetadata = ({
  hiddenTagCount = 0,
  leading,
  priority,
  tags,
}: CardMetadataProps) => (
  <div className="card__metadata">
    {leading}
    <PriorityBadge priority={priority} />
    {tags.map((tag) => (
      <TagChip key={tag.id}>{tag.name}</TagChip>
    ))}
    {hiddenTagCount > 0 && <TagChip overflow>+{hiddenTagCount}</TagChip>}
  </div>
);

export default CardMetadata;
export type { MetadataTag };
