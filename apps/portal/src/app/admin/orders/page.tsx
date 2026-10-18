'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
    IndianRupee,
    TrendingUp,
    CheckCircle2,
    Clock,
    XCircle,
    RotateCcw,
    ChevronRight,
    ChevronLeft,
    Loader2,
    Search,
    FlaskConical,
    Receipt,
    Trophy,
    RefreshCw,
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatDateTime, formatPaise, type Order, type OrderStatus } from '@/lib/razorpay';

type Summary = {
    currency: string;
    revenue: { today: number; '7d': number; '30d': number; total: number };
    paid_count: number;
    pending_count: number;
    failed_count: number;
    refunded_count: number;
    paid_today: number;
    test_mode_orders: number;
    by_series: { test_series_id: number; name: string; orders_count: number; revenue: number }[];
};

type Page<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
};

type Filters = {
    status: '' | OrderStatus;
    provider: '' | 'razorpay' | 'fake';
    from: string;
    to: string;
    q: string;
    test_series_id: string;
};

const STATUS: Record<OrderStatus, { label: string; className: string; icon: typeof CheckCircle2 }> = {
    paid: { label: 'Paid', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 },
    pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Clock },
    failed: { label: 'Failed', className: 'bg-red-500/10 text-red-600 border-red-500/20', icon: XCircle },
    refunded: { label: 'Refunded', className: 'bg-slate-500/10 text-slate-500 border-slate-500/20', icon: RotateCcw },
};

const emptyFilters: Filters = { status: '', provider: '', from: '', to: '', q: '', test_series_id: '' };

export default function AdminOrdersPage() {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [orders, setOrders] = useState<Page<Order> | null>(null);
    const [filters, setFilters] = useState<Filters>(emptyFilters);
    const [draft, setDraft] = useState<Filters>(emptyFilters);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadSummary = useCallback(async () => {
        try {
            const res = await api.get<Summary>('/admin/orders/summary');
            setSummary(res.data);
        } catch {
            setError('Could not load revenue summary.');
        }
    }, []);

    const loadOrders = useCallback(async () => {
        setTableLoading(true);
        try {
            const params: Record<string, string | number> = { page, per_page: 25 };
            (Object.keys(filters) as (keyof Filters)[]).forEach(k => {
                if (filters[k]) params[k] = filters[k];
            });
            const res = await api.get<Page<Order>>('/admin/orders', { params });
            setOrders(res.data);
            setError(null);
        } catch {
            setError('Could not load orders.');
        } finally {
            setTableLoading(false);
        }
    }, [filters, page]);

    useEffect(() => {
        Promise.all([loadSummary(), loadOrders()]).finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!loading) void loadOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, page]);

    const applyFilters = (e?: React.FormEvent) => {
        e?.preventDefault();
        setPage(1);
        setFilters(draft);
    };

    const resetFilters = () => {
        setDraft(emptyFilters);
        setFilters(emptyFilters);
        setPage(1);
    };

    const quickStatus = (status: Filters['status']) => {
        const next = { ...draft, status };
        setDraft(next);
        setFilters(next);
        setPage(1);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em]">Loading revenue…</p>
            </div>
        );
    }

    const cards = summary ? [
        { label: 'Today', value: formatPaise(summary.revenue.today), sub: `${summary.paid_today} paid order(s)`, icon: IndianRupee, tone: 'text-emerald-600 bg-emerald-600/10' },
        { label: 'Last 7 days', value: formatPaise(summary.revenue['7d']), sub: 'captured revenue', icon: TrendingUp, tone: 'text-indigo-600 bg-indigo-600/10' },
        { label: 'Last 30 days', value: formatPaise(summary.revenue['30d']), sub: 'captured revenue', icon: TrendingUp, tone: 'text-blue-600 bg-blue-600/10' },
        { label: 'All time', value: formatPaise(summary.revenue.total), sub: `${summary.paid_count} paid · ${summary.pending_count} pending · ${summary.failed_count} failed`, icon: Receipt, tone: 'text-amber-600 bg-amber-600/10' },
    ] : [];

    const inputClass = 'bg-card-bg border border-card-border rounded-2xl py-3 px-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-indigo-600/30 transition-all';

    return (
        <div className="space-y-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                        <span>Admin</span>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-indigo-600">Orders & Revenue</span>
                    </div>
                    <h1 className="text-5xl font-black text-foreground uppercase tracking-tighter italic leading-none">
                        Revenue <span className="text-indigo-600">Ledger</span>
                    </h1>
                    {summary && summary.test_mode_orders > 0 && (
                        <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-amber-600">
                            <FlaskConical className="h-3 w-3" /> {summary.test_mode_orders} test-mode order(s) are included in these totals — filter by provider to separate them
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/admin/test-series" className="px-6 py-4 bg-card-bg border border-card-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground/60 hover:text-indigo-600 transition-all">
                        Manage pricing
                    </Link>
                    <button
                        onClick={() => { void loadSummary(); void loadOrders(); }}
                        className="flex items-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
                    >
                        <RefreshCw className={cn('h-4 w-4', tableLoading && 'animate-spin')} /> Refresh
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-600 rounded-2xl px-6 py-4 text-sm font-bold">{error}</div>
            )}

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map(card => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="bg-card-bg border border-card-border p-8 rounded-[2.5rem] space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">{card.label}</p>
                                <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center', card.tone)}>
                                    <Icon className="h-4 w-4" />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-foreground tracking-tight">{card.value}</p>
                            <p className="text-[8px] font-black text-foreground/30 uppercase tracking-widest">{card.sub}</p>
                        </div>
                    );
                })}
            </div>

            {/* Top series */}
            {summary && summary.by_series.length > 0 && (
                <div className="bg-card-bg border border-card-border rounded-[2.5rem] p-8 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                            <Trophy className="h-4 w-4" />
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Top series by revenue</h2>
                    </div>
                    <div className="space-y-3">
                        {summary.by_series.map((row, i) => {
                            const pct = summary.revenue.total > 0 ? Math.round((row.revenue / summary.revenue.total) * 100) : 0;
                            return (
                                <button
                                    key={row.test_series_id}
                                    onClick={() => {
                                        const next = { ...draft, test_series_id: String(row.test_series_id) };
                                        setDraft(next);
                                        setFilters(next);
                                        setPage(1);
                                    }}
                                    className="w-full text-left group"
                                >
                                    <div className="flex items-center justify-between gap-4 text-[10px] font-black uppercase tracking-widest">
                                        <span className="flex items-center gap-3 min-w-0">
                                            <span className="text-foreground/30 w-5">{i + 1}.</span>
                                            <span className="text-foreground truncate group-hover:text-indigo-600 transition-colors">{row.name}</span>
                                        </span>
                                        <span className="flex items-center gap-4 shrink-0">
                                            <span className="text-foreground/40">{row.orders_count} order(s)</span>
                                            <span className="text-foreground">{formatPaise(row.revenue)}</span>
                                        </span>
                                    </div>
                                    <div className="mt-2 h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${Math.max(pct, 2)}%` }} />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Filters */}
            <form onSubmit={applyFilters} className="bg-card-bg border border-card-border rounded-[2.5rem] p-6 flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                    {([['', 'All'], ['paid', 'Paid'], ['pending', 'Pending'], ['failed', 'Failed'], ['refunded', 'Refunded']] as [Filters['status'], string][]).map(([value, label]) => (
                        <button
                            key={value || 'all'}
                            type="button"
                            onClick={() => quickStatus(value)}
                            className={cn(
                                'px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all',
                                filters.status === value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-background border-card-border text-foreground/50 hover:text-indigo-600',
                            )}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div className="relative md:col-span-2">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground/30" />
                        <input
                            type="text"
                            placeholder="Email, phone, name, payment id, order #"
                            value={draft.q}
                            onChange={e => setDraft({ ...draft, q: e.target.value })}
                            className={cn(inputClass, 'w-full pl-10 normal-case tracking-normal')}
                        />
                    </div>
                    <input type="date" value={draft.from} onChange={e => setDraft({ ...draft, from: e.target.value })} className={inputClass} aria-label="From date" />
                    <input type="date" value={draft.to} onChange={e => setDraft({ ...draft, to: e.target.value })} className={inputClass} aria-label="To date" />
                    <select value={draft.provider} onChange={e => setDraft({ ...draft, provider: e.target.value as Filters['provider'] })} className={inputClass}>
                        <option value="">All providers</option>
                        <option value="razorpay">Razorpay</option>
                        <option value="fake">Test mode</option>
                    </select>
                </div>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <p className="text-[9px] font-black uppercase tracking-widest text-foreground/40">
                        {orders ? `${orders.total} order(s)` : ''}
                        {filters.test_series_id && <> · series #{filters.test_series_id}</>}
                    </p>
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={resetFilters} className="px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border border-card-border text-foreground/50 hover:text-foreground">Reset</button>
                        <button type="submit" className="px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">Apply</button>
                    </div>
                </div>
            </form>

            {/* Orders table */}
            <div className="bg-card-bg border border-card-border rounded-[2.5rem] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[8px] font-black uppercase tracking-widest text-foreground/40 border-b border-card-border">
                                <th className="px-6 py-4">Order</th>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Series</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Payment</th>
                                <th className="px-6 py-4">When</th>
                            </tr>
                        </thead>
                        <tbody className={cn(tableLoading && 'opacity-50')}>
                            {orders?.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center text-[10px] font-black uppercase tracking-widest text-foreground/30">No orders match these filters</td>
                                </tr>
                            )}
                            {orders?.data.map(order => {
                                const s = STATUS[order.status] ?? STATUS.pending;
                                const Icon = s.icon;
                                return (
                                    <tr key={order.id} className="border-b border-card-border/50 hover:bg-foreground/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-black text-foreground">#{order.id}</p>
                                            {order.is_test_mode && (
                                                <span className="inline-flex items-center gap-1 text-[7px] font-black uppercase tracking-widest text-amber-600"><FlaskConical className="h-2.5 w-2.5" /> test</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 min-w-[180px]">
                                            <p className="text-xs font-black text-foreground truncate max-w-[220px]">{order.user?.name ?? `User #${order.user_id}`}</p>
                                            <p className="text-[9px] font-bold text-foreground/40 truncate max-w-[220px]">{order.user?.email}{order.user?.phone ? ` · ${order.user.phone}` : ''}</p>
                                        </td>
                                        <td className="px-6 py-4 min-w-[180px]">
                                            <Link href={`/dashboard/test-series/${order.test_series_id}`} className="text-xs font-black text-foreground hover:text-indigo-600 truncate block max-w-[240px]">
                                                {order.test_series?.name_en ?? `Series #${order.test_series_id}`}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-black text-foreground whitespace-nowrap">{formatPaise(order.amount, order.currency)}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border', s.className)}>
                                                <Icon className="h-3 w-3" /> {s.label}
                                            </span>
                                            {order.status === 'failed' && order.failure_reason && (
                                                <p className="text-[8px] text-red-500 mt-1 max-w-[200px] truncate" title={order.failure_reason}>{order.failure_reason}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-[9px] font-mono text-foreground/60">{order.provider_payment_id ?? '—'}</p>
                                            <p className="text-[8px] font-mono text-foreground/30">{order.provider_order_id ?? ''}</p>
                                        </td>
                                        <td className="px-6 py-4 text-[9px] font-bold text-foreground/50 whitespace-nowrap">
                                            {formatDateTime(order.paid_at ?? order.created_at)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {orders && orders.last_page > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-card-border">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-card-border disabled:opacity-30"
                        >
                            <ChevronLeft className="h-3 w-3" /> Prev
                        </button>
                        <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40">Page {orders.current_page} of {orders.last_page}</span>
                        <button
                            disabled={page >= orders.last_page}
                            onClick={() => setPage(p => p + 1)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-card-border disabled:opacity-30"
                        >
                            Next <ChevronRight className="h-3 w-3" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
