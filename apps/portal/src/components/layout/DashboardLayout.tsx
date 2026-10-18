'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';
import { usePathname } from 'next/navigation';
import RouteGuard from '@/components/auth/RouteGuard';

/**
 * Dashboard routes that render a dedicated guest view (sign-in prompts /
 * auth modals) and therefore stay browsable without an account. Every other
 * /dashboard route is wrapped in RouteGuard and redirects to
 * /auth/login?redirect=<path> when logged out.
 */
const GUEST_ROUTES: RegExp[] = [
    /^\/dashboard\/?$/,
    /^\/dashboard\/tests\/?$/,
    /^\/dashboard\/test-series\/?$/,
    /^\/dashboard\/test-series\/(?!enrolled\/?$)[^/]+\/?$/,
    /^\/dashboard\/live\/?$/,
    /^\/dashboard\/live\/(?!manage\/?$)[^/]+\/?$/,
    /^\/dashboard\/focus\/?$/,
];

function isGuestRoute(pathname: string | null): boolean {
    if (!pathname) return false;
    return GUEST_ROUTES.some((re) => re.test(pathname));
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { loading } = useAuth();
    const pathname = usePathname();
    const guestAllowed = isGuestRoute(pathname);

    // Admins can use the student dashboard too (the Next.js admin panel lives at /admin).
    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Mobile sidebar (drawer) */}
            <div
                className={cn(
                    'fixed inset-0 z-50 lg:hidden transition-opacity duration-200',
                    isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                )}
                aria-hidden={!isMobileMenuOpen}
            >
                <div className="fixed inset-0 bg-slate-950/60" onClick={() => setIsMobileMenuOpen(false)} />
                <div
                    className={cn(
                        'fixed inset-y-0 left-0 flex w-[85vw] max-w-xs transform transition-transform duration-200 ease-out',
                        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    )}
                >
                    <div className="relative flex w-full flex-col bg-sidebar-bg shadow-2xl">
                        <button
                            type="button"
                            className="absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                            onClick={() => setIsMobileMenuOpen(false)}
                            aria-label="Close menu"
                        >
                            <X className="h-5 w-5" aria-hidden="true" />
                        </button>
                        <div className="flex-1 overflow-y-auto" onClick={() => setIsMobileMenuOpen(false)}>
                            <Sidebar />
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
                <Sidebar />
            </div>

            <div className="lg:pl-64">
                <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />
                <main className="py-6 sm:py-8">
                    <div className="page-container">
                        {guestAllowed ? children : <RouteGuard>{children}</RouteGuard>}
                    </div>
                </main>
            </div>
        </div>
    );
}
