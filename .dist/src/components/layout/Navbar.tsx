import { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, Menu, Sun, Moon, LogOut, Settings, ChevronDown, Rocket } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const getBaseUrl = () => {
    const url = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:8000';
    return url.endsWith('/') ? url.slice(0, -1) : url;
};

export default function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const avatarUrl = user?.avatar
        ? `${getBaseUrl()}/storage/${user.avatar}`
        : null;

    return (
        <header className="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-x-4 border-b border-card-border bg-background/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8 transition-all duration-500">
            <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-200 lg:hidden"
                onClick={onMenuClick}
            >
                <span className="sr-only">Open sidebar</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
            </button>

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 items-center">
                <form className="relative flex flex-1 max-w-md" action="#" method="GET">
                    <label htmlFor="search-field" className="sr-only">Search</label>
                    <Search className="pointer-events-none absolute inset-y-0 left-4 h-full w-4 text-foreground/40" />
                    <input
                        id="search-field"
                        className="block h-10 w-full bg-card-bg border-0 rounded-2xl py-0 pl-11 pr-4 text-foreground placeholder:text-foreground/40 focus:ring-2 focus:ring-accent-blue/20 text-sm transition-all"
                        placeholder="Search for intelligence..."
                        type="search"
                        name="search"
                    />
                </form>

                <div className="flex flex-1 justify-end items-center gap-x-4 lg:gap-x-6">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl bg-card-bg text-foreground/50 hover:text-accent-blue transition-all border border-card-border shadow-sm group"
                        title={theme === 'dark' ? 'Activate Day Mode' : 'Activate Stealth Mode'}
                    >
                        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>

                    <button type="button" className="relative p-2.5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors">
                        <span className="sr-only">View notifications</span>
                        <Bell className="h-5 w-5" aria-hidden="true" />
                        <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />
                    </button>

                    <div className="hidden lg:block h-6 w-px bg-gray-200 dark:bg-white/10" aria-hidden="true" />

                    {/* Profile Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all group"
                        >
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/20 group-hover:shadow-neon transition-shadow">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={user?.name || 'V'}
                                        className="h-full w-full object-cover rounded-lg bg-background"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            if (target.nextElementSibling) {
                                                (target.nextElementSibling as HTMLElement).classList.remove('hidden');
                                                (target.nextElementSibling as HTMLElement).classList.add('flex');
                                            }
                                        }}
                                    />
                                ) : null}
                                <div className={cn("h-full w-full bg-background rounded-lg flex items-center justify-center text-[10px] font-black text-blue-600 uppercase", avatarUrl ? "hidden" : "flex")}>
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                            </div>
                            <span className="hidden lg:flex flex-col items-start">
                                <span className="text-xs font-black text-foreground uppercase tracking-tight flex items-center gap-1">
                                    {user?.name || 'Aspirant'}
                                    <ChevronDown className={cn("h-3 w-3 transition-transform duration-300", isProfileOpen && "rotate-180")} />
                                </span>
                                <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest leading-none">Intelligence Ops</span>
                            </span>
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileOpen && (
                            <div className="absolute right-0 mt-3 w-56 origin-top-right bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-white/5 p-2 animate-in fade-in slide-in-from-top-4 duration-300 overflow-hidden">
                                <p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">Active Identity</p>
                                <p className="text-[10px] font-black text-foreground truncate mt-1 uppercase tracking-tight">{user?.name}</p>
                                <p className="text-[8px] font-bold text-foreground/50 truncate mt-0.5 tracking-wider">{user?.email}</p>

                                <Link
                                    href="/dashboard/settings"
                                    className="flex items-center gap-3 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-foreground/70 hover:bg-accent-blue/10 hover:text-accent-blue rounded-xl transition-all group"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <Settings className="h-4 w-4 text-foreground/40 group-hover:text-accent-blue transition-colors" />
                                    Account Settings
                                </Link>

                                <Link
                                    href="/dashboard/identity"
                                    className="flex items-center gap-3 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-foreground/70 hover:bg-indigo-600/10 hover:text-indigo-600 rounded-xl transition-all group"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <Rocket className="h-4 w-4 text-foreground/40 group-hover:text-indigo-600 transition-colors" />
                                    Growth Identity
                                </Link>

                                <div className="h-px bg-card-border my-1" />

                                <button
                                    onClick={logout}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded-xl transition-all group"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Deactivate Session
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
