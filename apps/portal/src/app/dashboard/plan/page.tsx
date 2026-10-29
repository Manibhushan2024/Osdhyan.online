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
    Clock,
    Library,
    Lightbulb,
    Loader2,
    Plus,
    RefreshCw,
    RotateCcw,
    Sun,
    Target,
    Trash2,
    Trophy,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types (shape of GET /study-plan) ─────────────────────────────────────────

type Slot = 'office' | 'library' | 'weekend';
type TaskType = 'notes' | 'test' | 'revision' | 'mock' | 'review';
/** Per slot: clock windows ["HH:MM", "HH:MM"]. */
type Timetable = Record<Slot, [string, string][]>;

interface PlanTask {
    id: number;
    date: string;
    slot: Slot;
    position: number;
    /** "HH:MM" (student's local time); null for plans made before timetables. */
    start_time: string | null;
    end_time: string | null;
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
    /** Why the plan starts / is weighted the way it is (baseline mock, latest mock scores…). */
    advice?: string[];
}

interface PlanInfo {
    id: number;
    exam_date: string;
    weekday_office_min: number;
    weekday_library_min: number;
    weekend_min: number;
    focus: string[];
    timetable?: Timetable;
    summary: PlanSummary | null;
    generated_at: string | null;
    days_left: number;
}

interface PlanResponse {
    today_date: string;
    defaults: { exam_date: string; weekday_office_min: number; weekday_library_min: number; weekend_min: number; timetable?: Timetable };
    focus_options: { key: string; label: string; kind: 'subject' | 'section' }[];
    plan: PlanInfo | null;
    today: PlanTask[];
    week: PlanTask[];
    tasks: PlanTask[];
    progress: Progress;
    today_progress: Progress;
}

type View = 'today' | 'week' | 'full';

const SLOTS: Slot[] = ['office', 'library', 'weekend'];
const MAX_WINDOWS = 4;

const DEFAULT_TIMETABLE: Timetable = {
    office: [['13:00', '14:00'], ['17:00', '18:00']],
    library: [['05:30', '08:30'], ['19:00', '22:30']],
    weekend: [['07:00', '13:00'], ['15:00', '19:00']],
};

const SLOT_META: Record<Slot, { label: string; short: string; icon: React.ElementType }> = {
    office: { label: 'At work', short: 'Work', icon: Briefcase },
    library: { label: 'Library', short: 'Library', icon: Library },
    weekend: { label: 'Weekend', short: 'Weekend', icon: Sun },
};

const TYPE_META: Record<TaskType, { label: string; className: string; icon: React.ElementType }> = {
    notes: { label: 'Notes', className: 'badge-blue', icon: BookOpen },
    test: { label: 'Test', className: 'badge-green', icon: ClipboardCheck },
    revision: { label: 'Revision', className: 'badge-gray', icon: RotateCcw },
    mock: { label: 'Full mock', className: 'badge-amber', icon: Trophy },
    review: { label: 'Review', className: 'badge-amber', icon: Target },
};

const SLOT_ORDER: Record<Slot, number> = { office: 0, library: 1, weekend: 2 };

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

function toMinutes(hhmm: string) {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
}

function toClock(min: number) {
    const m = Math.max(0, Math.min(23 * 60 + 59, min));
    return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

/** Current time in India as "HH:MM" (the plan's times are IST). */
function istClock() {
    return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date());
}

function useClock() {
    const [now, setNow] = useState(istClock);
    useEffect(() => {
        const id = window.setInterval(() => setNow(istClock()), 30_000);
        return () => window.clearInterval(id);
    }, []);
    return now;
}

function taskHref(t: PlanTask) {
    if (t.type === 'review' && t.review_link) return t.review_link;
    return t.link || '#';
}

/** Clock order; tasks without a time (older plans) by slot and position. */
function byTime(a: PlanTask, b: PlanTask) {
    const ta = a.start_time ?? '99:99';
    const tb = b.start_time ?? '99:99';
    if (ta !== tb) return ta < tb ? -1 : 1;
    return SLOT_ORDER[a.slot] - SLOT_ORDER[b.slot] || a.position - b.position || a.id - b.id;
}

function groupByDate(tasks: PlanTask[]) {
    const days = new Map<string, PlanTask[]>();
    for (const t of tasks) {
        if (!days.has(t.date)) days.set(t.date, []);
        days.get(t.date)!.push(t);
    }
    for (const list of days.values()) list.sort(byTime);
    return days;
}

/** "Now": the open task running at this minute; "Next": the first open task after it (or after now). */
function nowAndNext(tasks: PlanTask[], clock: string) {
    const open = tasks.filter((t) => !t.done && t.start_time && t.end_time).sort(byTime);
    const current = open.find((t) => t.start_time! <= clock && clock < t.end_time!) ?? null;
    const next = open.find((t) => t.start_time! > clock && t.id !== current?.id) ?? null;
    return { current, next };
}

function errorMessage(e: unknown, fallback: string) {
    const data = (e as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data;
    const first = data?.errors ? Object.values(data.errors)[0]?.[0] : undefined;
    return first || data?.message || fallback;
}

function cloneTimetable(t?: Timetable): Timetable {
    const src = t ?? DEFAULT_TIMETABLE;
    return {
        office: (src.office ?? []).map(([a, b]) => [a, b] as [string, string]),
        library: (src.library ?? []).map(([a, b]) => [a, b] as [string, string]),
        weekend: (src.weekend ?? []).map(([a, b]) => [a, b] as [string, string]),
    };
}

/** First problem with a slot's windows, or null. */
function windowsError(windows: [string, string][]) {
    for (const [s, e] of windows) {
        if (!/^\d{2}:\d{2}$/.test(s) || !/^\d{2}:\d{2}$/.test(e)) return 'Enter both times.';
        if (s >= e) return `${s} – ${e}: the end must be after the start.`;
    }
    const sorted = [...windows].sort((a, b) => (a[0] < b[0] ? -1 : 1));
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i][0] < sorted[i - 1][1]) return `${sorted[i - 1][0]} – ${sorted[i - 1][1]} and ${sorted[i][0]} – ${sorted[i][1]} overlap.`;
    }
    return null;
}

function windowsTotal(windows: [string, string][]) {
    return windows.reduce((s, [a, b]) => s + Math.max(0, toMinutes(b) - toMinutes(a)), 0);
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
    const clock = useClock();

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
    const labels = plan?.summary?.day_labels ?? {};

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="page-title">My study plan</h1>
                    <p className="page-subtitle">
                        DSSSB TGT Computer Science 2026 — a day-by-day timetable built from your free time, your weak sections and the tests and notes on OSDHYAN.
                    </p>
                </div>
                {plan && !showForm && (
                    <button className="btn btn-secondary btn-sm self-start sm:self-auto" onClick={() => setShowForm(true)}>
                        <RefreshCw className="h-4 w-4" /> Change times / regenerate
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
                        <>
                            <NowNext tasks={data.today} clock={clock} />
                            <TaskDays
                                tasks={data.today}
                                today={data.today_date}
                                labels={labels}
                                pending={pending}
                                onToggle={toggle}
                                clock={clock}
                                empty="Nothing planned for today. Enjoy the break, or open This week to get ahead."
                            />
                        </>
                    )}
                    {view === 'week' && (
                        <TaskDays
                            tasks={data.week}
                            today={data.today_date}
                            labels={labels}
                            pending={pending}
                            onToggle={toggle}
                            clock={clock}
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
                                labels={labels}
                                pending={pending}
                                onToggle={toggle}
                                clock={clock}
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

const SLOT_FORM: Record<Slot, { title: string; hoursLabel: string; hint: string; max: number }> = {
    office: {
        title: 'Free time at work (Mon–Fri)',
        hoursLabel: 'Hours per day',
        hint: 'Short, interruptible slots: 15–40 minute items.',
        max: 15,
    },
    library: {
        title: 'Library (Mon–Fri)',
        hoursLabel: 'Hours per day',
        hint: 'Before and after work: mocks, reviews and whole chapters. A 10-minute break after every 90 minutes.',
        max: 15,
    },
    weekend: {
        title: 'Weekend (Sat and Sun)',
        hoursLabel: 'Hours per day',
        hint: 'Full days. The plan fills the hours you set, inside these windows.',
        max: 20,
    },
};

function SetupForm({ data, onDone, onCancel }: { data: PlanResponse; onDone: (r: PlanResponse) => void; onCancel?: () => void }) {
    const src = data.plan ?? data.defaults;
    const [examDate, setExamDate] = useState(src.exam_date);
    const [hours, setHours] = useState<Record<Slot, string>>({
        office: String(src.weekday_office_min / 60),
        library: String(src.weekday_library_min / 60),
        weekend: String(src.weekend_min / 60),
    });
    const [timetable, setTimetable] = useState<Timetable>(() => cloneTimetable(data.plan?.timetable ?? data.defaults.timetable));
    const [focus, setFocus] = useState<string[]>(data.plan?.focus ?? []);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const hoursToMinutes = (v: string) => Math.max(0, Math.round((parseFloat(v) || 0) * 60));
    const problems = SLOTS.map((s) => windowsError(timetable[s])).filter(Boolean);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (problems.length) {
            setError('Please fix the time windows first.');
            return;
        }
        setSaving(true);
        setError(null);
        const sorted = Object.fromEntries(
            SLOTS.map((s) => [s, [...timetable[s]].sort((a, b) => (a[0] < b[0] ? -1 : 1))]),
        ) as Timetable;
        try {
            const res = await api.post<PlanResponse>('/study-plan/generate', {
                exam_date: examDate,
                weekday_office_min: hoursToMinutes(hours.office),
                weekday_library_min: hoursToMinutes(hours.library),
                weekend_min: hoursToMinutes(hours.weekend),
                timetable: sorted,
                focus,
            });
            onDone(res.data);
        } catch (err) {
            setError(errorMessage(err, 'Could not build the plan. Please try again.'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={submit} className="card p-4 sm:p-6 space-y-5">
            <div>
                <h2 className="text-lg font-bold">{data.plan ? 'Update your plan' : 'Set up your plan'}</h2>
                <p className="text-sm text-muted-foreground">
                    Tell us when you can study. The plan starts today and runs up to the day before your exam; every task gets a clock time inside your windows.
                    {data.plan && ' Tasks you have already ticked stay in your history.'}
                </p>
            </div>

            <div className="space-y-1.5 sm:max-w-xs">
                <label htmlFor="exam_date" className="text-sm font-semibold">Plan up to</label>
                <input id="exam_date" type="date" className="input w-full" value={examDate} min={data.today_date}
                    onChange={(e) => setExamDate(e.target.value)} required />
                <p className="text-xs text-muted-foreground">The CBT runs 27 Nov – 4 Dec 2026. Keep 26 Nov until you know your exact day.</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                {SLOTS.map((slot) => (
                    <SlotEditor
                        key={slot}
                        slot={slot}
                        hours={hours[slot]}
                        onHours={(v) => setHours((h) => ({ ...h, [slot]: v }))}
                        windows={timetable[slot]}
                        onWindows={(w) => setTimetable((t) => ({ ...t, [slot]: w }))}
                    />
                ))}
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

function SlotEditor({ slot, hours, onHours, windows, onWindows }: {
    slot: Slot;
    hours: string;
    onHours: (v: string) => void;
    windows: [string, string][];
    onWindows: (w: [string, string][]) => void;
}) {
    const meta = SLOT_FORM[slot];
    const Icon = SLOT_META[slot].icon;
    const total = windowsTotal(windows);
    const problem = windowsError(windows);
    const asked = Math.round((parseFloat(hours) || 0) * 60);

    const set = (i: number, j: 0 | 1, v: string) =>
        onWindows(windows.map((w, k) => (k === i ? (j === 0 ? [v, w[1]] : [w[0], v]) : w)));
    const add = () => {
        const lastEnd = windows.length ? toMinutes([...windows].sort((a, b) => (a[0] < b[0] ? -1 : 1))[windows.length - 1][1]) : 17 * 60;
        const start = Math.min(lastEnd + 60, 22 * 60);
        onWindows([...windows, [toClock(start), toClock(Math.min(start + 60, 23 * 60 + 59))]]);
    };

    return (
        <fieldset className="rounded-xl border border-card-border p-3 sm:p-4 space-y-3 min-w-0">
            <legend className="px-1 text-sm font-bold flex items-center gap-1.5">
                <Icon className="h-4 w-4" /> {meta.title}
            </legend>
            <p className="text-xs text-muted-foreground">{meta.hint}</p>

            <div className="space-y-1.5">
                <label htmlFor={`hours-${slot}`} className="text-xs font-semibold">{meta.hoursLabel}</label>
                <input id={`hours-${slot}`} type="number" min={0} max={meta.max} step={0.5} inputMode="decimal"
                    className="input w-full" value={hours} onChange={(e) => onHours(e.target.value)} />
            </div>

            <div className="space-y-2">
                <p className="text-xs font-semibold">Time windows</p>
                {windows.length === 0 && <p className="text-xs text-muted-foreground">No windows: nothing is planned here.</p>}
                {windows.map(([s, e], i) => (
                    <div key={i} className="flex items-center gap-2">
                        <input type="time" step={300} aria-label={`${meta.title}: window ${i + 1} starts`} className="input min-w-0 flex-1"
                            value={s} onChange={(ev) => set(i, 0, ev.target.value)} required />
                        <span className="text-xs text-muted-foreground">to</span>
                        <input type="time" step={300} aria-label={`${meta.title}: window ${i + 1} ends`} className="input min-w-0 flex-1"
                            value={e} onChange={(ev) => set(i, 1, ev.target.value)} required />
                        <button type="button" className="btn btn-ghost btn-sm shrink-0 px-2" aria-label={`Remove window ${s} to ${e}`}
                            onClick={() => onWindows(windows.filter((_, k) => k !== i))}>
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
                {windows.length < MAX_WINDOWS && (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={add}>
                        <Plus className="h-4 w-4" /> Add a time window
                    </button>
                )}
                {problem ? (
                    <p className="text-xs text-destructive">{problem}</p>
                ) : (
                    <p className="text-xs text-muted-foreground">
                        Windows add up to {formatMinutes(total)}
                        {asked > total ? ` — the plan uses ${formatMinutes(total)}, not ${formatMinutes(asked)}.` : '.'}
                    </p>
                )}
            </div>
        </fieldset>
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
    const advice = summary?.advice ?? [];

    return (
        <div className="card p-4 sm:p-6 space-y-5">
            {advice.length > 0 && (
                <ul className="rounded-xl border border-primary/40 bg-accent p-3 space-y-1.5">
                    {advice.map((a) => (
                        <li key={a} className="flex items-start gap-2 text-sm">
                            <Lightbulb className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                            <span>{a}</span>
                        </li>
                    ))}
                </ul>
            )}

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

// ─── Now / Next ───────────────────────────────────────────────────────────────

function NowNext({ tasks, clock }: { tasks: PlanTask[]; clock: string }) {
    const { current, next } = nowAndNext(tasks, clock);
    if (!current && !next) return null;

    const card = (label: string, t: PlanTask, strong: boolean) => (
        <Link href={taskHref(t)} className={cn('block rounded-xl border p-3 sm:p-4 space-y-1 transition-colors hover:border-primary min-w-0',
            strong ? 'border-primary bg-accent' : 'border-card-border bg-card-bg')}>
            <p className={cn('text-xs font-bold uppercase tracking-wide', strong ? 'text-primary' : 'text-muted-foreground')}>
                {label} · {t.start_time} – {t.end_time}
            </p>
            <p className="text-sm font-semibold leading-snug break-words">{t.title}</p>
            <p className="text-xs text-muted-foreground">{formatMinutes(t.minutes)} · {SLOT_META[t.slot].label}</p>
        </Link>
    );

    return (
        <div className={cn('grid gap-3', current && next && 'sm:grid-cols-2')} aria-live="polite">
            {current && card('Now', current, true)}
            {next && card(current ? 'Next' : `Next (it is ${clock})`, next, !current)}
        </div>
    );
}

// ─── Task lists ───────────────────────────────────────────────────────────────

function TaskDays({ tasks, today, labels, pending, onToggle, clock, empty, collapsible = false }: {
    tasks: PlanTask[];
    today: string;
    labels: Record<string, string>;
    pending: Set<number>;
    onToggle: (t: PlanTask) => void;
    clock: string;
    empty: string;
    collapsible?: boolean;
}) {
    const days = useMemo(() => groupByDate(tasks), [tasks]);
    const todays = days.get(today) ?? [];
    const { current, next } = nowAndNext(todays, clock);

    if (tasks.length === 0) {
        return <div className="card p-6 text-sm text-muted-foreground">{empty}</div>;
    }

    return (
        <div className="space-y-4">
            {[...days.entries()].map(([date, all]) => {
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
                    <ol className="space-y-2">
                        {all.map((t) => (
                            <TaskRow
                                key={t.id}
                                task={t}
                                busy={pending.has(t.id)}
                                onToggle={onToggle}
                                mark={date !== today ? undefined : t.id === current?.id ? 'now' : t.id === next?.id ? 'next' : undefined}
                            />
                        ))}
                    </ol>
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

function TaskRow({ task, busy, onToggle, mark }: { task: PlanTask; busy: boolean; onToggle: (t: PlanTask) => void; mark?: 'now' | 'next' }) {
    const meta = TYPE_META[task.type] ?? TYPE_META.test;
    const slot = SLOT_META[task.slot];
    const SlotIcon = slot.icon;
    const href = taskHref(task);
    const action = task.ref_type === 'test'
        ? (task.type === 'review' ? (task.review_link ? 'See wrong answers' : 'Take the test first') : task.attempt_id ? 'Open again' : 'Start')
        : 'Open';

    return (
        <li className={cn('flex items-start gap-3 rounded-xl border p-3 transition-colors',
            mark === 'now' ? 'border-primary bg-accent' : mark === 'next' ? 'border-primary/60' : 'border-card-border',
            task.done && 'bg-muted/60')}>
            <div className="w-14 shrink-0 text-right tabular-nums leading-tight pt-0.5">
                {task.start_time ? (
                    <>
                        <p className="text-sm font-bold">{task.start_time}</p>
                        <p className="text-xs text-muted-foreground">{task.end_time}</p>
                    </>
                ) : (
                    <Clock className="h-4 w-4 ml-auto text-muted-foreground" aria-hidden />
                )}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
                {mark && (
                    <span className={cn('inline-block text-[11px] font-bold uppercase tracking-wide', mark === 'now' ? 'text-primary' : 'text-muted-foreground')}>
                        {mark === 'now' ? 'Now' : 'Next'}
                    </span>
                )}
                <Link href={href} className={cn('block text-sm font-medium leading-snug hover:text-primary break-words', task.done && 'line-through text-muted-foreground')}>
                    {task.title}
                </Link>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <span className={cn('badge', meta.className)}>{meta.label}</span>
                    <span>{formatMinutes(task.minutes)}</span>
                    <span className="inline-flex items-center gap-1"><SlotIcon className="h-3 w-3" aria-hidden />{slot.short}</span>
                    <Link href={href} className="font-semibold text-primary hover:underline">{action} →</Link>
                </div>
            </div>
            <button
                type="button"
                onClick={() => onToggle(task)}
                disabled={busy}
                aria-pressed={task.done}
                aria-label={task.done ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
                className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 transition-colors',
                    task.done ? 'bg-success border-success text-white' : 'border-input hover:border-primary')}
            >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : task.done && <Check className="h-4 w-4" />}
            </button>
        </li>
    );
}
