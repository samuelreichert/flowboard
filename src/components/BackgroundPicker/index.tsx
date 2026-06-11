import { Button } from '@base-ui/react/button';
import { Popover } from '@base-ui/react/popover';
import { Check, Palette, X } from 'lucide-react';
import { useState } from 'react';
import type { RefObject } from 'react';

import type { BoardBackground } from '../../types';
import ImageUrlForm from './ImageUrlForm';

import './BackgroundPicker.css';

type BackgroundPickerProps = {
  anchor?: RefObject<Element | null>;
  background: BoardBackground;
  onChange: (background: BoardBackground) => void;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  showTrigger?: boolean;
};

const COLOR_BACKGROUNDS = [
  { label: 'Cloud', value: '#fbfbfc' },
  { label: 'Lavender', value: '#f3f0ff' },
  { label: 'Mist', value: '#eef5f7' },
  { label: 'Sand', value: '#f7f2e9' },
  { label: 'Blush', value: '#f8eef0' },
];

const IMAGE_BACKGROUNDS = [
  {
    label: 'Northern lights',
    value: '/flowboard-background.png',
  },
];

const isSelected = (
  background: BoardBackground,
  type: BoardBackground['type'],
  value: string
) => background.type === type && background.value === value;

const getCustomImageUrl = (background: BoardBackground) =>
  background.type === 'image' &&
  !IMAGE_BACKGROUNDS.some((image) => image.value === background.value)
    ? background.value
    : '';

const BackgroundPicker = ({
  anchor,
  background,
  onChange,
  onOpenChange,
  open,
  showTrigger = true,
}: BackgroundPickerProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const customImageUrl = getCustomImageUrl(background);
  const setIsOpen = (
    nextOpen: boolean | ((currentOpen: boolean) => boolean)
  ) => {
    const resolvedOpen =
      typeof nextOpen === 'function' ? nextOpen(isOpen) : nextOpen;

    if (open === undefined) {
      setInternalOpen(resolvedOpen);
    }

    onOpenChange?.(resolvedOpen);
  };

  const chooseBackground = (nextBackground: BoardBackground) => {
    onChange(nextBackground);
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      {showTrigger && (
        <Popover.Trigger
          className="button button--subtle background-picker__trigger"
          render={<Button />}
        >
          <Palette size={16} />
          Background
        </Popover.Trigger>
      )}
      <Popover.Portal>
        <Popover.Positioner
          align="end"
          anchor={showTrigger ? undefined : anchor}
          className="background-picker__positioner"
          sideOffset={8}
        >
          <Popover.Popup
            aria-label="Choose board background"
            className="background-picker__panel"
          >
            <div className="background-picker__header">
              <div>
                <Popover.Title className="background-picker__title">
                  Board background
                </Popover.Title>
                <Popover.Description className="background-picker__description">
                  Pick a color or an image for your workspace.
                </Popover.Description>
              </div>
              <Popover.Close
                aria-label="Close background picker"
                className="icon-button"
                render={<Button />}
              >
                <X size={16} />
              </Popover.Close>
            </div>
            <section>
              <h3 className="background-picker__section-title">Colors</h3>
              <div className="background-picker__colors">
                {COLOR_BACKGROUNDS.map((color) => (
                  <Button
                    aria-label={`Use ${color.label} background`}
                    aria-pressed={isSelected(background, 'color', color.value)}
                    className="background-picker__color"
                    key={color.value}
                    onClick={() =>
                      chooseBackground({ type: 'color', value: color.value })
                    }
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                    type="button"
                  >
                    {isSelected(background, 'color', color.value) && (
                      <Check size={15} />
                    )}
                  </Button>
                ))}
              </div>
            </section>
            <section>
              <h3 className="background-picker__section-title">Images</h3>
              <div className="background-picker__images">
                {IMAGE_BACKGROUNDS.map((image) => (
                  <Button
                    aria-label={`Use ${image.label} background`}
                    aria-pressed={isSelected(background, 'image', image.value)}
                    className="background-picker__image"
                    key={image.value}
                    onClick={() =>
                      chooseBackground({ type: 'image', value: image.value })
                    }
                    style={{ backgroundImage: `url(${image.value})` }}
                    type="button"
                  >
                    {isSelected(background, 'image', image.value) && (
                      <span className="background-picker__selected">
                        <Check size={15} />
                      </span>
                    )}
                    <span>{image.label}</span>
                  </Button>
                ))}
              </div>
            </section>
            <ImageUrlForm
              initialImageUrl={customImageUrl}
              key={customImageUrl}
              onApply={(value) => chooseBackground({ type: 'image', value })}
            />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default BackgroundPicker;
