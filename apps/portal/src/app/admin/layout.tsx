'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2, ShieldCheck, Cpu } from 'lucide-react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { Logo } from '@/components/ui/Logo';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 gap-4">
                <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                <p className="text-sm text-indigo-300/70">Loading admin…</p>
            </div>
        );
    }

    const hasAdminAccess = !!user?.is_admin && (user?.admin_role === 'root' || user?.admin_role === 'editor');

    if (!hasAdminAccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 gap-8 text-center px-8">
                <div className="h-20 w-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-2xl shadow-indigo-500/10">
                    <ShieldCheck className="h-10 w-10 text-indigo-500" />
                </div>
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Admin access required</h2>
                    <p className="text-sm text-indigo-100/60 max-w-[400px] leading-relaxed">
                        This area is only for OSDHYAN administrators. Sign in with an admin account to continue.
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => router.push('/admin/login')}
                        className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-wide hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-600/20"
                    >
                        Admin sign in
                    </button>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="bg-white/5 border border-white/10 text-white/40 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-wide hover:text-white transition-all"
                    >
                        Back to student portal
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-950 overflow-hidden">
            <AdminSidebar />

            <main className="flex-1 min-w-0 overflow-y-auto p-4 pt-[4.5rem] sm:p-8 sm:pt-[4.5rem] lg:p-10 lg:pt-10">
                <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
                    {/* On phones the top bar already carries the name */}
                    <div className="hidden lg:flex items-center justify-between border-b border-indigo-500/10 pb-6">
                        <div className="flex items-center gap-4">
                            <Logo iconOnly className="transition-transform duration-500 hover:scale-110" />
                            <div>
                                <h1 className="text-xl font-bold text-white tracking-tight">OSDHYAN Admin</h1>
                                <p className="text-sm text-indigo-200/70">Manage courses, tests and questions</p>
                            </div>
                        </div>
                    </div>

                    {children}
                </div>
            </main>
        </div>
    );
}
