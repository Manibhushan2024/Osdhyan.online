'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/components/providers/AuthProvider';
import { consumeOAuthRedirect } from '@/lib/redirect';

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const handledRef = useRef(false);

    useEffect(() => {
        // Run once — login() changes auth context, which would otherwise re-trigger this effect.
        if (handledRef.current) return;
        handledRef.current = true;

        const token = searchParams.get('token');

        if (!token) {
            router.replace('/auth/login?error=Authentication failed');
            return;
        }

        // The api interceptor reads the token from localStorage, so store it
        // before fetching the user profile.
        localStorage.setItem('auth_token', token);

        api.get('/user', { skipAuthRedirect: true })
            .then(res => {
                // Updates AuthProvider context + localStorage, then navigates.
                login(token, res.data, consumeOAuthRedirect('/dashboard'));
            })
            .catch(() => {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user');
                router.replace('/auth/login?error=Session initialization failed');
            });
    }, [searchParams, router, login]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="text-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
                <p className="mt-4 text-muted-foreground text-sm">Signing you in…</p>
            </div>
        </div>
    );
}

export default function AuthCallback() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
                    <p className="mt-4 text-muted-foreground text-sm">Signing you in…</p>
                </div>
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}
