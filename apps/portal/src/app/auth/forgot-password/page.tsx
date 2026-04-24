'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Loader2, ArrowRight, Lock, Smartphone, ShieldCheck, Activity } from 'lucide-react';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<'request' | 'reset'>('request');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(0);

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/forgot-password', { phone });
            if (res.data.dev_otp) {
                console.log(`Dev-Only OTP: ${res.data.dev_otp}`);
            }
            setStep('reset');
            setResendTimer(30);
            const interval = setInterval(() => {
                setResendTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send reset link. Verify your number.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        try {
            await api.post('/auth/reset-password', { phone, otp, password });
            router.push('/auth/login?reset=success');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Reset failed. Check your OTP or security key.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Tech Orbs */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -ml-64 -mt-64" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[120px] -mr-64 -mb-64" />

            <div className="w-full max-w-md space-y-12 relative z-10">
                <div className="flex flex-col items-center text-center">
                    <Logo className="scale-125 mb-8" />
                    <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">
                        {step === 'request' ? 'Key Recovery' : 'Reset Protocol'}
                    </h2>
                    <p className="mt-2 text-[10px] font-black text-indigo-400/50 uppercase tracking-[0.3em]">
                        {step === 'request'
                            ? 'Initiate identity verification sequence'
                            : `Transmission verified for ${phone}`}
                    </p>
                </div>

                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] shadow-2xl relative">
                    <div className="absolute -top-px -left-px w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-tl-[3rem]" />

                    {error && (
                        <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 animate-in fade-in slide-in-from-top-2">
                            <div className="text-[10px] font-black text-red-400 uppercase tracking-widest text-center">{error}</div>
                        </div>
                    )}

                    {step === 'request' ? (
                        <form className="space-y-8" onSubmit={handleRequestOtp}>
                            <div>
                                <label htmlFor="phone" className="block text-[10px] font-black text-white/40 uppercase tracking-widest ml-4 mb-2">
                                    Mobile Ident
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <Smartphone className="h-4 w-4 text-indigo-500 group-focus-within:text-emerald-500 transition-colors" />
                                    </div>
                                    <input
                                        type="tel"
                                        id="phone"
                                        required
                                        className="block w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-bold text-sm"
                                        placeholder="91XXXXXXXX"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] hover:from-indigo-500 hover:to-indigo-600 focus:outline-none transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                    <>
                                        Verify Identity
                                        <ArrowRight className="h-3 w-3" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form className="space-y-8" onSubmit={handleResetPassword}>
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="otp" className="block text-[10px] font-black text-white/40 uppercase tracking-widest ml-4 mb-2">
                                        Verification OTP
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                            <ShieldCheck className="h-4 w-4 text-emerald-500 group-focus-within:text-indigo-500 transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            id="otp"
                                            required
                                            maxLength={4}
                                            className="block w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-black text-center tracking-[0.5em] text-xl"
                                            placeholder="XXXX"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="password" className="block text-[10px] font-black text-white/40 uppercase tracking-widest ml-4 text-indigo-400">New Security Key</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400/50 group-focus-within:text-indigo-400 transition-colors" />
                                            <input
                                                type="password" id="password" required
                                                className="block w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold text-sm"
                                                placeholder="••••••••"
                                                value={password} onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="confirmPassword" className="block text-[10px] font-black text-white/40 uppercase tracking-widest ml-4 text-indigo-400">Confirm Key</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400/50 group-focus-within:text-indigo-400 transition-colors" />
                                            <input
                                                type="password" id="confirmPassword" required
                                                className="block w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold text-sm"
                                                placeholder="••••••••"
                                                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center px-4">
                                <button
                                    type="button"
                                    onClick={() => setStep('request')}
                                    className="text-[9px] font-black text-white/30 uppercase tracking-widest hover:text-white transition-colors"
                                >
                                    Modify Ident
                                </button>
                                <button
                                    type="button"
                                    disabled={resendTimer > 0 || loading}
                                    className={cn(
                                        "text-[9px] font-black uppercase tracking-widest transition-all",
                                        resendTimer > 0 ? "text-white/10 cursor-not-allowed" : "text-emerald-500 hover:text-emerald-400"
                                    )}
                                    onClick={handleRequestOtp}
                                >
                                    {resendTimer > 0 ? `Retry in ${resendTimer}s` : 'Request New Key'}
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 px-6 bg-emerald-600 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/10 hover:bg-emerald-500 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                    <>
                                        Establish New Key
                                        <Activity className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                <p className="text-center">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mr-2">Remember Key?</span>
                    <Link href="/auth/login" className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">
                        Re-Establish Link
                    </Link>
                </p>
            </div>
        </div>
    );
}
