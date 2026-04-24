'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import AuthModal from '@/components/auth/AuthModal';
import {
    Play, Pause, RotateCcw, Plus, ChevronRight, ChevronDown,
    Check, X, Target, BookOpen, Layers, ListChecks, Timer,
    ShieldCheck, Zap, Settings2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type Task = {
    id: string;
    title: string;
    allocatedMin: number;
    pomodorosDone: number;
    done: boolean;
};

type Topic = {
    id: string;
    title: string;
    allocatedMin: number;
    tasks: Task[];
    expanded: boolean;
};

type Chapter = {
    id: string;
    title: string;
    allocatedMin: number;
    topics: Topic[];
    expanded: boolean;
};

type Subject = {
    id: string;
    title: string;
    color: string;
    allocatedHours: number;
    chapters: Chapter[];
    expanded: boolean;
};

type PomodoroMode = 'focus' | 'short_break' | 'long_break';
type AddModalState = {
    type: 'subject' | 'chapter' | 'topic' | 'task';
    parentId?: string;
    grandParentId?: string;
} | null;

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_DURATIONS: Record<PomodoroMode, number> = {
    focus: 25 * 60,
    short_break: 5 * 60,
    long_break: 15 * 60,
};

// Preset configurations (in minutes for UI, stored as seconds internally)
const PRESETS = [
    { label: 'Classic', sub: '25/5/15', focus: 25, short_break: 5, long_break: 15 },
    { label: 'Short', sub: '15/3/10', focus: 15, short_break: 3, long_break: 10 },
    { label: 'Long', sub: '50/10/30', focus: 50, short_break: 10, long_break: 30 },
    { label: 'Ultra', sub: '90/20/30', focus: 90, short_break: 20, long_break: 30 },
];

const SUBJECT_COLORS = [
    'bg-blue-600', 'bg-purple-600', 'bg-green-600',
    'bg-orange-500', 'bg-red-500', 'bg-indigo-600',
];

const DEMO_SUBJECTS: Subject[] = [
    {
        id: 'sub-1', title: 'Mathematics', color: 'bg-blue-600',
        allocatedHours: 3, expanded: true,
        chapters: [{
            id: 'ch-1', title: 'Algebra', allocatedMin: 60, expanded: true,
            topics: [{
                id: 'tp-1', title: 'Quadratic Equations', allocatedMin: 30, expanded: true,
                tasks: [
                    { id: 't-1', title: 'Read theory section', allocatedMin: 10, pomodorosDone: 1, done: true },
                    { id: 't-2', title: 'Solve practice problems', allocatedMin: 15, pomodorosDone: 0, done: false },
                    { id: 't-3', title: 'Attempt MCQs', allocatedMin: 5, pomodorosDone: 0, done: false },
                ]
            }, {
                id: 'tp-2', title: 'Linear Equations', allocatedMin: 25, expanded: false,
                tasks: [
                    { id: 't-4', title: 'Concept review', allocatedMin: 10, pomodorosDone: 0, done: false },
                    { id: 't-5', title: 'Practice set', allocatedMin: 15, pomodorosDone: 0, done: false },
                ]
            }]
        }]
    },
    {
        id: 'sub-2', title: 'General Science', color: 'bg-green-600',
        allocatedHours: 2, expanded: false,
        chapters: [{
            id: 'ch-2', title: 'Physics Basics', allocatedMin: 45, expanded: false,
            topics: [{
                id: 'tp-3', title: 'Motion & Laws', allocatedMin: 30, expanded: false,
                tasks: [
                    { id: 't-6', title: "Newton's Laws revision", allocatedMin: 15, pomodorosDone: 0, done: false },
                ]
            }]
        }]
    },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function FocusTimerPage() {
    const { user } = useAuth();
    const [authModal, setAuthModal] = useState(false);

    // Task tree
    const [subjects, setSubjects] = useState<Subject[]>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('pomodoro_subjects_v2');
                return saved ? JSON.parse(saved) : DEMO_SUBJECTS;
            } catch { return DEMO_SUBJECTS; }
        }
        return DEMO_SUBJECTS;
    });
    const [selectedTask, setSelectedTask] = useState<{
        task: Task; topicId: string; chapterId: string; subjectId: string;
    } | null>(null);

    // Pomodoro timer
    const [mode, setMode] = useState<PomodoroMode>('focus');
    const [isRunning, setIsRunning] = useState(false);
    const [pomodoroCount, setPomodoroCount] = useState(0);
    const [sessionLog, setSessionLog] = useState<{ task: string; duration: number }[]>([]);

    // Configurable durations (stored as seconds, loaded from localStorage)
    const [durations, setDurations] = useState<Record<PomodoroMode, number>>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('pomodoro_durations_v1');
                return saved ? JSON.parse(saved) : DEFAULT_DURATIONS;
            } catch { return DEFAULT_DURATIONS; }
        }
        return DEFAULT_DURATIONS;
    });
    const [timeLeft, setTimeLeft] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('pomodoro_durations_v1');
                const d = saved ? JSON.parse(saved) : DEFAULT_DURATIONS;
                return d.focus;
            } catch {}
        }
        return DEFAULT_DURATIONS.focus;
    });
    const [showSettings, setShowSettings] = useState(false);
    // Settings form (in minutes for UI)
    const [settingsFocus, setSettingsFocus] = useState(() => Math.round((durations?.focus ?? DEFAULT_DURATIONS.focus) / 60));
    const [settingsShort, setSettingsShort] = useState(() => Math.round((durations?.short_break ?? DEFAULT_DURATIONS.short_break) / 60));
    const [settingsLong, setSettingsLong] = useState(() => Math.round((durations?.long_break ?? DEFAULT_DURATIONS.long_break) / 60));

    // Add modal
    const [addModal, setAddModal] = useState<AddModalState>(null);
    const [addTitle, setAddTitle] = useState('');
    const [addMinutes, setAddMinutes] = useState(25);

    const timerRef = useRef<number | null>(null);
    const completeFnRef = useRef<() => void>(() => {});

    // Persist tree to localStorage
    useEffect(() => {
        localStorage.setItem('pomodoro_subjects_v2', JSON.stringify(subjects));
    }, [subjects]);

    // Timer complete handler — stored in ref so interval closure is always fresh
    const handleTimerComplete = useCallback(() => {
        setIsRunning(false);
        if (mode === 'focus') {
            const next = (pomodoroCount + 1) % 4 === 0 ? 'long_break' : 'short_break';
            setPomodoroCount(c => c + 1);
            if (selectedTask) {
                setSubjects(prev => prev.map(sub =>
                    sub.id !== selectedTask.subjectId ? sub : {
                        ...sub, chapters: sub.chapters.map(ch =>
                            ch.id !== selectedTask.chapterId ? ch : {
                                ...ch, topics: ch.topics.map(tp =>
                                    tp.id !== selectedTask.topicId ? tp : {
                                        ...tp, tasks: tp.tasks.map(t =>
                                            t.id !== selectedTask.task.id ? t : { ...t, pomodorosDone: t.pomodorosDone + 1 }
                                        )
                                    }
                                )
                            }
                        )
                    }
                ));
                const focusMin = Math.round(durations.focus / 60);
                setSessionLog(prev => [...prev, { task: selectedTask.task.title, duration: focusMin }]);
            }
            toast.success('Pomodoro complete! Take a break. 🍅');
            setMode(next);
            setTimeLeft(durations[next]);
        } else {
            toast('Break over — time to focus! ⚡');
            setMode('focus');
            setTimeLeft(durations.focus);
        }
    }, [mode, pomodoroCount, selectedTask, durations]);

    useEffect(() => {
        completeFnRef.current = handleTimerComplete;
    }, [handleTimerComplete]);

    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev: number) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!);
                        completeFnRef.current();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isRunning]);

    const startTimer = () => {
        if (!user) { setAuthModal(true); return; }
        setIsRunning(true);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(durations[mode]);
    };

    const switchMode = (m: PomodoroMode) => {
        setIsRunning(false);
        setMode(m);
        setTimeLeft(durations[m]);
    };

    const applySettings = () => {
        const f = Math.max(1, Math.min(120, settingsFocus || 25));
        const s = Math.max(1, Math.min(60, settingsShort || 5));
        const l = Math.max(1, Math.min(60, settingsLong || 15));
        const newDurations: Record<PomodoroMode, number> = {
            focus: f * 60,
            short_break: s * 60,
            long_break: l * 60,
        };
        setDurations(newDurations);
        localStorage.setItem('pomodoro_durations_v1', JSON.stringify(newDurations));
        // Reset timer to new duration for current mode
        if (!isRunning) setTimeLeft(newDurations[mode]);
        setShowSettings(false);
        toast.success('Timer settings saved!');
    };

    const applyPreset = (p: typeof PRESETS[number]) => {
        setSettingsFocus(p.focus);
        setSettingsShort(p.short_break);
        setSettingsLong(p.long_break);
    };

    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // SVG ring
    const radius = 110;
    const circumference = 2 * Math.PI * radius;
    const progress = 1 - timeLeft / (durations[mode] || 1);
    const dashOffset = circumference * (1 - progress);

    const RING_COLOR = { focus: '#3b82f6', short_break: '#22c55e', long_break: '#a855f7' };
    const TEXT_COLOR = { focus: 'text-blue-500', short_break: 'text-green-500', long_break: 'text-purple-500' };

    // ─── Tree helpers ─────────────────────────────────────────────────────────

    const toggleSubject = (id: string) =>
        setSubjects(p => p.map(s => s.id === id ? { ...s, expanded: !s.expanded } : s));
    const toggleChapter = (sid: string, cid: string) =>
        setSubjects(p => p.map(s => s.id !== sid ? s : {
            ...s, chapters: s.chapters.map(c => c.id === cid ? { ...c, expanded: !c.expanded } : c)
        }));
    const toggleTopic = (sid: string, cid: string, tid: string) =>
        setSubjects(p => p.map(s => s.id !== sid ? s : {
            ...s, chapters: s.chapters.map(c => c.id !== cid ? c : {
                ...c, topics: c.topics.map(t => t.id === tid ? { ...t, expanded: !t.expanded } : t)
            })
        }));

    const markTaskDone = (subId: string, chId: string, tpId: string, taskId: string) =>
        setSubjects(p => p.map(s => s.id !== subId ? s : {
            ...s, chapters: s.chapters.map(c => c.id !== chId ? c : {
                ...c, topics: c.topics.map(t => t.id !== tpId ? t : {
                    ...t, tasks: t.tasks.map(tk => tk.id !== taskId ? tk : { ...tk, done: !tk.done })
                })
            })
        }));

    const addItem = () => {
        if (!addTitle.trim() || !addModal) return;
        const newId = `${addModal.type}-${Date.now()}`;
        if (addModal.type === 'subject') {
            const color = SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length];
            setSubjects(p => [...p, { id: newId, title: addTitle, color, allocatedHours: addMinutes, expanded: true, chapters: [] }]);
        } else if (addModal.type === 'chapter' && addModal.parentId) {
            setSubjects(p => p.map(s => s.id !== addModal.parentId ? s : {
                ...s, chapters: [...s.chapters, { id: newId, title: addTitle, allocatedMin: addMinutes, expanded: true, topics: [] }]
            }));
        } else if (addModal.type === 'topic' && addModal.parentId && addModal.grandParentId) {
            setSubjects(p => p.map(s => s.id !== addModal.grandParentId ? s : {
                ...s, chapters: s.chapters.map(c => c.id !== addModal.parentId ? c : {
                    ...c, topics: [...c.topics, { id: newId, title: addTitle, allocatedMin: addMinutes, expanded: false, tasks: [] }]
                })
            }));
        } else if (addModal.type === 'task' && addModal.parentId && addModal.grandParentId) {
            const [subId, chId] = addModal.grandParentId.split('::');
            setSubjects(p => p.map(s => s.id !== subId ? s : {
                ...s, chapters: s.chapters.map(c => c.id !== chId ? c : {
                    ...c, topics: c.topics.map(t => t.id !== addModal.parentId ? t : {
                        ...t, tasks: [...t.tasks, { id: newId, title: addTitle, allocatedMin: addMinutes, pomodorosDone: 0, done: false }]
                    })
                })
            }));
        }
        setAddModal(null);
        setAddTitle('');
        setAddMinutes(25);
    };

    const openAdd = (modal: AddModalState, defaultMin = 25) => {
        setAddModal(modal);
        setAddTitle('');
        setAddMinutes(defaultMin);
    };

    const totalFocusMin = sessionLog.reduce((a, l) => a + l.duration, 0);

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col h-[calc(100vh-7rem)] overflow-hidden gap-4">
            {/* Top Bar */}
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter italic">
                        Pomodoro <span className="text-blue-600">Studio</span>
                    </h1>
                    <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mt-0.5">
                        Subject → Chapter → Topic → Task Focus Engine
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className={cn(
                            "h-2.5 w-2.5 rounded-full border-2 transition-all",
                            i < pomodoroCount % 4 ? "bg-blue-600 border-blue-600" : "border-card-border"
                        )} />
                    ))}
                    <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest ml-1">
                        {pomodoroCount} done
                    </span>
                    <button
                        onClick={() => { setSettingsFocus(Math.round(durations.focus/60)); setSettingsShort(Math.round(durations.short_break/60)); setSettingsLong(Math.round(durations.long_break/60)); setShowSettings(true); }}
                        className="ml-2 h-8 w-8 rounded-xl bg-card-bg border border-card-border flex items-center justify-center text-foreground/30 hover:text-foreground hover:border-foreground/20 transition-all"
                        title="Timer Settings"
                    >
                        <Settings2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* 3-Panel Layout */}
            <div className="flex gap-5 flex-1 overflow-hidden min-h-0">

                {/* ─── LEFT: Study Plan Tree ─────────────────────────── */}
                <div className="w-72 shrink-0 flex flex-col bg-card-bg border border-card-border rounded-[2rem] overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-card-border shrink-0">
                        <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Study Plan</span>
                        <button
                            onClick={() => openAdd({ type: 'subject' }, 3)}
                            className="h-7 w-7 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all"
                            title="Add Subject"
                        >
                            <Plus className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    <div className="overflow-y-auto flex-1 p-2 space-y-0.5">
                        {subjects.map(sub => {
                            const allTasks = sub.chapters.flatMap(c => c.topics.flatMap(t => t.tasks));
                            const doneCnt = allTasks.filter(t => t.done).length;
                            return (
                                <div key={sub.id}>
                                    {/* Subject row */}
                                    <button
                                        onClick={() => toggleSubject(sub.id)}
                                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-background transition-all text-left"
                                    >
                                        <div className={cn("h-4 w-4 rounded-md shrink-0", sub.color)} />
                                        <span className="flex-1 text-[11px] font-black text-foreground uppercase tracking-tight truncate">{sub.title}</span>
                                        <span className="text-[9px] font-black text-foreground/30 shrink-0">{sub.allocatedHours}h</span>
                                        {allTasks.length > 0 && (
                                            <span className="text-[8px] font-black text-foreground/30 shrink-0">{doneCnt}/{allTasks.length}</span>
                                        )}
                                        {sub.expanded
                                            ? <ChevronDown className="h-3 w-3 text-foreground/30 shrink-0" />
                                            : <ChevronRight className="h-3 w-3 text-foreground/30 shrink-0" />}
                                    </button>

                                    {sub.expanded && (
                                        <div className="ml-3 space-y-0.5">
                                            {sub.chapters.map(ch => (
                                                <div key={ch.id}>
                                                    {/* Chapter row */}
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => toggleChapter(sub.id, ch.id)}
                                                            className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-background transition-all text-left"
                                                        >
                                                            <Layers className="h-3 w-3 text-foreground/30 shrink-0" />
                                                            <span className="flex-1 text-[10px] font-black text-foreground/70 truncate">{ch.title}</span>
                                                            <span className="text-[9px] text-foreground/30 shrink-0">{ch.allocatedMin}m</span>
                                                            {ch.expanded
                                                                ? <ChevronDown className="h-3 w-3 text-foreground/20" />
                                                                : <ChevronRight className="h-3 w-3 text-foreground/20" />}
                                                        </button>
                                                        <button
                                                            onClick={() => openAdd({ type: 'topic', parentId: ch.id, grandParentId: sub.id }, 30)}
                                                            className="p-1 text-foreground/20 hover:text-blue-600 transition-colors"
                                                            title="Add Topic"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </button>
                                                    </div>

                                                    {ch.expanded && (
                                                        <div className="ml-3 space-y-0.5">
                                                            {ch.topics.map(tp => (
                                                                <div key={tp.id}>
                                                                    {/* Topic row */}
                                                                    <div className="flex items-center gap-1">
                                                                        <button
                                                                            onClick={() => toggleTopic(sub.id, ch.id, tp.id)}
                                                                            className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-background transition-all text-left"
                                                                        >
                                                                            <BookOpen className="h-3 w-3 text-foreground/20 shrink-0" />
                                                                            <span className="flex-1 text-[10px] text-foreground/60 truncate">{tp.title}</span>
                                                                            <span className="text-[9px] text-foreground/20 shrink-0">{tp.allocatedMin}m</span>
                                                                            {tp.expanded
                                                                                ? <ChevronDown className="h-3 w-3 text-foreground/20" />
                                                                                : <ChevronRight className="h-3 w-3 text-foreground/20" />}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => openAdd({ type: 'task', parentId: tp.id, grandParentId: `${sub.id}::${ch.id}` }, 25)}
                                                                            className="p-1 text-foreground/20 hover:text-blue-600 transition-colors"
                                                                            title="Add Task"
                                                                        >
                                                                            <Plus className="h-3 w-3" />
                                                                        </button>
                                                                    </div>

                                                                    {tp.expanded && (
                                                                        <div className="ml-3 space-y-0.5 pb-1">
                                                                            {tp.tasks.map(task => (
                                                                                <button
                                                                                    key={task.id}
                                                                                    onClick={() => setSelectedTask({ task, topicId: tp.id, chapterId: ch.id, subjectId: sub.id })}
                                                                                    className={cn(
                                                                                        "w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-left",
                                                                                        selectedTask?.task.id === task.id
                                                                                            ? "bg-blue-600/10 border border-blue-500/20"
                                                                                            : "hover:bg-background"
                                                                                    )}
                                                                                >
                                                                                    <button
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            markTaskDone(sub.id, ch.id, tp.id, task.id);
                                                                                        }}
                                                                                        className={cn(
                                                                                            "h-4 w-4 rounded border shrink-0 flex items-center justify-center transition-all",
                                                                                            task.done
                                                                                                ? "bg-green-500 border-green-500"
                                                                                                : "border-card-border hover:border-blue-500"
                                                                                        )}
                                                                                    >
                                                                                        {task.done && <Check className="h-2.5 w-2.5 text-white" />}
                                                                                    </button>
                                                                                    <span className={cn(
                                                                                        "flex-1 text-[10px] truncate",
                                                                                        task.done ? "line-through text-foreground/25" : "text-foreground/60"
                                                                                    )}>
                                                                                        {task.title}
                                                                                    </span>
                                                                                    {task.pomodorosDone > 0 && (
                                                                                        <span className="text-[8px] font-black text-orange-500 shrink-0">🍅×{task.pomodorosDone}</span>
                                                                                    )}
                                                                                    <span className="text-[9px] text-foreground/20 shrink-0">{task.allocatedMin}m</span>
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => openAdd({ type: 'chapter', parentId: sub.id }, 45)}
                                                className="w-full flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black text-foreground/20 hover:text-blue-600 transition-colors uppercase tracking-widest"
                                            >
                                                <Plus className="h-3 w-3" /> Add Chapter
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {subjects.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 gap-3">
                                <ListChecks className="h-8 w-8 text-foreground/10" />
                                <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest text-center">
                                    No subjects yet.<br />Click + to add one.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── CENTER: Pomodoro Timer ────────────────────────── */}
                <div className="flex-1 flex flex-col items-center justify-center gap-6 min-w-0">
                    {/* Mode tabs */}
                    <div className="flex items-center gap-1.5 bg-card-bg border border-card-border p-1.5 rounded-2xl">
                        {([
                            { key: 'focus', label: 'Focus' },
                            { key: 'short_break', label: 'Short Break' },
                            { key: 'long_break', label: 'Long Break' },
                        ] as const).map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => switchMode(key)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center",
                                    mode === key
                                        ? "bg-background shadow text-foreground"
                                        : "text-foreground/30 hover:text-foreground/60"
                                )}
                            >
                                <span>{label}</span>
                                <span className="text-[8px] font-bold opacity-60 tabular-nums">{formatTime(durations[key])}</span>
                            </button>
                        ))}
                    </div>

                    {/* Active task chip */}
                    {selectedTask ? (
                        <div className="flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 px-5 py-2 rounded-2xl max-w-sm">
                            <Target className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                            <span className="text-[11px] font-black text-blue-500 uppercase tracking-wide truncate">{selectedTask.task.title}</span>
                            <button onClick={() => setSelectedTask(null)} className="text-blue-400/40 hover:text-blue-400 shrink-0">
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 bg-foreground/5 border border-card-border px-5 py-2 rounded-2xl">
                            <ListChecks className="h-3.5 w-3.5 text-foreground/30" />
                            <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Select a task from the plan</span>
                        </div>
                    )}

                    {/* SVG Ring Timer */}
                    <div className="relative flex items-center justify-center select-none">
                        <svg width="280" height="280" viewBox="0 0 280 280">
                            <circle
                                cx="140" cy="140" r={radius}
                                fill="none" stroke="currentColor" strokeWidth="10"
                                className="text-card-border"
                            />
                            <circle
                                cx="140" cy="140" r={radius}
                                fill="none"
                                stroke={RING_COLOR[mode]}
                                strokeWidth="10"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={dashOffset}
                                transform="rotate(-90 140 140)"
                                style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                            <span className={cn("text-5xl font-black tabular-nums tracking-tighter transition-colors", TEXT_COLOR[mode])}>
                                {formatTime(timeLeft)}
                            </span>
                            <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">
                                {mode === 'focus' ? 'Deep Focus' : mode === 'short_break' ? 'Short Break' : 'Long Break'}
                            </span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={resetTimer}
                            className="h-12 w-12 bg-card-bg border border-card-border rounded-2xl flex items-center justify-center text-foreground/40 hover:text-foreground hover:shadow-md transition-all"
                            title="Reset"
                        >
                            <RotateCcw className="h-5 w-5" />
                        </button>

                        <button
                            onClick={isRunning ? () => setIsRunning(false) : startTimer}
                            className={cn(
                                "h-16 w-16 rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-95",
                                mode === 'focus' ? "bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-700"
                                    : mode === 'short_break' ? "bg-green-500 text-white shadow-green-500/20 hover:bg-green-600"
                                        : "bg-purple-600 text-white shadow-purple-500/20 hover:bg-purple-700"
                            )}
                        >
                            {isRunning
                                ? <Pause className="h-7 w-7 fill-current" />
                                : <Play className="h-7 w-7 fill-current" />}
                        </button>

                        <div className="h-12 w-12 bg-card-bg border border-card-border rounded-2xl flex flex-col items-center justify-center gap-0.5">
                            <span className="text-[9px] font-black text-foreground/30 uppercase">Cycle</span>
                            <span className="text-[11px] font-black text-foreground">#{pomodoroCount + 1}</span>
                        </div>
                    </div>

                    {/* Tip */}
                    <div className="flex items-center gap-2 px-5 py-3 bg-blue-600/5 border border-blue-600/10 rounded-2xl max-w-sm">
                        <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0" />
                        <p className="text-[9px] font-bold text-foreground/50 leading-relaxed">
                            {mode === 'focus'
                                ? 'Stay away from distractions for 25 minutes. You can do it.'
                                : 'Walk, breathe, stretch. Let your brain consolidate.'}
                        </p>
                    </div>
                </div>

                {/* ─── RIGHT: Stats & Log ────────────────────────────── */}
                <div className="w-64 shrink-0 flex flex-col gap-4 overflow-hidden">
                    {/* Today's Stats */}
                    <div className="bg-card-bg border border-card-border rounded-[2rem] p-5 space-y-4 shrink-0">
                        <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Today</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-background border border-card-border rounded-2xl p-3 text-center">
                                <p className="text-2xl font-black text-blue-600">{sessionLog.length}</p>
                                <p className="text-[8px] font-black text-foreground/30 uppercase tracking-widest mt-0.5">🍅 Done</p>
                            </div>
                            <div className="bg-background border border-card-border rounded-2xl p-3 text-center">
                                <p className="text-2xl font-black text-green-600">{totalFocusMin}m</p>
                                <p className="text-[8px] font-black text-foreground/30 uppercase tracking-widest mt-0.5">Focus</p>
                            </div>
                        </div>

                        {/* Subject progress */}
                        <div className="space-y-2.5">
                            {subjects.map(sub => {
                                const all = sub.chapters.flatMap(c => c.topics.flatMap(t => t.tasks));
                                const done = all.filter(t => t.done).length;
                                const pct = all.length > 0 ? Math.round((done / all.length) * 100) : 0;
                                return (
                                    <div key={sub.id} className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <div className={cn("h-2 w-2 rounded-sm", sub.color)} />
                                                <span className="text-[9px] font-black text-foreground/50 uppercase truncate max-w-[90px]">{sub.title}</span>
                                            </div>
                                            <span className="text-[9px] font-black text-foreground/30">{done}/{all.length}</span>
                                        </div>
                                        <div className="h-1.5 bg-background rounded-full overflow-hidden border border-card-border">
                                            <div className={cn("h-full rounded-full transition-all duration-500", sub.color)} style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Session Log */}
                    <div className="bg-card-bg border border-card-border rounded-[2rem] p-5 flex flex-col flex-1 overflow-hidden min-h-0">
                        <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-3 shrink-0">Session Log</p>
                        {sessionLog.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center space-y-2">
                                    <Zap className="h-6 w-6 text-foreground/10 mx-auto" />
                                    <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">
                                        No sessions yet
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-y-auto flex-1 space-y-2">
                                {[...sessionLog].reverse().map((log, i) => (
                                    <div key={i} className="flex items-center gap-2.5 bg-background border border-card-border p-2.5 rounded-xl">
                                        <div className="h-6 w-6 bg-blue-600/10 rounded-lg flex items-center justify-center shrink-0">
                                            <Timer className="h-3 w-3 text-blue-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black text-foreground/60 truncate">{log.task}</p>
                                            <p className="text-[8px] text-foreground/30">{log.duration} min</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Add Item Modal ────────────────────────────────────── */}
            {addModal && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setAddModal(null)} />
                    <div className="relative z-10 w-full max-w-sm bg-card-bg border border-card-border rounded-[2rem] p-8 shadow-2xl space-y-6 animate-in zoom-in-95 fade-in duration-200">
                        <h3 className="text-lg font-black text-foreground uppercase tracking-tight italic">
                            Add {addModal.type.charAt(0).toUpperCase() + addModal.type.slice(1)}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-2 block">
                                    {addModal.type === 'subject' ? 'Subject Name' :
                                        addModal.type === 'chapter' ? 'Chapter Name' :
                                            addModal.type === 'topic' ? 'Topic Name' : 'Task Description'}
                                </label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={addTitle}
                                    onChange={e => setAddTitle(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addItem()}
                                    placeholder={`Enter ${addModal.type} name...`}
                                    className="w-full bg-background border border-card-border rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-2 block">
                                    Time Allocation ({addModal.type === 'subject' ? 'hours' : 'minutes'})
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max={addModal.type === 'subject' ? 24 : 300}
                                    value={addMinutes}
                                    onChange={e => setAddMinutes(parseInt(e.target.value) || 25)}
                                    className="w-full bg-background border border-card-border rounded-2xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setAddModal(null)}
                                className="flex-1 py-3 border border-card-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addItem}
                                disabled={!addTitle.trim()}
                                className="flex-1 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Timer Settings Modal ──────────────────────────── */}
            {showSettings && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
                    <div className="relative z-10 w-full max-w-sm bg-card-bg border border-card-border rounded-[2rem] p-8 shadow-2xl space-y-6 animate-in zoom-in-95 fade-in duration-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-black text-foreground uppercase tracking-tight italic">Timer Settings</h3>
                            <button onClick={() => setShowSettings(false)} className="p-1.5 rounded-xl hover:bg-foreground/5 text-foreground/30 hover:text-foreground transition-all">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Presets */}
                        <div>
                            <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest mb-2.5">Quick Presets</p>
                            <div className="grid grid-cols-2 gap-2">
                                {PRESETS.map(p => (
                                    <button
                                        key={p.label}
                                        onClick={() => applyPreset(p)}
                                        className={cn(
                                            "px-3 py-2.5 rounded-xl border text-left transition-all",
                                            settingsFocus === p.focus && settingsShort === p.short_break && settingsLong === p.long_break
                                                ? "bg-blue-600/10 border-blue-500/30 text-blue-500"
                                                : "border-card-border hover:border-foreground/20 text-foreground/60"
                                        )}
                                    >
                                        <p className="text-[10px] font-black uppercase tracking-widest">{p.label}</p>
                                        <p className="text-[9px] font-bold opacity-60">{p.sub} min</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom fields */}
                        <div className="space-y-3">
                            <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Custom (minutes)</p>
                            {[
                                { label: 'Focus Session', color: 'text-blue-500', val: settingsFocus, set: setSettingsFocus, min: 1, max: 120 },
                                { label: 'Short Break', color: 'text-green-500', val: settingsShort, set: setSettingsShort, min: 1, max: 60 },
                                { label: 'Long Break', color: 'text-purple-500', val: settingsLong, set: setSettingsLong, min: 1, max: 60 },
                            ].map(({ label, color, val, set, min, max }) => (
                                <div key={label} className="flex items-center gap-3">
                                    <span className={cn("text-[10px] font-black uppercase tracking-widest w-28 shrink-0", color)}>{label}</span>
                                    <div className="flex items-center gap-2 flex-1">
                                        <button
                                            onClick={() => set(v => Math.max(min, v - 1))}
                                            className="h-8 w-8 rounded-xl bg-foreground/5 border border-card-border text-foreground/50 hover:text-foreground flex items-center justify-center font-black text-sm transition-all"
                                        >−</button>
                                        <input
                                            type="number"
                                            min={min}
                                            max={max}
                                            value={val}
                                            onChange={e => {
                                                const n = parseInt(e.target.value, 10);
                                                if (!isNaN(n)) set(Math.max(min, Math.min(max, n)));
                                            }}
                                            className="flex-1 bg-background border border-card-border rounded-xl px-2 py-1.5 text-[13px] font-black text-foreground text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                        <button
                                            onClick={() => set(v => Math.min(max, v + 1))}
                                            className="h-8 w-8 rounded-xl bg-foreground/5 border border-card-border text-foreground/50 hover:text-foreground flex items-center justify-center font-black text-sm transition-all"
                                        >+</button>
                                    </div>
                                    <span className="text-[9px] font-black text-foreground/20 w-6 shrink-0">min</span>
                                </div>
                            ))}
                        </div>

                        {/* Pomodoro science tip */}
                        <div className="px-4 py-3 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                            <p className="text-[9px] font-bold text-foreground/40 leading-relaxed">
                                The Pomodoro technique recommends <strong className="text-foreground/60">25 min focus → 5 min break</strong>, with a long 15–30 min break after every 4 sessions. Longer sessions (50/90 min) suit deep work tasks.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowSettings(false)}
                                className="flex-1 py-3 border border-card-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground transition-all"
                            >Cancel</button>
                            <button
                                onClick={applySettings}
                                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all"
                            >Apply</button>
                        </div>
                    </div>
                </div>
            )}

            <AuthModal
                open={authModal}
                onClose={() => setAuthModal(false)}
                reason="start a focus session"
                redirectTo="/dashboard/focus"
            />
        </div>
    );
}
