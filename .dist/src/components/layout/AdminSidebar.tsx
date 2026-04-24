'use client';

import {
    LayoutDashboard,
    BookOpen,
    Shield,
    ArrowLeft,
    Settings,
    HelpCircle,
    Rocket,
    Cpu
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { Logo } from '@/components/ui/Logo';

const navigation = [
    { name: 'Intelligence Hub', href: '/admin/courses', icon: Cpu },
    { name: 'Test Series', href: '/admin/test-series', icon: Rocket },
    { name: 'Tests Pool', href: '/admin/tests', icon: LayoutDashboard },
    { name: 'Question Bank', href: '/admin/questions', icon: BookOpen },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const isRootAdmin = user?.admin_role === 'root';
    const navItems = isRootAdmin
        ? [...navigation, { name: 'Settings', href: '/admin/settings', icon: Settings }]
        : navigation;

    return (
        <div className="flex h-full flex-col bg-slate-950 border-r border-indigo-500/10 transition-all duration-700 w-80 shrink-0">
            <div className="p-8">
                <div className="mb-10 px-2 group transition-all duration-500 transform hover:scale-105">
                    <Link href="/admin/courses">
                        <Logo variant="white" />
                    </Link>
                </div>

                <nav className="space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-4 px-5 py-4 text-[9px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all group relative",
                                    isActive
                                        ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20"
                                        : "text-indigo-100/30 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-indigo-400/40 group-hover:text-indigo-400 transition-colors")} />
                                {item.name}
                                {isActive && (
                                    <span className="absolute right-4 h-1 w-1 rounded-full bg-white opacity-50" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-8 space-y-4">
                <button
                    onClick={() => window.open('http://localhost:8000/admin', '_blank')}
                    className="w-full flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[8px] font-black text-indigo-400 uppercase tracking-widest hover:bg-white/10 transition-all group"
                >
                    <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                    Filament Dashboard
                </button>

                <div className="p-6 bg-indigo-600/5 rounded-[2rem] border border-indigo-600/20">
                    <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Admin Status</h4>
                    <p className="text-[8px] text-white/40 font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)] animate-pulse" />
                        Command Mode Active
                    </p>
                </div>
            </div>
        </div>
    );
}
