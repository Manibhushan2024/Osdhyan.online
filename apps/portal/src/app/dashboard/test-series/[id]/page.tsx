'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
    ChevronLeft,
    Clock,
    Target,
    ClipboardCheck,
    Zap,
    Play,
    RotateCcw,
    CheckCircle2,
    Lock,
    Trophy,
    BarChart3,
    Minus,
    Plus,
    CalendarClock,
    FlaskConical,
    Receipt,
    Unlock,
    History,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/components/providers/AuthProvider';
import AuthModal from '@/components/auth/AuthModal';
import PriceTag from '@/components/payments/PriceTag';
import CheckoutButton from '@/components/payments/CheckoutButton';
import type { CheckoutError, CheckoutResult } from '@/components/payments/useCheckout';
import { formatDate } from '@/lib/razorpay';

type Test = {
    id: number;
    name_en: string;
    total_marks: number;
    duration_sec: number;
    questions_count?: number;
    description_en: string;
    is_free?: boolean;
    requires_purchase?: boolean;
    is_locked?: boolean;
    attempt_status: 'none' | 'ongoing' | 'in_progress' | 'completed' | string;
    attempt_id: number | null;
    last_completed_attempt_id?: number | null;
    attempts_count?: number;
};

type SeriesDetail = {
    series: {
        id: number;
        name_en: string;
        description_en: string;
        image: string;
        exam?: { name_en: string };
        price?: string | number;
        mrp?: string | number | null;
        currency?: string;
        is_paid?: boolean;
        validity_days?: number | null;
    };
    is_enrolled: boolean;
    has_access?: boolean;
    access_expires_at?: string | null;
    requires_payment?: boolean;
    pricing?: {
        is_paid: boolean;
        price: number;
        mrp: number | null;
        currency: string;
        amount: number;
        validity_days: number | null;
    };
    content: Record<string, Test[]>;
    stats: {
        total_tests: number;
        free_tests?: number;
        users_count: number;
    };
};

export default function TestSeriesDetail() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [data, setData] = useState<SeriesDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>('all');
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [hasAccess, setHasAccess] = useState(false);
    const [accessExpiresAt, setAccessExpiresAt] = useState<string | null>(null);
    const [enrolling, setEnrolling] = useState(false);
    const [authModal, setAuthModal] = useState(false);
    const [justPurchased, setJustPurchased] = useState<{ testMode: boolean } | null>(null);

    const isAdmin = !!user?.is_admin;

    const fetchSeriesDetail = useCallback(async () => {
        try {
            const res = await api.get(`/test-series/${params.id}`);
            const d: SeriesDetail = res.data;
            setData(d);
            setIsEnrolled(d.is_enrolled ?? false);
            setHasAccess(d.has_access ?? d.is_enrolled ?? false);
            setAccessExpiresAt(d.access_expires_at ?? null);
            const keys = Object.keys(d.content);
            if (keys.length > 0) setActiveTab(prev => (prev === 'all' || keys.includes(prev) ? prev : keys[0]));
        } catch (error) {
            console.error('Failed to fetch series details', error);
            toast.error('Failed to load test series');
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        fetchSeriesDetail();
    }, [fetchSeriesDetail]);

    const requiresPayment = !!(data?.requires_payment ?? data?.pricing?.is_paid);
    const price = data?.pricing?.price ?? Number(data?.series.price ?? 0);
    const mrp = data?.pricing?.mrp ?? (data?.series.mrp ?? null);
    const currency = data?.pricing?.currency ?? data?.series.currency ?? 'INR';
    const validityDays = data?.pricing?.validity_days ?? data?.series.validity_days ?? null;
    const accessExpired = isEnrolled && !hasAccess;

    const handleEnroll = async () => {
        if (!user) {
            setAuthModal(true);
            return;
        }
        setEnrolling(true);
        try {
            await api.post(`/test-series/${params.id}/enroll`);
            setIsEnrolled(true);
            setHasAccess(true);
            toast.success('Successfully enrolled! You can now attempt tests.');
            fetchSeriesDetail();
        } catch (error: unknown) {
            const ax = error as { response?: { status?: number; data?: { code?: string } } };
            if (ax.response?.status === 402 || ax.response?.data?.code === 'PAYMENT_REQUIRED') {
                toast.error('This is a paid series. Use Buy now to unlock it.');
                fetchSeriesDetail();
            } else {
                toast.error('Enrollment failed');
            }
        } finally {
            setEnrolling(false);
        }
    };

    const handleUnenroll = async () => {
        if (requiresPayment && hasAccess && !confirm('You paid for this series. Unenrolling removes your access. Continue?')) {
            return;
        }
        setEnrolling(true);
        setIsEnrolled(false);
        setHasAccess(false);
        try {
            await api.post(`/test-series/${params.id}/unenroll`);
            toast.success('Successfully unenrolled!');
            fetchSeriesDetail();
        } catch {
            setIsEnrolled(true);
            toast.error('Unenrollment failed');
        } finally {
            setEnrolling(false);
        }
    };

    const handlePurchaseSuccess = (result: CheckoutResult) => {
        setJustPurchased({ testMode: !!result.testMode });
        setHasAccess(true);
        setIsEnrolled(true);
        if (result.accessExpiresAt) setAccessExpiresAt(result.accessExpiresAt);
        toast.success(result.testMode ? 'TEST MODE: access granted without charge' : 'Payment successful! Series unlocked.');
        fetchSeriesDetail();
    };

    const handlePurchaseError = (err: CheckoutError) => {
        if (err.code === 'CANCELLED') {
            toast('Payment cancelled', { icon: 'ℹ️' });
            return;
        }
        toast.error(err.message);
    };

    const handleStartTest = async (test: Test) => {
        if (!user) {
            setAuthModal(true);
            return;
        }
        if (test.is_locked && !isAdmin) {
            toast.error('Purchase this series to attempt the test');
            return;
        }
        if (!isEnrolled && !isAdmin) {
            toast.error('Please enroll in this test series first');
            return;
        }
        router.push(`/dashboard/tests/play/${test.id}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!data) return null;

    const categories = Object.keys(data.content);
    const activeTests = activeTab === 'all'
        ? Object.values(data.content).flat()
        : data.content[activeTab] || [];

    const canAttemptAll = hasAccess || isAdmin;

    const renderPrimaryCta = () => {
        if (canAttemptAll && isEnrolled) {
            return (
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                    <div className="px-8 py-4 bg-green-500/10 border border-green-500/20 text-green-600 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                        <CheckCircle2 className="h-5 w-5" />
                        {requiresPayment ? 'Purchased · Full access' : 'Enrolled'}
                    </div>
                    <button
                        onClick={handleUnenroll}
                        disabled={enrolling}
                        className="px-6 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-600 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        <Minus className="h-4 w-4" />
                        Unenroll
                    </button>
                </div>
            );
        }

        if (requiresPayment) {
            return (
                <div className="flex flex-col items-stretch md:items-end gap-3">
                    <PriceTag price={price} mrp={mrp} currency={currency} size="lg" />
                    <CheckoutButton
                        seriesId={String(params.id)}
                        price={price}
                        currency={currency}
                        isAdmin={isAdmin}
                        loggedIn={!!user}
                        onRequireAuth={() => setAuthModal(true)}
                        onSuccess={handlePurchaseSuccess}
                        onError={handlePurchaseError}
                    />
                </div>
            );
        }

        return (
            <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="px-12 py-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-4 animate-pulse"
            >
                {enrolling ? 'Enrolling...' : 'Enroll Now to Unlock'}
                <Plus className="h-5 w-5" />
            </button>
        );
    };

    return (
        <>
        <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4 md:px-0 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <Link href="/dashboard/test-series" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-blue-600 transition-colors">
                        <ChevronLeft className="h-3 w-3" />
                        Back to Test Hub
                    </Link>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{data.series.exam?.name_en || 'Exam Series'}</span>
                            {requiresPayment ? (
                                <span className="px-3 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                    <Lock className="h-3 w-3" /> Paid Series
                                </span>
                            ) : (
                                <span className="px-3 py-1 bg-green-500/10 text-green-600 border border-green-500/20 rounded-full text-[8px] font-black uppercase tracking-widest">Free</span>
                            )}
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-foreground uppercase tracking-tighter italic leading-none">
                            {data.series.name_en}
                        </h1>
                    </div>
                </div>

                {renderPrimaryCta()}
            </div>

            {/* Purchase success banner */}
            {justPurchased && (
                <div className={cn(
                    'rounded-[2rem] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border',
                    justPurchased.testMode ? 'bg-amber-500/5 border-amber-500/20' : 'bg-green-500/5 border-green-500/20',
                )}>
                    <div className="flex items-center gap-4">
                        <div className={cn('h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg', justPurchased.testMode ? 'bg-amber-500' : 'bg-green-500')}>
                            {justPurchased.testMode ? <FlaskConical className="h-6 w-6" /> : <Unlock className="h-6 w-6" />}
                        </div>
                        <div>
                            <p className="text-sm font-black uppercase tracking-tight italic text-foreground">
                                {justPurchased.testMode ? 'Test-mode purchase complete' : 'Payment successful — series unlocked'}
                            </p>
                            <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
                                {accessExpiresAt ? `Access until ${formatDate(accessExpiresAt)}` : 'Lifetime access'}
                            </p>
                        </div>
                    </div>
                    <Link href="/dashboard/orders" className="px-6 py-3 bg-card-bg border border-card-border rounded-xl text-[9px] font-black uppercase tracking-widest text-foreground/60 hover:text-blue-600 flex items-center gap-2 self-start md:self-auto">
                        <Receipt className="h-3 w-3" /> View receipt
                    </Link>
                </div>
            )}

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-card-bg border border-card-border p-6 rounded-[2rem] flex items-center gap-4">
                    <div className="h-10 w-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-600">
                        <ClipboardCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-foreground/40 uppercase tracking-widest">Total Tests</p>
                        <p className="text-xl font-black text-foreground">{data.stats.total_tests}</p>
                    </div>
                </div>
                <div className="bg-card-bg border border-card-border p-6 rounded-[2rem] flex items-center gap-4">
                    <div className="h-10 w-10 bg-purple-600/10 rounded-xl flex items-center justify-center text-purple-600">
                        <Target className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-foreground/40 uppercase tracking-widest">Enrolled</p>
                        <p className="text-xl font-black text-foreground">{data.stats.users_count}</p>
                    </div>
                </div>
                <div className="col-span-2 bg-card-bg border border-card-border p-6 rounded-[2rem] flex items-center gap-4">
                    <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', accessExpired ? 'bg-red-600/10 text-red-600' : 'bg-green-600/10 text-green-600')}>
                        {accessExpiresAt ? <CalendarClock className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-foreground/40 uppercase tracking-widest">Status</p>
                        <p className={cn('text-xl font-black', hasAccess ? 'text-green-600' : accessExpired ? 'text-red-600' : 'text-foreground/40')}>
                            {hasAccess
                                ? (accessExpiresAt ? `Access until ${formatDate(accessExpiresAt)}` : (requiresPayment ? 'Purchased — Lifetime Access' : 'Enrolled — Ready to Attempt'))
                                : accessExpired
                                    ? `Access expired ${accessExpiresAt ? formatDate(accessExpiresAt) : ''}`
                                    : requiresPayment ? 'Locked — Purchase Required' : 'Not Enrolled'}
                        </p>
                        {!hasAccess && requiresPayment && validityDays ? (
                            <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest mt-1">{validityDays}-day access from purchase</p>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Enrollment / purchase CTA */}
            {!canAttemptAll && (
                <div className={cn(
                    'rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 border',
                    requiresPayment ? 'bg-amber-500/5 border-amber-500/20' : 'bg-blue-600/5 border-blue-500/20',
                )}>
                    <div className="space-y-2">
                        <h3 className="text-lg font-black text-foreground uppercase tracking-tight italic">
                            {requiresPayment
                                ? accessExpired ? 'Your access has expired — renew to continue' : 'Unlock every test in this series'
                                : 'Enroll to Unlock All Tests'}
                        </h3>
                        <p className="text-foreground/40 text-sm font-medium">
                            {requiresPayment
                                ? <>One-time payment{validityDays ? ` · ${validityDays} days of access` : ' · lifetime access'}. {data.stats.free_tests ? `${data.stats.free_tests} free test(s) included.` : ''}</>
                                : "You must enroll in this series to attempt any test. It's free!"}
                        </p>
                        {requiresPayment && <PriceTag price={price} mrp={mrp} currency={currency} size="md" />}
                    </div>
                    {requiresPayment ? (
                        <CheckoutButton
                            seriesId={String(params.id)}
                            price={price}
                            currency={currency}
                            isAdmin={isAdmin}
                            loggedIn={!!user}
                            onRequireAuth={() => setAuthModal(true)}
                            onSuccess={handlePurchaseSuccess}
                            onError={handlePurchaseError}
                            size="md"
                        />
                    ) : (
                        <button
                            onClick={handleEnroll}
                            disabled={enrolling}
                            className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-60"
                        >
                            <Plus className="h-4 w-4" />
                            {enrolling ? 'Enrolling...' : 'Enroll Now — Free'}
                        </button>
                    )}
                </div>
            )}

            {/* Content Tabs */}
            <div className="space-y-8">
                <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2 border-b border-card-border">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={cn(
                            "px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all",
                            activeTab === 'all'
                                ? "bg-foreground text-background"
                                : "bg-card-bg border border-card-border text-foreground/40 hover:text-foreground"
                        )}
                    >
                        All tests ({Object.values(data.content).flat().length})
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={cn(
                                "px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all",
                                activeTab === cat
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                    : "bg-card-bg border border-card-border text-foreground/40 hover:text-blue-600"
                            )}
                        >
                            {cat} ({data.content[cat]?.length || 0})
                        </button>
                    ))}
                </div>

                {/* Test List */}
                <div className="space-y-4">
                    {activeTests.length === 0 && (
                        <div className="text-center py-20 text-foreground/20 font-bold uppercase tracking-widest">
                            No tests in this series yet
                        </div>
                    )}

                    {activeTests.map((test) => {
                        const locked = !!test.is_locked && !isAdmin;
                        const openable = !locked && (isEnrolled || isAdmin || (requiresPayment && !test.requires_purchase && isEnrolled));
                        const ongoing = test.attempt_status === 'ongoing' || test.attempt_status === 'in_progress';
                        // Last finished attempt — reachable even while a re-attempt is in progress.
                        const lastResultId = test.last_completed_attempt_id
                            ?? (test.attempt_status === 'completed' ? test.attempt_id : null);
                        const done = !!lastResultId && !ongoing;
                        const attemptsCount = Number(test.attempts_count ?? 0);
                        return (
                        <div key={test.id} className={cn("group bg-card-bg border border-card-border p-6 md:p-8 rounded-[2.5rem] transition-all shadow-sm", locked ? "opacity-80" : "hover:border-blue-500/30")}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-start gap-6">
                                    <div className={cn(
                                        "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:scale-110",
                                        locked
                                            ? "bg-amber-500/10 border border-amber-500/20 text-amber-600"
                                            : done
                                                ? "bg-green-500 text-white shadow-green-500/20"
                                                : ongoing
                                                    ? "bg-orange-500 text-white shadow-orange-500/20 animate-pulse"
                                                    : openable
                                                        ? "bg-blue-600/10 border border-blue-500/20 text-blue-600"
                                                        : "bg-background border border-card-border text-foreground/20"
                                    )}>
                                        {locked ? <Lock className="h-6 w-6" /> : done ? <Trophy className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <h3 className="text-lg font-black text-foreground uppercase tracking-tight italic">{test.name_en}</h3>
                                            {test.is_free && requiresPayment && (
                                                <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-green-500/20">
                                                    Free
                                                </span>
                                            )}
                                            {locked && (
                                                <span className="px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-amber-500/20 flex items-center gap-1">
                                                    <Lock className="h-2.5 w-2.5" /> Locked
                                                </span>
                                            )}
                                            {done && (
                                                <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-green-500/20">
                                                    Completed
                                                </span>
                                            )}
                                            {ongoing && (
                                                <span className="px-3 py-1 bg-orange-500/10 text-orange-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-orange-500/20 animate-pulse">
                                                    In Progress
                                                </span>
                                            )}
                                            {attemptsCount > 0 && (
                                                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-blue-500/20">
                                                    Attempted {attemptsCount}×
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[9px] font-black text-foreground/40 uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {Math.floor(test.duration_sec / 60)} Mins</span>
                                            <span className="flex items-center gap-1.5"><Target className="h-3 w-3" /> {test.total_marks} Marks</span>
                                            {attemptsCount > 0 && (
                                                <Link
                                                    href={`/dashboard/history?test=${test.id}`}
                                                    className="flex items-center gap-1.5 text-blue-600 hover:underline"
                                                >
                                                    <History className="h-3 w-3" /> All attempts
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 self-end md:self-auto w-full md:w-auto">
                                    {locked ? (
                                        <CheckoutButton
                                            seriesId={String(params.id)}
                                            price={price}
                                            currency={currency}
                                            isAdmin={isAdmin}
                                            loggedIn={!!user}
                                            onRequireAuth={() => setAuthModal(true)}
                                            onSuccess={handlePurchaseSuccess}
                                            onError={handlePurchaseError}
                                            size="md"
                                            className="w-full md:w-auto"
                                        />
                                    ) : !openable ? (
                                        <button
                                            onClick={handleEnroll}
                                            className="w-full md:w-auto px-8 py-4 bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-600/20 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                        >
                                            <Lock className="h-3 w-3" />
                                            Enroll to Unlock
                                        </button>
                                    ) : (
                                        <>
                                            {done ? (
                                                <>
                                                    <Link
                                                        href={`/dashboard/tests/result/${lastResultId}`}
                                                        className="flex-1 md:flex-none px-6 py-4 bg-background border border-card-border hover:border-blue-500/30 text-foreground/60 hover:text-blue-600 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <BarChart3 className="h-3 w-3" />
                                                        Analysis
                                                    </Link>
                                                    <button
                                                        onClick={() => handleStartTest(test)}
                                                        className="flex-1 md:flex-none px-8 py-4 bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-600/20 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <RotateCcw className="h-3 w-3" />
                                                        Re-Attempt
                                                    </button>
                                                </>
                                            ) : ongoing ? (
                                                <>
                                                {lastResultId && (
                                                    <Link
                                                        href={`/dashboard/tests/result/${lastResultId}`}
                                                        className="flex-1 md:flex-none px-6 py-4 bg-background border border-card-border hover:border-blue-500/30 text-foreground/60 hover:text-blue-600 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <BarChart3 className="h-3 w-3" />
                                                        Last result
                                                    </Link>
                                                )}
                                                <button
                                                    onClick={() => handleStartTest(test)}
                                                    className="flex-1 md:flex-none md:w-auto px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 animate-pulse"
                                                >
                                                    <Play className="h-3 w-3" />
                                                    Resume
                                                </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => handleStartTest(test)}
                                                    className="w-full md:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                                                >
                                                    <Play className="h-3 w-3" />
                                                    Start test
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        );
                    })}
                </div>
            </div>
        </div>

        <AuthModal
            open={authModal}
            onClose={() => setAuthModal(false)}
            reason="attempt this test"
            redirectTo={`/dashboard/test-series/${params.id}`}
        />
        </>
    );
}
