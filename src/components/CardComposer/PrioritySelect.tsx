import { Select } from '@base-ui/react/select';
import { Check, ChevronDown } from 'lucide-react';

import { useLocalization } from '../../LocalizationProvider';
import type { CardPriority } from '../../types';
import SelectTrigger from '../SelectTrigger';

export type PriorityOption = {
  label: string;
  value: CardPriority;
};

type PrioritySelectProps = {
  onValueChange: (value: CardPriority) => void;
  options: PriorityOption[];
  value: CardPriority;
};

const PrioritySelect = ({
  onValueChange,
  options,
  value,
}: PrioritySelectProps) => {
  const { messages } = useLocalization();

  return (
    <Select.Root
      name="composer-priority"
      onValueChange={(nextValue) => onValueChange(nextValue as CardPriority)}
      value={value}
    >
      <SelectTrigger
        ariaLabel={messages.card.priority}
        className={`card-composer__chip card-composer__priority card-composer__priority--${value}`}
      >
        <Select.Value className="card-composer__chip-value">
          {(selectedValue: CardPriority | null) =>
            selectedValue
              ? messages.priority[selectedValue]
              : messages.common.choosePriority
          }
        </Select.Value>
        <Select.Icon className="card-composer__chip-icon">
          <ChevronDown size={15} strokeWidth={1.5} />
        </Select.Icon>
      </SelectTrigger>
      <Select.Portal>
        <Select.Positioner
          align="start"
          className="card-composer__select-positioner"
          sideOffset={6}
        >
          <Select.Popup className="card-composer__popup">
            <Select.List>
              {options.map((option) => (
                <Select.Item
                  className="card-composer__option"
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
};

export default PrioritySelect;
