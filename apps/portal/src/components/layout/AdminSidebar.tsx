'use client';

import { useEffect, useState } from 'react';
import {
    LayoutDashboard,
    BookOpen,
    ArrowLeft,
    Settings,
    Rocket,
    Cpu,
    Upload, IndianRupee, GraduationCap, Radio, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
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

/**
 * Admin navigation. On large screens it is a fixed left column; on phones and
 * tablets it is a top bar with a menu button that opens the same links as a
 * slide-in drawer, so the content keeps the full width.
 */
export default function AdminSidebar() {
    const pathname = usePathname();
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const isRootAdmin = user?.admin_role === 'root';
    const navItems = isRootAdmin
        ? [...navigation, { name: 'Settings', href: '/admin/settings', icon: Settings }]
        : navigation;

    // Close the drawer whenever the route changes (a link was tapped).
    useEffect(() => { setOpen(false); }, [pathname]);

    const filamentUrl = /^https?:\/\//.test(process.env.NEXT_PUBLIC_API_URL ?? '')
        ? (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api\s*$/, '') + '/admin'
        : null;

    const links = (
        <nav className="space-y-2">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-4 py-2.5 min-h-[44px] text-sm font-medium rounded-xl transition-colors group relative",
                            isActive
                                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20"
                                : "text-indigo-100/60 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-indigo-400/60 group-hover:text-indigo-400 transition-colors")} />
                        {item.name}
                    </Link>
                );
            })}
        </nav>
    );

    const footer = filamentUrl ? (
        <div className="mt-auto p-5">
            <a
                href={filamentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-4 py-2.5 min-h-[44px] bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-indigo-300 hover:bg-white/10 transition-colors group"
            >
                <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                Open Filament admin
            </a>
        </div>
    ) : null;

    return (
        <>
            {/* Large screens: fixed left column */}
            <aside className="hidden lg:flex h-full flex-col bg-slate-950 border-r border-indigo-500/10 w-64 shrink-0">
                <div className="p-5">
                    <div className="mb-8 px-2">
                        <Link href="/admin/courses"><Logo variant="white" /></Link>
                    </div>
                    {links}
                </div>
                {footer}
            </aside>

            {/* Phones and tablets: top bar + drawer */}
            <div className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 flex items-center justify-between px-3 bg-slate-950/95 backdrop-blur border-b border-indigo-500/10">
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="h-11 w-11 -ml-1 flex items-center justify-center rounded-xl text-white hover:bg-white/10"
                    aria-label="Open menu"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <Link href="/admin/courses" className="flex items-center gap-2 text-white font-bold">
                    <Logo iconOnly /> <span>Admin</span>
                </Link>
                <Link href="/dashboard" className="text-xs font-semibold text-indigo-300 px-2 py-2">Student site</Link>
            </div>

            {open && (
                <div className="lg:hidden fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
                    <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-slate-950 border-r border-indigo-500/10 flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between p-4">
                            <Logo variant="white" />
                            <button type="button" onClick={() => setOpen(false)} className="h-11 w-11 flex items-center justify-center rounded-xl text-white hover:bg-white/10" aria-label="Close menu">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="px-4 pb-4 overflow-y-auto">{links}</div>
                        {footer}
                    </div>
                </div>
            )}
        </>
    );
}
