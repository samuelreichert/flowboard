import { Select } from '@base-ui/react/select';
import { Check, ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

type DialogSelectOption<T extends string> = {
  label: ReactNode;
  value: T;
};

type DialogSelectProps<T extends string> = {
  ariaLabel?: string;
  label?: ReactNode;
  name: string;
  onValueChange: (value: T) => void;
  options: DialogSelectOption<T>[];
  renderValue: (value: T | null) => ReactNode;
  value: T;
};

const DialogSelect = <T extends string>({
  ariaLabel,
  label,
  name,
  onValueChange,
  options,
  renderValue,
  value,
}: DialogSelectProps<T>) => (
  <Select.Root
    name={name}
    onValueChange={(nextValue) => onValueChange(nextValue as T)}
    value={value}
  >
    {label ? (
      <div className="dialog-field">
        <Select.Label className="dialog-label">{label}</Select.Label>
        <Select.Trigger
          aria-label={ariaLabel}
          className="dialog-input dialog-select__trigger"
        >
          <Select.Value className="dialog-select__value">
            {(selectedValue: T | null) => renderValue(selectedValue)}
          </Select.Value>
          <Select.Icon className="dialog-select__icon">
            <ChevronDown size={17} />
          </Select.Icon>
        </Select.Trigger>
      </div>
    ) : (
      <Select.Trigger
        aria-label={ariaLabel}
        className="dialog-input dialog-select__trigger"
      >
        <Select.Value className="dialog-select__value">
          {(selectedValue: T | null) => renderValue(selectedValue)}
        </Select.Value>
        <Select.Icon className="dialog-select__icon">
          <ChevronDown size={17} />
        </Select.Icon>
      </Select.Trigger>
    )}
    <Select.Portal>
      <Select.Positioner
        align="start"
        alignItemWithTrigger={false}
        className="dialog-select__positioner"
        collisionPadding={8}
        sideOffset={5}
      >
        <Select.Popup className="dialog-select__popup">
          <Select.List>
            {options.map((option) => (
              <Select.Item
                className="dialog-select__item"
                key={option.value}
                value={option.value}
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <Check size={15} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.List>
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>
);

export default DialogSelect;
export type { DialogSelectOption };
