import axios from 'axios';
import { loginUrlWithRedirect } from '@/lib/redirect';

declare module 'axios' {
    interface AxiosRequestConfig {
        /**
         * When true, a 401 response is returned to the caller untouched:
         * no token clearing and no redirect to the login page. Used by the
         * test player, which must never lose an in-progress attempt.
         */
        skipAuthRedirect?: boolean;
    }
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * Auth is Bearer-token only (no Sanctum cookies / CSRF). Returns the token the
 * axios instance would attach for the current page, so non-axios requests
 * (e.g. fetch with keepalive) can authenticate the same way.
 */
export function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
        const isAdminRoute = window.location.pathname.startsWith('/admin');
        if (isAdminRoute) {
            // Backward-compatible fallback to legacy auth_token for older admin sessions.
            return localStorage.getItem('admin_auth_token') || localStorage.getItem('auth_token');
        }
        return localStorage.getItem('auth_token');
    } catch {
        return null;
    }
}

/** Pages that handle 401 themselves and must never be hard-redirected away. */
function isProtectedFromAuthRedirect(path: string): boolean {
    return path.startsWith('/dashboard/tests/play/');
}

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Interceptor to add auth token if present
api.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (typeof window === 'undefined') {
            return Promise.reject(error);
        }

        const status = error?.response?.status;
        if (status !== 401) {
            return Promise.reject(error);
        }

        const requestUrl = String(error?.config?.url || '');
        if (requestUrl.includes('/auth/')) {
            return Promise.reject(error);
        }

        const path = window.location.pathname;

        // Caller opted out, or we're on a page (test player) that keeps
        // unsynced work locally and shows its own "session expired" prompt.
        if (error?.config?.skipAuthRedirect || isProtectedFromAuthRedirect(path)) {
            return Promise.reject(error);
        }

        const isAdminRoute = path.startsWith('/admin');

        if (isAdminRoute) {
            localStorage.removeItem('admin_auth_token');
            localStorage.removeItem('admin_user');
            if (path !== '/admin/login') {
                window.location.href = '/admin/login';
            }
        } else {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            if (!path.startsWith('/auth/')) {
                window.location.href = loginUrlWithRedirect(path + window.location.search);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
