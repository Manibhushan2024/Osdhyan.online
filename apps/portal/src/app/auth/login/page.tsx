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
import FirebasePhoneForm from '@/components/auth/FirebasePhoneForm';
import FirebaseEmailLinkForm from '@/components/auth/FirebaseEmailLinkForm';
import { useFirebaseAvailable } from '@/lib/firebase';

type Method = 'otp' | 'email-link' | 'password';

function initialMethod(via: string | null): Method {
    if (via === 'password') return 'password';
    if (via === 'email-link') return 'email-link';
    return 'otp';
}

function LoginPageInner() {
    const { login: authenticateUser } = useAuth();
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const params = useSearchParams();
    const [method, setMethod] = useState<Method>(initialMethod(params.get('via')));
    const prefillId = params.get('id') ?? params.get('phone') ?? '';
    // Firebase sign-in (SMS via Firebase, e-mail link, Google pop-up) when it
    // is configured; otherwise the server-side OTP flow is used.
    const firebase = useFirebaseAvailable();
    const tabs: { id: Method; label: string }[] = [
        { id: 'otp', label: 'Mobile OTP' },
        ...(firebase ? [{ id: 'email-link' as const, label: 'E-mail link' }] : []),
        { id: 'password', label: firebase ? 'Password' : 'Email / password' },
    ];
    const activeMethod: Method = method === 'email-link' && firebase === false ? 'otp' : method;
    const onAuthenticated = (token: string, user: unknown) =>
        authenticateUser(token, user as Parameters<typeof authenticateUser>[1], redirectFromLocation('/dashboard'));

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
            <div className={`mb-6 grid ${tabs.length === 3 ? 'grid-cols-3' : 'grid-cols-2'} rounded-xl bg-background/60 p-1 border border-card-border text-sm font-medium`} role="tablist">
                {tabs.map((tab) => (
                    <button key={tab.id} type="button" role="tab" aria-selected={activeMethod === tab.id} onClick={() => { setMethod(tab.id); setError(''); }}
                        className={`rounded-lg py-2 transition ${activeMethod === tab.id ? 'bg-primary text-white shadow' : 'text-muted-foreground hover:text-foreground'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeMethod === 'otp' ? (
                firebase === null ? (
                    <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                ) : firebase ? (
                    <FirebasePhoneForm mode="login" initialPhone={prefillId} onAuthenticated={onAuthenticated} />
                ) : (
                    <OtpForm mode="login" initialIdentifier={prefillId} onAuthenticated={onAuthenticated} />
                )
            ) : activeMethod === 'email-link' ? (
                <FirebaseEmailLinkForm initialEmail={prefillId} />
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
