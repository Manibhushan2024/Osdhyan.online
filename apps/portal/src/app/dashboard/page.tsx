'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Target,
    CheckCircle2,
    CalendarDays,
    Moon,
    Sun,
    Trophy,
    Sparkles,
    RotateCcw,
    Clock3,
    Play,
    Square,
    ChevronUp,
    ChevronDown,
    Trash2,
    ArrowRight,
    BookOpen,
    Timer,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { StudyTimer } from '@/components/dashboard/StudyTimer';
import { GoalSetupWizard } from '@/components/dashboard/GoalSetupWizard';
import { DailyClosingModal } from '@/components/dashboard/DailyClosingModal';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';

type DailyTask = {
    id: number;
    title: string;
    is_completed: boolean;
    scheduled_date: string;
    task_scope?: 'daily' | 'weekly';
    week_start_date?: string | null;
};

type Metrics = {
    target_minutes: number;
    actual_minutes: number;
    remaining_minutes: number;
};

type FocusSection = {
    id: number;
    parent_id?: number | null;
    title: string;
    node_type: 'chapter' | 'topic' | 'task' | 'month' | 'week' | 'day';
    target_minutes: number;
    spent_minutes: number;
    status: 'active' | 'completed' | 'archived';
    scheduled_date?: string | null;
    sort_order?: number;
    meta?: Record<string, any> | null;
};

type PlannerData = {
    monthly_plan: any | null;
    weekly_plan: any | null;
    today_log: {
        total_study_time: number;
        is_closed: boolean;
        tomorrow_task?: string;
    };
    tasks: DailyTask[];
    today_tasks?: DailyTask[];
    weekly_tasks?: DailyTask[];
    report: {
        daily: Metrics;
        weekly: Metrics;
        monthly: Metrics;
        suggestion: string;
    };
    targets: {
        daily_base_target_minutes: number;
        today_target_minutes: number;
        today_remaining_minutes: number;
        rollover_minutes: number;
        weekly_remaining_minutes: number;
        monthly_remaining_minutes: number;
    };
    weekly_timeline: Array<{
        date: string;
        label: string;
        target_minutes: number;
        actual_minutes: number;
    }>;
    previous_day?: {
        voice_note_url?: string | null;
        tomorrow_task?: string | null;
        play_oath?: boolean;
    };
    overdue_tasks_count?: number;
    plan_nodes?: FocusSection[];
    focus_sections?: FocusSection[];
    active_section_session?: {
        id: number;
        plan_node_id: number;
        started_at: string;
        elapsed_seconds: number;
        node: FocusSection;
    } | null;
};

type OverviewStats = {
    has_data?: boolean;
    user_name?: string;
    today_study_time_min?: number;
    today_tests_count?: number;
    today_reading_hours?: number;
    stats?: {
        total_tests?: number;
        average_score?: number;
        total_time_spent_min?: number;
        study_streak?: number;
        accuracy_percentage?: number;
    };
    activity_feed?: Array<{
        type: string;
        title: string;
        score?: number;
        total_marks?: number;
        duration_sec?: number;
        activity_at: string;
    }>;
};

function formatMinutes(minutes: number) {
    const safe = Math.max(0, Math.floor(minutes));
    const hours = Math.floor(safe / 60);
    const mins = safe % 60;
    return `${hours}h ${mins}m`;
}

function formatActivityTime(value?: string) {
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--';

    return `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ${date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
    })}`;
}

function formatSeconds(seconds: number) {
    const safe = Math.max(0, Math.floor(seconds));
    const h = Math.floor(safe / 3600);
    const m = Math.floor((safe % 3600) / 60);
    const s = safe % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function minutesPercent(actual: number, target: number) {
    if (target <= 0) return 0;
    return Math.min((actual / target) * 100, 100);
}

function tomorrowDateString() {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10);
}

function playReminderTone() {
    try {
        const audioContext = new window.AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(920, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.06, audioContext.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.45);
    } catch (error) {
        console.error('Reminder sound failed', error);
    }
}

export default function Dashboard() {
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [plannerData, setPlannerData] = useState<PlannerData | null>(null);
    const [stats, setStats] = useState<OverviewStats | null>(null);
    const [showGoalWizard, setShowGoalWizard] = useState(false);
    const [showClosingModal, setShowClosingModal] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskScope, setNewTaskScope] = useState<'daily' | 'weekly'>('daily');
    const [addingTask, setAddingTask] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState('');
    const [newSectionType, setNewSectionType] = useState<'chapter' | 'topic' | 'task'>('chapter');
    const [newSectionTarget, setNewSectionTarget] = useState(60);
    const [newSectionParentId, setNewSectionParentId] = useState<number | null>(null);
    const [newSectionDate, setNewSectionDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [addingSection, setAddingSection] = useState(false);
    const [activeSectionElapsed, setActiveSectionElapsed] = useState(0);

    const reminderTriggeredRef = useRef(false);
    const playedOathRef = useRef<string | null>(null);
    const { toast } = useToast();

    const fetchDashboardData = async () => {
        try {
            const [plannerRes, statsRes] = await Promise.all([
                axios.get('/study-planner/dashboard'),
                axios.get('/analytics/overview'),
            ]);

            setPlannerData(plannerRes.data);
            setStats(statsRes.data);

            if (!plannerRes.data.monthly_plan) {
                setShowGoalWizard(true);
            }
        } catch {
            // silent — guest or network error, handled below
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authLoading) return;
        if (!user) { setLoading(false); return; }
        fetchDashboardData();
    }, [authLoading, user]);

    useEffect(() => {
        if (!plannerData || plannerData.today_log?.is_closed) return;

        const checkReminder = () => {
            const now = new Date();
            const isAfterTenPm = now.getHours() >= 22;
            if (!isAfterTenPm || reminderTriggeredRef.current) return;

            reminderTriggeredRef.current = true;
            playReminderTone();
            toast({
                title: 'Time to close your day',
                description: 'Set tomorrow\'s task and close today\'s plan.',
            });
            setShowClosingModal(true);
        };

        checkReminder();
        const interval = setInterval(checkReminder, 60 * 1000);
        return () => clearInterval(interval);
    }, [plannerData, toast]);

    useEffect(() => {
        const previous = plannerData?.previous_day;
        if (!previous?.play_oath || !previous.voice_note_url) return;
        if (playedOathRef.current === previous.voice_note_url) return;

        const audio = new Audio(previous.voice_note_url);
        audio.play().catch((error) => {
            console.warn('Auto-play blocked for oath audio', error);
        });
        playedOathRef.current = previous.voice_note_url;
    }, [plannerData?.previous_day]);

    useEffect(() => {
        const activeSession = plannerData?.active_section_session;
        if (!activeSession) {
            setActiveSectionElapsed(0);
            return;
        }

        setActiveSectionElapsed(activeSession.elapsed_seconds || 0);
        const interval = setInterval(() => {
            setActiveSectionElapsed((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [plannerData?.active_section_session?.id]);

    const handleTaskToggle = async (taskId: number) => {
        try {
            await axios.patch(`/study-planner/tasks/${taskId}`);
            setPlannerData((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    tasks: prev.tasks.map((task) =>
                        task.id === taskId ? { ...task, is_completed: !task.is_completed } : task
                    ),
                    today_tasks: (prev.today_tasks || []).map((task) =>
                        task.id === taskId ? { ...task, is_completed: !task.is_completed } : task
                    ),
                    weekly_tasks: (prev.weekly_tasks || []).map((task) =>
                        task.id === taskId ? { ...task, is_completed: !task.is_completed } : task
                    ),
                };
            });
        } catch (error) {
            console.error('Task toggle failed', error);
            toast({
                title: 'Could not update task',
                description: 'Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleAddTask = async () => {
        const title = newTaskTitle.trim();
        if (!title) return;

        try {
            setAddingTask(true);
            const payload: Record<string, any> = { title, task_scope: newTaskScope };
            if (newTaskScope === 'weekly') {
                const now = new Date();
                const day = now.getDay();
                const diff = day === 0 ? -6 : 1 - day;
                const monday = new Date(now);
                monday.setDate(now.getDate() + diff);
                payload.week_start_date = monday.toISOString().slice(0, 10);
            }

            const response = await axios.post('/study-planner/tasks', payload);
            setPlannerData((prev) => {
                if (!prev) return prev;
                if (newTaskScope === 'weekly') {
                    return {
                        ...prev,
                        weekly_tasks: [...(prev.weekly_tasks || []), response.data],
                    };
                }

                return {
                    ...prev,
                    tasks: [...prev.tasks, response.data],
                    today_tasks: [...(prev.today_tasks || prev.tasks), response.data],
                };
            });
            setNewTaskTitle('');
        } catch (error) {
            console.error('Add task failed', error);
            toast({
                title: 'Could not add task',
                description: 'Could not add your task.',
                variant: 'destructive',
            });
        } finally {
            setAddingTask(false);
        }
    };

    const handleRescheduleTask = async (taskId: number) => {
        const defaultDate = tomorrowDateString();
        const selectedDate = window.prompt('Move task to date (YYYY-MM-DD)', defaultDate);
        if (!selectedDate) return;

        try {
            await axios.patch(`/study-planner/tasks/${taskId}/reschedule`, {
                scheduled_date: selectedDate,
            });

            setPlannerData((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    tasks: prev.tasks.filter((task) => task.id !== taskId),
                    today_tasks: (prev.today_tasks || []).filter((task) => task.id !== taskId),
                    weekly_tasks: (prev.weekly_tasks || []).filter((task) => task.id !== taskId),
                };
            });

            toast({
                title: 'Task moved',
                description: `Task moved to ${selectedDate}.`,
            });
        } catch (error) {
            console.error('Reschedule failed', error);
            toast({
                title: 'Could not move task',
                description: 'Please enter a valid date and try again.',
                variant: 'destructive',
            });
        }
    };

    const handleAddFocusSection = async () => {
        const title = newSectionTitle.trim();
        if (!title) return;

        try {
            setAddingSection(true);
            const response = await axios.post('/study-planner/nodes', {
                title,
                node_type: newSectionType,
                target_minutes: Math.max(1, newSectionTarget),
                parent_id: newSectionParentId || undefined,
                scheduled_date: newSectionDate || undefined,
            });

            setPlannerData((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    focus_sections: [...(prev.focus_sections || []), response.data],
                    plan_nodes: [...(prev.plan_nodes || []), response.data],
                };
            });
            setNewSectionTitle('');
            setNewSectionTarget(60);
            setNewSectionParentId(null);
        } catch (error) {
            console.error('Add focus section failed', error);
            toast({
                title: 'Could not add section',
                description: 'Please try again.',
                variant: 'destructive',
            });
        } finally {
            setAddingSection(false);
        }
    };

    const handleStartSectionTimer = async (sectionId: number) => {
        try {
            await axios.post(`/study-planner/nodes/${sectionId}/timer/start`);
            await fetchDashboardData();
        } catch (error: any) {
            console.error('Start section timer failed', error);
            toast({
                title: 'Could not start timer',
                description: error?.response?.data?.message || 'Unable to start section timer.',
                variant: 'destructive',
            });
        }
    };

    const handleStopSectionTimer = async (sectionId: number) => {
        try {
            await axios.post(`/study-planner/nodes/${sectionId}/timer/stop`);
            await fetchDashboardData();
        } catch (error: any) {
            console.error('Stop section timer failed', error);
            toast({
                title: 'Could not stop timer',
                description: error?.response?.data?.message || 'Unable to stop section timer.',
                variant: 'destructive',
            });
        }
    };

    const handleSectionStatus = async (sectionId: number, status: 'active' | 'completed' | 'archived') => {
        try {
            await axios.patch(`/study-planner/nodes/${sectionId}`, { status });
            await fetchDashboardData();
        } catch (error: any) {
            console.error('Update section status failed', error);
            toast({
                title: 'Could not update section',
                description: error?.response?.data?.message || 'Unable to update section.',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteSection = async (sectionId: number) => {
        if (!window.confirm('Delete this section?')) return;
        try {
            await axios.delete(`/study-planner/nodes/${sectionId}`);
            await fetchDashboardData();
        } catch (error: any) {
            console.error('Delete section failed', error);
            toast({
                title: 'Could not delete',
                description: error?.response?.data?.message || 'Unable to delete section.',
                variant: 'destructive',
            });
        }
    };

    const handleMoveSection = async (sectionId: number, direction: 'up' | 'down') => {
        try {
            await axios.patch(`/study-planner/nodes/${sectionId}/move`, { direction });
            await fetchDashboardData();
        } catch (error: any) {
            console.error('Move section failed', error);
            toast({
                title: 'Could not reorder',
                description: error?.response?.data?.message || 'Unable to reorder section.',
                variant: 'destructive',
            });
        }
    };

    const pendingTasksCount = useMemo(
        () => (plannerData?.today_tasks || plannerData?.tasks || []).filter((task) => !task.is_completed).length,
        [plannerData?.today_tasks, plannerData?.tasks]
    );

    const pendingWeeklyTasksCount = useMemo(
        () => (plannerData?.weekly_tasks || []).filter((task) => !task.is_completed).length,
        [plannerData?.weekly_tasks]
    );

    const planNodes = useMemo(
        () => plannerData?.plan_nodes || [],
        [plannerData?.plan_nodes]
    );

    const sectionNodes = useMemo(
        () => planNodes.filter((node) => ['chapter', 'topic', 'task'].includes(node.node_type)),
        [planNodes]
    );

    const parentOptions = useMemo(
        () =>
            planNodes.filter((node) =>
                ['day', 'chapter', 'topic'].includes(node.node_type) && node.status === 'active'
            ),
        [planNodes]
    );

    const sectionRows = useMemo(() => {
        const byParent = new Map<number | null, FocusSection[]>();
        const sectionMap = new Map<number, FocusSection>();

        sectionNodes.forEach((node) => {
            sectionMap.set(node.id, node);
        });

        sectionNodes.forEach((node) => {
            const parentId = sectionMap.has(node.parent_id || -1) ? (node.parent_id || null) : null;
            const current = byParent.get(parentId) || [];
            current.push(node);
            byParent.set(parentId, current);
        });

        byParent.forEach((nodes) => {
            nodes.sort((a, b) => {
                const sortDiff = (a.sort_order || 0) - (b.sort_order || 0);
                if (sortDiff !== 0) return sortDiff;
                return a.id - b.id;
            });
        });

        const rows: Array<{ node: FocusSection; depth: number }> = [];
        const walk = (parentId: number | null, depth: number) => {
            const children = byParent.get(parentId) || [];
            children.forEach((node) => {
                rows.push({ node, depth });
                walk(node.id, depth + 1);
            });
        };
        walk(null, 0);

        return rows;
    }, [sectionNodes]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent" />
            </div>
        );
    }

    // ── Guest dashboard ────────────────────────────────────────────────────────
    if (!user) {
        return (
            <div className="space-y-10 pb-12">
                {/* Hero */}
                <div className="card p-6 sm:p-10">
                    <p className="eyebrow">Free to browse</p>
                    <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">Welcome to OSDHYAN</h1>
                    <p className="mt-3 text-base text-muted-foreground max-w-xl">
                        Browse tests, study materials and the focus timer without an account. Create a free account when you want to save your scores and track progress.
                    </p>
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                        <Link href="/auth/signup" className="btn btn-primary btn-lg">
                            Create free account <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link href="/auth/login" className="btn btn-secondary btn-lg">
                            Sign in
                        </Link>
                    </div>
                </div>

                {/* Quick access tiles */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">Browse without signing in</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { label: 'Test series', sub: 'Mock test sets for each exam', href: '/dashboard/test-series', icon: Trophy },
                            { label: 'Free tests', sub: 'Attempt a test right away', href: '/dashboard/tests', icon: Sparkles },
                            { label: 'Previous year papers', sub: 'Original papers from past exams', href: '/dashboard/pyqs', icon: RotateCcw },
                            { label: 'Study materials', sub: 'Notes, PDFs and NCERT', href: '/dashboard/materials', icon: BookOpen },
                            { label: 'Syllabus', sub: 'Exam-wise syllabus', href: '/dashboard/syllabus', icon: Target },
                            { label: 'Focus timer', sub: 'Pomodoro timer and task list', href: '/dashboard/focus', icon: Timer },
                        ].map(({ label, sub, href, icon: Icon }) => (
                            <Link key={href} href={href} className="card card-hover p-5 flex items-start gap-4 group">
                                <div className="h-11 w-11 shrink-0 rounded-xl bg-accent text-accent-foreground flex items-center justify-center">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold group-hover:text-primary transition-colors">{label}</p>
                                    <p className="text-sm text-muted-foreground mt-0.5">{sub}</p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary mt-1 shrink-0" />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Sign-up value prop */}
                <div className="card p-6 sm:p-8">
                    <h2 className="text-xl font-bold">With a free account you can</h2>
                    <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        {['Save test scores and see your history', 'Get accuracy and weak-topic analysis', 'Set daily study goals', 'Track your study streak', 'Enrol in test series', 'Join live classes'].map(f => (
                            <li key={f} className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" /> {f}
                            </li>
                        ))}
                    </ul>
                    <Link href="/auth/signup" className="btn btn-primary mt-6">
                        Create free account <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        );
    }

    // API fetch failed for logged-in user
    if (!plannerData) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <p className="text-sm text-muted-foreground">We could not load your dashboard.</p>
                <button
                    onClick={fetchDashboardData}
                    className="btn btn-primary"
                >
                    Retry
                </button>
            </div>
        );
    }

    const dailyReport = plannerData.report?.daily || { target_minutes: 120, actual_minutes: 0, remaining_minutes: 120 };
    const weeklyReport = plannerData.report?.weekly || { target_minutes: 0, actual_minutes: 0, remaining_minutes: 0 };
    const monthlyReport = plannerData.report?.monthly || { target_minutes: 0, actual_minutes: 0, remaining_minutes: 0 };

    const dailyPercent = minutesPercent(dailyReport.actual_minutes, dailyReport.target_minutes);
    const weeklyPercent = minutesPercent(weeklyReport.actual_minutes, weeklyReport.target_minutes);
    const monthlyPercent = minutesPercent(monthlyReport.actual_minutes, monthlyReport.target_minutes);
    const todayTasks = plannerData.today_tasks || plannerData.tasks || [];
    const weeklyTasks = plannerData.weekly_tasks || [];
    const activeSectionSession = plannerData.active_section_session;
    const totalTestsAttempted = stats?.stats?.total_tests || 0;
    const overallAccuracy = stats?.stats?.accuracy_percentage || 0;
    const averageScore = stats?.stats?.average_score || 0;
    const studyStreak = stats?.stats?.study_streak || 0;
    const totalStudyMinutes = stats?.stats?.total_time_spent_min || 0;
    const todayStudyMinutes = stats?.today_study_time_min || 0;
    const todayTestsCount = stats?.today_tests_count || 0;
    const todayReadingHours = stats?.today_reading_hours || 0;
    const activityFeed = stats?.activity_feed || [];

    const statusCards = [
        {
            title: 'Today',
            value: dailyPercent >= 100 ? 'Done' : `${Math.round(dailyPercent)}%`,
            done: dailyPercent >= 100,
        },
        {
            title: 'This week',
            value: weeklyReport.target_minutes ? `${Math.round(weeklyPercent)}%` : 'No goal',
            done: weeklyPercent >= 100,
        },
        {
            title: 'This month',
            value: monthlyReport.target_minutes ? `${Math.round(monthlyPercent)}%` : 'No goal',
            done: monthlyPercent >= 100,
        },
    ];

    return (
        <div className="pb-16">
            <div className="pb-6">
                <div className="flex justify-between items-end gap-4 flex-wrap">
                    <div>
                        <h1 className="page-title">
                            Hello, {stats?.user_name || user?.name || 'there'}
                        </h1>
                        <p className="page-subtitle flex items-center gap-2">
                            <Sun className="h-4 w-4 text-amber-500" />
                            Here is your study plan for today.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setShowClosingModal(true)}
                        className="rounded-xl px-5"
                    >
                        <Moon className="h-4 w-4" />
                        Close the day
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {statusCards.map((card) => (
                        <div
                            key={card.title}
                            className={cn(
                                'rounded-2xl border p-4 flex items-center justify-between',
                                card.done ? 'border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-900/20' : 'border-card-border bg-card-bg'
                            )}
                        >
                            <div>
                                <p className="text-sm text-muted-foreground">{card.title}</p>
                                <p className="text-lg font-bold">{card.value}</p>
                            </div>
                            <div
                                className={cn(
                                    'h-8 w-8 rounded-full flex items-center justify-center',
                                    card.done ? 'bg-green-500' : 'bg-accent'
                                )}
                            >
                                {card.done ? (
                                    <CheckCircle2 className="h-5 w-5 text-white" />
                                ) : (
                                    <Target className="h-4 w-4 text-blue-600" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <div className="xl:col-span-2 card p-5 sm:p-6">
                        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                            <h3 className="text-lg font-semibold">Your performance</h3>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                {
                                    title: 'Tests attempted',
                                    value: `${totalTestsAttempted}`,
                                    subtitle: 'Completed tests',
                                    icon: Trophy,
                                    className: 'bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-900/20 dark:border-amber-900/40 dark:text-amber-200',
                                    iconClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
                                },
                                {
                                    title: 'Accuracy',
                                    value: `${overallAccuracy}%`,
                                    subtitle: 'Overall accuracy',
                                    icon: Target,
                                    className: 'bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-900/20 dark:border-blue-900/40 dark:text-blue-200',
                                    iconClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200',
                                },
                                {
                                    title: 'Average score',
                                    value: `${averageScore}`,
                                    subtitle: 'Across tests',
                                    icon: CheckCircle2,
                                    className: 'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-900/40 dark:text-emerald-200',
                                    iconClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
                                },
                                {
                                    title: 'Study streak',
                                    value: `${studyStreak} days`,
                                    subtitle: 'Current streak',
                                    icon: CalendarDays,
                                    className: 'bg-purple-50 border-purple-100 text-purple-800 dark:bg-purple-900/20 dark:border-purple-900/40 dark:text-purple-200',
                                    iconClass: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200',
                                },
                            ].map((item) => (
                                <div key={item.title} className={cn('rounded-2xl border p-4', item.className)}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm opacity-80">{item.title}</p>
                                            <p className="text-2xl font-bold mt-1">{item.value}</p>
                                            <p className="text-xs opacity-75 mt-1">{item.subtitle}</p>
                                        </div>
                                        <div className={cn('h-9 w-9 rounded-full flex items-center justify-center', item.iconClass)}>
                                            <item.icon className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                            <div className="rounded-2xl border border-card-border bg-muted/50 p-4">
                                <p className="text-sm text-muted-foreground">Tests today</p>
                                <p className="text-2xl font-bold mt-1">{todayTestsCount}</p>
                            </div>
                            <div className="rounded-2xl border border-card-border bg-muted/50 p-4">
                                <p className="text-sm text-muted-foreground">Study time today</p>
                                <p className="text-2xl font-bold mt-1">{todayStudyMinutes} min</p>
                                <p className="text-xs text-muted-foreground mt-1">Reading {todayReadingHours}h</p>
                            </div>
                            <div className="rounded-2xl border border-card-border bg-muted/50 p-4">
                                <p className="text-sm text-muted-foreground">Total study time</p>
                                <p className="text-2xl font-bold mt-1">{formatMinutes(totalStudyMinutes)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card p-5 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Recent activity</h3>
                        </div>

                        {activityFeed.length > 0 ? (
                            <div className="space-y-3">
                                {activityFeed.slice(0, 6).map((activity, index) => {
                                    const durationMinutes = Math.max(1, Math.round((activity.duration_sec || 0) / 60));
                                    return (
                                        <div key={`${activity.type}-${activity.activity_at}-${index}`} className="rounded-xl border border-card-border p-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm font-semibold line-clamp-1">{activity.title}</p>
                                                <span
                                                    className={cn(
                                                        'badge',
                                                        activity.type === 'test'
                                                            ? 'badge-blue'
                                                            : 'badge-green'
                                                    )}
                                                >
                                                    {activity.type}
                                                </span>
                                            </div>
                                            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                                                <span>{formatActivityTime(activity.activity_at)}</span>
                                                {activity.type === 'test' ? (
                                                    <span className="font-semibold text-foreground">
                                                        Score: {activity.score || 0}/{activity.total_marks || 0}
                                                    </span>
                                                ) : (
                                                    <span className="font-semibold text-foreground">{durationMinutes} min</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No activity yet. Start a test or the study timer.</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StudyTimer onSessionComplete={() => fetchDashboardData()} />

                    <div className="card p-5 sm:p-6 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lg font-semibold">Today&apos;s target</h3>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-4xl font-bold">
                                        {formatMinutes(dailyReport.actual_minutes)}
                                    </span>
                                    <span className="text-muted-foreground">/ {formatMinutes(dailyReport.target_minutes)}</span>
                                </div>
                                {plannerData.targets?.rollover_minutes > 0 && (
                                    <p className="text-xs mt-2 text-orange-500 font-semibold">
                                        Includes rollover: {formatMinutes(plannerData.targets.rollover_minutes)}
                                    </p>
                                )}
                            </div>
                            <div className="h-12 w-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                                <Target className="h-6 w-6 text-green-600" />
                            </div>
                        </div>

                        <div className="h-3 w-full bg-muted rounded-full overflow-hidden mb-4">
                            <div
                                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000 ease-out"
                                style={{ width: `${dailyPercent}%` }}
                            />
                        </div>

                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>{dailyPercent.toFixed(0)}% complete</span>
                            <span>
                                {plannerData.today_log.is_closed
                                    ? 'Day closed'
                                    : `${formatMinutes(dailyReport.remaining_minutes)} left`}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 card p-5 sm:p-6">
                        <div className="flex flex-col gap-4 mb-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Today&apos;s tasks</h3>
                                <p className="text-sm text-muted-foreground">
                                    {pendingTasksCount} pending
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    value={newTaskTitle}
                                    onChange={(event) => setNewTaskTitle(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') {
                                            event.preventDefault();
                                            handleAddTask();
                                        }
                                    }}
                                    placeholder="Add a task for today"
                                    aria-label="New task"
                                    className="input flex-1"
                                />
                                <select
                                    value={newTaskScope}
                                    onChange={(event) => setNewTaskScope(event.target.value as 'daily' | 'weekly')}
                                    aria-label="Task scope"
                                    className="input sm:w-32"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                </select>
                                <Button onClick={handleAddTask} disabled={addingTask || !newTaskTitle.trim()}>
                                    Add task
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {todayTasks.length > 0 ? (
                                todayTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        onClick={() => handleTaskToggle(task.id)}
                                        className={cn(
                                            'flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group',
                                            task.is_completed
                                                ? 'bg-green-50/50 border-green-100 dark:bg-green-900/10 dark:border-green-900/40'
                                                : 'bg-card-bg border-card-border hover:border-primary/40'
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors',
                                                task.is_completed
                                                    ? 'bg-green-500 border-green-500'
                                                    : 'border-input group-hover:border-primary'
                                            )}
                                        >
                                            {task.is_completed && <CheckCircle2 className="h-4 w-4 text-white" />}
                                        </div>

                                        <span
                                            className={cn(
                                                'text-base font-medium transition-all flex-1',
                                                task.is_completed ? 'text-muted-foreground line-through' : 'text-foreground'
                                            )}
                                        >
                                            {task.title}
                                        </span>

                                        {!task.is_completed && (
                                            <button
                                                type="button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    handleRescheduleTask(task.id);
                                                }}
                                                className="h-10 px-3 rounded-lg border border-card-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors inline-flex items-center gap-1"
                                            >
                                                <RotateCcw className="h-3.5 w-3.5" />
                                                Move
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-muted-foreground text-sm">
                                    <p>No tasks for today yet. Add one to get started.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />

                        <h3 className="text-white/80 font-medium mb-2">Monthly goal</h3>
                        <div className="text-4xl font-bold mb-8">
                            {formatMinutes(monthlyReport.target_minutes)}
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between text-sm text-indigo-200">
                                <span>Completed</span>
                                <span>{formatMinutes(monthlyReport.actual_minutes)}</span>
                            </div>
                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white transition-all duration-1000"
                                    style={{ width: `${monthlyPercent}%` }}
                                />
                            </div>
                            <div className="pt-4 flex gap-4">
                                <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
                                    <div className="text-xs text-indigo-300">Streak</div>
                                    <div className="text-xl font-bold">{studyStreak}</div>
                                </div>
                                <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
                                    <div className="text-xs text-indigo-300">Accuracy</div>
                                    <div className="text-xl font-bold">{overallAccuracy}%</div>
                                </div>
                            </div>
                            {plannerData.overdue_tasks_count ? (
                                <div className="rounded-xl bg-orange-500/20 border border-orange-300/20 p-3 text-sm">
                                    {plannerData.overdue_tasks_count} overdue {plannerData.overdue_tasks_count === 1 ? 'task' : 'tasks'}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="card p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-semibold">This week&apos;s tasks</h3>
                        <p className="text-sm text-muted-foreground">
                            {pendingWeeklyTasksCount} pending
                        </p>
                    </div>

                    {weeklyTasks.length > 0 ? (
                        <div className="space-y-3">
                            {weeklyTasks.map((task) => (
                                <div
                                    key={task.id}
                                    onClick={() => handleTaskToggle(task.id)}
                                    className={cn(
                                        'flex items-center gap-3 rounded-xl border p-3 min-h-[48px] cursor-pointer',
                                        task.is_completed
                                            ? 'border-green-100 bg-green-50/60 dark:bg-green-900/10 dark:border-green-900/40'
                                            : 'border-card-border hover:border-primary/40'
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'h-5 w-5 rounded-full border-2 flex items-center justify-center',
                                            task.is_completed ? 'border-green-500 bg-green-500' : 'border-input'
                                        )}
                                    >
                                        {task.is_completed && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                                    </div>
                                    <span className={cn(
                                        'flex-1 text-sm font-medium',
                                        task.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'
                                    )}>
                                        {task.title}
                                    </span>
                                    {!task.is_completed && (
                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleRescheduleTask(task.id);
                                            }}
                                            className="text-sm px-3 py-2 min-h-[40px] rounded-lg border border-card-border text-muted-foreground hover:border-primary hover:text-primary"
                                        >
                                            Move
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No weekly tasks yet. Add one and choose &quot;Weekly&quot;.</p>
                    )}
                </div>

                <div className="card p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Clock3 className="h-5 w-5 text-primary" />
                            Topic timers
                        </h3>
                        {activeSectionSession ? (
                            <span className="text-sm text-emerald-600 font-semibold">
                                Running: {formatSeconds(activeSectionElapsed)}
                            </span>
                        ) : (
                            <span className="text-sm text-muted-foreground">No timer running</span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-4">
                        <input
                            value={newSectionTitle}
                            onChange={(event) => setNewSectionTitle(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    handleAddFocusSection();
                                }
                            }}
                            placeholder="Add a chapter, topic or task"
                            aria-label="Section title"
                            className="input md:col-span-2"
                        />
                        <select
                            value={newSectionType}
                            onChange={(event) => setNewSectionType(event.target.value as 'chapter' | 'topic' | 'task')}
                            aria-label="Section type"
                            className="input"
                        >
                            <option value="chapter">Chapter</option>
                            <option value="topic">Topic</option>
                            <option value="task">Task</option>
                        </select>
                        <select
                            value={newSectionParentId ?? ''}
                            onChange={(event) => setNewSectionParentId(event.target.value ? Number(event.target.value) : null)}
                            aria-label="Parent section"
                            className="input"
                        >
                            <option value="">Under today (default)</option>
                            {parentOptions.map((node) => (
                                <option key={node.id} value={node.id}>
                                    {node.title} ({node.node_type})
                                </option>
                            ))}
                        </select>
                        <input
                            type="date"
                            value={newSectionDate}
                            onChange={(event) => setNewSectionDate(event.target.value)}
                            aria-label="Date"
                            className="input"
                        />
                        <div className="flex gap-2">
                            <input
                                type="number"
                                min={1}
                                value={newSectionTarget}
                                onChange={(event) => setNewSectionTarget(Math.max(1, Number(event.target.value) || 1))}
                                aria-label="Target minutes"
                                title="Target minutes"
                                className="input w-24"
                            />
                            <Button
                                onClick={handleAddFocusSection}
                                disabled={addingSection || !newSectionTitle.trim()}
                            >
                                Add
                            </Button>
                        </div>
                    </div>

                    {sectionRows.length > 0 ? (
                        <div className="space-y-3">
                            {sectionRows.map(({ node: section, depth }) => {
                                const progress = minutesPercent(section.spent_minutes, section.target_minutes);
                                const isRunning = activeSectionSession?.plan_node_id === section.id;
                                return (
                                    <div
                                        key={section.id}
                                        className={cn(
                                            'rounded-xl border p-4',
                                            isRunning ? 'border-emerald-300 bg-emerald-50/40 dark:bg-emerald-900/10 dark:border-emerald-900/50' : 'border-card-border bg-muted/40'
                                        )}
                                        style={{ marginLeft: `${Math.min(depth, 4) * 16}px` }}
                                    >
                                        <div className="flex items-center justify-between gap-3 flex-wrap">
                                            <div>
                                                <p className="text-sm font-semibold">{section.title}</p>
                                                <p className="text-xs text-muted-foreground capitalize">
                                                    {section.node_type}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isRunning ? (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleStopSectionTimer(section.id)}
                                                        className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20"
                                                    >
                                                        <Square className="h-3.5 w-3.5 mr-1" />
                                                        Stop
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleStartSectionTimer(section.id)}
                                                    >
                                                        <Play className="h-3.5 w-3.5 mr-1" />
                                                        Start
                                                    </Button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleMoveSection(section.id, 'up')}
                                                    className="h-10 w-10 rounded-lg border border-card-border text-muted-foreground hover:border-primary hover:text-primary inline-flex items-center justify-center"
                                                    title="Move up"
                                                    aria-label="Move up"
                                                >
                                                    <ChevronUp className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleMoveSection(section.id, 'down')}
                                                    className="h-10 w-10 rounded-lg border border-card-border text-muted-foreground hover:border-primary hover:text-primary inline-flex items-center justify-center"
                                                    title="Move down"
                                                    aria-label="Move down"
                                                >
                                                    <ChevronDown className="h-4 w-4" />
                                                </button>
                                                {section.status === 'completed' ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSectionStatus(section.id, 'active')}
                                                        className="h-10 px-3 rounded-lg border border-card-border text-sm text-muted-foreground hover:border-primary hover:text-primary"
                                                    >
                                                        Reopen
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSectionStatus(section.id, 'completed')}
                                                        className="h-10 px-3 rounded-lg border border-green-200 text-sm text-green-700 hover:bg-green-50 dark:border-green-900/50 dark:text-green-300 dark:hover:bg-green-900/20"
                                                    >
                                                        Mark done
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteSection(section.id)}
                                                    className="h-10 w-10 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20 inline-flex items-center justify-center"
                                                    title="Delete"
                                                    aria-label="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="mt-2 text-xs text-muted-foreground flex items-center justify-between">
                                            <span>Spent: {formatMinutes(section.spent_minutes)}</span>
                                            <span>Target: {formatMinutes(section.target_minutes)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No topic timers yet. Add a chapter, topic or task and start its timer.</p>
                    )}
                </div>

                <div className="card p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-3 mb-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-amber-500" />
                            Target vs actual
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { label: 'Daily', data: dailyReport, color: 'from-emerald-400 to-green-500' },
                            { label: 'Weekly', data: weeklyReport, color: 'from-blue-400 to-indigo-500' },
                            { label: 'Monthly', data: monthlyReport, color: 'from-purple-400 to-pink-500' },
                        ].map((item) => {
                            const progress = minutesPercent(item.data.actual_minutes, item.data.target_minutes);
                            return (
                                <div key={item.label} className="rounded-2xl border border-card-border p-5 bg-muted/40">
                                    <p className="text-sm font-semibold mb-3">{item.label}</p>
                                    <p className="text-sm text-muted-foreground">Target: {formatMinutes(item.data.target_minutes)}</p>
                                    <p className="text-sm text-muted-foreground">Actual: {formatMinutes(item.data.actual_minutes)}</p>
                                    <p className="text-sm font-semibold">
                                        Remaining: {formatMinutes(item.data.remaining_minutes)}
                                    </p>
                                    <div className="h-2 mt-3 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full bg-gradient-to-r ${item.color} transition-all duration-1000`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-900/20 p-4 flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-300 mt-0.5 shrink-0" />
                        <p className="text-sm text-blue-900 dark:text-blue-100">{plannerData.report?.suggestion}</p>
                    </div>
                </div>

                {plannerData.weekly_timeline?.length > 0 && (
                    <div className="card p-5 sm:p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <CalendarDays className="h-5 w-5 text-primary" />
                            This week
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                            {plannerData.weekly_timeline.map((day) => (
                                <div key={day.date} className="rounded-xl border border-card-border p-3 bg-muted/40">
                                    <p className="text-sm font-semibold">{day.label}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Target {formatMinutes(day.target_minutes)}</p>
                                    <p className="text-sm font-semibold">Done {formatMinutes(day.actual_minutes)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <GoalSetupWizard
                open={showGoalWizard}
                onOpenChange={setShowGoalWizard}
                onGoalSet={() => {
                    fetchDashboardData();
                }}
            />

            <DailyClosingModal
                open={showClosingModal}
                onOpenChange={setShowClosingModal}
                onCloseComplete={() => fetchDashboardData()}
                pendingTasksCount={pendingTasksCount}
            />
        </div>
    );
}
