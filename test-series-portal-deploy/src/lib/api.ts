import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
    withXSRFToken: true,
});

// Interceptor to add auth token if present
api.interceptors.request.use((config) => {
    let token: string | null = null;

    if (typeof window !== 'undefined') {
        const isAdminRoute = window.location.pathname.startsWith('/admin');

        if (isAdminRoute) {
            // Backward-compatible fallback to legacy auth_token for older admin sessions.
            token = localStorage.getItem('admin_auth_token') || localStorage.getItem('auth_token');
        } else {
            token = localStorage.getItem('auth_token');
        }
    }

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
                window.location.href = '/auth/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;
