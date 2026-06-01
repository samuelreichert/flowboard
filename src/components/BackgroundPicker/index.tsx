import { Button } from '@base-ui/react/button';
import { Check, Image, Palette, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import { isSafeImageUrl } from '../../storage';
import type { BoardBackground } from '../../types';

import './BackgroundPicker.css';

type BackgroundPickerProps = {
  background: BoardBackground;
  onChange: (background: BoardBackground) => void;
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

const BackgroundPicker = ({ background, onChange }: BackgroundPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (
      background.type === 'image' &&
      !IMAGE_BACKGROUNDS.some((image) => image.value === background.value)
    ) {
      setImageUrl(background.value);
    }
  }, [background]);

  const chooseBackground = (nextBackground: BoardBackground) => {
    setError('');
    onChange(nextBackground);
  };

  const applyImageUrl = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = imageUrl.trim();

    if (!isSafeImageUrl(value)) {
      setError('Enter a secure HTTPS image URL.');
      return;
    }

    chooseBackground({ type: 'image', value });
  };

  return (
    <div className="background-picker">
      <Button
        aria-expanded={isOpen}
        className="button button--subtle background-picker__trigger"
        onClick={() => setIsOpen((open) => !open)}
      >
        <Palette size={16} />
        Background
      </Button>
      {isOpen && (
        <div
          aria-label="Choose board background"
          className="background-picker__panel"
          role="dialog"
        >
          <div className="background-picker__header">
            <div>
              <h2 className="background-picker__title">Board background</h2>
              <p className="background-picker__description">
                Pick a color or an image for your workspace.
              </p>
            </div>
            <Button
              aria-label="Close background picker"
              className="icon-button"
              onClick={() => setIsOpen(false)}
            >
              <X size={16} />
            </Button>
          </div>
          <section>
            <h3 className="background-picker__section-title">Colors</h3>
            <div className="background-picker__colors">
              {COLOR_BACKGROUNDS.map((color) => (
                <button
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
                </button>
              ))}
            </div>
          </section>
          <section>
            <h3 className="background-picker__section-title">Images</h3>
            <div className="background-picker__images">
              {IMAGE_BACKGROUNDS.map((image) => (
                <button
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
                </button>
              ))}
            </div>
          </section>
          <form className="background-picker__form" onSubmit={applyImageUrl}>
            <label className="background-picker__label" htmlFor="image-url">
              Image URL
            </label>
            <div className="background-picker__url-row">
              <div className="background-picker__url-input">
                <Image size={15} />
                <input
                  id="image-url"
                  maxLength={2048}
                  onChange={(event) => setImageUrl(event.target.value)}
                  placeholder="https://images.example.com/cover.jpg"
                  type="url"
                  value={imageUrl}
                />
              </div>
              <Button className="button button--primary" type="submit">
                Apply
              </Button>
            </div>
            {error && <p className="background-picker__error">{error}</p>}
          </form>
        </div>
      )}
    </div>
  );
};

export default BackgroundPicker;
