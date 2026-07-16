import { Select } from '@base-ui/react/select';
import { Check, ChevronDown } from 'lucide-react';

import { useLocalization } from '../../LocalizationProvider';
import type { BoardColumn } from '../../types';

type ColumnSelectProps = {
  columns: BoardColumn[];
  onValueChange: (value: string) => void;
  value: string;
};

const ColumnSelect = ({ columns, onValueChange, value }: ColumnSelectProps) => {
  const { messages } = useLocalization();

  return (
    <Select.Root
      name="composer-column"
      onValueChange={(nextValue) => {
        if (nextValue) {
          onValueChange(nextValue);
        }
      }}
      value={value}
    >
      <Select.Trigger
        aria-label={messages.composer.destinationColumn}
        className="card-composer__chip"
      >
        <Select.Value className="card-composer__chip-value">
          {(selectedValue: string | null) =>
            columns.find((column) => column.id === selectedValue)?.title ??
            messages.common.chooseColumn
          }
        </Select.Value>
        <Select.Icon className="card-composer__chip-icon">
          <ChevronDown size={15} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner
          align="start"
          className="card-composer__select-positioner"
          sideOffset={6}
        >
          <Select.Popup className="card-composer__popup">
            <Select.List>
              {columns.map((column) => (
                <Select.Item
                  className="card-composer__option"
                  key={column.id}
                  value={column.id}
                >
                  <Select.ItemText>{column.title}</Select.ItemText>
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

export default ColumnSelect;
