/**
 * Post-login redirect helpers.
 *
 * Only same-origin relative paths are honoured: the value must start with a
 * single "/" (not "//" or "/\", which browsers treat as protocol-relative).
 * Anything else falls back to the provided default.
 */
export function safeRedirectPath(raw: string | null | undefined, fallback = '/dashboard'): string {
    if (!raw) return fallback;
    const value = raw.trim();
    if (!value.startsWith('/')) return fallback;
    if (value.startsWith('//') || value.startsWith('/\\')) return fallback;
    // Reject control characters / whitespace tricks (e.g. "/\t/evil.com").
    if (/[\u0000-\u001f\u007f\s\\]/.test(value)) return fallback;
    // Never bounce back to an auth page (avoids login loops).
    if (value.startsWith('/auth/')) return fallback;
    return value;
}

/** Reads ?redirect= from the current URL (client only) and sanitises it. */
export function redirectFromLocation(fallback = '/dashboard'): string {
    if (typeof window === 'undefined') return fallback;
    const raw = new URLSearchParams(window.location.search).get('redirect');
    return safeRedirectPath(raw, fallback);
}

/** Builds the student login URL that returns to `path` afterwards. */
export function loginUrlWithRedirect(path: string): string {
    const safe = safeRedirectPath(path, '');
    return safe ? `/auth/login?redirect=${encodeURIComponent(safe)}` : '/auth/login';
}

const OAUTH_REDIRECT_KEY = 'osd_post_login_redirect';

/** Remembers where to go after an OAuth round trip (Google etc.). */
export function rememberOAuthRedirect(path: string) {
    try {
        const safe = safeRedirectPath(path, '');
        if (safe) sessionStorage.setItem(OAUTH_REDIRECT_KEY, safe);
        else sessionStorage.removeItem(OAUTH_REDIRECT_KEY);
    } catch {
        // storage unavailable — fall back to default destination
    }
}

/** Reads and clears the remembered OAuth redirect. */
export function consumeOAuthRedirect(fallback = '/dashboard'): string {
    try {
        const raw = sessionStorage.getItem(OAUTH_REDIRECT_KEY);
        sessionStorage.removeItem(OAUTH_REDIRECT_KEY);
        return safeRedirectPath(raw, fallback);
    } catch {
        return fallback;
    }
}
