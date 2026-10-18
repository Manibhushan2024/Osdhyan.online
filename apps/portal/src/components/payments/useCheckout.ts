'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import {
    loadRazorpay,
    type CheckoutResponse,
    type PaymentsConfig,
    type RazorpayFailure,
    type RazorpaySuccess,
} from '@/lib/razorpay';

export type CheckoutStage = 'idle' | 'loading' | 'opening' | 'verifying' | 'success' | 'error';

export type CheckoutError = {
    code?: 'PAYMENTS_NOT_CONFIGURED' | 'PAYMENTS_MISCONFIGURED' | 'PAYMENT_REQUIRED' | 'GATEWAY_ERROR' | 'INVALID_SIGNATURE' | 'ORDER_MISMATCH' | 'CANCELLED' | string;
    message: string;
    status?: number;
};

export type CheckoutResult = {
    accessExpiresAt?: string | null;
    testMode?: boolean;
    orderId?: number;
    already?: boolean;
    free?: boolean;
};

type Options = {
    onSuccess?: (result: CheckoutResult) => void;
    onError?: (error: CheckoutError) => void;
};

/**
 * Drives the full buy flow for a test series:
 *   GET /payments/config → POST /test-series/{id}/checkout →
 *   (Razorpay modal) → POST /payments/verify.
 * The fake gateway short-circuits at the checkout step.
 */
export function useCheckout(seriesId: number | string, options: Options = {}) {
    const [config, setConfig] = useState<PaymentsConfig | null>(null);
    const [configError, setConfigError] = useState<string | null>(null);
    const [stage, setStage] = useState<CheckoutStage>('idle');
    const [error, setError] = useState<CheckoutError | null>(null);
    const mounted = useRef(true);
    const opts = useRef(options);

    // Keep the latest callbacks without re-creating `buy` on every render.
    useEffect(() => {
        opts.current = options;
    });

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    const fetchConfig = useCallback(async (): Promise<PaymentsConfig | null> => {
        try {
            const res = await api.get<PaymentsConfig>('/payments/config');
            if (mounted.current) {
                setConfig(res.data);
                setConfigError(null);
            }
            return res.data;
        } catch {
            if (mounted.current) setConfigError('Could not load payment settings');
            return null;
        }
    }, []);

    const fail = useCallback((e: CheckoutError) => {
        if (!mounted.current) return;
        setError(e);
        setStage('error');
        opts.current.onError?.(e);
    }, []);

    const succeed = useCallback((r: CheckoutResult) => {
        if (!mounted.current) return;
        setError(null);
        setStage('success');
        opts.current.onSuccess?.(r);
    }, []);

    const buy = useCallback(async () => {
        if (stage === 'loading' || stage === 'opening' || stage === 'verifying') return;
        setError(null);
        setStage('loading');

        const cfg = config ?? (await fetchConfig());
        if (!cfg) {
            fail({ message: 'Could not load payment settings. Please retry.' });
            return;
        }

        let checkout: CheckoutResponse;
        try {
            const res = await api.post<CheckoutResponse>(`/test-series/${seriesId}/checkout`);
            checkout = res.data;
        } catch (err: unknown) {
            const ax = err as { response?: { status?: number; data?: { code?: string; message?: string } } };
            const status = ax.response?.status;
            const data = ax.response?.data;
            fail({
                status,
                code: data?.code ?? (status === 503 ? 'PAYMENTS_NOT_CONFIGURED' : undefined),
                message:
                    data?.message ??
                    (status === 503
                        ? 'Payments are not configured yet.'
                        : status === 404
                            ? 'This series is not available.'
                            : 'Could not start checkout. Please try again.'),
            });
            return;
        }

        if (checkout.enrolled) {
            succeed({
                accessExpiresAt: checkout.access_expires_at ?? null,
                testMode: !!checkout.test_mode || !!checkout.fake,
                orderId: checkout.order?.id,
                already: !!checkout.already,
                free: !!checkout.free,
            });
            return;
        }

        setStage('opening');
        let Razorpay;
        try {
            Razorpay = await loadRazorpay();
        } catch (e) {
            fail({ message: (e as Error).message });
            return;
        }

        const orderId = checkout.order_id;
        let settled = false;

        const verify = async (rz: RazorpaySuccess) => {
            if (settled) return;
            settled = true;
            if (mounted.current) setStage('verifying');
            try {
                const res = await api.post('/payments/verify', {
                    order_id: orderId,
                    razorpay_order_id: rz.razorpay_order_id,
                    razorpay_payment_id: rz.razorpay_payment_id,
                    razorpay_signature: rz.razorpay_signature,
                });
                succeed({
                    accessExpiresAt: res.data?.enrolment?.access_expires_at ?? null,
                    testMode: !!res.data?.test_mode,
                    orderId,
                    already: !!res.data?.already,
                });
            } catch (err: unknown) {
                const ax = err as { response?: { status?: number; data?: { code?: string; message?: string } } };
                fail({
                    status: ax.response?.status,
                    code: ax.response?.data?.code,
                    message:
                        ax.response?.data?.message ??
                        'Payment was received but could not be verified. If money was deducted, it will be confirmed automatically within a few minutes.',
                });
            }
        };

        try {
            const instance = new Razorpay({
                key: checkout.key_id,
                amount: checkout.amount,
                currency: checkout.currency,
                name: checkout.name,
                description: checkout.description,
                image: checkout.image ?? undefined,
                order_id: checkout.provider_order_id,
                prefill: {
                    name: checkout.prefill?.name ?? undefined,
                    email: checkout.prefill?.email ?? undefined,
                    contact: checkout.prefill?.contact ?? undefined,
                },
                notes: checkout.notes,
                theme: checkout.theme ?? { color: '#2563eb' },
                retry: { enabled: true },
                handler: (rz) => {
                    void verify(rz);
                },
                modal: {
                    escape: true,
                    ondismiss: () => {
                        if (settled) return;
                        settled = true;
                        fail({ code: 'CANCELLED', message: 'Payment cancelled.' });
                    },
                },
            });
            instance.on('payment.failed', (res: RazorpayFailure) => {
                if (settled) return;
                settled = true;
                try {
                    instance.close();
                } catch {
                    /* ignore */
                }
                fail({
                    code: res.error?.code ?? 'PAYMENT_FAILED',
                    message: res.error?.description ?? 'Payment failed. You can try again.',
                });
            });
            instance.open();
        } catch (e) {
            fail({ message: (e as Error).message || 'Could not open the payment window.' });
        }
    }, [config, fetchConfig, fail, succeed, seriesId, stage]);

    const reset = useCallback(() => {
        setStage('idle');
        setError(null);
    }, []);

    return {
        config,
        configError,
        fetchConfig,
        stage,
        error,
        busy: stage === 'loading' || stage === 'opening' || stage === 'verifying',
        buy,
        reset,
    };
}
