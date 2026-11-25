const EXTERNAL_URL_PATTERN = /^(https?:\/\/|data:|blob:)/i;

/**
 * Resolves a static asset path located in `public/` against Vite's `BASE_URL`
 * so assets work both locally and on GitHub Pages subpaths.
 */
export function resolveAssetUrl(
  assetPath: string,
  baseUrl: string = import.meta.env.BASE_URL,
): string {
  const trimmed = assetPath.trim();
  if (!trimmed) {
    return '';
  }

  if (EXTERNAL_URL_PATTERN.test(trimmed)) {
    return trimmed;
  }

  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const normalizedAsset = trimmed.replace(/^\/+/, '');
  return `${normalizedBase}${normalizedAsset}`;
}
