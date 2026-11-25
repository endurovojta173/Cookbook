import { describe, expect, it } from 'vitest';
import { resolveAssetUrl } from './assets';

describe('resolveAssetUrl', () => {
  it('joins relative asset paths with GitHub Pages subpath base', () => {
    expect(resolveAssetUrl('images/svickova.webp', '/Cookbook/')).toBe(
      '/Cookbook/images/svickova.webp',
    );
  });

  it('strips leading slashes from asset paths to prevent broken subpath URLs', () => {
    expect(resolveAssetUrl('/images/svickova.webp', '/Cookbook/')).toBe(
      '/Cookbook/images/svickova.webp',
    );
    expect(resolveAssetUrl('///images/svickova.webp', './')).toBe(
      './images/svickova.webp',
    );
  });

  it('normalizes base URL without trailing slash', () => {
    expect(resolveAssetUrl('images/test.webp', '/Cookbook')).toBe(
      '/Cookbook/images/test.webp',
    );
  });

  it('keeps external and data URLs untouched', () => {
    expect(resolveAssetUrl('https://example.com/foto.webp', '/Cookbook/')).toBe(
      'https://example.com/foto.webp',
    );
    expect(resolveAssetUrl('data:image/png;base64,abc', '/Cookbook/')).toBe(
      'data:image/png;base64,abc',
    );
  });

  it('returns empty string for blank input', () => {
    expect(resolveAssetUrl('   ', '/Cookbook/')).toBe('');
  });
});
