import type { CardPriority } from '../../types';
import PriorityBadge from './PriorityBadge';
import TagChip from './TagChip';

type MetadataTag = {
  id: string;
  name: string;
};

type CardMetadataProps = {
  hiddenTagCount?: number;
  leadingClassName?: string;
  leadingText?: string;
  priority: CardPriority;
  tags: MetadataTag[];
};

const CardMetadata = ({
  hiddenTagCount = 0,
  leadingClassName,
  leadingText,
  priority,
  tags,
}: CardMetadataProps) => (
  <div className="card__metadata">
    {leadingText && <span className={leadingClassName}>{leadingText}</span>}
    <PriorityBadge priority={priority} />
    {tags.map((tag) => (
      <TagChip key={tag.id}>{tag.name}</TagChip>
    ))}
    {hiddenTagCount > 0 && <TagChip overflow>+{hiddenTagCount}</TagChip>}
  </div>
);

export default CardMetadata;
export { default as PriorityBadge } from './PriorityBadge';
export { default as TagChip } from './TagChip';
export { formatPriorityLabel } from './formatPriorityLabel';
export type { MetadataTag };
