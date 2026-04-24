'use client';

import {
    Trophy,
    History,
    Notebook,
    Timer,
    Cpu,
    FolderOpen,
    Newspaper,
    Route,
    Shield,
    LayoutDashboard,
    BookOpen,
    Video,
    RotateCcw,
    ClipboardCheck,
    FileText,
    HelpCircle,
    Settings,
    LogOut,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

interface NavItem {
    name: string;
    href: string;
    icon: any;
    badge?: string;
    color?: string;
}

interface NavCategory {
    title: string;
    items: NavItem[];
}

const navCategories: NavCategory[] = [
    {
        title: 'Learn',
        items: [
            { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
            { name: 'Courses', href: '/dashboard/courses', icon: BookOpen },
            { name: 'Live Classes', href: '/dashboard/live', icon: Video, badge: 'LIVE' },
            { name: 'Practice', href: '/dashboard/practice', icon: RotateCcw },
        ]
    },
    {
        title: 'Tests',
        items: [
            { name: 'Test Series', href: '/dashboard/test-series', icon: ClipboardCheck },
            { name: 'Prev. Year Papers', href: '/dashboard/pyqs', icon: FileText },
            { name: 'Free Quizzes', href: '/dashboard/tests', icon: HelpCircle },
        ]
    },
    {
        title: 'Academic',
        items: [
            { name: 'Syllabus', href: '/dashboard/syllabus', icon: Route },
            { name: 'Notes', href: '/dashboard/notes', icon: Notebook },
            { name: 'Materials', href: '/dashboard/materials', icon: FolderOpen },
            { name: 'Blogs', href: '/dashboard/blogs', icon: Newspaper },
        ]
    },
    {
        title: 'Productivity',
        items: [
            { name: 'Focus Terminal', href: '/dashboard/focus', icon: Timer },
            { name: 'Growth Lab', href: '/dashboard/productivity', icon: Cpu },
            { name: 'Mission History', href: '/dashboard/history', icon: History },
        ]
    },
    {
        title: 'Identity',
        items: [
            { name: 'Dossier', href: '/dashboard/identity', icon: Shield, color: 'text-indigo-500' },
            { name: 'Performance', href: '/dashboard/analytics', icon: Trophy },
            { name: 'Settings', href: '/dashboard/settings', icon: Settings },
            { name: 'Help Hub', href: '/dashboard/help', icon: HelpCircle },
        ]
    }
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <div className="flex h-full flex-col bg-sidebar-bg border-r border-card-border transition-all duration-700">
            <div className="p-8 pb-4">
                <div className="mb-10 px-2 group transition-all duration-500 transform hover:scale-105">
                    <Link href="/dashboard">
                        <Logo />
                    </Link>
                </div>

                <nav className="space-y-10 overflow-y-auto max-h-[calc(100vh-300px)] no-scrollbar">
                    {navCategories.map((category) => (
                        <div key={category.title} className="space-y-3">
                            <h3 className="px-4 text-[9px] font-black text-foreground/30 uppercase tracking-[0.3em] italic">{category.title}</h3>
                            <div className="space-y-1">
                                {category.items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center justify-between px-4 py-3 rounded-[1.2rem] transition-all group relative",
                                                isActive
                                                    ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20"
                                                    : "text-foreground/50 hover:bg-card-bg hover:text-foreground hover:translate-x-1"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className={cn("h-4 w-4", item.color || (isActive ? "text-white" : "text-gray-400 group-hover:text-blue-600 transition-colors"))} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>
                                            </div>
                                            {item.badge && (
                                                <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-lg animate-pulse">
                                                    {item.badge}
                                                </span>
                                            )}
                                            {isActive && (
                                                <span className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </div>

            <div className="mt-auto p-8 space-y-4">
                {user ? (
                    <button
                        onClick={() => logout()}
                        className="flex items-center gap-3 px-6 py-4 w-full rounded-2xl text-foreground/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-black uppercase tracking-widest text-[10px]"
                    >
                        <LogOut className="h-4 w-4" />
                        Terminate Session
                    </button>
                ) : (
                    <Link
                        href="/auth/login"
                        className="flex items-center gap-3 px-6 py-4 w-full rounded-2xl text-foreground/40 hover:text-accent-blue hover:bg-accent-blue/10 dark:hover:bg-accent-blue/10 transition-all font-black uppercase tracking-widest text-[10px]"
                    >
                        <Settings className="h-4 w-4" />
                        Initiate Login
                    </Link>
                )}

                <div className="p-6 bg-card-bg rounded-[2rem] border border-card-border shadow-sm">
                    <h4 className="text-[10px] font-black text-foreground/50 uppercase tracking-widest">System Status</h4>
                    <p className="text-[9px] text-accent-blue font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,1)] animate-pulse" />
                        Neural Link Active
                    </p>
                </div>
            </div>
        </div>
    );
}
