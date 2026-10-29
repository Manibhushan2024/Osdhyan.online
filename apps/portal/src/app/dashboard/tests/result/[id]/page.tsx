'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import {
    ChevronRight,
    CheckCircle2,
    XCircle,
    MinusCircle,
    Clock,
    Target,
    Share2,
    RotateCcw,
    ArrowLeft,
    Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import AttemptSwitcher, { AttemptRef, formatScore } from '@/components/tests/AttemptSwitcher';
import type { SectionResult } from '@/components/tests/SectionedPlayer';

type SectionStat = {
    correct: number;
    incorrect: number;
    total: number;
    marks: number;
};

type Attempt = {
    id: number;
    test_id?: number;
    total_score: number | string;
    completed_at: string;
    time_taken_sec: number;
    metadata: {
        correct_count: number;
        incorrect_count: number;
        unattempted_count?: number;
        accuracy: number;
        sectional_stats: Record<string, SectionStat>;
        /** Sectioned papers: one row per group, in paper order. */
        section_results?: SectionResult[] | null;
        ai_insights?: string | string[] | null;
    };
    ai_insights?: string | string[] | null;
    attempt_number?: number | null;
    attempts?: AttemptRef[];
    test: {
        id?: number;
        name_en: string;
        total_marks: number;
    }
};

function formatTime(sec: number) {
    const safe = Math.max(0, Math.floor(sec || 0));
    const h = Math.floor(safe / 3600);
    const m = Math.floor((safe % 3600) / 60);
    const s = safe % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${s}s`;
}

export default function TestResult() {
    const params = useParams();
    const [attempt, setAttempt] = useState<Attempt | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResult();
    }, [params.id]);

    const fetchResult = async () => {
        try {
            const res = await api.get(`/attempts/${params.id}`);
            setAttempt(res.data);
        } catch (error) {
            console.error('Failed to fetch result', error);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        if (!attempt) return;
        const shareData = {
            title: `Result: ${attempt.test.name_en}`,
            text: `I scored ${formatScore(attempt.total_score)}/${attempt.test.total_marks} in ${attempt.test.name_en} on OSDHYAN.`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied');
            } catch (err) {
                toast.error('Could not copy the link');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Loading your result…</p>
            </div>
        );
    }

    if (!attempt) {
        return (
            <div className="card p-10 text-center">
                <h2 className="text-lg font-semibold">Result not found</h2>
                <p className="mt-1 text-sm text-muted-foreground">This attempt may still be in progress or may not belong to your account.</p>
                <Link href="/dashboard/tests" className="btn btn-primary mt-5">Back to tests</Link>
            </div>
        );
    }

    const sectional = attempt.metadata?.sectional_stats ?? {};
    const sectionResults = Array.isArray(attempt.metadata?.section_results) ? attempt.metadata.section_results : [];
    const sectionTotals = sectionResults.reduce(
        (acc, s) => ({
            total: acc.total + (Number(s.total) || 0),
            correct: acc.correct + (Number(s.correct) || 0),
            incorrect: acc.incorrect + (Number(s.incorrect) || 0),
            unattempted: acc.unattempted + (Number(s.unattempted) || 0),
            marks: acc.marks + (Number(s.marks) || 0),
            max: acc.max + (Number(s.max_marks) || 0),
        }),
        { total: 0, correct: 0, incorrect: 0, unattempted: 0, marks: 0, max: 0 },
    );
    const totalQuestions = Object.values(sectional).reduce((acc, s) => acc + (s.total || 0), 0);
    const correct = attempt.metadata?.correct_count ?? 0;
    const incorrect = attempt.metadata?.incorrect_count ?? 0;
    const unattempted = attempt.metadata?.unattempted_count ?? Math.max(0, totalQuestions - correct - incorrect);
    const accuracy = Math.round(Number(attempt.metadata?.accuracy ?? 0));
    const scorePercent = attempt.test.total_marks > 0
        ? Math.max(0, Math.min(100, Math.round((Number(attempt.total_score) / attempt.test.total_marks) * 100)))
        : 0;
    const testId = attempt.test_id ?? attempt.test?.id;
    const reattemptHref = testId ? `/dashboard/tests/play/${testId}` : '/dashboard/tests';

    const rawInsights = attempt.ai_insights ?? attempt.metadata?.ai_insights;
    const insights: string[] = Array.isArray(rawInsights)
        ? rawInsights.filter(Boolean)
        : typeof rawInsights === 'string' && rawInsights.trim()
            ? [rawInsights.trim()]
            : [];

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <nav className="flex items-center gap-2 text-sm text-muted-foreground print:hidden" aria-label="Breadcrumb">
                        <Link href="/dashboard/tests" className="hover:text-foreground">Tests</Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span>Result</span>
                    </nav>
                    <h1 className="page-title mt-1">{attempt.test.name_en}</h1>
                    {attempt.completed_at && (
                        <p className="page-subtitle">
                            Completed {new Date(attempt.completed_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2 print:hidden">
                    <button onClick={handleShare} className="btn btn-secondary btn-sm" title="Share">
                        <Share2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Share</span>
                    </button>
                </div>
            </div>

            <AttemptSwitcher
                currentId={attempt.id}
                attemptNumber={attempt.attempt_number}
                attempts={attempt.attempts}
                testId={testId}
                hrefFor={(id) => `/dashboard/tests/result/${id}`}
            />

            {/* Score summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="card p-6 lg:col-span-1">
                    <p className="eyebrow">Your score</p>
                    <p className="mt-2 text-5xl font-extrabold tracking-tight">
                        {formatScore(attempt.total_score)}
                        <span className="text-xl font-semibold text-muted-foreground"> / {attempt.test.total_marks}</span>
                    </p>
                    <div className="mt-4 h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${scorePercent}%` }} />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{scorePercent}% of total marks</p>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Target className="h-4 w-4" /> Accuracy</p>
                            <p className="mt-1 text-2xl font-bold">{accuracy}%</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Clock className="h-4 w-4" /> Time taken</p>
                            <p className="mt-1 text-2xl font-bold">{formatTime(attempt.time_taken_sec)}</p>
                        </div>
                    </div>
                </div>

                <div className="card p-6 lg:col-span-2">
                    <p className="eyebrow">Question breakdown</p>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                        <div className="rounded-xl bg-green-50 dark:bg-green-900/20 p-4">
                            <div className="flex items-center gap-2 text-green-700 dark:text-green-300 text-sm font-medium">
                                <CheckCircle2 className="h-4 w-4" /> Correct
                            </div>
                            <p className="mt-1 text-3xl font-bold text-green-700 dark:text-green-300">{correct}</p>
                        </div>
                        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-4">
                            <div className="flex items-center gap-2 text-red-700 dark:text-red-300 text-sm font-medium">
                                <XCircle className="h-4 w-4" /> Incorrect
                            </div>
                            <p className="mt-1 text-3xl font-bold text-red-700 dark:text-red-300">{incorrect}</p>
                        </div>
                        <div className="rounded-xl bg-muted p-4">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                                <MinusCircle className="h-4 w-4" /> Unattempted
                            </div>
                            <p className="mt-1 text-3xl font-bold">{unattempted}</p>
                        </div>
                    </div>

                    {totalQuestions > 0 && (
                        <div className="mt-5">
                            <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                                <div className="bg-green-500" style={{ width: `${(correct / totalQuestions) * 100}%` }} title="Correct" />
                                <div className="bg-red-500" style={{ width: `${(incorrect / totalQuestions) * 100}%` }} title="Incorrect" />
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">{totalQuestions} questions in total</p>
                        </div>
                    )}

                    <div className="mt-6 flex flex-wrap gap-2 print:hidden">
                        <Link href={`/dashboard/tests/solutions/${attempt.id}`} className="btn btn-primary">
                            View solutions
                        </Link>
                        <Link href={reattemptHref} className="btn btn-secondary">
                            <RotateCcw className="h-4 w-4" />
                            Re-attempt
                        </Link>
                        <Link href="/dashboard/tests" className="btn btn-ghost">
                            <ArrowLeft className="h-4 w-4" />
                            Back to tests
                        </Link>
                    </div>
                </div>
            </div>

            {/* Section-wise (groups of a sectioned paper, in paper order) */}
            {sectionResults.length > 0 && (
                <div className="card overflow-hidden">
                    <div className="p-5 sm:p-6 border-b border-card-border">
                        <h2 className="text-lg font-semibold">Section-wise performance</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/60 text-muted-foreground">
                                <tr>
                                    <th className="text-left font-medium px-5 sm:px-6 py-3">Section</th>
                                    <th className="text-right font-medium px-3 py-3">Questions</th>
                                    <th className="text-right font-medium px-3 py-3">Correct</th>
                                    <th className="text-right font-medium px-3 py-3">Wrong</th>
                                    <th className="text-right font-medium px-3 py-3">Skipped</th>
                                    <th className="text-right font-medium px-3 py-3">Marks</th>
                                    <th className="text-right font-medium px-5 sm:px-6 py-3">Accuracy</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-card-border">
                                {sectionResults.map((s) => {
                                    const acc = Math.round(Number(s.accuracy) || 0);
                                    return (
                                        <tr key={s.key}>
                                            <td className="px-5 sm:px-6 py-3 font-medium min-w-[200px]">{s.name_en}</td>
                                            <td className="px-3 py-3 text-right">{s.total}</td>
                                            <td className="px-3 py-3 text-right text-green-700 dark:text-green-300">{s.correct}</td>
                                            <td className="px-3 py-3 text-right text-red-700 dark:text-red-300">{s.incorrect}</td>
                                            <td className="px-3 py-3 text-right">{s.unattempted}</td>
                                            <td className="px-3 py-3 text-right font-semibold whitespace-nowrap">
                                                {formatScore(s.marks)} / {formatScore(s.max_marks)}
                                            </td>
                                            <td className="px-5 sm:px-6 py-3 text-right">
                                                <span className={cn(
                                                    'badge',
                                                    acc >= 70 ? 'badge-green' : acc >= 40 ? 'badge-blue' : 'badge-amber'
                                                )}>
                                                    {acc}%
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="border-t-2 border-card-border font-semibold">
                                <tr>
                                    <td className="px-5 sm:px-6 py-3">Total</td>
                                    <td className="px-3 py-3 text-right">{sectionTotals.total}</td>
                                    <td className="px-3 py-3 text-right text-green-700 dark:text-green-300">{sectionTotals.correct}</td>
                                    <td className="px-3 py-3 text-right text-red-700 dark:text-red-300">{sectionTotals.incorrect}</td>
                                    <td className="px-3 py-3 text-right">{sectionTotals.unattempted}</td>
                                    <td className="px-3 py-3 text-right whitespace-nowrap">
                                        {formatScore(sectionTotals.marks)} / {formatScore(sectionTotals.max)}
                                    </td>
                                    <td className="px-5 sm:px-6 py-3" />
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {/* Subject-wise table */}
            {Object.keys(sectional).length > 0 && (
                <div className="card overflow-hidden">
                    <div className="p-5 sm:p-6 border-b border-card-border">
                        <h2 className="text-lg font-semibold">{sectionResults.length > 0 ? 'Subject-wise performance' : 'Section-wise performance'}</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/60 text-muted-foreground">
                                <tr>
                                    <th className="text-left font-medium px-5 sm:px-6 py-3">{sectionResults.length > 0 ? 'Subject' : 'Section'}</th>
                                    <th className="text-right font-medium px-3 py-3">Questions</th>
                                    <th className="text-right font-medium px-3 py-3">Correct</th>
                                    <th className="text-right font-medium px-3 py-3">Incorrect</th>
                                    <th className="text-right font-medium px-3 py-3">Accuracy</th>
                                    <th className="text-right font-medium px-5 sm:px-6 py-3">Marks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-card-border">
                                {Object.entries(sectional).map(([name, stat]) => {
                                    const attempted = stat.correct + stat.incorrect;
                                    const acc = attempted > 0 ? Math.round((stat.correct / attempted) * 100) : 0;
                                    return (
                                        <tr key={name}>
                                            <td className="px-5 sm:px-6 py-3 font-medium">{name}</td>
                                            <td className="px-3 py-3 text-right">{stat.total}</td>
                                            <td className="px-3 py-3 text-right text-green-700 dark:text-green-300">{stat.correct}</td>
                                            <td className="px-3 py-3 text-right text-red-700 dark:text-red-300">{stat.incorrect}</td>
                                            <td className="px-3 py-3 text-right">
                                                <span className={cn(
                                                    'badge',
                                                    acc >= 70 ? 'badge-green' : acc >= 40 ? 'badge-blue' : 'badge-amber'
                                                )}>
                                                    {acc}%
                                                </span>
                                            </td>
                                            <td className="px-5 sm:px-6 py-3 text-right font-semibold">{stat.marks}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* AI feedback (only when real data exists) */}
            {insights.length > 0 && (
                <div className="card p-5 sm:p-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        AI feedback
                    </h2>
                    <ul className="mt-3 space-y-2 text-sm leading-relaxed">
                        {insights.map((line, i) => (
                            <li key={i} className="flex gap-2">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                <span>{line}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Print styles */}
            <style>{`
                @media print {
                    @page { margin: 12mm; size: auto; }
                    body { background: white; color: black; }
                    .print\\:hidden { display: none !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            `}</style>
        </div>
    );
}
