'use client';

import {
    LayoutDashboard,
    BookOpen,
    Shield,
    ArrowLeft,
    Settings,
    HelpCircle,
    Rocket,
    Cpu,
    Upload, IndianRupee, GraduationCap, Radio } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { Logo } from '@/components/ui/Logo';

const navigation = [
    { name: 'Courses', href: '/admin/courses', icon: Cpu },
    { name: 'Test Series', href: '/admin/test-series', icon: Rocket },
    { name: 'Tests', href: '/admin/tests', icon: LayoutDashboard },
    { name: 'Questions', href: '/admin/questions', icon: BookOpen },
    { name: 'Bulk import', href: '/admin/bulk-import', icon: Upload },
    { name: 'Orders & revenue', href: '/admin/orders', icon: IndianRupee },
    { name: 'Teachers', href: '/admin/teachers', icon: GraduationCap },
    { name: 'Live classes', href: '/admin/live', icon: Radio },
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
        <div className="flex h-full flex-col bg-slate-950 border-r border-indigo-500/10 w-64 shrink-0">
            <div className="p-5">
                <div className="mb-8 px-2">
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
                                    "flex items-center gap-3 px-4 py-2.5 min-h-[44px] text-sm font-medium rounded-xl transition-colors group relative",
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

            <div className="mt-auto p-5 space-y-3">
                {/* Filament (Laravel) panel lives on the backend host; only reachable
                    when the API URL is absolute (not the same-origin /api proxy). */}
                {/^https?:\/\//.test(process.env.NEXT_PUBLIC_API_URL ?? '') && (
                <button
                    onClick={() => {
                        const api = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api\s*$/, '');
                        window.open(api + '/admin', '_blank');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 min-h-[44px] bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-indigo-300 hover:bg-white/10 transition-colors group"
                >
                    <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                    Open Filament admin
                </button>
                )}

            </div>
        </div>
    );
}
