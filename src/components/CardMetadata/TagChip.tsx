import type { ReactNode } from 'react';

type TagChipProps = {
  children: ReactNode;
  overflow?: boolean;
};

const TagChip = ({ children, overflow = false }: TagChipProps) => (
  <span className={`card__tag${overflow ? ' card__tag--overflow' : ''}`}>
    {children}
  </span>
);

export default TagChip;
