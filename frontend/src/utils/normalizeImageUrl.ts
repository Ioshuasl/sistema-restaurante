const DEFAULT_UPLOADS_BASE = 'https://api-gs-sabores.ioshuavps.com.br';

function getUploadsBaseUrl() {
  const configured = import.meta.env.VITE_UPLOADS_BASE_URL?.replace(/\/$/, '');
  return configured || DEFAULT_UPLOADS_BASE;
}

export function normalizeImageUrl(url?: string | null): string {
  if (!url) return '';

  let normalized = url.trim();
  if (!normalized) return '';

  if (normalized.startsWith('/uploads/')) {
    return `${getUploadsBaseUrl()}${normalized}`;
  }

  return normalized.replace(/^http:\/\//i, 'https://');
}
