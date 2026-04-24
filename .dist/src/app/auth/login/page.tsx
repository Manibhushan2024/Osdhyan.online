'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Loader2, ArrowRight, Lock, UserCircle } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login', { login, password });
            localStorage.setItem('auth_token', res.data.access_token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Tech Orbs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[120px] -ml-64 -mb-64" />

            <div className="w-full max-w-md space-y-12 relative z-10">
                <div className="flex flex-col items-center text-center">
                    <Logo className="scale-125 mb-8" />
                    <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">
                        Intelligence Access
                    </h2>
                    <p className="mt-2 text-[10px] font-black text-indigo-400/50 uppercase tracking-[0.3em]">
                        Establish secure uplink to your dashboard
                    </p>
                </div>

                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] shadow-2xl relative">
                    <div className="absolute -top-px -right-px w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-tr-[3rem]" />

                    {error && (
                        <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 animate-in fade-in slide-in-from-top-2">
                            <div className="text-[10px] font-black text-red-400 uppercase tracking-widest text-center">{error}</div>
                        </div>
                    )}

                    <form className="space-y-8" onSubmit={handleLogin}>
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="login" className="block text-[10px] font-black text-white/40 uppercase tracking-widest ml-4 mb-2">
                                    Identity Descriptor
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <UserCircle className="h-4 w-4 text-indigo-500 group-focus-within:text-emerald-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        id="login"
                                        required
                                        className="block w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-bold text-sm"
                                        placeholder="Mobile or Email"
                                        value={login}
                                        onChange={(e) => setLogin(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between ml-4 mb-2">
                                    <label htmlFor="password" className="block text-[10px] font-black text-white/40 uppercase tracking-widest">
                                        Access Key
                                    </label>
                                    <Link href="/auth/forgot-password" className="text-[8px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300">
                                        Key Recovery?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-indigo-500 group-focus-within:text-emerald-500 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        id="password"
                                        required
                                        className="block w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-bold text-sm"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] hover:from-indigo-500 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                <>
                                    Initiate Access
                                    <ArrowRight className="h-3 w-3" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-4 bg-[#0f172a] text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Alternative Auth</span>
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                className="w-full py-4 border border-white/5 rounded-2xl bg-white/[0.02] text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/[0.05] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google Quantum Login
                            </button>
                        </div>
                    </div>
                </div>

                <p className="text-center">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mr-2">New Candidate?</span>
                    <Link href="/auth/signup" className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">
                        Register Protocol
                    </Link>
                </p>
            </div>
        </div>
    );
}
