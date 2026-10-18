'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';

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
            setError(err.response?.data?.message || 'Could not send the OTP. Please check your mobile number.');
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
            setError(err.response?.data?.message || 'Reset failed. Please check the OTP and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            title={step === 'request' ? 'Reset your password' : 'Enter the OTP'}
            subtitle={step === 'request'
                ? 'Enter your registered mobile number and we will send you a one-time password (OTP).'
                : `We sent a 4-digit OTP to ${phone}.`}
            footer={
                <>
                    Remembered it?{' '}
                    <Link href="/auth/login" className="font-semibold text-primary hover:underline">
                        Back to sign in
                    </Link>
                </>
            }
        >
            {error && (
                <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
                    {error}
                </div>
            )}

            {step === 'request' ? (
                <form className="space-y-5" onSubmit={handleRequestOtp}>
                    <div>
                        <label htmlFor="phone" className="label">Mobile number</label>
                        <input
                            type="tel"
                            id="phone"
                            required
                            autoComplete="tel"
                            inputMode="tel"
                            className="input"
                            placeholder="10-digit mobile number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary w-full">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send OTP'}
                    </button>
                </form>
            ) : (
                <form className="space-y-5" onSubmit={handleResetPassword}>
                    <div>
                        <label htmlFor="otp" className="label">OTP</label>
                        <input
                            type="text"
                            id="otp"
                            required
                            maxLength={4}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            className="input text-center text-2xl tracking-[0.5em] font-semibold"
                            placeholder="••••"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="label">New password</label>
                        <input
                            type="password" id="password" required autoComplete="new-password"
                            className="input"
                            placeholder="At least 8 characters"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="label">Confirm new password</label>
                        <input
                            type="password" id="confirmPassword" required autoComplete="new-password"
                            className="input"
                            placeholder="Type the password again"
                            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <button
                            type="button"
                            onClick={() => setStep('request')}
                            className="font-medium text-muted-foreground hover:text-foreground min-h-[40px]"
                        >
                            Change number
                        </button>
                        <button
                            type="button"
                            disabled={resendTimer > 0 || loading}
                            className={cn(
                                'font-medium min-h-[40px]',
                                resendTimer > 0 ? 'text-muted-foreground/60 cursor-not-allowed' : 'text-primary hover:underline'
                            )}
                            onClick={handleRequestOtp}
                        >
                            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                        </button>
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary w-full">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Set new password'}
                    </button>
                </form>
            )}
        </AuthShell>
    );
}
