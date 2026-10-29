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
    GraduationCap,
    ShoppingBag,
    MessageSquare,
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
    icon: React.ElementType;
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
            { name: 'Home Tuition', href: '/dashboard/tuition', icon: GraduationCap },
            { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
            { name: 'Practice', href: '/dashboard/practice', icon: RotateCcw },
        ]
    },
    {
        title: 'Tests',
        items: [
            { name: 'Test Series', href: '/dashboard/test-series', icon: ClipboardCheck },
            { name: 'My Purchases', href: '/dashboard/orders', icon: ShoppingBag },
            { name: 'Prev. Year Papers', href: '/dashboard/pyqs', icon: FileText },
            { name: 'Free Tests', href: '/dashboard/tests', icon: HelpCircle },
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
        title: 'Study tools',
        items: [
            { name: 'Focus Timer', href: '/dashboard/focus', icon: Timer },
            { name: 'Productivity', href: '/dashboard/productivity', icon: Cpu },
            { name: 'My attempts', href: '/dashboard/history', icon: History },
        ]
    },
    {
        title: 'Account',
        items: [
            { name: 'My Profile', href: '/dashboard/identity', icon: Shield },
            { name: 'Performance', href: '/dashboard/analytics', icon: Trophy },
            { name: 'Settings', href: '/dashboard/settings', icon: Settings },
            { name: 'Help & Support', href: '/dashboard/help', icon: HelpCircle },
        ]
    }
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <div className="flex h-full flex-col bg-sidebar-bg border-r border-card-border overflow-y-auto">
            <div className="p-4 pb-2">
                <div className="mb-6 px-2 pt-2">
                    <Link href="/dashboard">
                        <Logo />
                    </Link>
                </div>

                <nav className="space-y-6">
                    {navCategories.map((category) => (
                        <div key={category.title} className="space-y-3">
                            <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{category.title}</h3>
                            <div className="space-y-1">
                                {category.items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center justify-between px-4 py-2.5 min-h-[44px] rounded-xl transition-colors group relative",
                                                isActive
                                                    ? "bg-primary text-white"
                                                    : "text-foreground/70 hover:bg-muted hover:text-foreground"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className={cn("h-4 w-4", item.color || (isActive ? "text-white" : "text-gray-400 group-hover:text-blue-600 transition-colors"))} />
                                                <span className="text-sm font-medium">{item.name}</span>
                                            </div>
                                            {item.badge && (
                                                <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </div>

            <div className="mt-auto p-4 space-y-1 border-t border-card-border">
                {(user as { role?: string } | null)?.role === 'teacher' && (
                    <Link
                        href="/teach"
                        className="flex items-center gap-3 px-4 py-2.5 min-h-[44px] w-full rounded-xl text-foreground/70 hover:text-foreground hover:bg-muted transition-colors text-sm font-medium"
                    >
                        <GraduationCap className="h-4 w-4" />
                        Teacher Panel
                    </Link>
                )}
                {user?.is_admin && (
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-2.5 min-h-[44px] w-full rounded-xl text-foreground/70 hover:text-foreground hover:bg-muted transition-colors text-sm font-medium"
                    >
                        <Settings className="h-4 w-4" />
                        Admin Panel
                    </Link>
                )}
                {user ? (
                    <button
                        onClick={() => logout()}
                        className="flex items-center gap-3 px-4 py-2.5 min-h-[44px] w-full rounded-xl text-foreground/70 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign out
                    </button>
                ) : (
                    <Link
                        href="/auth/login"
                        className="flex items-center gap-3 px-4 py-2.5 min-h-[44px] w-full rounded-xl text-foreground/70 hover:text-foreground hover:bg-muted transition-colors text-sm font-medium"
                    >
                        <Settings className="h-4 w-4" />
                        Sign in
                    </Link>
                )}
            </div>
        </div>
    );
}
