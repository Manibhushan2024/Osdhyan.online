const STORAGE_BASE =
    (process.env.NEXT_PUBLIC_STORAGE_URL || process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '').replace(/\/$/, '');

/**
 * Resolves a stored file path to an absolute URL.
 * If `path` is already absolute (starts with http/https), it is returned as-is.
 */
export function storageUrl(path: string | null | undefined): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${STORAGE_BASE}/storage/${path}`;
}
