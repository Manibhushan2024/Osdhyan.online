'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { redirectFromLocation } from '@/lib/redirect';
import OtpForm from '@/components/auth/OtpForm';
import GoogleButton from '@/components/auth/GoogleButton';
import AuthShell from '@/components/auth/AuthShell';

function LoginPageInner() {
    const { login: authenticateUser } = useAuth();
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const params = useSearchParams();
    const [method, setMethod] = useState<'otp' | 'password'>(params.get('via') === 'password' ? 'password' : 'otp');
    const prefillId = params.get('id') ?? params.get('phone') ?? '';

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

            {params.get('error') && !error && (
                <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
                    {params.get('error')}
                </div>
            )}

            {/* Method switch */}
            <div className="mb-6 grid grid-cols-2 rounded-xl bg-background/60 p-1 border border-card-border text-sm font-medium" role="tablist">
                <button type="button" role="tab" aria-selected={method === 'otp'} onClick={() => { setMethod('otp'); setError(''); }}
                    className={`rounded-lg py-2 transition ${method === 'otp' ? 'bg-primary text-white shadow' : 'text-muted-foreground hover:text-foreground'}`}>
                    Mobile OTP
                </button>
                <button type="button" role="tab" aria-selected={method === 'password'} onClick={() => { setMethod('password'); setError(''); }}
                    className={`rounded-lg py-2 transition ${method === 'password' ? 'bg-primary text-white shadow' : 'text-muted-foreground hover:text-foreground'}`}>
                    Email / password
                </button>
            </div>

            {method === 'otp' ? (
                <OtpForm
                    mode="login"
                    initialIdentifier={prefillId}
                    onAuthenticated={(token, user) => authenticateUser(token, user as Parameters<typeof authenticateUser>[1], redirectFromLocation('/dashboard'))}
                />
            ) : (
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
            )}

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-card-border" /></div>
                <div className="relative flex justify-center">
                    <span className="bg-card-bg px-3 text-xs text-muted-foreground">or</span>
                </div>
            </div>

            <GoogleButton onError={setError} />
        </AuthShell>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <LoginPageInner />
        </Suspense>
    );
}
