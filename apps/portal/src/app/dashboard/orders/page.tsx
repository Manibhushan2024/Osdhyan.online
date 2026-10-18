'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Receipt,
    CheckCircle2,
    Clock,
    XCircle,
    RotateCcw,
    ChevronRight,
    FlaskConical,
    CalendarClock,
    Loader2,
    ShoppingBag,
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatDate, formatDateTime, formatPaise, type Order, type OrderStatus } from '@/lib/razorpay';

const STATUS: Record<OrderStatus, { label: string; className: string; icon: typeof CheckCircle2 }> = {
    paid: { label: 'Paid', className: 'bg-green-500/10 text-green-600 border-green-500/20', icon: CheckCircle2 },
    pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Clock },
    failed: { label: 'Failed', className: 'bg-red-500/10 text-red-600 border-red-500/20', icon: XCircle },
    refunded: { label: 'Refunded', className: 'bg-slate-500/10 text-slate-500 border-slate-500/20', icon: RotateCcw },
};

export default function MyOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        api.get<Order[]>('/orders')
            .then(res => {
                if (!cancelled) setOrders(res.data ?? []);
            })
            .catch(() => {
                if (!cancelled) setError('Could not load your purchases.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const paidTotal = orders.filter(o => o.status === 'paid' && !o.is_test_mode).reduce((sum, o) => sum + o.amount, 0);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em]">Loading purchases…</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20 px-4 md:px-0 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3">
                    <Link href="/dashboard/test-series" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-blue-600 transition-colors">
                        <ShoppingBag className="h-3 w-3" />
                        Test Hub
                    </Link>
                    <h1 className="text-4xl lg:text-5xl font-black text-foreground uppercase tracking-tighter italic leading-none">
                        My <span className="text-blue-600">Purchases</span>
                    </h1>
                    <p className="text-foreground/40 text-sm font-medium">Receipts for every test series you have bought.</p>
                </div>
                <div className="bg-card-bg border border-card-border px-8 py-5 rounded-[2rem] flex items-center gap-4">
                    <div className="h-10 w-10 bg-green-600/10 rounded-xl flex items-center justify-center text-green-600">
                        <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-foreground/40 uppercase tracking-widest">Total spent</p>
                        <p className="text-xl font-black text-foreground">{formatPaise(paidTotal)}</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-600 rounded-2xl px-6 py-4 text-sm font-bold">{error}</div>
            )}

            {!error && orders.length === 0 && (
                <div className="bg-card-bg border border-card-border rounded-[2.5rem] p-16 text-center space-y-4">
                    <div className="h-16 w-16 mx-auto bg-blue-600/10 rounded-3xl flex items-center justify-center text-blue-600">
                        <ShoppingBag className="h-8 w-8" />
                    </div>
                    <p className="text-sm font-black uppercase tracking-widest text-foreground/60">No purchases yet</p>
                    <p className="text-xs text-foreground/40 font-medium">Paid test series you buy will show up here with their receipts.</p>
                    <Link href="/dashboard/test-series" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
                        Browse Test Series <ChevronRight className="h-3 w-3" />
                    </Link>
                </div>
            )}

            <div className="space-y-4">
                {orders.map(order => {
                    const s = STATUS[order.status] ?? STATUS.pending;
                    const Icon = s.icon;
                    return (
                        <div key={order.id} className="bg-card-bg border border-card-border rounded-[2.5rem] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-blue-500/30 transition-all">
                            <div className="flex items-start gap-5 min-w-0">
                                <div className={cn('h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border', s.className)}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div className="space-y-2 min-w-0">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <Link
                                            href={`/dashboard/test-series/${order.test_series_id}`}
                                            className="text-lg font-black text-foreground uppercase tracking-tight italic hover:text-blue-600 truncate"
                                        >
                                            {order.test_series?.name_en ?? `Series #${order.test_series_id}`}
                                        </Link>
                                        <span className={cn('px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border', s.className)}>{s.label}</span>
                                        {order.is_test_mode && (
                                            <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border bg-amber-500/10 text-amber-600 border-amber-500/20 flex items-center gap-1">
                                                <FlaskConical className="h-2.5 w-2.5" /> Test mode
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-x-5 gap-y-1 flex-wrap text-[9px] font-black text-foreground/40 uppercase tracking-widest">
                                        <span>Order #{order.id}</span>
                                        <span>{formatDateTime(order.paid_at ?? order.created_at)}</span>
                                        {order.provider_payment_id && <span className="normal-case tracking-normal font-mono">{order.provider_payment_id}</span>}
                                        {order.status === 'paid' && (
                                            <span className="flex items-center gap-1.5 text-green-600">
                                                <CalendarClock className="h-3 w-3" />
                                                {order.expires_at ? `Access until ${formatDate(order.expires_at)}` : 'Lifetime access'}
                                            </span>
                                        )}
                                        {order.status === 'failed' && order.failure_reason && (
                                            <span className="text-red-500 normal-case tracking-normal">{order.failure_reason}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-6 shrink-0">
                                <p className="text-2xl font-black text-foreground">{formatPaise(order.amount, order.currency)}</p>
                                <Link
                                    href={`/dashboard/test-series/${order.test_series_id}`}
                                    className="px-6 py-3 bg-background border border-card-border hover:border-blue-500/30 text-foreground/60 hover:text-blue-600 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-2"
                                >
                                    {order.status === 'paid' ? 'Open series' : order.status === 'pending' || order.status === 'failed' ? 'Retry' : 'View'}
                                    <ChevronRight className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
