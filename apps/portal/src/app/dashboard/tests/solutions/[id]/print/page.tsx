'use client';

import { CSSProperties, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Download, Languages, Loader2, Play } from 'lucide-react';
import api from '@/lib/api';
import QuestionText from '@/components/tests/QuestionText';
import { AttemptRef, formatScore } from '@/components/tests/AttemptSwitcher';
import { useAuth } from '@/components/providers/AuthProvider';
import { cn } from '@/lib/utils';

/* ─── API shape (GET /attempts/{id}) ─────────────────────────────────────── */

type Option = {
    id: number;
    label?: string | null;
    option_en: string | null;
    option_hi: string | null;
    is_correct?: boolean;
};

type Question = {
    id: number;
    question_en: string | null;
    question_hi: string | null;
    options: Option[];
    explanation_en?: string | null;
    explanation_hi?: string | null;
    subject?: { name_en: string | null; name_hi?: string | null } | null;
    pivot?: { marks?: string | number | null; negative_marks?: string | number | null; sort_order?: number | null } | null;
};

type ResponseRow = {
    question_id: number;
    selected_option_id: number | null;
    is_marked_for_review?: boolean | null;
    time_taken_sec?: number | null;
    marks_obtained?: string | number | null;
    is_correct?: boolean | null;
};

type Attempt = {
    id: number;
    test_id?: number;
    status: string;
    total_score: string | number | null;
    time_taken_sec?: number | null;
    started_at?: string | null;
    completed_at?: string | null;
    created_at?: string | null;
    attempt_number?: number | null;
    attempts?: AttemptRef[];
    metadata?: {
        correct_count?: number;
        incorrect_count?: number;
        unattempted_count?: number;
        total_questions?: number;
        accuracy?: number;
    } | null;
    test: {
        id?: number;
        name_en: string;
        name_hi?: string | null;
        total_marks?: number | string | null;
        negative_marking?: number | string | null;
        duration_sec?: number | null;
        exam?: { name_en: string } | null;
        questions: Question[];
    };
    responses: ResponseRow[];
};

type QStatus = 'correct' | 'wrong' | 'skipped';

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function formatDateTime(value?: string | null) {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function formatSec(sec?: number | null) {
    const safe = Math.max(0, Math.floor(Number(sec) || 0));
    const h = Math.floor(safe / 3600);
    const m = Math.floor((safe % 3600) / 60);
    const s = safe % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

function signed(n: number) {
    const v = formatScore(Math.abs(n));
    return n > 0 ? `+${v}` : n < 0 ? `−${v}` : '0';
}

/** Light palette for the "paper", so the report stays black-on-white in dark mode too. */
const PAPER_VARS = {
    '--background': '#ffffff',
    '--foreground': '#111827',
    '--card-bg': '#ffffff',
    '--card-border': '#d1d5db',
    '--muted': '#f3f4f6',
    '--muted-foreground': '#4b5563',
    colorScheme: 'light',
} as CSSProperties;

/* ─── Page ───────────────────────────────────────────────────────────────── */

function AttemptReport() {
    const params = useParams();
    const searchParams = useSearchParams();
    const autoPrint = searchParams.get('print') === '1';
    const { user } = useAuth();

    const [attempt, setAttempt] = useState<Attempt | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [language, setLanguage] = useState<'en' | 'hi'>('en');
    const printedRef = useRef(false);

    useEffect(() => {
        let cancelled = false;
        api.get<Attempt>(`/attempts/${params.id}`)
            .then((res) => {
                if (cancelled) return;
                setAttempt(res.data);
                setError(null);
            })
            .catch((err) => {
                if (cancelled) return;
                const status = err?.response?.status;
                setError(status === 403 || status === 404
                    ? 'This attempt was not found, or it belongs to another account.'
                    : 'We could not load this attempt. Check your connection and try again.');
            });
        return () => {
            cancelled = true;
        };
    }, [params.id]);

    const testName = attempt ? ((language === 'hi' && attempt.test.name_hi) || attempt.test.name_en) : '';
    const attemptNumber = attempt?.attempt_number ?? attempt?.attempts?.find((a) => a.id === attempt.id)?.number ?? null;
    const attemptsTotal = attempt?.attempts?.length ?? 0;
    const pdfTitle = attempt
        ? `OSDHYAN - ${attempt.test.name_en}${attemptNumber ? ` - Attempt ${attemptNumber}` : ''}`
        : null;

    // The browser uses document.title as the suggested PDF file name.
    useEffect(() => {
        if (!pdfTitle) return;
        const previous = document.title;
        document.title = pdfTitle;
        return () => {
            document.title = previous;
        };
    }, [pdfTitle]);

    const report = useMemo(() => {
        if (!attempt) return null;
        const responses = new Map<number, ResponseRow>();
        for (const r of attempt.responses ?? []) responses.set(r.question_id, r);

        const questions = [...(attempt.test?.questions ?? [])]
            .map((q, i) => ({ q, i }))
            .sort((a, b) => (a.q.pivot?.sort_order ?? a.i) - (b.q.pivot?.sort_order ?? b.i) || a.i - b.i)
            .map(({ q }) => q);

        const rows = questions.map((q) => {
            const resp = responses.get(q.id);
            const selected = resp?.selected_option_id ?? null;
            const marks = Number(resp?.marks_obtained ?? 0) || 0;
            let status: QStatus = 'skipped';
            if (selected) {
                const opt = q.options.find((o) => o.id === selected);
                const correct = resp?.is_correct ?? (opt?.is_correct !== undefined ? !!opt.is_correct : marks > 0);
                status = correct ? 'correct' : 'wrong';
            }
            return { q, resp, selected, marks, status, marked: !!resp?.is_marked_for_review };
        });

        const correct = rows.filter((r) => r.status === 'correct').length;
        const wrong = rows.filter((r) => r.status === 'wrong').length;
        const skipped = rows.filter((r) => r.status === 'skipped').length;
        const marked = rows.filter((r) => r.marked).length;
        const negativeLost = rows.reduce((acc, r) => acc + (r.marks < 0 ? -r.marks : 0), 0);
        const positiveMarks = rows.reduce((acc, r) => acc + (r.marks > 0 ? r.marks : 0), 0);
        const attempted = correct + wrong;
        const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

        // Subject-wise breakdown (only meaningful when questions carry a subject).
        const sections = new Map<string, { total: number; correct: number; wrong: number; skipped: number; marks: number }>();
        for (const r of rows) {
            const name = (language === 'hi' && r.q.subject?.name_hi) || r.q.subject?.name_en || 'General';
            const s = sections.get(name) ?? { total: 0, correct: 0, wrong: 0, skipped: 0, marks: 0 };
            s.total += 1;
            s[r.status] += 1;
            s.marks += r.marks;
            sections.set(name, s);
        }
        const hasSubjects = rows.some((r) => r.q.subject?.name_en);

        return {
            rows,
            correct,
            wrong,
            skipped,
            marked,
            negativeLost,
            positiveMarks,
            accuracy,
            sections: hasSubjects ? [...sections.entries()] : [],
        };
    }, [attempt, language]);

    const ready = !!attempt && attempt.status === 'completed' && !!report;

    // ?print=1 → open the print dialog once, after the report has rendered.
    useEffect(() => {
        if (!autoPrint || !ready || printedRef.current) return;
        printedRef.current = true;
        let timer: ReturnType<typeof setTimeout> | undefined;
        const go = () => {
            timer = setTimeout(() => window.print(), 400);
        };
        if (document.fonts?.ready) document.fonts.ready.then(go, go);
        else go();
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [autoPrint, ready]);

    const handleDownload = () => {
        if (pdfTitle) document.title = pdfTitle;
        window.print();
    };

    if (error) {
        return (
            <div className="card p-10 text-center">
                <h2 className="text-lg font-semibold">Report not available</h2>
                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                <Link href="/dashboard/history" className="btn btn-primary mt-5">My attempts</Link>
            </div>
        );
    }

    if (!attempt || !report) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Preparing your report…</p>
            </div>
        );
    }

    if (attempt.status !== 'completed') {
        const testId = attempt.test_id ?? attempt.test?.id;
        return (
            <div className="card p-10 text-center">
                <h2 className="text-lg font-semibold">This attempt is not finished yet</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    The report with answers and solutions is ready once you submit the test.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {testId && (
                        <Link href={`/dashboard/tests/play/${testId}`} className="btn btn-primary">
                            <Play className="h-4 w-4" /> Continue the test
                        </Link>
                    )}
                    <Link href="/dashboard/history" className="btn btn-secondary">My attempts</Link>
                </div>
            </div>
        );
    }

    const totalMarks = Number(attempt.test.total_marks ?? 0);
    const score = Number(attempt.total_score ?? 0);
    const scorePct = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : null;
    const negativeMarking = Number(attempt.test.negative_marking ?? 0);
    const hasHindi = attempt.test.questions?.some((q) => q.question_hi) || !!attempt.test.name_hi;
    const t = (en?: string | null, hi?: string | null) => (language === 'hi' && hi ? hi : en ?? hi ?? '');

    const summary: { label: string; value: string }[] = [
        { label: 'Score', value: `${formatScore(score)} / ${formatScore(totalMarks)}${scorePct !== null ? ` (${scorePct}%)` : ''}` },
        { label: 'Correct', value: String(report.correct) },
        { label: 'Wrong', value: String(report.wrong) },
        { label: 'Skipped', value: String(report.skipped) },
        { label: 'Accuracy', value: `${report.accuracy}%` },
        { label: 'Time taken', value: formatSec(attempt.time_taken_sec) },
    ];
    if (negativeMarking > 0) {
        summary.push({ label: 'Marks for correct', value: `+${formatScore(report.positiveMarks)}` });
        summary.push({ label: 'Negative marks', value: `−${formatScore(report.negativeLost)}` });
    }
    if (report.marked > 0) summary.push({ label: 'Marked for review', value: String(report.marked) });

    return (
        <div className="report-root pb-12 print:pb-0">
            {/* Toolbar — screen only */}
            <div className="mx-auto max-w-4xl mb-4 flex flex-col gap-3 print:hidden">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link href={`/dashboard/tests/result/${attempt.id}`} className="btn btn-ghost btn-sm">
                        <ArrowLeft className="h-4 w-4" /> Back to result
                    </Link>
                    <div className="flex flex-wrap items-center gap-2">
                        {hasHindi && (
                            <button
                                onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                                className="btn btn-secondary btn-sm"
                            >
                                <Languages className="h-4 w-4" />
                                {language === 'en' ? 'हिन्दी' : 'English'}
                            </button>
                        )}
                        <button onClick={handleDownload} className="btn btn-primary btn-sm">
                            <Download className="h-4 w-4" /> Download PDF
                        </button>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground sm:text-right">
                    In the print window, choose <strong>“Save as PDF”</strong> as the printer.
                </p>
            </div>

            {/* The paper */}
            <article
                style={PAPER_VARS}
                className="report-paper mx-auto max-w-4xl bg-white text-gray-900 rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-10 print:max-w-none print:rounded-none print:border-0 print:shadow-none print:p-0"
            >
                {/* Header */}
                <header className="report-block border-b-2 border-gray-900 pb-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-sm font-black tracking-[0.2em]">OSDHYAN</p>
                        <p className="text-xs text-gray-600">Attempt report</p>
                    </div>
                    <h1 className="mt-2 text-xl sm:text-2xl font-bold leading-snug break-words">{testName}</h1>
                    <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                        <div className="flex gap-2"><dt className="text-gray-600">Candidate:</dt><dd className="font-semibold break-words">{user?.name || '—'}</dd></div>
                        <div className="flex gap-2">
                            <dt className="text-gray-600">Attempt:</dt>
                            <dd className="font-semibold">{attemptNumber ? `Attempt ${attemptNumber}${attemptsTotal ? ` of ${attemptsTotal}` : ''}` : '—'}</dd>
                        </div>
                        <div className="flex gap-2"><dt className="text-gray-600">Started:</dt><dd>{formatDateTime(attempt.started_at ?? attempt.created_at)}</dd></div>
                        <div className="flex gap-2"><dt className="text-gray-600">Completed:</dt><dd>{formatDateTime(attempt.completed_at)}</dd></div>
                        <div className="flex gap-2"><dt className="text-gray-600">Time taken:</dt><dd>{formatSec(attempt.time_taken_sec)}{attempt.test.duration_sec ? ` of ${formatSec(attempt.test.duration_sec)}` : ''}</dd></div>
                        <div className="flex gap-2"><dt className="text-gray-600">Questions:</dt><dd>{report.rows.length}{negativeMarking > 0 ? ` · −${formatScore(negativeMarking)} per wrong answer` : ''}</dd></div>
                    </dl>
                </header>

                {/* Score summary */}
                <section className="report-block mt-5">
                    <h2 className="text-sm font-bold uppercase tracking-wide">Score summary</h2>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {summary.map((s) => (
                            <div key={s.label} className="rounded-lg border border-gray-400 px-3 py-2">
                                <p className="text-xs text-gray-600">{s.label}</p>
                                <p className="text-base font-bold">{s.value}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Subject-wise */}
                {report.sections.length > 0 && (
                    <section className="report-block mt-5">
                        <h2 className="text-sm font-bold uppercase tracking-wide">Subject-wise</h2>
                        <div className="mt-2 overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-gray-900 text-left">
                                        <th className="py-1.5 pr-2 font-semibold">Subject</th>
                                        <th className="py-1.5 px-2 font-semibold text-right">Qs</th>
                                        <th className="py-1.5 px-2 font-semibold text-right">Correct</th>
                                        <th className="py-1.5 px-2 font-semibold text-right">Wrong</th>
                                        <th className="py-1.5 px-2 font-semibold text-right">Skipped</th>
                                        <th className="py-1.5 pl-2 font-semibold text-right">Marks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.sections.map(([name, s]) => (
                                        <tr key={name} className="border-b border-gray-300">
                                            <td className="py-1.5 pr-2">{name}</td>
                                            <td className="py-1.5 px-2 text-right">{s.total}</td>
                                            <td className="py-1.5 px-2 text-right">{s.correct}</td>
                                            <td className="py-1.5 px-2 text-right">{s.wrong}</td>
                                            <td className="py-1.5 px-2 text-right">{s.skipped}</td>
                                            <td className="py-1.5 pl-2 text-right font-semibold">{formatScore(s.marks)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* Every question */}
                <section className="mt-6">
                    <h2 className="report-block text-sm font-bold uppercase tracking-wide border-b border-gray-900 pb-1">
                        Questions, your answers and solutions
                    </h2>
                    <ol className="mt-2">
                        {report.rows.map((row, index) => {
                            const explanation = t(row.q.explanation_en, row.q.explanation_hi);
                            return (
                                <li key={row.q.id} className="report-q border-b border-gray-300 py-5 last:border-0">
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                                        <span className="font-bold">Q{index + 1}.</span>
                                        <span
                                            className={cn(
                                                'rounded border px-2 py-0.5 text-xs font-bold uppercase',
                                                row.status === 'correct' && 'border-green-700 text-green-800',
                                                row.status === 'wrong' && 'border-red-700 text-red-800',
                                                row.status === 'skipped' && 'border-gray-500 text-gray-700',
                                            )}
                                        >
                                            {row.status === 'correct' && `✓ Correct (${signed(row.marks)})`}
                                            {row.status === 'wrong' && `✗ Wrong (${signed(row.marks)})`}
                                            {row.status === 'skipped' && '— Skipped (0)'}
                                        </span>
                                        {row.marked && (
                                            <span className="rounded border border-gray-500 px-2 py-0.5 text-xs font-bold uppercase text-gray-700">
                                                ⚑ Marked for review
                                            </span>
                                        )}
                                        <span className="text-xs text-gray-600">Time spent: {formatSec(row.resp?.time_taken_sec)}</span>
                                        {row.q.subject?.name_en && (
                                            <span className="ml-auto text-xs text-gray-600">{t(row.q.subject.name_en, row.q.subject.name_hi)}</span>
                                        )}
                                    </div>

                                    <QuestionText
                                        className="mt-2 text-[15px] font-medium leading-relaxed"
                                        text={t(row.q.question_en, row.q.question_hi)}
                                    />

                                    <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {row.q.options.map((opt, i) => {
                                            const isSelected = row.selected === opt.id;
                                            const isCorrect = !!opt.is_correct;
                                            const letter = opt.label || String.fromCharCode(65 + i);
                                            let tag: string | null = null;
                                            if (isCorrect && isSelected) tag = '✓ Your answer · Correct';
                                            else if (isCorrect) tag = '✓ Correct answer';
                                            else if (isSelected) tag = '✗ Your answer';
                                            return (
                                                <li
                                                    key={opt.id}
                                                    className={cn(
                                                        'rounded-lg px-3 py-2 text-sm',
                                                        isCorrect
                                                            ? 'border-2 border-gray-900 bg-green-50 print:bg-white'
                                                            : isSelected
                                                                ? 'border-2 border-dashed border-gray-900 bg-red-50 print:bg-white'
                                                                : 'border border-gray-300',
                                                    )}
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <span className="font-bold shrink-0">({letter})</span>
                                                        <span className="min-w-0 break-words whitespace-pre-wrap">{t(opt.option_en, opt.option_hi)}</span>
                                                    </div>
                                                    {tag && (
                                                        <p className={cn(
                                                            'mt-1 text-xs font-bold uppercase',
                                                            isCorrect ? 'text-green-800' : 'text-red-800',
                                                        )}>
                                                            {tag}
                                                        </p>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>

                                    {row.status === 'skipped' && (
                                        <p className="mt-2 text-xs text-gray-600">You did not answer this question.</p>
                                    )}

                                    <div className="mt-3 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 print:bg-white">
                                        <p className="text-xs font-bold uppercase tracking-wide text-gray-700">Explanation</p>
                                        {explanation ? (
                                            <QuestionText className="mt-1 text-sm leading-relaxed text-gray-800" text={explanation} />
                                        ) : (
                                            <p className="mt-1 text-sm text-gray-600">No explanation has been added for this question yet.</p>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </section>

                <footer className="mt-6 border-t border-gray-300 pt-3 text-center text-xs text-gray-600">
                    Generated by OSDHYAN on {formatDateTime(new Date().toISOString())}
                </footer>
            </article>

            <style>{`
                .report-paper pre { color: #111827; }
                @media print {
                    @page { size: A4; margin: 14mm 12mm; }
                    :root, .dark {
                        --background: #ffffff;
                        --foreground: #111827;
                        --card-bg: #ffffff;
                        --card-border: #d1d5db;
                        --muted: #f3f4f6;
                        --muted-foreground: #4b5563;
                        color-scheme: light;
                    }
                    html, body { background: #ffffff !important; color: #111827 !important; }
                    .report-paper { font-size: 11pt; }
                    .report-q, .report-block, .report-paper table, .report-paper tr { break-inside: avoid; page-break-inside: avoid; }
                    .report-paper h2 { break-after: avoid; page-break-after: avoid; }
                    .report-paper pre { white-space: pre-wrap !important; overflow: visible !important; word-break: break-word; }
                }
            `}</style>
        </div>
    );
}

export default function AttemptReportPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[50vh] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            }
        >
            <AttemptReport />
        </Suspense>
    );
}
