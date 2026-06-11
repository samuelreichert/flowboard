import { Button } from '@base-ui/react/button';
import { Field } from '@base-ui/react/field';
import { Image } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

import { isSafeImageUrl } from '../../storage';

export type ImageUrlFormProps = {
  initialImageUrl: string;
  onApply: (value: string) => void;
};

const ImageUrlForm = ({ initialImageUrl, onApply }: ImageUrlFormProps) => {
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [error, setError] = useState('');

  const applyImageUrl = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = imageUrl.trim();

    if (!isSafeImageUrl(value)) {
      setError('Enter a secure HTTPS image URL.');
      return;
    }

    setError('');
    onApply(value);
  };

  return (
    <form className="background-picker__form" onSubmit={applyImageUrl}>
      <Field.Root invalid={Boolean(error)}>
        <Field.Label className="background-picker__label" htmlFor="image-url">
          Image URL
        </Field.Label>
        <div className="background-picker__url-row">
          <div className="background-picker__url-input">
            <Image size={15} />
            <Field.Control
              id="image-url"
              maxLength={2048}
              onValueChange={setImageUrl}
              placeholder="https://images.example.com/cover.jpg"
              type="url"
              value={imageUrl}
            />
          </div>
          <Button className="button button--primary" type="submit">
            Apply
          </Button>
        </div>
        <Field.Error
          className="background-picker__error"
          match={Boolean(error)}
        >
          {error}
        </Field.Error>
      </Field.Root>
    </form>
  );
};

export default ImageUrlForm;
