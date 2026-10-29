'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import {
    Clock,
    Calendar,
    ChevronRight,
    History as HistoryIcon,
    Eye,
    EyeOff,
    Download,
    FileText,
    BarChart3,
    Play,
    X,
    AlertTriangle,
    Loader2,
} from 'lucide-react';
import { formatScore, reportHref } from '@/components/tests/AttemptSwitcher';

type AttemptRow = {
    id: number;
    test_id: number;
    test_name_en: string | null;
    test_name_hi: string | null;
    status: 'completed' | 'in_progress' | string;
    attempt_number: number;
    attempts_at_test: number;
    total_score: number | null;
    total_marks: number | null;
    correct: number | null;
    incorrect: number | null;
    time_taken_sec: number | null;
    started_at: string | null;
    completed_at: string | null;
};

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
};

const PER_PAGE = 20;

function formatDateTime(value?: string | null) {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function formatDuration(sec?: number | null) {
    if (sec == null || sec <= 0) return null;
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

function HistoryContent() {
    const searchParams = useSearchParams();
    const testFilter = searchParams.get('test');
    const testId = testFilter && /^\d+$/.test(testFilter) ? Number(testFilter) : null;

    const [rows, setRows] = useState<AttemptRow[]>([]);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hideScores, setHideScores] = useState(false);

    useEffect(() => {
        try {
            if (localStorage.getItem('hide_scores') === 'true') setHideScores(true);
        } catch {
            // storage unavailable — keep scores visible
        }
    }, []);

    const toggleHideScores = () => {
        const next = !hideScores;
        setHideScores(next);
        try {
            localStorage.setItem('hide_scores', String(next));
        } catch {
            // ignore
        }
    };

    const fetchPage = useCallback(async (pageNo: number) => {
        const params: Record<string, number> = { per_page: PER_PAGE, page: pageNo };
        if (testId) params.test_id = testId;
        const res = await api.get<Paginated<AttemptRow>>('/attempts', { params });
        return res.data;
    }, [testId]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        setRows([]);
        fetchPage(1)
            .then((data) => {
                if (cancelled) return;
                setRows(data.data ?? []);
                setPage(data.current_page ?? 1);
                setLastPage(data.last_page ?? 1);
                setTotal(data.total ?? (data.data ?? []).length);
            })
            .catch(() => {
                if (!cancelled) setError('We could not load your attempts. Check your connection and try again.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [fetchPage]);

    const loadMore = async () => {
        if (loadingMore || page >= lastPage) return;
        setLoadingMore(true);
        try {
            const data = await fetchPage(page + 1);
            setRows((prev) => {
                const seen = new Set(prev.map((r) => r.id));
                return [...prev, ...(data.data ?? []).filter((r) => !seen.has(r.id))];
            });
            setPage(data.current_page ?? page + 1);
            setLastPage(data.last_page ?? lastPage);
        } catch {
            setError('Could not load more attempts. Please try again.');
        } finally {
            setLoadingMore(false);
        }
    };

    const retry = () => {
        setError(null);
        setLoading(true);
        fetchPage(1)
            .then((data) => {
                setRows(data.data ?? []);
                setPage(data.current_page ?? 1);
                setLastPage(data.last_page ?? 1);
                setTotal(data.total ?? (data.data ?? []).length);
            })
            .catch(() => setError('We could not load your attempts. Check your connection and try again.'))
            .finally(() => setLoading(false));
    };

    const filteredTestName = testId ? rows.find((r) => r.test_id === testId)?.test_name_en : null;

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="page-title">My attempts</h1>
                    <p className="page-subtitle">
                        Every test you have taken. Open any attempt to see its result and solutions, or download it as a PDF.
                    </p>
                </div>
                <button onClick={toggleHideScores} className="btn btn-secondary btn-sm self-start md:self-auto">
                    {hideScores ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    {hideScores ? 'Show scores' : 'Hide scores'}
                </button>
            </div>

            {testId && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Showing attempts of</span>
                    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-accent text-accent-foreground px-3 py-1 font-medium">
                        <span className="truncate">{filteredTestName || `Test #${testId}`}</span>
                        <Link href="/dashboard/history" aria-label="Clear test filter" className="shrink-0 rounded-full hover:opacity-70">
                            <X className="h-3.5 w-3.5" />
                        </Link>
                    </span>
                    <Link href="/dashboard/history" className="font-semibold text-primary hover:underline">
                        Show all tests
                    </Link>
                </div>
            )}

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="card p-5 animate-pulse space-y-2">
                            <div className="h-5 w-2/3 bg-muted rounded" />
                            <div className="h-4 w-1/3 bg-muted rounded" />
                        </div>
                    ))}
                </div>
            ) : error && rows.length === 0 ? (
                <div className="card p-10 text-center">
                    <AlertTriangle className="h-10 w-10 mx-auto text-amber-500" />
                    <h3 className="mt-4 text-lg font-semibold">Something went wrong</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                    <button onClick={retry} className="btn btn-primary mt-5">Try again</button>
                </div>
            ) : rows.length > 0 ? (
                <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                        {total} attempt{total === 1 ? '' : 's'}
                    </p>
                    {rows.map((row) => {
                        const title = row.test_name_en || row.test_name_hi || 'Test';
                        const completed = row.status === 'completed';
                        const duration = formatDuration(row.time_taken_sec);
                        const when = completed ? row.completed_at ?? row.started_at : row.started_at;
                        return (
                            <div key={row.id} className="card p-4 sm:p-5 flex flex-col gap-4">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="badge badge-blue">
                                                Attempt {row.attempt_number} of {row.attempts_at_test}
                                            </span>
                                            {completed ? (
                                                <span className="badge badge-green">Completed</span>
                                            ) : row.status === 'in_progress' ? (
                                                <span className="badge badge-amber">In progress</span>
                                            ) : (
                                                <span className="badge badge-gray capitalize">{row.status.replace('_', ' ')}</span>
                                            )}
                                        </div>
                                        <h3 className="mt-2 font-semibold leading-snug break-words">{title}</h3>
                                        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="h-4 w-4 shrink-0" />
                                                {completed ? '' : 'Started '}{formatDateTime(when)}
                                            </span>
                                            {duration && (
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="h-4 w-4 shrink-0" />
                                                    {duration}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {completed && (
                                        <dl className="grid grid-cols-3 gap-4 shrink-0 sm:text-right">
                                            <div>
                                                <dt className="text-xs text-muted-foreground">Score</dt>
                                                <dd className="text-lg font-bold whitespace-nowrap">
                                                    {hideScores
                                                        ? '••'
                                                        : `${formatScore(row.total_score)}${row.total_marks != null ? ` / ${formatScore(row.total_marks)}` : ''}`}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs text-muted-foreground">Correct</dt>
                                                <dd className="text-lg font-bold text-green-600 dark:text-green-400">
                                                    {hideScores ? '••' : row.correct ?? '—'}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs text-muted-foreground">Wrong</dt>
                                                <dd className="text-lg font-bold text-red-600 dark:text-red-400">
                                                    {hideScores ? '••' : row.incorrect ?? '—'}
                                                </dd>
                                            </div>
                                        </dl>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2 border-t border-card-border pt-3">
                                    {completed ? (
                                        <>
                                            <Link href={`/dashboard/tests/result/${row.id}`} className="btn btn-primary btn-sm">
                                                <BarChart3 className="h-4 w-4" />
                                                Result
                                            </Link>
                                            <Link href={`/dashboard/tests/solutions/${row.id}`} className="btn btn-secondary btn-sm">
                                                <FileText className="h-4 w-4" />
                                                Solutions
                                            </Link>
                                            <Link href={reportHref(row.id)} className="btn btn-secondary btn-sm">
                                                <Download className="h-4 w-4" />
                                                Download PDF
                                            </Link>
                                        </>
                                    ) : row.status === 'in_progress' ? (
                                        <Link href={`/dashboard/tests/play/${row.test_id}`} className="btn btn-primary btn-sm">
                                            <Play className="h-4 w-4" />
                                            Continue
                                        </Link>
                                    ) : null}
                                    {!testId && row.attempts_at_test > 1 && (
                                        <Link
                                            href={`/dashboard/history?test=${row.test_id}`}
                                            className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                                        >
                                            All attempts of this test <ChevronRight className="h-4 w-4" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

                    {page < lastPage && (
                        <div className="pt-2 flex justify-center">
                            <button onClick={loadMore} disabled={loadingMore} className="btn btn-secondary">
                                {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                                {loadingMore ? 'Loading…' : `Load more (${rows.length} of ${total})`}
                            </button>
                        </div>
                    )}

                    <div className="pt-2">
                        <Link href="/dashboard/analytics" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                            See detailed analytics <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="card p-10 text-center">
                    <HistoryIcon className="h-10 w-10 mx-auto text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">
                        {testId ? 'No attempts at this test yet' : 'No attempts yet'}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {testId ? 'Attempts at this test will show here.' : 'Every test you take will appear here, with its result and solutions.'}
                    </p>
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                        {testId && <Link href="/dashboard/history" className="btn btn-secondary">Show all attempts</Link>}
                        <Link href="/dashboard/tests" className="btn btn-primary">{testId ? 'Browse tests' : 'Start your first test'}</Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function HistoryPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[40vh] flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            }
        >
            <HistoryContent />
        </Suspense>
    );
}
