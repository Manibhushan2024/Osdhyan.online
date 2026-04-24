'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Hard auth guard — redirects unauthenticated users to login.
 * Use for pages that are purely personal and make no sense without an account
 * (analytics, history, identity, settings).
 */
export default function RouteGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user) {
            router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
        }
    }, [user, loading, router, pathname]);

    if (loading || !user) {
        return (
            <div className="flex min-h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return <>{children}</>;
}
