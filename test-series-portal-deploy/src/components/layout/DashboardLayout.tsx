'use client';

import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;
        if (!user || user.is_admin) {
            router.replace('/auth/login');
        }
    }, [loading, user, router]);

    if (loading || !user || user.is_admin) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background transition-colors duration-500">
            {/* Mobile Sidebar Overlay */}
            <div className={cn(
                "fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ease-linear",
                isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}>
                <div className="fixed inset-0 bg-gray-900/80" onClick={() => setIsMobileMenuOpen(false)} />
                <div className={cn(
                    "fixed inset-y-0 left-0 flex w-full max-w-xs transform transition duration-300 ease-in-out",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}>
                    <div className="relative flex w-full flex-col bg-white">
                        <div className="absolute right-0 top-0 -mr-12 pt-2">
                            <button
                                type="button"
                                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <X className="h-6 w-6 text-white" aria-hidden="true" />
                            </button>
                        </div>
                        <Sidebar />
                    </div>
                </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                <Sidebar />
            </div>

            <div className="lg:pl-72 transition-all duration-500">
                <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />
                <main className="py-8">
                    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
