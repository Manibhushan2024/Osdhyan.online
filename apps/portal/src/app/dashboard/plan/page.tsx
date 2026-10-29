'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import {
    AlertTriangle,
    BookOpen,
    Briefcase,
    CalendarDays,
    Check,
    ClipboardCheck,
    Library,
    Loader2,
    RefreshCw,
    RotateCcw,
    Sun,
    Target,
    Trophy,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types (shape of GET /study-plan) ─────────────────────────────────────────

type Slot = 'office' | 'library' | 'weekend';
type TaskType = 'notes' | 'test' | 'revision' | 'mock' | 'review';

interface PlanTask {
    id: number;
    date: string;
    slot: Slot;
    position: number;
    type: TaskType;
    title: string;
    minutes: number;
    ref_type: 'test' | 'material' | 'chapter' | null;
    ref_id: number | null;
    link: string | null;
    subject_key: string | null;
    phase: number | null;
    done: boolean;
    done_at: string | null;
    attempt_id: number | null;
    review_link: string | null;
}

interface Progress {
    total: number;
    done: number;
    minutes_total: number;
    minutes_done: number;
    percent: number;
}

interface PlanSummary {
    phases: { phase: number; name: string; description: string; from: string; to: string }[];
    subjects: { key: string; label: string; section: string; chapters: number }[];
    sections: { key: string; label: string; marks: number; score_percent: number | null; has_pack: boolean }[];
    day_labels: Record<string, string>;
    counts: { tasks: number; minutes: number; mocks: number };
    notes: string[];
}

interface PlanInfo {
    id: number;
    exam_date: string;
    weekday_office_min: number;
    weekday_library_min: number;
    weekend_min: number;
    focus: string[];
    summary: PlanSummary | null;
    generated_at: string | null;
    days_left: number;
}

interface PlanResponse {
    today_date: string;
    defaults: { exam_date: string; weekday_office_min: number; weekday_library_min: number; weekend_min: number };
    focus_options: { key: string; label: string; kind: 'subject' | 'section' }[];
    plan: PlanInfo | null;
    today: PlanTask[];
    week: PlanTask[];
    tasks: PlanTask[];
    progress: Progress;
    today_progress: Progress;
}

type View = 'today' | 'week' | 'full';

const SLOT_META: Record<Slot, { label: string; hint: string; icon: React.ElementType }> = {
    office: { label: 'At work', hint: 'Short items you can finish in a free slot', icon: Briefcase },
    library: { label: 'Library (evening)', hint: 'Longer study block after work', icon: Library },
    weekend: { label: 'Weekend', hint: 'Full day', icon: Sun },
};

const TYPE_META: Record<TaskType, { label: string; className: string; icon: React.ElementType }> = {
    notes: { label: 'Notes', className: 'badge-blue', icon: BookOpen },
    test: { label: 'Test', className: 'badge-green', icon: ClipboardCheck },
    revision: { label: 'Revision', className: 'badge-gray', icon: RotateCcw },
    mock: { label: 'Full mock', className: 'badge-amber', icon: Trophy },
    review: { label: 'Review', className: 'badge-amber', icon: Target },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDay(date: string, today: string) {
    if (date === today) return 'Today';
    const d = new Date(`${date}T00:00:00`);
    const t = new Date(`${today}T00:00:00`);
    if ((d.getTime() - t.getTime()) / 86400000 === 1) return 'Tomorrow';
    return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
}

function formatShort(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatMinutes(min: number) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h && m) return `${h}h ${m}m`;
    if (h) return `${h}h`;
    return `${m}m`;
}

function taskHref(t: PlanTask) {
    if (t.type === 'review' && t.review_link) return t.review_link;
    return t.link || '#';
}

function groupByDate(tasks: PlanTask[]) {
    const days = new Map<string, Map<Slot, PlanTask[]>>();
    for (const t of tasks) {
        if (!days.has(t.date)) days.set(t.date, new Map());
        const slots = days.get(t.date)!;
        if (!slots.has(t.slot)) slots.set(t.slot, []);
        slots.get(t.slot)!.push(t);
    }
    return days;
}

function errorMessage(e: unknown, fallback: string) {
    const data = (e as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data;
    const first = data?.errors ? Object.values(data.errors)[0]?.[0] : undefined;
    return first || data?.message || fallback;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudyPlanPage() {
    const [data, setData] = useState<PlanResponse | null>(null);
    const [fullTasks, setFullTasks] = useState<PlanTask[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<View>('today');
    const [showForm, setShowForm] = useState(false);
    const [pending, setPending] = useState<Set<number>>(new Set());

    const load = useCallback(async () => {
        setError(null);
        try {
            const res = await api.get<PlanResponse>('/study-plan');
            setData(res.data);
            setFullTasks(null);
        } catch (e) {
            setError(errorMessage(e, 'We could not load your study plan. Check your connection and try again.'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        if (view !== 'full' || fullTasks || !data?.plan) return;
        api.get<PlanResponse>('/study-plan', { params: { full: 1 } })
            .then((res) => setFullTasks(res.data.tasks))
            .catch(() => setError('Could not load the full plan. Please try again.'));
    }, [view, fullTasks, data?.plan]);

    const onGenerated = (res: PlanResponse) => {
        setData(res);
        setFullTasks(null);
        setShowForm(false);
        setView('today');
    };

    const toggle = async (task: PlanTask) => {
        if (pending.has(task.id)) return;
        const done = !task.done;
        const patch = (list: PlanTask[]) => list.map((t) => (t.id === task.id ? { ...t, done } : t));
        setPending((p) => new Set(p).add(task.id));
        setData((d) => (d ? { ...d, today: patch(d.today), week: patch(d.week) } : d));
        setFullTasks((f) => (f ? patch(f) : f));
        try {
            const res = await api.patch<{ task: PlanTask; progress: Progress; today_progress: Progress }>(
                `/study-plan/tasks/${task.id}`,
                { done },
            );
            const replace = (list: PlanTask[]) => list.map((t) => (t.id === task.id ? res.data.task : t));
            setData((d) => (d ? { ...d, today: replace(d.today), week: replace(d.week), progress: res.data.progress, today_progress: res.data.today_progress } : d));
            setFullTasks((f) => (f ? replace(f) : f));
        } catch {
            const undo = (list: PlanTask[]) => list.map((t) => (t.id === task.id ? { ...t, done: !done } : t));
            setData((d) => (d ? { ...d, today: undo(d.today), week: undo(d.week) } : d));
            setFullTasks((f) => (f ? undo(f) : f));
            setError('Could not save that tick. Please try again.');
        } finally {
            setPending((p) => {
                const next = new Set(p);
                next.delete(task.id);
                return next;
            });
        }
    };

    if (loading) {
        return (
            <div className="space-y-4 pb-12">
                <div className="h-8 w-48 bg-muted rounded animate-pulse" />
                <div className="card p-6 h-40 animate-pulse" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="card p-6 space-y-3">
                <p className="text-sm text-destructive">{error}</p>
                <button className="btn btn-secondary btn-sm" onClick={() => { setLoading(true); load(); }}>Try again</button>
            </div>
        );
    }

    const plan = data.plan;

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="page-title">My study plan</h1>
                    <p className="page-subtitle">
                        DSSSB TGT Computer Science 2026 — a day-by-day plan built from your free time, your weak sections and the tests and notes on OSDHYAN.
                    </p>
                </div>
                {plan && !showForm && (
                    <button className="btn btn-secondary btn-sm self-start sm:self-auto" onClick={() => setShowForm(true)}>
                        <RefreshCw className="h-4 w-4" /> Change hours / regenerate
                    </button>
                )}
            </div>

            {error && (
                <div className="flex items-start gap-2 rounded-xl border border-card-border bg-card-bg p-3 text-sm text-destructive">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {(!plan || showForm) && (
                <SetupForm data={data} onDone={onGenerated} onCancel={plan ? () => setShowForm(false) : undefined} />
            )}

            {plan && (
                <>
                    <Overview data={data} plan={plan} />

                    <div className="flex gap-1 rounded-xl bg-muted p-1 w-full sm:w-fit" role="tablist">
                        {(['today', 'week', 'full'] as View[]).map((v) => (
                            <button
                                key={v}
                                role="tab"
                                aria-selected={view === v}
                                onClick={() => setView(v)}
                                className={cn(
                                    'flex-1 sm:flex-none px-4 py-2 min-h-[40px] rounded-lg text-sm font-semibold transition-colors',
                                    view === v ? 'bg-card-bg text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {v === 'today' ? 'Today' : v === 'week' ? 'This week' : 'Full plan'}
                            </button>
                        ))}
                    </div>

                    {view === 'today' && (
                        <TaskDays
                            tasks={data.today}
                            today={data.today_date}
                            labels={plan.summary?.day_labels ?? {}}
                            pending={pending}
                            onToggle={toggle}
                            empty="Nothing planned for today. Enjoy the break, or open This week to get ahead."
                        />
                    )}
                    {view === 'week' && (
                        <TaskDays
                            tasks={data.week}
                            today={data.today_date}
                            labels={plan.summary?.day_labels ?? {}}
                            pending={pending}
                            onToggle={toggle}
                            empty="No tasks in the next 7 days."
                        />
                    )}
                    {view === 'full' && (
                        fullTasks === null ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading the full plan…</div>
                        ) : (
                            <TaskDays
                                tasks={fullTasks}
                                today={data.today_date}
                                labels={plan.summary?.day_labels ?? {}}
                                pending={pending}
                                onToggle={toggle}
                                collapsible
                                empty="The plan is empty."
                            />
                        )
                    )}
                </>
            )}
        </div>
    );
}

// ─── Set-up form ──────────────────────────────────────────────────────────────

function SetupForm({ data, onDone, onCancel }: { data: PlanResponse; onDone: (r: PlanResponse) => void; onCancel?: () => void }) {
    const src = data.plan ?? data.defaults;
    const [examDate, setExamDate] = useState(src.exam_date);
    const [office, setOffice] = useState(String(src.weekday_office_min / 60));
    const [library, setLibrary] = useState(String(src.weekday_library_min / 60));
    const [weekend, setWeekend] = useState(String(src.weekend_min / 60));
    const [focus, setFocus] = useState<string[]>(data.plan?.focus ?? []);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toMinutes = (v: string) => Math.max(0, Math.round((parseFloat(v) || 0) * 60));

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const res = await api.post<PlanResponse>('/study-plan/generate', {
                exam_date: examDate,
                weekday_office_min: toMinutes(office),
                weekday_library_min: toMinutes(library),
                weekend_min: toMinutes(weekend),
                focus,
            });
            onDone(res.data);
        } catch (err) {
            setError(errorMessage(err, 'Could not build the plan. Please try again.'));
        } finally {
            setSaving(false);
        }
    };

    const hoursField = (id: string, label: string, hint: string, value: string, set: (v: string) => void) => (
        <div className="space-y-1.5">
            <label htmlFor={id} className="text-sm font-semibold">{label}</label>
            <input id={id} type="number" min={0} max={id === 'weekend' ? 20 : 15} step={0.5} inputMode="decimal"
                className="input w-full" value={value} onChange={(e) => set(e.target.value)} />
            <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
    );

    return (
        <form onSubmit={submit} className="card p-4 sm:p-6 space-y-5">
            <div>
                <h2 className="text-lg font-bold">{data.plan ? 'Update your plan' : 'Set up your plan'}</h2>
                <p className="text-sm text-muted-foreground">
                    Tell us when you can study. The plan starts today and runs up to the day before your exam.
                    {data.plan && ' Tasks you have already ticked stay in your history.'}
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <label htmlFor="exam_date" className="text-sm font-semibold">Plan up to</label>
                    <input id="exam_date" type="date" className="input w-full" value={examDate} min={data.today_date}
                        onChange={(e) => setExamDate(e.target.value)} required />
                    <p className="text-xs text-muted-foreground">The CBT runs 27 Nov – 4 Dec 2026. Keep 26 Nov until you know your exact day.</p>
                </div>
                {hoursField('office', 'Free time at work (hours, Mon–Fri)', 'Short, interruptible slots: gets 25–40 minute items.', office, setOffice)}
                {hoursField('library', 'Library after work (hours, Mon–Fri)', 'Long block: mocks, reviews and whole chapters.', library, setLibrary)}
                {hoursField('weekend', 'Weekend study (hours per day)', 'Saturday and Sunday.', weekend, setWeekend)}
            </div>

            {data.focus_options.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-semibold">Give extra time to (optional)</p>
                    <div className="flex flex-wrap gap-2">
                        {data.focus_options.map((o) => {
                            const on = focus.includes(o.key);
                            return (
                                <button key={o.key} type="button" aria-pressed={on}
                                    onClick={() => setFocus((f) => (on ? f.filter((k) => k !== o.key) : [...f, o.key]))}
                                    className={cn('px-3 py-1.5 min-h-[36px] rounded-full border text-sm transition-colors',
                                        on ? 'bg-primary text-white border-primary' : 'border-card-border hover:bg-muted')}>
                                    {on && <Check className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />}{o.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                {onCancel && <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>}
                <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarDays className="h-4 w-4" />}
                    {data.plan ? 'Regenerate my plan' : 'Generate my plan'}
                </button>
            </div>
        </form>
    );
}

// ─── Overview ─────────────────────────────────────────────────────────────────

function ProgressBar({ percent, label }: { percent: number; label: string }) {
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>{label}</span>
                <span className="font-semibold text-foreground">{percent}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, percent)}%` }} />
            </div>
        </div>
    );
}

function Overview({ data, plan }: { data: PlanResponse; plan: PlanInfo }) {
    const summary = plan.summary;
    const today = data.today_date;
    const currentPhase = summary?.phases.find((p) => p.from <= today && p.to >= today)?.phase;

    return (
        <div className="card p-4 sm:p-6 space-y-5">
            <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                    <p className="text-2xl font-bold">{plan.days_left}</p>
                    <p className="text-xs text-muted-foreground">days left</p>
                </div>
                <div>
                    <p className="text-2xl font-bold">{formatMinutes(data.today_progress.minutes_total)}</p>
                    <p className="text-xs text-muted-foreground">planned today</p>
                </div>
                <div>
                    <p className="text-2xl font-bold">{summary?.counts.mocks ?? 0}</p>
                    <p className="text-xs text-muted-foreground">full mocks</p>
                </div>
            </div>

            <div className="space-y-3">
                <ProgressBar percent={data.today_progress.percent} label={`Today: ${data.today_progress.done} of ${data.today_progress.total} done`} />
                <ProgressBar percent={data.progress.percent} label={`Whole plan: ${data.progress.done} of ${data.progress.total} done`} />
            </div>

            {summary && summary.phases.length > 0 && (
                <ol className="grid gap-2 sm:grid-cols-3">
                    {summary.phases.map((p) => (
                        <li key={p.phase} className={cn('rounded-xl border p-3 space-y-1',
                            p.phase === currentPhase ? 'border-primary bg-accent' : 'border-card-border')}>
                            <p className="text-xs font-semibold text-muted-foreground">
                                Phase {p.phase} · {formatShort(p.from)} – {formatShort(p.to)}
                            </p>
                            <p className="text-sm font-bold">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.description}</p>
                        </li>
                    ))}
                </ol>
            )}

            {summary && summary.notes.length > 0 && (
                <ul className="text-xs text-muted-foreground space-y-1">
                    {summary.notes.map((n) => <li key={n}>• {n}</li>)}
                </ul>
            )}
        </div>
    );
}

// ─── Task lists ───────────────────────────────────────────────────────────────

function TaskDays({ tasks, today, labels, pending, onToggle, empty, collapsible = false }: {
    tasks: PlanTask[];
    today: string;
    labels: Record<string, string>;
    pending: Set<number>;
    onToggle: (t: PlanTask) => void;
    empty: string;
    collapsible?: boolean;
}) {
    const days = useMemo(() => groupByDate(tasks), [tasks]);

    if (tasks.length === 0) {
        return <div className="card p-6 text-sm text-muted-foreground">{empty}</div>;
    }

    return (
        <div className="space-y-4">
            {[...days.entries()].map(([date, slots]) => {
                const all = [...slots.values()].flat();
                const done = all.filter((t) => t.done).length;
                const minutes = all.reduce((s, t) => s + t.minutes, 0);
                const past = date < today;
                const header = (
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                        <h3 className={cn('font-bold', date === today && 'text-primary')}>{formatDay(date, today)}</h3>
                        <span className="text-xs text-muted-foreground">{done}/{all.length} done · {formatMinutes(minutes)}</span>
                        {labels[date] && <p className="w-full text-xs font-semibold text-warning">{labels[date]}</p>}
                    </div>
                );
                const body = (
                    <div className="space-y-4">
                        {(['office', 'library', 'weekend'] as Slot[]).filter((s) => slots.has(s)).map((slot) => {
                            const meta = SLOT_META[slot];
                            const Icon = meta.icon;
                            return (
                                <div key={slot} className="space-y-2">
                                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        <Icon className="h-3.5 w-3.5" /> {meta.label}
                                        <span className="normal-case font-normal tracking-normal hidden sm:inline">— {meta.hint}</span>
                                    </p>
                                    <ul className="space-y-2">
                                        {slots.get(slot)!.map((t) => (
                                            <TaskRow key={t.id} task={t} busy={pending.has(t.id)} onToggle={onToggle} />
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                );

                if (collapsible) {
                    return (
                        <details key={date} className="card p-4 group" open={date === today}>
                            <summary className={cn('cursor-pointer list-none', past && done < all.length && 'opacity-80')}>{header}</summary>
                            <div className="mt-4">{body}</div>
                        </details>
                    );
                }
                return (
                    <section key={date} className="card p-4 space-y-4">
                        {header}
                        {body}
                    </section>
                );
            })}
        </div>
    );
}

function TaskRow({ task, busy, onToggle }: { task: PlanTask; busy: boolean; onToggle: (t: PlanTask) => void }) {
    const meta = TYPE_META[task.type] ?? TYPE_META.test;
    const href = taskHref(task);
    const action = task.ref_type === 'test'
        ? (task.type === 'review' ? (task.review_link ? 'See wrong answers' : 'Take the test first') : task.attempt_id ? 'Open again' : 'Start')
        : 'Open';

    return (
        <li className={cn('flex items-start gap-3 rounded-xl border border-card-border p-3 transition-colors', task.done && 'bg-muted/60')}>
            <button
                type="button"
                onClick={() => onToggle(task)}
                disabled={busy}
                aria-pressed={task.done}
                aria-label={task.done ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
                className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors',
                    task.done ? 'bg-success border-success text-white' : 'border-input hover:border-primary')}
            >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : task.done && <Check className="h-4 w-4" />}
            </button>
            <div className="min-w-0 flex-1 space-y-1">
                <Link href={href} className={cn('block text-sm font-medium leading-snug hover:text-primary break-words', task.done && 'line-through text-muted-foreground')}>
                    {task.title}
                </Link>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className={cn('badge', meta.className)}>{meta.label}</span>
                    <span>{formatMinutes(task.minutes)}</span>
                    <Link href={href} className="font-semibold text-primary hover:underline">{action} →</Link>
                </div>
            </div>
        </li>
    );
}
