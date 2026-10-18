'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { redirectFromLocation, rememberOAuthRedirect } from '@/lib/redirect';
import AuthShell from '@/components/auth/AuthShell';

export default function LoginPage() {
    const router = useRouter();
    const { login: authenticateUser } = useAuth();
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login', { login, password });
            // Honour ?redirect= (same-origin relative paths only).
            authenticateUser(res.data.access_token, res.data.user, redirectFromLocation('/dashboard'));
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setError(message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            title="Sign in"
            subtitle="Welcome back. Sign in to continue your preparation."
            footer={
                <>
                    New to OSDHYAN?{' '}
                    <Link href="/auth/signup" className="font-semibold text-primary hover:underline">
                        Create a free account
                    </Link>
                </>
            }
        >
            {error && (
                <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
                    {error}
                </div>
            )}

            <form className="space-y-5" onSubmit={handleLogin}>
                <div>
                    <label htmlFor="login" className="label">Mobile number or email</label>
                    <input
                        type="text"
                        id="login"
                        required
                        autoComplete="username"
                        inputMode="email"
                        className="input"
                        placeholder="e.g. 98XXXXXXXX or you@example.com"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="password" className="label mb-0">Password</label>
                        <Link href="/auth/forgot-password" className="text-sm font-medium text-primary hover:underline">
                            Forgot password?
                        </Link>
                    </div>
                    <input
                        type="password"
                        id="password"
                        required
                        autoComplete="current-password"
                        className="input"
                        placeholder="Your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary w-full">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign in'}
                </button>
            </form>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-card-border" /></div>
                <div className="relative flex justify-center">
                    <span className="bg-card-bg px-3 text-xs text-muted-foreground">or</span>
                </div>
            </div>

            <button
                type="button"
                disabled={googleLoading}
                onClick={async () => {
                    setGoogleLoading(true);
                    try {
                        rememberOAuthRedirect(redirectFromLocation(''));
                        const res = await api.get('/auth/google/redirect');
                        window.location.href = res.data.url;
                    } catch {
                        setError('Google sign-in is unavailable right now. Please try again.');
                        setGoogleLoading(false);
                    }
                }}
                className="btn btn-secondary w-full"
            >
                {googleLoading
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                }
                Continue with Google
            </button>
        </AuthShell>
    );
}
