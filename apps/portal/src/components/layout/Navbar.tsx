import { useState, useRef, useEffect } from 'react';
import { Menu, Sun, Moon, LogOut, Settings, ChevronDown, User, Coins } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const getBaseUrl = () => {
    const url = (process.env.NEXT_PUBLIC_STORAGE_URL ?? process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') ?? '');
    return url.replace(/\/$/, '');
};

export default function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
    const { theme, toggleTheme } = useTheme();
    const { user, loading, logout } = useAuth();
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
        <>
            {!loading && !user && (
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-2 bg-accent text-accent-foreground border-b border-card-border text-sm">
                    <p>You are browsing as a guest. Sign in to save your scores and progress.</p>
                    <div className="flex items-center gap-2 shrink-0">
                        <Link href="/auth/login" className="btn btn-ghost btn-sm text-accent-foreground">Sign in</Link>
                        <Link href="/auth/signup" className="btn btn-primary btn-sm">Create free account</Link>
                    </div>
                </div>
            )}
            <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-card-border bg-background/90 backdrop-blur px-4 sm:px-6">
                <button
                    type="button"
                    className="-ml-2 flex h-11 w-11 items-center justify-center rounded-xl text-foreground hover:bg-muted lg:hidden"
                    onClick={onMenuClick}
                    aria-label="Open menu"
                >
                    <Menu className="h-6 w-6" aria-hidden="true" />
                </button>

                <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-card-border bg-card-bg text-muted-foreground hover:text-foreground"
                        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>

                    {/* Coin balance */}
                    {user && (user.coins ?? 0) > 0 && (
                        <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300" title="Coins">
                            <Coins className="h-4 w-4" />
                            {user.coins}
                        </div>
                    )}

                    {/* Profile menu */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 rounded-xl p-1 pr-2 hover:bg-muted min-h-[44px]"
                            aria-haspopup="menu"
                            aria-expanded={isProfileOpen}
                        >
                            <div className="h-9 w-9 overflow-hidden rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                                {avatarUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={avatarUrl}
                                        alt={user?.name || 'Profile'}
                                        className="h-full w-full object-cover"
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
                                <div className={cn('h-full w-full items-center justify-center text-sm font-bold uppercase', avatarUrl ? 'hidden' : 'flex')}>
                                    {user?.name?.charAt(0) || <User className="h-4 w-4" />}
                                </div>
                            </div>
                            <span className="hidden lg:flex items-center gap-1 text-sm font-medium max-w-[160px]">
                                <span className="truncate">{user?.name || 'Guest'}</span>
                                <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', isProfileOpen && 'rotate-180')} />
                            </span>
                        </button>

                        {isProfileOpen && (
                            <div role="menu" className="absolute right-0 mt-2 w-64 card p-2 shadow-xl">
                                {user ? (
                                    <>
                                        <div className="px-3 py-2">
                                            <p className="text-sm font-semibold truncate">{user.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                        <div className="my-1 h-px bg-card-border" />
                                        <Link
                                            href="/dashboard/identity"
                                            role="menuitem"
                                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-muted min-h-[44px]"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            My profile
                                        </Link>
                                        <Link
                                            href="/dashboard/settings"
                                            role="menuitem"
                                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-muted min-h-[44px]"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <Settings className="h-4 w-4 text-muted-foreground" />
                                            Settings
                                        </Link>
                                        <div className="my-1 h-px bg-card-border" />
                                        <button
                                            onClick={logout}
                                            role="menuitem"
                                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 min-h-[44px]"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Sign out
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="px-3 py-2">
                                            <p className="text-sm font-semibold">Not signed in</p>
                                            <p className="text-xs text-muted-foreground">Sign in to save your progress.</p>
                                        </div>
                                        <div className="my-1 h-px bg-card-border" />
                                        <Link href="/auth/login" className="btn btn-primary w-full" onClick={() => setIsProfileOpen(false)}>
                                            Sign in
                                        </Link>
                                        <Link href="/auth/signup" className="btn btn-secondary w-full mt-2" onClick={() => setIsProfileOpen(false)}>
                                            Create account
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
}
