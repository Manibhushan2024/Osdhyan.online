'use client';

import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthModalProps {
    open: boolean;
    onClose: () => void;
    /** Reason shown to the user — e.g. "attempt a test", "set a study goal" */
    reason?: string;
    /** Where to redirect after login (passed as ?redirect=...) */
    redirectTo?: string;
}

const perks = [
    { icon: Trophy, label: 'Save all test scores & history' },
    { icon: Zap, label: 'AI-powered performance analysis' },
    { icon: ShieldCheck, label: 'Set goals & track daily progress' },
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
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md bg-card-bg border border-card-border rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 fade-in duration-200 space-y-8">
                {/* Icon */}
                <div className="flex justify-center">
                    <div className="h-16 w-16 bg-blue-600/10 border border-blue-500/20 rounded-[2rem] flex items-center justify-center">
                        <ShieldCheck className="h-8 w-8 text-blue-500" />
                    </div>
                </div>

                {/* Heading */}
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-black text-foreground uppercase tracking-tight italic">
                        Sign in to {reason}
                    </h2>
                    <p className="text-[11px] font-black text-foreground/40 uppercase tracking-widest">
                        Free account — takes 30 seconds
                    </p>
                </div>

                {/* Perks */}
                <div className="space-y-3">
                    {perks.map((p, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3 bg-background rounded-2xl border border-card-border">
                            <p.icon className="h-4 w-4 text-blue-500 shrink-0" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-foreground/60">{p.label}</span>
                        </div>
                    ))}
                </div>

                {/* CTAs */}
                <div className="space-y-3">
                    <Link
                        href={signupHref}
                        className="group flex items-center justify-center gap-3 w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all active:scale-95"
                    >
                        Create Free Account
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        href={loginHref}
                        className="flex items-center justify-center w-full py-4 border border-card-border text-foreground/50 hover:text-foreground hover:border-foreground/20 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all"
                    >
                        Already have an account? Sign in
                    </Link>
                </div>

                {/* Skip */}
                <button
                    onClick={onClose}
                    className="w-full text-[10px] font-black uppercase tracking-widest text-foreground/20 hover:text-foreground/40 transition-colors"
                >
                    Continue browsing as guest
                </button>
            </div>
        </div>
    );
}
