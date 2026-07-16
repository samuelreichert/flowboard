import { Select } from '@base-ui/react/select';
import { Toolbar } from '@base-ui/react/toolbar';
import { Check, ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import type { ReactNode } from 'react';

import type { ToolbarSelectOption } from './types';

type ToolbarButtonProps = {
  active?: boolean;
  children: ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
};

type ToolbarSelectProps<TValue extends string> = {
  active?: boolean;
  disabled?: boolean;
  fallbackOption?: ToolbarSelectOption<TValue>;
  label: string;
  onValueChange: (value: TValue) => void;
  options: ToolbarSelectOption<TValue>[];
  value: TValue;
};

type ToolbarHintProps = {
  children: (props: {
    hint: ReactNode;
    hintTriggerProps: {
      onBlur: () => void;
      onFocus: () => void;
      onPointerEnter: () => void;
      onPointerLeave: () => void;
    };
  }) => ReactNode;
  label: string;
};

export const ToolbarHint = ({ children, label }: ToolbarHintProps) => {
  const [open, setOpen] = useState(false);
  const hintId = useId();
  const hint = open ? (
    <span aria-hidden="true" className="editor-toolbar__hover-label" id={hintId}>
      {label}
    </span>
  ) : null;

  return children({
    hint,
    hintTriggerProps: {
      onBlur: () => setOpen(false),
      onFocus: () => setOpen(true),
      onPointerEnter: () => setOpen(true),
      onPointerLeave: () => setOpen(false),
    },
  });
};

export const ToolbarButton = ({
  active = false,
  children,
  disabled = false,
  label,
  onClick,
}: ToolbarButtonProps) => (
  <ToolbarHint label={label}>
    {({ hint, hintTriggerProps }) => (
      <Toolbar.Button
        aria-disabled={disabled}
        aria-label={label}
        aria-pressed={active}
        className={`editor-toolbar__button ${active ? 'editor-toolbar__button--active' : ''}`}
        data-disabled={disabled ? '' : undefined}
        onClick={(event) => {
          if (disabled) {
            event.preventDefault();
            return;
          }

          onClick();
        }}
        onMouseDown={(event) => event.preventDefault()}
        tabIndex={disabled ? -1 : undefined}
        type="button"
        {...hintTriggerProps}
      >
        {children}
        {hint}
      </Toolbar.Button>
    )}
  </ToolbarHint>
);

export const ToolbarSelect = <TValue extends string>({
  active = false,
  disabled = false,
  fallbackOption,
  label,
  onValueChange,
  options,
  value,
}: ToolbarSelectProps<TValue>) => {
  const selectLabelId = useId();
  const selectedOption =
    options.find((option) => option.value === value) ??
    fallbackOption ??
    options[0];
  const triggerLabel = selectedOption.triggerLabel ?? selectedOption.label;

  return (
    <Select.Root
      onValueChange={(nextValue) => {
        if (nextValue) {
          onValueChange(nextValue as TValue);
        }
      }}
      value={value}
    >
      <span className="editor-toolbar__accessible-label" id={selectLabelId}>
        {label}
      </span>
      <ToolbarHint label={triggerLabel}>
        {({ hint, hintTriggerProps }) => (
          <Toolbar.Button
            aria-label={`${label}: ${triggerLabel}`}
            aria-labelledby={selectLabelId}
            aria-pressed={active}
            className={`editor-toolbar__select-trigger ${active ? 'editor-toolbar__button--active' : ''}`}
            disabled={disabled}
            render={<Select.Trigger />}
            {...hintTriggerProps}
          >
            <span
              className="editor-toolbar__select-trigger-icon"
              title={triggerLabel}
            >
              {selectedOption.icon}
            </span>
            <Select.Icon className="editor-toolbar__select-icon">
              <ChevronDown size={14} />
            </Select.Icon>
            {hint}
          </Toolbar.Button>
        )}
      </ToolbarHint>
      <Select.Portal>
        <Select.Positioner
          align="start"
          className="editor-toolbar__select-positioner"
          sideOffset={5}
        >
          <Select.Popup className="editor-toolbar__select-popup">
            <Select.List>
              {options.map((option) => (
                <Select.Item
                  className="editor-toolbar__select-item"
                  key={option.value}
                  value={option.value}
                >
                  <Select.ItemText>
                    <span className="editor-toolbar__select-label">
                      {option.icon}
                      <span>{option.label}</span>
                    </span>
                  </Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={14} />
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
