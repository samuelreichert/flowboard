const SUPPORTED_DATA_IMAGE_PATTERN =
  /^data:image\/(?:gif|jpeg|png|webp);base64,[a-z0-9+/]+={0,2}$/i;

const parseUrl = (value: string) => {
  try {
    return new URL(value);
  } catch {
    return null;
  }
};

export const isSupportedLinkUrl = (value: string) => {
  const url = parseUrl(value);

  return url?.protocol === 'https:' || url?.protocol === 'mailto:';
};

export const isSupportedDataImageUrl = (value: string) =>
  SUPPORTED_DATA_IMAGE_PATTERN.test(value.trim());

export const isSupportedImageUrl = (value: string) => {
  const url = parseUrl(value);

  return url?.protocol === 'https:' || isSupportedDataImageUrl(value);
};
