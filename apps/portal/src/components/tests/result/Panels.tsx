'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
    AlertTriangle,
    BarChart3,
    BookOpen,
    CheckCircle2,
    Clock,
    Crown,
    Lightbulb,
    MinusCircle,
    Table2,
    Target,
    TrendingDown,
    TrendingUp,
    Trophy,
    XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Analysis, AnalysisSection, ChartColors, ImproveTip } from './types';
import { clampPct, formatDuration, num, plural } from './types';

/* ── Shared bits ─────────────────────────────────────────────────────────── */

export function Skeleton({ className }: { className?: string }) {
    return <div className={cn('animate-pulse rounded-xl bg-muted', className)} />;
}

const AnswerDonut = dynamic(() => import('./Charts').then((m) => m.AnswerDonut), {
    ssr: false,
    loading: () => <Skeleton className="h-48 w-48 shrink-0 rounded-full" />,
});
const TrendChart = dynamic(() => import('./Charts').then((m) => m.TrendChart), {
    ssr: false,
    loading: () => <Skeleton className="h-56 w-full" />,
});

function CardTitle({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
    return (
        <div className="min-w-0">
            <h2 className="text-lg font-semibold flex items-center gap-2">
                <Icon className="h-5 w-5 text-primary shrink-0" />
                {title}
            </h2>
            {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
    );
}

function Swatch({ color, dashed }: { color: string; dashed?: boolean }) {
    return dashed ? (
        <span className="inline-block h-3 w-0 border-l-2 border-dashed shrink-0" style={{ borderColor: color }} aria-hidden />
    ) : (
        <span className="inline-block h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: color }} aria-hidden />
    );
}

function accuracyBadge(acc: number, attempted: number) {
    if (attempted <= 0) return 'badge-gray';
    return acc >= 70 ? 'badge-green' : acc >= 40 ? 'badge-blue' : 'badge-amber';
}

export function ResultSkeleton() {
    return (
        <div className="space-y-6" aria-busy="true" aria-label="Loading your result">
            <div className="grid gap-4 lg:grid-cols-3">
                <Skeleton className="h-52 lg:col-span-2" />
                <Skeleton className="h-52" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
            </div>
            <Skeleton className="h-72" />
            <div className="grid gap-4 lg:grid-cols-2">
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
            </div>
            <Skeleton className="h-80" />
        </div>
    );
}

/* ── 1. Hero ─────────────────────────────────────────────────────────────── */

function ScoreGauge({ percentage }: { percentage: number }) {
    const r = 52;
    const c = 2 * Math.PI * r;
    const filled = (clampPct(percentage) / 100) * c;
    return (
        <div className="relative h-36 w-36 shrink-0">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" role="img" aria-label={`${num(percentage)} percent of total marks`}>
                <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-muted" />
                {filled > 0 && (
                    <circle
                        cx="60" cy="60" r={r} fill="none" strokeWidth="10" strokeLinecap="round"
                        className="stroke-primary"
                        strokeDasharray={`${filled} ${c}`}
                    />
                )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold tracking-tight">{num(percentage)}%</span>
                <span className="text-[11px] text-muted-foreground">of total marks</span>
            </div>
        </div>
    );
}

function RankCard({ rank }: { rank: Analysis['rank'] }) {
    if (!rank) {
        return (
            <div className="card p-5 sm:p-6">
                <p className="eyebrow flex items-center gap-1.5"><Trophy className="h-4 w-4" /> Your rank</p>
                <p className="mt-3 text-sm text-muted-foreground">Rank is not available for this attempt yet.</p>
            </div>
        );
    }
    const alone = rank.out_of <= 1;
    const basis = rank.basis === 'first_attempt'
        ? "Ranked against every student's first attempt at this test."
        : "This is a re-attempt, so it is compared with other students' first attempts. It does not change anyone's rank.";
    return (
        <div className="card p-5 sm:p-6 flex flex-col">
            <p className="eyebrow flex items-center gap-1.5"><Trophy className="h-4 w-4" /> Your rank</p>
            <p className="mt-2 text-4xl font-extrabold tracking-tight">
                #{rank.rank}
                <span className="text-lg font-semibold text-muted-foreground"> of {rank.out_of}</span>
            </p>
            {alone ? (
                <p className="mt-2 text-sm">
                    You&apos;re the first to take this test. Your rank will update as others take it.
                </p>
            ) : (
                <>
                    <p className="mt-2 text-sm">
                        Better than <span className="font-semibold">{num(rank.percentile)}%</span> of other students
                    </p>
                    <div className="mt-3 relative h-2 rounded-full bg-muted overflow-hidden" aria-hidden>
                        <div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${clampPct(rank.percentile)}%` }} />
                    </div>
                    <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                        <span>Lowest score</span><span>Highest score</span>
                    </div>
                </>
            )}
            <p className="mt-auto pt-3 text-xs text-muted-foreground">{basis}</p>
        </div>
    );
}

function StatTile({ icon: Icon, label, value, children }: { icon: React.ElementType; label: string; value: React.ReactNode; children?: React.ReactNode }) {
    return (
        <div className="card p-4 min-w-0">
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5"><Icon className="h-4 w-4 shrink-0" /> {label}</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold truncate">{value}</p>
            {children}
        </div>
    );
}

export function HeroPanel({ a, actions }: { a: Analysis; actions: React.ReactNode }) {
    const { counts, time } = a;
    const timePct = time.allowed_sec > 0 ? clampPct((time.taken_sec / time.allowed_sec) * 100) : 0;
    const negPer = a.test?.negative_marking;
    return (
        <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
                <div className="card p-5 sm:p-6 lg:col-span-2">
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                        <ScoreGauge percentage={a.percentage} />
                        <div className="text-center sm:text-left min-w-0">
                            <p className="eyebrow">Your score</p>
                            <p className="mt-1 text-5xl font-extrabold tracking-tight">
                                <span className={cn(a.score < 0 && 'text-red-600 dark:text-red-400')}>{num(a.score)}</span>
                                <span className="text-xl font-semibold text-muted-foreground"> / {num(a.max_marks)}</span>
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                <span className="text-green-700 dark:text-green-300 font-medium">{counts.correct} correct</span>
                                {' · '}
                                <span className="text-red-700 dark:text-red-300 font-medium">{counts.incorrect} wrong</span>
                                {' · '}
                                {counts.unattempted} skipped
                                {counts.marked_not_evaluated > 0 && (
                                    <> · <span className="text-amber-700 dark:text-amber-300 font-medium">{counts.marked_not_evaluated} not evaluated</span></>
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="mt-5 flex flex-wrap justify-center sm:justify-start gap-2 print:hidden">{actions}</div>
                </div>
                <RankCard rank={a.rank} />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatTile icon={Target} label="Accuracy" value={`${num(a.accuracy)}%`}>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {counts.attempted > 0 ? `${counts.correct} of ${counts.attempted} attempted` : 'No questions attempted'}
                    </p>
                </StatTile>
                <StatTile icon={Clock} label="Time taken" value={formatDuration(time.taken_sec)}>
                    {time.allowed_sec > 0 && (
                        <>
                            <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden" aria-hidden>
                                <div className="h-full rounded-full bg-primary" style={{ width: `${timePct}%` }} />
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">of {formatDuration(time.allowed_sec)} allowed</p>
                        </>
                    )}
                </StatTile>
                <StatTile icon={Clock} label="Per question" value={`${num(time.per_question_sec)}s`}>
                    <p className="mt-1 text-xs text-muted-foreground">average over {counts.total} questions</p>
                </StatTile>
                <StatTile
                    icon={TrendingDown}
                    label="Negative marks"
                    value={<span className={cn(a.negative_marks_lost > 0 && 'text-red-600 dark:text-red-400')}>{a.negative_marks_lost > 0 ? `−${num(a.negative_marks_lost)}` : '0'}</span>}
                >
                    <p className="mt-1 text-xs text-muted-foreground">
                        {a.negative_marks_lost > 0
                            ? `${counts.incorrect} wrong${negPer ? ` × ${num(negPer)}` : ''}`
                            : 'No marks lost to wrong answers'}
                    </p>
                </StatTile>
            </div>
        </div>
    );
}

/* ── 2. Where you stand ──────────────────────────────────────────────────── */

function RefLabel({ pos, row, color, text }: { pos: number; row: number; color: string; text: string }) {
    const align = pos > 80 ? 'right' : pos < 20 ? 'left' : 'center';
    return (
        <span
            className="absolute whitespace-nowrap text-[11px] font-medium text-foreground flex items-center gap-1"
            style={{
                top: row * 16,
                left: align === 'right' ? undefined : `${pos}%`,
                right: align === 'right' ? `${100 - pos}%` : undefined,
                transform: align === 'center' ? 'translateX(-50%)' : undefined,
            }}
        >
            <Swatch color={color} dashed />
            {text}
        </span>
    );
}

function Histogram({ a, colors }: { a: Analysis; colors: ChartColors }) {
    const dist = a.distribution ?? [];
    const [hover, setHover] = useState<number | null>(null);
    if (dist.length === 0) return <p className="text-sm text-muted-foreground">No score data yet.</p>;
    const lo = dist[0].from;
    const hi = dist[dist.length - 1].to;
    const span = hi - lo || 1;
    const pos = (v: number) => clampPct(((v - lo) / span) * 100);
    const maxStudents = Math.max(1, ...dist.map((d) => d.students));
    const cmp = a.comparison;
    const activeIdx = hover != null ? hover : dist.findIndex((d) => d.you);
    const active = activeIdx >= 0 ? dist[activeIdx] : null;
    const bounds = [...dist.map((d) => d.from), hi];

    return (
        <div>
            <div className="min-h-[20px] text-xs text-muted-foreground" aria-live="polite">
                {active && (
                    <>
                        <span className="font-medium text-foreground">{num(active.from)}–{num(active.to)} marks:</span>{' '}
                        {plural(active.students, 'student')}
                        {active.you && ' · you are here'}
                    </>
                )}
            </div>
            {cmp && (
                <div className="relative mt-2 h-8">
                    <RefLabel pos={pos(cmp.average)} row={0} color={colors.average} text={`Average ${num(cmp.average)}`} />
                    <RefLabel pos={pos(cmp.topper)} row={1} color={colors.topper} text={`Topper ${num(cmp.topper)}`} />
                </div>
            )}
            <div className="relative h-44 border-b border-card-border">
                <div className="absolute inset-0 flex items-end gap-[2px]">
                    {dist.map((d, i) => {
                        const h = (d.students / maxStudents) * 100;
                        return (
                            <button
                                key={i}
                                type="button"
                                className="group relative flex-1 h-full flex flex-col justify-end items-center focus:outline-none"
                                onMouseEnter={() => setHover(i)}
                                onMouseLeave={() => setHover(null)}
                                onFocus={() => setHover(i)}
                                onBlur={() => setHover(null)}
                                onClick={() => setHover(i)}
                                aria-label={`${num(d.from)} to ${num(d.to)} marks: ${plural(d.students, 'student')}${d.you ? ', you are here' : ''}`}
                            >
                                {d.students > 0 && (
                                    <span className={cn('mb-0.5 text-[10px] tabular-nums', d.you ? 'font-bold text-foreground' : 'text-muted-foreground')}>
                                        {d.students}
                                    </span>
                                )}
                                <span
                                    className={cn(
                                        'w-full rounded-t-[4px] transition-opacity',
                                        activeIdx === i ? 'opacity-100' : 'opacity-85 group-hover:opacity-100',
                                        activeIdx === i && hover != null && 'ring-2 ring-foreground/30',
                                    )}
                                    style={{
                                        height: d.students > 0 ? `max(${h * 0.85}%, 3px)` : 0,
                                        background: d.you ? colors.you : colors.bar,
                                    }}
                                />
                            </button>
                        );
                    })}
                </div>
                {cmp && (
                    <>
                        <span className="pointer-events-none absolute -top-8 bottom-0 border-l-2 border-dashed" style={{ left: `${pos(cmp.average)}%`, borderColor: colors.average }} aria-hidden />
                        <span className="pointer-events-none absolute -top-4 bottom-0 border-l-2 border-dashed" style={{ left: `${pos(cmp.topper)}%`, borderColor: colors.topper }} aria-hidden />
                    </>
                )}
            </div>
            <div className="relative h-5 mt-1 text-[10px] text-muted-foreground tabular-nums">
                {bounds.map((v, i) => {
                    const last = i === bounds.length - 1;
                    return (
                        <span
                            key={i}
                            className={cn('absolute', i % 2 === 1 && 'hidden sm:inline')}
                            style={{
                                left: last ? undefined : `${(i / (bounds.length - 1)) * 100}%`,
                                right: last ? 0 : undefined,
                                transform: i === 0 || last ? undefined : 'translateX(-50%)',
                            }}
                        >
                            {num(v)}
                        </span>
                    );
                })}
            </div>
            <p className="text-center text-[11px] text-muted-foreground">Marks</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Swatch color={colors.you} /> Your score band</span>
                <span className="flex items-center gap-1.5"><Swatch color={colors.bar} /> Other students</span>
            </div>
        </div>
    );
}

function ComparisonBars({ a, colors }: { a: Analysis; colors: ChartColors }) {
    const cmp = a.comparison;
    if (!cmp) return null;
    const rows = [
        { label: 'You', value: cmp.you, color: colors.you, bold: true },
        { label: 'Average', value: cmp.average, color: colors.average },
        { label: 'Median', value: cmp.median, color: colors.median },
        { label: 'Topper', value: cmp.topper, color: colors.topper },
    ];
    const scale = a.max_marks > 0 ? a.max_marks : Math.max(1, ...rows.map((r) => r.value));
    const gap = Math.round((cmp.topper - cmp.you) * 100) / 100;
    const vsAvg = Math.round((cmp.you - cmp.average) * 100) / 100;
    return (
        <div>
            <ul className="space-y-3">
                {rows.map((r) => (
                    <li key={r.label} title={`${r.label}: ${num(r.value)} / ${num(a.max_marks)}`}>
                        <div className="flex items-baseline justify-between text-sm">
                            <span className={cn(r.bold ? 'font-semibold' : 'text-muted-foreground')}>{r.label}</span>
                            <span className={cn('tabular-nums', r.bold && 'font-semibold')}>
                                {num(r.value)}<span className="text-muted-foreground font-normal"> / {num(a.max_marks)}</span>
                            </span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${clampPct((r.value / scale) * 100)}%`, background: r.color }} />
                        </div>
                    </li>
                ))}
            </ul>
            <p className="mt-4 text-sm">
                {gap > 0 ? (
                    <>
                        You are <span className="font-semibold">{plural(gap, 'mark')}</span> behind the topper
                        {vsAvg >= 0
                            ? <> and <span className="font-semibold">{plural(vsAvg, 'mark')}</span> above the average.</>
                            : <> and <span className="font-semibold">{plural(-vsAvg, 'mark')}</span> below the average.</>}
                    </>
                ) : (
                    <span className="font-semibold inline-flex items-center gap-1.5"><Crown className="h-4 w-4 text-amber-500" /> You have the top score.</span>
                )}
            </p>
        </div>
    );
}

export function StandingPanel({ a, colors }: { a: Analysis; colors: ChartColors }) {
    const others = (a.rank?.out_of ?? 1) - 1;
    return (
        <section className="card p-5 sm:p-6">
            <CardTitle
                icon={BarChart3}
                title="Where you stand"
                subtitle={others > 0
                    ? `How your score compares with ${plural(others, 'other student')} (first attempts).`
                    : 'Only your score so far. This fills in as other students take the test.'}
            />
            <div className="mt-5 grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 min-w-0"><Histogram a={a} colors={colors} /></div>
                <div className="min-w-0"><ComparisonBars a={a} colors={colors} /></div>
            </div>
        </section>
    );
}

/* ── 3. Answer breakdown: donut + Venn ───────────────────────────────────── */

function Venn({ v, total, colors }: { v: Analysis['venn']; total: number; colors: ChartColors }) {
    const attempted = v.attempted_only + v.both;
    const marked = v.marked_only + v.both;
    return (
        <svg
            viewBox="0 0 340 236"
            className="w-full max-w-[420px] h-auto mx-auto block"
            role="img"
            aria-label={`Venn diagram of ${total} questions: ${v.attempted_only} attempted only, ${v.both} attempted and marked, ${v.marked_only} marked only, ${v.neither} neither`}
        >
            <rect x="1" y="1" width="338" height="234" rx="14" fill="none" strokeWidth="1.5" className="stroke-card-border" />
            <circle cx="132" cy="116" r="80" fill={colors.you} fillOpacity="0.16" stroke={colors.you} strokeWidth="2" />
            <circle cx="208" cy="116" r="80" fill={colors.median} fillOpacity="0.16" stroke={colors.median} strokeWidth="2" />

            <text x="96" y="25" textAnchor="middle" className="fill-foreground" fontSize="13" fontWeight="600">Attempted ({attempted})</text>
            <text x="244" y="25" textAnchor="middle" className="fill-foreground" fontSize="13" fontWeight="600">Marked for review ({marked})</text>

            <text x="90" y="112" textAnchor="middle" className="fill-foreground" fontSize="24" fontWeight="700">{v.attempted_only}</text>
            <text x="90" y="129" textAnchor="middle" className="fill-muted-foreground" fontSize="10.5">attempted only</text>
            <text x="90" y="146" textAnchor="middle" className="fill-green-700 dark:fill-green-400" fontSize="11.5" fontWeight="600">✓ {v.correct_attempted_only} correct</text>

            <text x="170" y="112" textAnchor="middle" className="fill-foreground" fontSize="24" fontWeight="700">{v.both}</text>
            <text x="170" y="129" textAnchor="middle" className="fill-muted-foreground" fontSize="10.5">both</text>
            <text x="170" y="146" textAnchor="middle" className="fill-green-700 dark:fill-green-400" fontSize="11.5" fontWeight="600">✓ {v.correct_both} correct</text>

            <text x="250" y="112" textAnchor="middle" className="fill-foreground" fontSize="24" fontWeight="700">{v.marked_only}</text>
            <text x="250" y="129" textAnchor="middle" className="fill-muted-foreground" fontSize="10.5">marked only</text>
            <text x="250" y="146" textAnchor="middle" className="fill-muted-foreground" fontSize="10.5">(no answer)</text>

            <text x="170" y="222" textAnchor="middle" className="fill-muted-foreground" fontSize="12">
                Neither (not answered, not marked): <tspan className="fill-foreground" fontWeight="700">{v.neither}</tspan>
            </text>
        </svg>
    );
}

export function AnswerPanel({ a, colors }: { a: Analysis; colors: ChartColors }) {
    const c = a.counts;
    const slices = [
        { key: 'correct', label: 'Correct', value: c.correct, color: colors.correct, icon: CheckCircle2, ink: 'text-green-700 dark:text-green-300' },
        { key: 'wrong', label: 'Wrong', value: c.incorrect, color: colors.wrong, icon: XCircle, ink: 'text-red-700 dark:text-red-300' },
        { key: 'skipped', label: 'Skipped', value: c.unattempted, color: colors.skipped, icon: MinusCircle, ink: 'text-muted-foreground' },
        ...(c.marked_not_evaluated > 0
            ? [{ key: 'ne', label: 'Not evaluated', value: c.marked_not_evaluated, color: colors.notEvaluated, icon: AlertTriangle, ink: 'text-amber-700 dark:text-amber-300' }]
            : []),
    ];
    const total = c.total || slices.reduce((s, x) => s + x.value, 0);
    const v = a.venn;
    return (
        <section className="grid gap-4 lg:grid-cols-2">
            <div className="card p-5 sm:p-6 min-w-0">
                <CardTitle icon={Target} title="Answer breakdown" subtitle={`What happened to each of the ${total} questions.`} />
                <div className="mt-5 flex flex-col sm:flex-row items-center gap-6">
                    <AnswerDonut slices={slices.map(({ key, label, value, color }) => ({ key, label, value, color }))} total={total} colors={colors} />
                    <ul className="w-full space-y-2.5">
                        {slices.map((s) => {
                            const Icon = s.icon;
                            return (
                                <li key={s.key} className="flex items-center gap-2 text-sm">
                                    <Swatch color={s.color} />
                                    <Icon className={cn('h-4 w-4 shrink-0', s.ink)} />
                                    <span className="flex-1">{s.label}</span>
                                    <span className="font-semibold tabular-nums">{s.value}</span>
                                    <span className="w-14 text-right text-xs text-muted-foreground tabular-nums">
                                        {total > 0 ? `${num((s.value / total) * 100)}%` : '0%'}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
            <div className="card p-5 sm:p-6 min-w-0">
                <CardTitle icon={Target} title="Attempted vs marked for review" subtitle="How answering and marking for review overlapped." />
                <div className="mt-4"><Venn v={v} total={total} colors={colors} /></div>
                {c.marked_not_evaluated > 0 && (
                    <div className="mt-4 flex gap-2.5 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-900/20 p-3 text-sm text-amber-900 dark:text-amber-200">
                        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                        <p>
                            <span className="font-semibold">
                                {c.marked_not_evaluated} answered {c.marked_not_evaluated === 1 ? 'question was' : 'questions were'} still marked for review.
                            </span>{' '}
                            In DSSSB these are <span className="font-semibold">not evaluated</span>, so they earned no marks
                            {v.correct_both > 0 ? ` (${v.correct_both} of them ${v.correct_both === 1 ? 'was' : 'were'} correct)` : ''}.
                            Before submitting, open each marked question and press Save &amp; Next.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}

/* ── 4. Section performance ──────────────────────────────────────────────── */

export type SectionTableRow = {
    key: string;
    name: string;
    total: number;
    correct: number;
    incorrect: number;
    unattempted: number;
    marks: number;
    max_marks: number;
    accuracy: number;
    avg_marks?: number | null;
    topper_marks?: number | null;
    time_sec?: number | null;
};

export function SectionTable({ rows, extended }: { rows: SectionTableRow[]; extended: boolean }) {
    const t = rows.reduce(
        (acc, s) => ({
            total: acc.total + (Number(s.total) || 0),
            correct: acc.correct + (Number(s.correct) || 0),
            incorrect: acc.incorrect + (Number(s.incorrect) || 0),
            unattempted: acc.unattempted + (Number(s.unattempted) || 0),
            marks: acc.marks + (Number(s.marks) || 0),
            max: acc.max + (Number(s.max_marks) || 0),
            time: acc.time + (Number(s.time_sec) || 0),
        }),
        { total: 0, correct: 0, incorrect: 0, unattempted: 0, marks: 0, max: 0, time: 0 },
    );
    return (
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
                        {extended && <th className="text-right font-medium px-3 py-3">Average</th>}
                        {extended && <th className="text-right font-medium px-3 py-3">Topper</th>}
                        {extended && <th className="text-right font-medium px-3 py-3">Time</th>}
                        <th className="text-right font-medium px-5 sm:px-6 py-3">Accuracy</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-card-border">
                    {rows.map((s) => {
                        const acc = Math.round(Number(s.accuracy) || 0);
                        return (
                            <tr key={s.key}>
                                <td className="px-5 sm:px-6 py-3 font-medium min-w-[200px]">{s.name}</td>
                                <td className="px-3 py-3 text-right">{s.total}</td>
                                <td className="px-3 py-3 text-right text-green-700 dark:text-green-300">{s.correct}</td>
                                <td className="px-3 py-3 text-right text-red-700 dark:text-red-300">{s.incorrect}</td>
                                <td className="px-3 py-3 text-right">{s.unattempted}</td>
                                <td className="px-3 py-3 text-right font-semibold whitespace-nowrap">{num(s.marks)} / {num(s.max_marks)}</td>
                                {extended && <td className="px-3 py-3 text-right whitespace-nowrap">{s.avg_marks == null ? '—' : num(s.avg_marks)}</td>}
                                {extended && <td className="px-3 py-3 text-right whitespace-nowrap">{s.topper_marks == null ? '—' : num(s.topper_marks)}</td>}
                                {extended && <td className="px-3 py-3 text-right whitespace-nowrap">{s.time_sec == null ? '—' : formatDuration(s.time_sec)}</td>}
                                <td className="px-5 sm:px-6 py-3 text-right">
                                    <span className={cn('badge', accuracyBadge(acc, s.correct + s.incorrect))}>{acc}%</span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
                <tfoot className="border-t-2 border-card-border font-semibold">
                    <tr>
                        <td className="px-5 sm:px-6 py-3">Total</td>
                        <td className="px-3 py-3 text-right">{t.total}</td>
                        <td className="px-3 py-3 text-right text-green-700 dark:text-green-300">{t.correct}</td>
                        <td className="px-3 py-3 text-right text-red-700 dark:text-red-300">{t.incorrect}</td>
                        <td className="px-3 py-3 text-right">{t.unattempted}</td>
                        <td className="px-3 py-3 text-right whitespace-nowrap">{num(t.marks)} / {num(t.max)}</td>
                        {extended && <td className="px-3 py-3" />}
                        {extended && <td className="px-3 py-3" />}
                        {extended && <td className="px-3 py-3 text-right whitespace-nowrap">{formatDuration(t.time)}</td>}
                        <td className="px-5 sm:px-6 py-3" />
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}

function MarkBar({ label, value, max, color, strong }: { label: string; value: number; max: number; color: string; strong?: boolean }) {
    return (
        <div className="flex items-center gap-2" title={`${label}: ${num(value)} / ${num(max)}`}>
            <span className={cn('w-14 shrink-0 text-xs', strong ? 'font-semibold' : 'text-muted-foreground')}>{label}</span>
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${clampPct(max > 0 ? (value / max) * 100 : 0)}%`, background: color }} />
            </div>
            <span className={cn('w-12 shrink-0 text-right text-xs tabular-nums', strong && 'font-semibold', value < 0 && 'text-red-600 dark:text-red-400')}>
                {num(value)}
            </span>
        </div>
    );
}

export function SectionPanel({
    sections, tableRows, colors,
}: { sections: AnalysisSection[]; tableRows: SectionTableRow[]; colors: ChartColors }) {
    const [view, setView] = useState<'charts' | 'table'>('charts');
    const hasPeers = sections.some((s) => s.avg_marks != null || s.topper_marks != null);
    const maxTime = Math.max(1, ...sections.map((s) => s.time_sec || 0));
    return (
        <section className="card overflow-hidden">
            <div className="p-5 sm:p-6 flex flex-wrap items-start justify-between gap-3">
                <CardTitle
                    icon={BarChart3}
                    title="Section-wise performance"
                    subtitle={hasPeers
                        ? 'Your marks against the average and the topper, out of each section’s maximum.'
                        : 'Your marks out of each section’s maximum. Average and topper appear once others take the test.'}
                />
                <div className="inline-flex rounded-xl border border-card-border p-0.5 print:hidden" role="tablist" aria-label="Section view">
                    {([['charts', 'Charts', BarChart3], ['table', 'Table', Table2]] as const).map(([k, label, Icon]) => (
                        <button
                            key={k}
                            type="button"
                            role="tab"
                            aria-selected={view === k}
                            onClick={() => setView(k)}
                            className={cn(
                                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                                view === k ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            <Icon className="h-3.5 w-3.5" /> {label}
                        </button>
                    ))}
                </div>
            </div>

            {view === 'table' ? (
                <div className="border-t border-card-border"><SectionTable rows={tableRows} extended /></div>
            ) : (
                <div className="px-5 sm:px-6 pb-6">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground mb-4">
                        <span className="flex items-center gap-1.5"><Swatch color={colors.you} /> You</span>
                        {hasPeers && <span className="flex items-center gap-1.5"><Swatch color={colors.average} /> Average</span>}
                        {hasPeers && <span className="flex items-center gap-1.5"><Swatch color={colors.topper} /> Topper</span>}
                        <span className="flex flex-wrap items-center gap-1">
                            Accuracy:
                            <span className="badge badge-green">70%+</span>
                            <span className="badge badge-blue">40–69%</span>
                            <span className="badge badge-amber">below 40%</span>
                        </span>
                    </div>
                    <ul className="grid gap-x-8 gap-y-5 md:grid-cols-2">
                        {sections.map((s) => {
                            const attempted = s.correct + s.incorrect;
                            return (
                                <li key={s.key} className="min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-sm font-medium leading-snug min-w-0">{s.name}</p>
                                        <span className={cn('badge shrink-0', accuracyBadge(s.accuracy, attempted))} title="Accuracy">
                                            {attempted > 0 ? `${num(s.accuracy)}%` : 'Not tried'}
                                        </span>
                                    </div>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {s.correct} correct · {s.incorrect} wrong · {s.unattempted} skipped · out of {num(s.max_marks)}
                                    </p>
                                    <div className="mt-2 space-y-1.5">
                                        <MarkBar label="You" value={s.marks} max={s.max_marks} color={colors.you} strong />
                                        {s.avg_marks != null && <MarkBar label="Average" value={s.avg_marks} max={s.max_marks} color={colors.average} />}
                                        {s.topper_marks != null && <MarkBar label="Topper" value={s.topper_marks} max={s.max_marks} color={colors.topper} />}
                                    </div>
                                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground" title="Time spent in this section">
                                        <Clock className="h-3.5 w-3.5 shrink-0" />
                                        <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                                            <div className="h-full rounded-full bg-muted-foreground/60" style={{ width: `${clampPct(((s.time_sec || 0) / maxTime) * 100)}%` }} />
                                        </div>
                                        <span className="tabular-nums">{formatDuration(s.time_sec || 0)}</span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </section>
    );
}

/* ── 5. Qualifying ───────────────────────────────────────────────────────── */

function ThresholdBar({ label, percent, valueText, lines }: { label: string; percent: number; valueText: string; lines: number[] }) {
    const best = Math.max(...lines);
    const least = Math.min(...lines);
    return (
        <div>
            <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="font-medium">{label}</span>
                <span className="tabular-nums text-muted-foreground">
                    <span className="font-semibold text-foreground">{valueText}</span> ({num(percent)}%)
                </span>
            </div>
            <div className="relative mt-2 h-3 rounded-full bg-muted">
                <div
                    className={cn('absolute inset-y-0 left-0 rounded-full', percent >= best ? 'bg-green-500' : percent >= least ? 'bg-amber-500' : 'bg-primary')}
                    style={{ width: `${clampPct(percent)}%` }}
                />
                {lines.map((l) => (
                    <span key={l} className="absolute -top-1 -bottom-1 w-0.5 bg-foreground/70" style={{ left: `${l}%` }} aria-hidden />
                ))}
            </div>
            <div className="relative mt-1 h-4 text-[10px] text-muted-foreground tabular-nums">
                {lines.map((l) => (
                    <span key={l} className="absolute -translate-x-1/2" style={{ left: `${l}%` }}>{l}%</span>
                ))}
            </div>
        </div>
    );
}

export function QualifyingPanel({ a }: { a: Analysis }) {
    const q = a.qualifying;
    if (!q || !q.categories?.length) return null;
    const lines = [...new Set(q.categories.map((c) => c.percent))].sort((x, y) => x - y);
    const hasB = q.section_b_max > 0;
    return (
        <section className="card p-5 sm:p-6">
            <CardTitle
                icon={CheckCircle2}
                title="Qualifying marks"
                subtitle={hasB
                    ? 'DSSSB needs the minimum percentage both in Section B and in the total.'
                    : 'Minimum percentage of the total needed by category.'}
            />
            <div className="mt-5 grid gap-6 md:grid-cols-2">
                {hasB && (
                    <ThresholdBar label="Section B" percent={q.section_b_percent} valueText={`${num(q.section_b_marks)} / ${num(q.section_b_max)}`} lines={lines} />
                )}
                <ThresholdBar label="Total" percent={q.total_percent} valueText={`${num(a.score)} / ${num(a.max_marks)}`} lines={lines} />
            </div>
            <ul className="mt-5 divide-y divide-card-border rounded-xl border border-card-border">
                {q.categories.map((c) => (
                    <li key={c.category} className="flex items-center gap-3 p-3 sm:px-4">
                        {c.qualified
                            ? <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" aria-label="Qualified" />
                            : <XCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" aria-label="Not qualified" />}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{c.category} <span className="text-muted-foreground font-normal">· {c.percent}%</span></p>
                            <p className="text-xs text-muted-foreground">
                                Needs {num(c.total_needed)} total{hasB ? ` and ${num(c.section_b_needed)} in Section B` : ''}
                            </p>
                        </div>
                        <span className={cn('text-sm font-semibold text-right', c.qualified ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300')}>
                            {c.qualified ? 'Qualified' : `Short by ${plural(c.short_by, 'mark')}`}
                        </span>
                    </li>
                ))}
            </ul>
        </section>
    );
}

/* ── 6. What to improve ──────────────────────────────────────────────────── */

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };
const PRIORITY_STYLE: Record<string, { label: string; bar: string; badge: string }> = {
    high: { label: 'High priority', bar: 'bg-red-500', badge: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
    medium: { label: 'Medium priority', bar: 'bg-amber-500', badge: 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
    low: { label: 'Low priority', bar: 'bg-slate-400', badge: 'bg-muted text-muted-foreground' },
};

function tipLink(tip: ImproveTip, solutionsHref: string): { href: string; label: string } | null {
    if (tip.kind === 'section') return { href: '/dashboard/test-series', label: 'Practise chapter tests' };
    if (tip.kind === 'concept') return { href: solutionsHref, label: 'Revise in solutions' };
    if (tip.kind === 'marked') return { href: solutionsHref, label: 'See these questions' };
    return null;
}

export function ImprovePanel({ a, solutionsHref }: { a: Analysis; solutionsHref: string }) {
    const tips = [...(a.improve ?? [])].sort((x, y) => (PRIORITY_ORDER[x.priority] ?? 3) - (PRIORITY_ORDER[y.priority] ?? 3));
    const weak = a.weak_chapters ?? [];
    return (
        <section className="card p-5 sm:p-6">
            <CardTitle icon={Lightbulb} title="What to improve" subtitle="Start at the top: these cost you the most marks." />
            {tips.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">Nothing major to fix in this attempt. Keep taking full mocks to stay sharp.</p>
            ) : (
                <ul className="mt-5 grid gap-3 md:grid-cols-2">
                    {tips.map((tip, i) => {
                        const st = PRIORITY_STYLE[tip.priority] ?? PRIORITY_STYLE.low;
                        const link = tipLink(tip, solutionsHref);
                        return (
                            <li key={i} className="relative overflow-hidden rounded-xl border border-card-border p-4 pl-5 min-w-0">
                                <span className={cn('absolute inset-y-0 left-0 w-1', st.bar)} aria-hidden />
                                <span className={cn('inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold', st.badge)}>{st.label}</span>
                                <p className="mt-2 text-sm font-semibold leading-snug">{tip.title}</p>
                                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{tip.detail}</p>
                                {link && (
                                    <Link href={link.href} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline print:hidden">
                                        <BookOpen className="h-4 w-4" /> {link.label}
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
            {weak.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-sm font-semibold">Chapters where you lost marks</h3>
                    <ul className="mt-2 flex flex-wrap gap-2">
                        {weak.map((w) => (
                            <li key={w.concept_key} className="max-w-full">
                                <Link
                                    href={solutionsHref}
                                    className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-card-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                                    title="Open solutions and use Revise this concept"
                                >
                                    <XCircle className="h-3.5 w-3.5 shrink-0 text-red-600 dark:text-red-400" />
                                    <span className="truncate">{w.chapter_title}</span>
                                    <span className="shrink-0 text-muted-foreground">· {w.wrong} wrong</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
}

/* ── 7. Progress ─────────────────────────────────────────────────────────── */

export function TrendPanel({ a, colors }: { a: Analysis; colors: ChartColors }) {
    const trend = a.trend ?? [];
    if (trend.length < 2) return null;
    const idx = trend.findIndex((t) => t.attempt_id === a.attempt_id);
    const points = trend.map((t) => ({ ...t, current: t.attempt_id === a.attempt_id }));
    const prev = idx > 0 ? trend[idx - 1] : null;
    const cur = idx >= 0 ? trend[idx] : null;
    const delta = prev && cur ? Math.round((cur.score - prev.score) * 100) / 100 : null;
    const best = trend.reduce((b, t) => (t.score > b.score ? t : b), trend[0]);
    return (
        <section className="card p-5 sm:p-6">
            <CardTitle icon={TrendingUp} title="Your progress on this test" subtitle={`Your score in each of your ${trend.length} attempts.`} />
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                {delta != null && prev && (
                    <span className={cn('font-medium', delta > 0 ? 'text-green-700 dark:text-green-300' : delta < 0 ? 'text-red-700 dark:text-red-300' : 'text-muted-foreground')}>
                        {delta > 0 ? `Up ${plural(delta, 'mark')}` : delta < 0 ? `Down ${plural(-delta, 'mark')}` : 'Same score'} since attempt #{prev.number}
                    </span>
                )}
                <span className="text-muted-foreground">
                    Best: <span className="font-semibold text-foreground">{num(best.score)}</span> (attempt #{best.number})
                </span>
            </div>
            <div className="mt-4"><TrendChart points={points} maxMarks={a.max_marks} colors={colors} /></div>
        </section>
    );
}
