'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type User = {
    id: number;
    name: string;
    username?: string;
    email: string;
    phone?: string;
    avatar?: string;
    address?: string;
    exam_preference?: string;
    target_year?: number;
    created_at?: string;
    is_admin?: boolean;
    is_teacher?: boolean;
    admin_role?: 'root' | 'editor' | null;
    coins?: number;
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    login: (token: string, user: User, redirectPath?: string) => void;
    logout: () => void;
    updateUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth is Bearer-token only (see src/lib/api.ts) — no Sanctum CSRF cookie needed.

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith('/admin') ?? false;

    useEffect(() => {
        let cancelled = false;
        let nextUser: User | null = null;

        const tokenKey = isAdminRoute ? 'admin_auth_token' : 'auth_token';
        const userKey = isAdminRoute ? 'admin_user' : 'user';

        let token = localStorage.getItem(tokenKey);
        let storedUser = localStorage.getItem(userKey);

        // One-time migration path for old admin sessions stored in auth_token/user.
        if (isAdminRoute && (!token || !storedUser)) {
            const legacyToken = localStorage.getItem('auth_token');
            const legacyUser = localStorage.getItem('user');
            if (legacyToken && legacyUser) {
                try {
                    const parsedLegacy = JSON.parse(legacyUser);
                    if (parsedLegacy?.is_admin) {
                        localStorage.setItem('admin_auth_token', legacyToken);
                        localStorage.setItem('admin_user', legacyUser);
                        token = legacyToken;
                        storedUser = legacyUser;
                    }
                } catch {
                    // Ignore malformed legacy user payload.
                }
            }
        }

        if (token && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);

                // Allow admin users to also have a student session.
                nextUser = parsedUser;
            } catch {
                localStorage.removeItem(tokenKey);
                localStorage.removeItem(userKey);
            }
        }

        const commit = () => {
            if (cancelled) return;
            setUser(nextUser);
            setLoading(false);
        };

        if (typeof queueMicrotask === 'function') {
            queueMicrotask(commit);
        } else {
            Promise.resolve().then(commit);
        }

        return () => {
            cancelled = true;
        };
    }, [isAdminRoute]);

    const login = (token: string, user: User, redirectPath = '/dashboard') => {
        const targetsAdmin = redirectPath.startsWith('/admin');
        const isAdminSession = !!user?.is_admin && (targetsAdmin || !!user?.admin_role);

        if (isAdminSession) {
            localStorage.setItem('admin_auth_token', token);
            localStorage.setItem('admin_user', JSON.stringify(user));
        }
        // Admins may also use the student dashboard, so any login that lands
        // outside /admin also establishes the student session.
        if (!targetsAdmin || !isAdminSession) {
            localStorage.setItem('auth_token', token);
            localStorage.setItem('user', JSON.stringify(user));
        }

        setUser(user);
        router.push(redirectPath);
    };

    const logout = () => {
        if (isAdminRoute) {
            localStorage.removeItem('admin_auth_token');
            localStorage.removeItem('admin_user');
            setUser(null);
            router.push('/admin/login');
            return;
        }

        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/auth/login');
    };

    const updateUser = (updatedUser: User) => {
        const userKey = isAdminRoute ? 'admin_user' : 'user';
        localStorage.setItem(userKey, JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
