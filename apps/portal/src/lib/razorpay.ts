/**
 * Razorpay Checkout helpers for the portal.
 *
 * - loadRazorpay(): injects https://checkout.razorpay.com/v1/checkout.js once
 *   and resolves with the global constructor.
 * - formatMoney(): ₹ formatting with en-IN grouping (1,00,000).
 *
 * Server shapes mirror backend/app/Http/Controllers/Api/PaymentController.php.
 */

export const RAZORPAY_CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

export type PaymentsConfig = {
    provider: 'razorpay' | 'fake';
    key_id: string | null;
    fake: boolean;
    test_mode: boolean;
    configured: boolean;
    currency: string;
};

export type CheckoutOrderResponse = {
    enrolled: false;
    fake: false;
    test_mode: false;
    order_id: number;
    provider_order_id: string;
    amount: number; // paise
    currency: string;
    key_id: string;
    name: string;
    description: string;
    image?: string | null;
    prefill: { name?: string | null; email?: string | null; contact?: string | null };
    notes?: Record<string, string>;
    theme?: { color?: string };
};

export type CheckoutEnrolledResponse = {
    enrolled: true;
    free?: boolean;
    already?: boolean;
    fake?: boolean;
    test_mode?: boolean;
    message?: string;
    access_expires_at?: string | null;
    order?: Order;
};

export type CheckoutResponse = CheckoutOrderResponse | CheckoutEnrolledResponse;

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type Order = {
    id: number;
    user_id: number;
    test_series_id: number;
    amount: number; // paise
    amount_rupees: number;
    currency: string;
    status: OrderStatus;
    provider: 'razorpay' | 'fake';
    is_test_mode: boolean;
    provider_order_id: string | null;
    provider_payment_id: string | null;
    paid_at: string | null;
    expires_at: string | null;
    failure_reason: string | null;
    created_at: string;
    test_series?: { id: number; name_en: string; name_hi?: string | null; image?: string | null } | null;
    user?: { id: number; name: string; email: string; phone?: string | null } | null;
};

export type RazorpaySuccess = {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
};

export type RazorpayOptions = {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    image?: string;
    order_id: string;
    handler: (response: RazorpaySuccess) => void;
    prefill?: { name?: string; email?: string; contact?: string };
    notes?: Record<string, string>;
    theme?: { color?: string };
    modal?: { ondismiss?: () => void; escape?: boolean; confirm_close?: boolean };
    retry?: { enabled?: boolean };
};

export type RazorpayFailure = {
    error: {
        code?: string;
        description?: string;
        reason?: string;
        metadata?: { order_id?: string; payment_id?: string };
    };
};

export interface RazorpayInstance {
    open(): void;
    close(): void;
    on(event: 'payment.failed', handler: (response: RazorpayFailure) => void): void;
}

export type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

declare global {
    interface Window {
        Razorpay?: RazorpayConstructor;
    }
}

let loader: Promise<RazorpayConstructor> | null = null;

/** Load checkout.js once; safe to call many times. Rejects when offline / blocked. */
export function loadRazorpay(): Promise<RazorpayConstructor> {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('Razorpay can only load in the browser'));
    }
    if (window.Razorpay) {
        return Promise.resolve(window.Razorpay);
    }
    if (loader) return loader;

    loader = new Promise<RazorpayConstructor>((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>(`script[src="${RAZORPAY_CHECKOUT_SRC}"]`);
        const script = existing ?? document.createElement('script');

        const onLoad = () => {
            if (window.Razorpay) resolve(window.Razorpay);
            else reject(new Error('Razorpay script loaded but window.Razorpay is missing'));
        };
        const onError = () => {
            loader = null;
            script.remove();
            reject(new Error('Could not load Razorpay checkout. Check your connection or ad-blocker.'));
        };

        script.addEventListener('load', onLoad, { once: true });
        script.addEventListener('error', onError, { once: true });

        if (!existing) {
            script.src = RAZORPAY_CHECKOUT_SRC;
            script.async = true;
            document.body.appendChild(script);
        }
    });

    return loader;
}

const formatters = new Map<string, Intl.NumberFormat>();

/** ₹1,499 / ₹1,499.50 — en-IN grouping, drops .00 */
export function formatMoney(rupees: number | string | null | undefined, currency = 'INR'): string {
    const value = Number(rupees ?? 0);
    const key = `${currency}:${Number.isInteger(value) ? 0 : 2}`;
    let fmt = formatters.get(key);
    if (!fmt) {
        fmt = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency || 'INR',
            minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
            maximumFractionDigits: 2,
        });
        formatters.set(key, fmt);
    }
    return fmt.format(value);
}

/** Paise → formatted rupees. */
export function formatPaise(paise: number | string | null | undefined, currency = 'INR'): string {
    return formatMoney(Number(paise ?? 0) / 100, currency);
}

export function discountPercent(price: number, mrp?: number | null): number | null {
    if (!mrp || mrp <= price || mrp <= 0) return null;
    return Math.round(((mrp - price) / mrp) * 100);
}

export function formatDate(iso: string | null | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso: string | null | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
