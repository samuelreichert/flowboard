import { describe, expect, test } from 'vitest';

import { isSupportedImageUrl, isSupportedUrl, normalizeUrl } from './commands';

describe('CardContentEditor command helpers', () => {
  test('normalizes bare URLs to HTTPS', () => {
    expect(normalizeUrl(' example.com/path ')).toBe('https://example.com/path');
  });

  test('preserves supported absolute URLs', () => {
    expect(normalizeUrl('mailto:team@example.com')).toBe(
      'mailto:team@example.com'
    );
    expect(normalizeUrl('https://example.com')).toBe('https://example.com');
  });

  test('rejects unsupported link protocols', () => {
    expect(isSupportedUrl('javascript:alert(1)')).toBe(false);
    expect(isSupportedUrl('http://example.com')).toBe(false);
    expect(isSupportedUrl('https://example.com')).toBe(true);
    expect(isSupportedUrl('mailto:team@example.com')).toBe(true);
  });

  test('allows data images only when explicitly requested', () => {
    const dataImage = 'data:image/png;base64,abc123';

    expect(isSupportedUrl(dataImage)).toBe(false);
    expect(isSupportedUrl(dataImage, true)).toBe(true);
    expect(isSupportedImageUrl(dataImage)).toBe(true);
  });

  test('requires image URLs to be secure or image data URLs', () => {
    expect(isSupportedImageUrl('https://example.com/image.png')).toBe(true);
    expect(isSupportedImageUrl('mailto:team@example.com')).toBe(false);
    expect(isSupportedImageUrl('data:text/plain;base64,abc123')).toBe(false);
    expect(isSupportedImageUrl('data:image/svg+xml;base64,PHN2Zy8+')).toBe(
      false
    );
  });
});
