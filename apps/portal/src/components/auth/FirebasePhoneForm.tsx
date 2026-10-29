'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';
import { exchangeFirebaseUser, firebaseErrorMessage, getFirebaseAuth } from '@/lib/firebase';

type Props = {
    /** signup asks for the student's name before sending the code */
    mode: 'login' | 'signup';
    initialPhone?: string;
    onAuthenticated: (token: string, user: unknown, isNewUser: boolean) => void;
};

const RESEND_SECONDS = 30;

const toPhone = (v: string) => v.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '').replace(/^0(?=\d{10}$)/, '');
const isPhone = (v: string) => /^[6-9]\d{9}$/.test(toPhone(v));

/**
 * Mobile OTP through Firebase phone sign-in: Firebase sends the SMS (with an
 * invisible reCAPTCHA check), the code is confirmed with Firebase, and the
 * resulting ID token is exchanged for our API token.
 */
export default function FirebasePhoneForm({ mode, initialPhone = '', onAuthenticated }: Props) {
    const [phone, setPhone] = useState(isPhone(initialPhone) ? toPhone(initialPhone) : '');
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [step, setStep] = useState<'phone' | 'code'>('phone');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendIn, setResendIn] = useState(0);
    const confirmation = useRef<ConfirmationResult | null>(null);
    const verifier = useRef<RecaptchaVerifier | null>(null);
    const recaptchaBox = useRef<HTMLDivElement>(null);
    const codeRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (resendIn <= 0) return;
        const t = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
        return () => window.clearTimeout(t);
    }, [resendIn]);

    // Warm up the SDK so the first "Send code" click is quick; clean up the reCAPTCHA on leave.
    useEffect(() => {
        void getFirebaseAuth().catch(() => undefined);
        return () => {
            verifier.current?.clear();
            verifier.current = null;
        };
    }, []);

    const resetVerifier = () => {
        try { verifier.current?.clear(); } catch { /* already gone */ }
        verifier.current = null;
    };

    const target = toPhone(phone);

    const sendCode = async () => {
        setError('');
        if (!isPhone(phone)) { setError('Enter a valid 10-digit mobile number.'); return; }
        if (mode === 'signup' && name.trim().length < 2) { setError('Please enter your name.'); return; }
        setLoading(true);
        try {
            const auth = await getFirebaseAuth();
            if (!auth) throw new Error('not-configured');
            const { RecaptchaVerifier, signInWithPhoneNumber } = await import('firebase/auth');
            if (!verifier.current && recaptchaBox.current) {
                // A fresh element each time: reCAPTCHA cannot render twice into one.
                recaptchaBox.current.innerHTML = '';
                const el = document.createElement('div');
                recaptchaBox.current.appendChild(el);
                verifier.current = new RecaptchaVerifier(auth, el, { size: 'invisible' });
            }
            if (!verifier.current) throw new Error('not-ready');
            confirmation.current = await signInWithPhoneNumber(auth, `+91${target}`, verifier.current);
            setStep('code');
            setCode('');
            setResendIn(RESEND_SECONDS);
            window.setTimeout(() => codeRef.current?.focus(), 50);
        } catch (err) {
            resetVerifier();
            setError(firebaseErrorMessage(err, 'Could not send the code. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    const verify = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setError('');
        if (!/^\d{6}$/.test(code)) { setError('Enter the 6-digit code from the SMS.'); return; }
        if (!confirmation.current) { setError('Please ask for a new code.'); setStep('phone'); return; }
        setLoading(true);
        try {
            const auth = await getFirebaseAuth();
            if (!auth) throw new Error('not-configured');
            const cred = await confirmation.current.confirm(code);
            const data = await exchangeFirebaseUser(auth, cred.user, mode === 'signup' ? name.trim() : undefined);
            onAuthenticated(data.access_token, data.user, !!data.is_new_user);
        } catch (err) {
            setError(firebaseErrorMessage(err, 'Could not verify the code. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-5">
            {error && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
                    {error}
                </div>
            )}

            {step === 'phone' && (
                <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); void sendCode(); }}>
                    {mode === 'signup' && (
                        <div>
                            <label htmlFor="fb-name" className="label">Your name</label>
                            <input id="fb-name" className="input" required autoComplete="name" placeholder="e.g. Priya Kumari"
                                value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                    )}
                    <div>
                        <label htmlFor="fb-phone" className="label">Mobile number</label>
                        <div className="flex gap-2">
                            <span className="input w-auto shrink-0 select-none text-muted-foreground" aria-hidden="true">+91</span>
                            <input id="fb-phone" className="input" required type="tel" inputMode="numeric" autoComplete="tel-national"
                                placeholder="98XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
                        {isPhone(phone) && <p className="mt-1 text-xs text-muted-foreground">We will SMS a 6-digit code to +91 {target}.</p>}
                    </div>
                    <button type="submit" disabled={loading} className="btn btn-primary w-full">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send code'}
                    </button>
                    <p className="text-xs text-muted-foreground">No password needed. Standard SMS rates may apply.</p>
                </form>
            )}

            {step === 'code' && (
                <form className="space-y-5" onSubmit={verify}>
                    <div className="rounded-xl border border-card-border bg-background/60 px-4 py-3 text-sm">
                        <p>We sent a 6-digit code by SMS.</p>
                        <p className="mt-1 text-muted-foreground">
                            Sent to +91 {target.slice(0, 2)}XXXXXX{target.slice(-2)} ·{' '}
                            <button type="button" className="font-semibold text-primary hover:underline"
                                onClick={() => { setStep('phone'); setCode(''); setError(''); }}>
                                change
                            </button>
                        </p>
                    </div>
                    <div>
                        <label htmlFor="fb-code" className="label">Enter code</label>
                        <input ref={codeRef} id="fb-code" className="input text-center text-2xl tracking-[0.5em] font-mono" inputMode="numeric"
                            autoComplete="one-time-code" maxLength={6} placeholder="••••••" value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} />
                    </div>
                    <button type="submit" disabled={loading} className="btn btn-primary w-full">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'signup' ? 'Verify & create account' : 'Verify & sign in'}
                    </button>
                    <p className="text-center text-sm text-muted-foreground">
                        {resendIn > 0 ? (
                            <>Resend code in {resendIn}s</>
                        ) : (
                            <button type="button" className="font-semibold text-primary hover:underline" onClick={() => void sendCode()} disabled={loading}>
                                Resend code
                            </button>
                        )}
                    </p>
                </form>
            )}

            {/* Invisible reCAPTCHA lives here (Firebase needs it to send the SMS). */}
            <div ref={recaptchaBox} />
        </div>
    );
}
