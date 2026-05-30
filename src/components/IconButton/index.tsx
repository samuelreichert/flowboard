import { Button } from '@base-ui/react/button';
import { Tooltip } from '@base-ui/react/tooltip';
import type { ComponentProps, ReactNode } from 'react';

import './IconButton.css';

type IconButtonProps = ComponentProps<typeof Button> & {
  label: string;
  children: ReactNode;
};

const IconButton = ({ label, children, ...props }: IconButtonProps) => (
  <Tooltip.Root>
    <Tooltip.Trigger
      aria-label={label}
      className="icon-button"
      render={<Button {...props} />}
    >
      {children}
    </Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Positioner sideOffset={8}>
        <Tooltip.Popup className="tooltip-popup">{label}</Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>
);

export default IconButton;
