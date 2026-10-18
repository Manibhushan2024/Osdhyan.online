'use client';

import Link from 'next/link';
import { ArrowRight, BarChart3, Target, Trophy, X } from 'lucide-react';

interface AuthModalProps {
    open: boolean;
    onClose: () => void;
    /** Reason shown to the user — e.g. "attempt a test", "set a study goal" */
    reason?: string;
    /** Where to redirect after login (passed as ?redirect=...) */
    redirectTo?: string;
}

const perks = [
    { icon: Trophy, label: 'Save your scores and test history' },
    { icon: BarChart3, label: 'See accuracy and weak topics after every test' },
    { icon: Target, label: 'Set daily goals and track your streak' },
];

export default function AuthModal({ open, onClose, reason = 'continue', redirectTo }: AuthModalProps) {
    if (!open) return null;

    const loginHref = redirectTo
        ? `/auth/login?redirect=${encodeURIComponent(redirectTo)}`
        : '/auth/login';
    const signupHref = redirectTo
        ? `/auth/signup?redirect=${encodeURIComponent(redirectTo)}`
        : '/auth/signup';

    return (
        <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
            <div className="absolute inset-0 bg-slate-950/60" onClick={onClose} />

            <div className="relative z-10 w-full sm:max-w-md card rounded-b-none sm:rounded-2xl p-6 sm:p-8 shadow-2xl">
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute right-3 top-3 h-10 w-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                    <X className="h-5 w-5" />
                </button>

                <h2 id="auth-modal-title" className="text-xl font-bold pr-8">Sign in to {reason}</h2>
                <p className="mt-1 text-sm text-muted-foreground">Creating an account is free and takes about a minute.</p>

                <ul className="mt-5 space-y-2">
                    {perks.map((p) => (
                        <li key={p.label} className="flex items-center gap-3 text-sm">
                            <p.icon className="h-4 w-4 text-primary shrink-0" />
                            <span>{p.label}</span>
                        </li>
                    ))}
                </ul>

                <div className="mt-6 space-y-3">
                    <Link href={signupHref} className="btn btn-primary w-full">
                        Create free account
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link href={loginHref} className="btn btn-secondary w-full">
                        I already have an account
                    </Link>
                </div>

                <button
                    onClick={onClose}
                    className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground min-h-[40px]"
                >
                    Continue browsing as guest
                </button>
            </div>
        </div>
    );
}
