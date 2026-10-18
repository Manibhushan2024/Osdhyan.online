'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';

type Props = {
    /** login = existing account; signup = new account (asks for a name) */
    mode: 'login' | 'signup';
    initialIdentifier?: string;
    /** Called with the auth payload once the OTP is verified */
    onAuthenticated: (token: string, user: unknown, isNewUser: boolean) => void;
};

type ApiError = { response?: { status?: number; data?: { message?: string; can_signup?: boolean; can_login?: boolean; needs_name?: boolean } } };

const RESEND_SECONDS = 30;

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
const toPhone = (v: string) => v.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '').replace(/^0(?=\d{10}$)/, '');
const isPhone = (v: string) => /^[6-9]\d{9}$/.test(toPhone(v));

/**
 * OTP sign-in / sign-up by mobile number OR e-mail.
 * Step 1: identifier (+ name for sign-up) → "Send OTP"
 * Step 2: 6-digit code → verify. In test mode (no SMS / e-mail gateway yet)
 * the server returns the code and it is shown on screen.
 */
export default function OtpForm({ mode, initialIdentifier = '', onAuthenticated }: Props) {
    const [identifier, setIdentifier] = useState(initialIdentifier);
    const [name, setName] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'identify' | 'otp'>('identify');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hint, setHint] = useState<React.ReactNode>(null);
    const [info, setInfo] = useState('');
    const [sentTo, setSentTo] = useState('');
    const [devOtp, setDevOtp] = useState<string | null>(null);
    const [resendIn, setResendIn] = useState(0);
    const otpRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (resendIn <= 0) return;
        const t = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
        return () => window.clearTimeout(t);
    }, [resendIn]);

    const trimmed = identifier.trim();
    const channel: 'email' | 'phone' | null = isEmail(trimmed) ? 'email' : isPhone(trimmed) ? 'phone' : null;
    const target = channel === 'phone' ? toPhone(trimmed) : trimmed.toLowerCase();

    const sendOtp = async () => {
        setError(''); setHint(null); setInfo(''); setDevOtp(null);
        if (!channel) { setError('Enter a valid 10-digit mobile number or an e-mail address.'); return; }
        if (mode === 'signup' && name.trim().length < 2) { setError('Please enter your name.'); return; }
        setLoading(true);
        try {
            const res = await api.post('/auth/send-otp', { identifier: target, purpose: mode });
            setStep('otp');
            setResendIn(RESEND_SECONDS);
            setInfo(res.data.message ?? 'OTP sent.');
            setSentTo(channel === 'phone' ? `+91 ${target.slice(0, 2)}XXXXXX${target.slice(-2)}` : target);
            setDevOtp(res.data.dev_otp ?? null);
            window.setTimeout(() => otpRef.current?.focus(), 50);
        } catch (err: unknown) {
            const data = (err as ApiError).response?.data;
            setError(data?.message || 'Could not send the OTP. Please try again.');
            if (data?.can_signup) {
                setHint(<Link href={`/auth/signup?id=${encodeURIComponent(target)}`} className="font-semibold text-primary hover:underline">Create an account</Link>);
            }
            if (data?.can_login) {
                setHint(<Link href={`/auth/login?id=${encodeURIComponent(target)}`} className="font-semibold text-primary hover:underline">Sign in instead</Link>);
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
                identifier: target,
                otp,
                ...(mode === 'signup' ? { name: name.trim() } : {}),
            });
            onAuthenticated(res.data.access_token, res.data.user, !!res.data.is_new_user);
        } catch (err: unknown) {
            const data = (err as ApiError).response?.data;
            if (data?.needs_name) {
                setError('No account yet with these details.');
                setHint(<Link href={`/auth/signup?id=${encodeURIComponent(target)}`} className="font-semibold text-primary hover:underline">Create an account</Link>);
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

            {step === 'identify' && (
                <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); void sendOtp(); }}>
                    {mode === 'signup' && (
                        <div>
                            <label htmlFor="otp-name" className="label">Your name</label>
                            <input id="otp-name" className="input" required autoComplete="name" placeholder="e.g. Priya Kumari"
                                value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                    )}
                    <div>
                        <label htmlFor="otp-id" className="label">Mobile number or e-mail</label>
                        <input id="otp-id" className="input" required inputMode="email" autoComplete="username"
                            placeholder="98XXXXXXXX or you@example.com" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
                        {channel === 'phone' && <p className="mt-1 text-xs text-muted-foreground">We will SMS a code to +91 {target}.</p>}
                        {channel === 'email' && <p className="mt-1 text-xs text-muted-foreground">We will e-mail a code to {target}.</p>}
                    </div>
                    <button type="submit" disabled={loading} className="btn btn-primary w-full">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send OTP'}
                    </button>
                    <p className="text-xs text-muted-foreground">No password needed. The code is valid for 10 minutes.</p>
                </form>
            )}

            {step === 'otp' && (
                <form className="space-y-5" onSubmit={verify}>
                    <div className="rounded-xl border border-card-border bg-background/60 px-4 py-3 text-sm">
                        <p>{info}</p>
                        <p className="mt-1 text-muted-foreground">
                            Sent to {sentTo} ·{' '}
                            <button type="button" className="font-semibold text-primary hover:underline" onClick={() => { setStep('identify'); setOtp(''); setDevOtp(null); }}>
                                change
                            </button>
                        </p>
                        {devOtp && (
                            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                                <strong>Test mode</strong> (delivery not connected yet) — your OTP is <span className="font-mono text-base tracking-widest">{devOtp}</span>
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
