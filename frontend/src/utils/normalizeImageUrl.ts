const DEFAULT_PUBLIC_API_BASE = 'https://api-gs-sabores.ioshuavps.com.br';

function getPublicApiBaseUrl() {
  const configured = import.meta.env.VITE_BACKEND_API_URL?.replace(/\/api\/?$/, '');
  return (configured || DEFAULT_PUBLIC_API_BASE).replace(/\/$/, '');
}

export function normalizeImageUrl(url?: string | null): string {
  if (!url) return '';

  let normalized = url.trim();
  if (!normalized) return '';

  if (normalized.startsWith('/uploads/')) {
    return `${getPublicApiBaseUrl()}${normalized}`;
  }

  normalized = normalized.replace(/^http:\/\//i, 'https://');
  normalized = normalized.replace(
    /https?:\/\/[^/]+\/uploads\//i,
    `${getPublicApiBaseUrl()}/uploads/`
  );

  return normalized;
}
