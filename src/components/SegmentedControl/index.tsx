import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';
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
    <ToggleGroup
      aria-label={ariaLabel}
      className={['segmented-control', className].filter(Boolean).join(' ')}
      data-selected-value={value}
      onValueChange={(nextValues) => {
        const nextValue = nextValues[0];

        if (nextValue) {
          onValueChange(nextValue as T);
        }
      }}
      style={style}
      value={[value]}
    >
      {options.map((option) => (
        <Toggle
          aria-label={option.ariaLabel ?? option.label}
          className="segmented-control__button"
          key={option.value}
          title={option.title ?? option.label}
          value={option.value}
        >
          {option.icon}
          <span>{option.label}</span>
        </Toggle>
      ))}
    </ToggleGroup>
  );
};

export default SegmentedControl;
export type { SegmentedControlOption };
