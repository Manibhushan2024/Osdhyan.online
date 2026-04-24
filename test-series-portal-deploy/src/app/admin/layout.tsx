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
                <p className="text-[10px] font-black text-indigo-400/40 uppercase tracking-[0.3em]">Synching Command Protocol...</p>
            </div>
        );
    }

    const hasAdminAccess = !!user?.is_admin && (user?.admin_role === 'root' || user?.admin_role === 'editor');

    if (!hasAdminAccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 gap-8 text-center px-8">
                <div className="h-20 w-20 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center border border-indigo-500/20 shadow-2xl shadow-indigo-500/10">
                    <ShieldCheck className="h-10 w-10 text-indigo-500" />
                </div>
                <div className="space-y-4">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">Tactical Clearance Required</h2>
                    <p className="text-[10px] font-medium text-indigo-100/30 uppercase tracking-[0.2em] max-w-[400px] leading-relaxed">
                        Access to the Selection Command Hub is restricted to authorized personnel.
                        Verify your credentials on port 3000.
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => router.push('/admin/login')}
                        className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-600/20"
                    >
                        Admin Login
                    </button>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="bg-white/5 border border-white/10 text-white/40 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
                    >
                        Student Portal
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-950 overflow-hidden">
            <AdminSidebar />

            <main className="flex-1 overflow-y-auto scrollbar-hide p-8 sm:p-12 lg:p-16">
                <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-right-4 duration-1000">
                    <div className="flex items-center justify-between border-b border-indigo-500/10 pb-12">
                        <div className="flex items-center gap-4">
                            <Logo iconOnly className="transition-transform duration-500 hover:scale-110" />
                            <div>
                                <h1 className="text-2xl font-black text-white uppercase tracking-tighter italic">Intelligence Hub</h1>
                                <p className="text-[8px] font-black text-indigo-400/60 uppercase tracking-widest">Global Curriculum & Vector Management</p>
                            </div>
                        </div>
                    </div>

                    {children}
                </div>
            </main>
        </div>
    );
}
