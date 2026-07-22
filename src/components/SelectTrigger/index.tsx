import { Select } from '@base-ui/react/select';
import type { ReactNode } from 'react';

type SelectTriggerProps = {
  ariaLabel?: string;
  children: ReactNode;
  className: string;
};

const SelectTrigger = ({
  ariaLabel,
  children,
  className,
}: SelectTriggerProps) => (
  <Select.Trigger aria-label={ariaLabel} className={className}>
    {children}
  </Select.Trigger>
);

export default SelectTrigger;
