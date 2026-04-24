'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const needsPhone = searchParams.get('needs_phone') === 'true';

        if (token) {
            localStorage.setItem('auth_token', token);

            // Fetch modern user data to ensure local storage is sync'd
            api.get('/user').then(res => {
                localStorage.setItem('user', JSON.stringify(res.data));

                if (needsPhone) {
                    // Redirect to profile to complete missing info
                    router.push('/dashboard/profile?complete=true');
                } else {
                    router.push('/dashboard');
                }
            }).catch(() => {
                router.push('/auth/login?error=Session initialization failed');
            });
        } else {
            router.push('/auth/login?error=Authentication failed');
        }
    }, [searchParams, router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="text-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
                <p className="mt-4 text-gray-600 font-medium">Finalizing secure connection...</p>
            </div>
        </div>
    );
}

export default function AuthCallback() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
                    <p className="mt-4 text-gray-600 font-medium">Finalizing secure connection...</p>
                </div>
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}
