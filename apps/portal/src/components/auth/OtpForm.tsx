'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';

type Props = {
    /** login = existing account; signup = new account (asks for a name) */
    mode: 'login' | 'signup';
    initialPhone?: string;
    /** Called with the auth payload once the OTP is verified */
    onAuthenticated: (token: string, user: unknown, isNewUser: boolean) => void;
};

type ApiError = { response?: { status?: number; data?: { message?: string; can_signup?: boolean; can_login?: boolean; needs_name?: boolean } } };

const RESEND_SECONDS = 30;

/**
 * Mobile-number OTP sign-in / sign-up.
 * Step 1: phone (+ name/email for sign-up) → "Send OTP"
 * Step 2: 6-digit code → verify. In test mode (no SMS gateway yet) the server
 * returns the code and it is shown on screen.
 */
export default function OtpForm({ mode, initialPhone = '', onAuthenticated }: Props) {
    const [phone, setPhone] = useState(initialPhone);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hint, setHint] = useState<React.ReactNode>(null);
    const [info, setInfo] = useState('');
    const [devOtp, setDevOtp] = useState<string | null>(null);
    const [resendIn, setResendIn] = useState(0);
    const otpRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (resendIn <= 0) return;
        const t = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
        return () => window.clearTimeout(t);
    }, [resendIn]);

    const digits = phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '').replace(/^0(?=\d{10}$)/, '');
    const phoneOk = /^[6-9]\d{9}$/.test(digits);

    const sendOtp = async () => {
        setError(''); setHint(null); setInfo(''); setDevOtp(null);
        if (!phoneOk) { setError('Enter a valid 10-digit mobile number.'); return; }
        if (mode === 'signup' && name.trim().length < 2) { setError('Please enter your name.'); return; }
        setLoading(true);
        try {
            const res = await api.post('/auth/send-otp', {
                phone: digits,
                purpose: mode,
                email: mode === 'signup' && email ? email : undefined,
            });
            setStep('otp');
            setResendIn(RESEND_SECONDS);
            setInfo(res.data.message ?? 'OTP sent.');
            setDevOtp(res.data.dev_otp ?? null);
            window.setTimeout(() => otpRef.current?.focus(), 50);
        } catch (err: unknown) {
            const e = err as ApiError;
            const data = e.response?.data;
            setError(data?.message || 'Could not send the OTP. Please try again.');
            if (data?.can_signup) {
                setHint(<Link href={`/auth/signup?phone=${digits}&via=otp`} className="font-semibold text-primary hover:underline">Create an account with this number</Link>);
            }
            if (data?.can_login) {
                setHint(<Link href={`/auth/login?phone=${digits}&via=otp`} className="font-semibold text-primary hover:underline">Sign in instead</Link>);
            }
        } finally {
            setLoading(false);
        }
    };

    const verify = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setError('');
        if (!/^\d{6}$/.test(otp)) { setError('Enter the 6-digit OTP.'); return; }
        setLoading(true);
        try {
            const res = await api.post('/auth/verify-otp', {
                phone: digits,
                otp,
                ...(mode === 'signup' ? { name: name.trim(), email: email || undefined } : {}),
            });
            onAuthenticated(res.data.access_token, res.data.user, !!res.data.is_new_user);
        } catch (err: unknown) {
            const e = err as ApiError;
            const data = e.response?.data;
            if (data?.needs_name) {
                setError('No account with this number yet.');
                setHint(<Link href={`/auth/signup?phone=${digits}&via=otp`} className="font-semibold text-primary hover:underline">Create an account</Link>);
            } else {
                setError(data?.message || 'Invalid or expired OTP.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-5">
            {error && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
                    {error}{hint && <> · {hint}</>}
                </div>
            )}

            {step === 'phone' && (
                <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); void sendOtp(); }}>
                    {mode === 'signup' && (
                        <div>
                            <label htmlFor="otp-name" className="label">Your name</label>
                            <input id="otp-name" className="input" required autoComplete="name" placeholder="e.g. Priya Kumari"
                                value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                    )}
                    <div>
                        <label htmlFor="otp-phone" className="label">Mobile number</label>
                        <div className="flex gap-2">
                            <span className="input w-16 shrink-0 flex items-center justify-center text-muted-foreground select-none">+91</span>
                            <input id="otp-phone" className="input" required inputMode="numeric" autoComplete="tel-national"
                                placeholder="10-digit mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
                    </div>
                    {mode === 'signup' && (
                        <div>
                            <label htmlFor="otp-email" className="label">E-mail <span className="text-muted-foreground font-normal">(optional, for results)</span></label>
                            <input id="otp-email" type="email" className="input" autoComplete="email" placeholder="you@example.com"
                                value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                    )}
                    <button type="submit" disabled={loading} className="btn btn-primary w-full">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send OTP'}
                    </button>
                    <p className="text-xs text-muted-foreground">We will send a 6-digit code by SMS. Standard rates may apply.</p>
                </form>
            )}

            {step === 'otp' && (
                <form className="space-y-5" onSubmit={verify}>
                    <div className="rounded-xl border border-card-border bg-background/60 px-4 py-3 text-sm">
                        <p>{info}</p>
                        <p className="mt-1 text-muted-foreground">
                            Sent to +91 {digits.slice(0, 2)}XXXXXX{digits.slice(-2)} ·{' '}
                            <button type="button" className="font-semibold text-primary hover:underline" onClick={() => { setStep('phone'); setOtp(''); setDevOtp(null); }}>
                                change number
                            </button>
                        </p>
                        {devOtp && (
                            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                                <strong>Test mode</strong> (SMS gateway not connected yet) — your OTP is <span className="font-mono text-base tracking-widest">{devOtp}</span>
                            </p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="otp-code" className="label">Enter OTP</label>
                        <input ref={otpRef} id="otp-code" className="input text-center text-2xl tracking-[0.5em] font-mono" inputMode="numeric"
                            autoComplete="one-time-code" maxLength={6} placeholder="••••••" value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} />
                    </div>
                    <button type="submit" disabled={loading} className="btn btn-primary w-full">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'signup' ? 'Verify & create account' : 'Verify & sign in'}
                    </button>
                    <p className="text-center text-sm text-muted-foreground">
                        {resendIn > 0 ? (
                            <>Resend OTP in {resendIn}s</>
                        ) : (
                            <button type="button" className="font-semibold text-primary hover:underline" onClick={() => void sendOtp()} disabled={loading}>
                                Resend OTP
                            </button>
                        )}
                    </p>
                </form>
            )}
        </div>
    );
}
