'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
    Clock,
    Calendar,
    ChevronRight,
    Target,
    History as HistoryIcon,
    Eye,
    EyeOff,
} from 'lucide-react';
import Link from 'next/link';

type ActivityItem = {
    type: string;
    title?: string;
    test_title?: string;
    score?: number;
    total_marks?: number;
    max_marks?: number;
    accuracy?: number | null;
    duration_sec?: number;
    activity_at?: string;
};

function formatDate(value?: string) {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDuration(sec?: number) {
    if (!sec || sec <= 0) return null;
    const m = Math.round(sec / 60);
    return m < 1 ? '< 1 min' : `${m} min`;
}

export default function HistoryPage() {
    const [history, setHistory] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [hideScores, setHideScores] = useState(false);

    useEffect(() => {
        fetchHistory();
        const stored = localStorage.getItem('hide_scores');
        if (stored === 'true') setHideScores(true);
    }, []);

    const toggleHideScores = () => {
        const newVal = !hideScores;
        setHideScores(newVal);
        localStorage.setItem('hide_scores', String(newVal));
    };

    const fetchHistory = async () => {
        try {
            const res = await api.get('/analytics/overview');
            setHistory(res.data.recent_activity || []);
        } catch (error) {
            console.error('Failed to fetch history', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="page-title">Test history</h1>
                    <p className="page-subtitle">Your recent test attempts with score and accuracy.</p>
                </div>
                <button onClick={toggleHideScores} className="btn btn-secondary btn-sm self-start md:self-auto">
                    {hideScores ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    {hideScores ? 'Show scores' : 'Hide scores'}
                </button>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="card p-5 animate-pulse space-y-2">
                            <div className="h-5 w-2/3 bg-muted rounded" />
                            <div className="h-4 w-1/3 bg-muted rounded" />
                        </div>
                    ))}
                </div>
            ) : history.length > 0 ? (
                <div className="space-y-3">
                    {history.map((item, idx) => {
                        const title = item.title || item.test_title || 'Test attempt';
                        const total = item.total_marks ?? item.max_marks;
                        const accuracy = item.accuracy != null ? Math.round(Number(item.accuracy)) : null;
                        const duration = formatDuration(item.duration_sec);
                        return (
                            <div key={idx} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="min-w-0">
                                    <h3 className="font-semibold leading-snug">{title}</h3>
                                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4" />
                                            {formatDate(item.activity_at)}
                                        </span>
                                        {duration && (
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="h-4 w-4" />
                                                {duration}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 shrink-0">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Score</p>
                                        <p className="text-lg font-bold">
                                            {hideScores ? '••' : `${item.score ?? 0}${total != null ? ` / ${total}` : ''}`}
                                        </p>
                                    </div>
                                    {accuracy != null && (
                                        <div>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1"><Target className="h-3 w-3" /> Accuracy</p>
                                            <p className={`text-lg font-bold ${!hideScores && accuracy >= 70 ? 'text-green-600 dark:text-green-400' : ''}`}>
                                                {hideScores ? '••' : `${accuracy}%`}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    <div className="pt-2">
                        <Link href="/dashboard/analytics" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                            See detailed analytics <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="card p-10 text-center">
                    <HistoryIcon className="h-10 w-10 mx-auto text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">No attempts yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Your completed tests will appear here.</p>
                    <Link href="/dashboard/tests" className="btn btn-primary mt-5">Start your first test</Link>
                </div>
            )}
        </div>
    );
}
