import { Button } from '@base-ui/react/button';
import type { CSSProperties, ReactNode } from 'react';

import './SegmentedControl.css';

type SegmentedControlOption<T extends string> = {
  ariaLabel?: string;
  icon?: ReactNode;
  label: string;
  title?: string;
  value: T;
};

type SegmentedControlProps<T extends string> = {
  ariaLabel: string;
  className?: string;
  onValueChange: (value: T) => void;
  options: SegmentedControlOption<T>[];
  value: T;
};

type SegmentedControlStyle = CSSProperties & {
  '--segmented-control-count': number;
  '--segmented-control-selected-index': number;
};

const SegmentedControl = <T extends string>({
  ariaLabel,
  className,
  onValueChange,
  options,
  value,
}: SegmentedControlProps<T>) => {
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );
  const style: SegmentedControlStyle = {
    '--segmented-control-count': options.length,
    '--segmented-control-selected-index': selectedIndex,
  };

  return (
    <fieldset
      aria-label={ariaLabel}
      className={['segmented-control', className].filter(Boolean).join(' ')}
      data-selected-value={value}
      style={style}
    >
      {options.map((option) => (
        <Button
          aria-label={option.ariaLabel ?? option.label}
          aria-pressed={value === option.value}
          className="segmented-control__button"
          key={option.value}
          onClick={() => onValueChange(option.value)}
          title={option.title ?? option.label}
          type="button"
        >
          {option.icon}
          <span>{option.label}</span>
        </Button>
      ))}
    </fieldset>
  );
};

export default SegmentedControl;
export type { SegmentedControlOption };
