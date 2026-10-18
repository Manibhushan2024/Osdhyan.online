'use client';

import { useEffect } from 'react';
import { AlertTriangle, CreditCard, FlaskConical, Loader2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/lib/razorpay';
import { useCheckout, type CheckoutError, type CheckoutResult } from './useCheckout';

type Props = {
    seriesId: number | string;
    price: number | string;
    currency?: string;
    /** Whether the current viewer is an admin (shows setup hints on 503). */
    isAdmin?: boolean;
    onSuccess?: (result: CheckoutResult) => void;
    onError?: (error: CheckoutError) => void;
    /** Called instead of starting checkout when the user is logged out. */
    onRequireAuth?: () => void;
    loggedIn?: boolean;
    className?: string;
    size?: 'md' | 'lg';
};

/**
 * "Buy now" for a paid test series. Renders "Pay (test mode)" when the
 * backend runs with PAYMENTS_FAKE, and a friendly notice when payments are
 * not configured (with an env hint for admins).
 */
export default function CheckoutButton({
    seriesId, price, currency = 'INR', isAdmin = false, onSuccess, onError, onRequireAuth, loggedIn = true, className, size = 'lg',
}: Props) {
    const { config, fetchConfig, stage, error, busy, buy } = useCheckout(seriesId, { onSuccess, onError });

    useEffect(() => {
        if (loggedIn) void fetchConfig();
    }, [loggedIn, fetchConfig]);

    const fake = !!config?.fake;
    const notConfigured = config ? !config.configured : false;
    const label = busy
        ? stage === 'verifying' ? 'Verifying payment…' : stage === 'opening' ? 'Opening checkout…' : 'Preparing…'
        : fake
            ? `Pay ${formatMoney(price, currency)} (test mode)`
            : `Buy now · ${formatMoney(price, currency)}`;

    const handleClick = () => {
        if (!loggedIn) {
            onRequireAuth?.();
            return;
        }
        void buy();
    };

    const sizeClass = size === 'lg'
        ? 'px-12 py-5 rounded-[2rem] text-[10px] tracking-[0.3em]'
        : 'px-8 py-4 rounded-xl text-[9px] tracking-widest';

    return (
        <div className={cn('flex flex-col gap-3', className)}>
            <button
                type="button"
                onClick={handleClick}
                disabled={busy || notConfigured}
                className={cn(
                    'font-black uppercase shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed text-white',
                    fake
                        ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20',
                    sizeClass,
                )}
            >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : fake ? <FlaskConical className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                {label}
            </button>

            {fake && (
                <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 flex items-center gap-2">
                    <FlaskConical className="h-3 w-3" /> TEST MODE — no money is charged
                </p>
            )}

            {!fake && config?.configured && (
                <p className="text-[9px] font-bold uppercase tracking-widest text-foreground/40 flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3" /> Secure payment via Razorpay · UPI, cards, netbanking
                </p>
            )}

            {notConfigured && (
                <div className="text-[10px] font-bold text-amber-700 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>
                        Online payments are not available yet.
                        {isAdmin && (
                            <> <span className="font-black">Admin:</span> set <code>RAZORPAY_KEY_ID</code> / <code>RAZORPAY_KEY_SECRET</code> (or <code>PAYMENTS_FAKE=true</code> locally) on the API.</>
                        )}
                    </span>
                </div>
            )}

            {error && error.code !== 'CANCELLED' && stage === 'error' && (
                <div className="text-[10px] font-bold text-red-600 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>
                        {error.message}
                        {isAdmin && (error.code === 'PAYMENTS_NOT_CONFIGURED' || error.code === 'PAYMENTS_MISCONFIGURED') && (
                            <> <span className="font-black">Admin:</span> check <code>RAZORPAY_*</code> / <code>PAYMENTS_FAKE</code> env on the API.</>
                        )}
                    </span>
                </div>
            )}
        </div>
    );
}
