'use client';

import { useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import api from '@/lib/api';
import { useAuth } from '@/components/providers/AuthProvider';

export default function AdminLoginPage() {
    const { login } = useAuth();
    const [loginValue, setLoginValue] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');

        const cleanedLogin = loginValue.trim();
        if (!cleanedLogin || !password) {
            setError('Enter username/email and password.');
            return;
        }

        try {
            setSubmitting(true);
            const response = await api.post('/auth/admin/login', {
                login: cleanedLogin,
                password,
            });

            const token = response.data?.access_token;
            const user = response.data?.user;

            if (!token || !user) {
                setError('Invalid admin login response.');
                return;
            }

            await login(token, user, '/admin/courses');
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Admin login failed.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
            <div className="w-full max-w-md rounded-2xl border border-indigo-500/20 bg-white/[0.02] p-8 shadow-2xl shadow-indigo-900/30">
                <div className="flex flex-col items-center text-center mb-8">
                    <Logo variant="indigo" className="scale-125 mb-4" />
                    <h1 className="mt-4 text-2xl font-bold text-white tracking-tight">
                        Admin sign in
                    </h1>
                    <p className="mt-2 text-sm text-indigo-200/70">
                        For OSDHYAN administrators only
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-indigo-100 mb-1.5">
                            Username or Email
                        </label>
                        <input
                            value={loginValue}
                            onChange={(e) => setLoginValue(e.target.value)}
                            placeholder="Username or email"
                            className="w-full rounded-xl border border-indigo-500/20 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder:text-indigo-200/25 focus:outline-none focus:border-indigo-400/50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-indigo-100 mb-1.5">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="w-full rounded-xl border border-indigo-500/20 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder:text-indigo-200/25 focus:outline-none focus:border-indigo-400/50"
                        />
                    </div>

                    {error ? (
                        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-200">
                            {error}
                        </div>
                    ) : null}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white py-3 min-h-[44px] text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        {submitting ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    );
}
