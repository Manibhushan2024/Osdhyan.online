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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { StudyTimer } from '@/components/dashboard/StudyTimer';
import { GoalSetupWizard } from '@/components/dashboard/GoalSetupWizard';
import { DailyClosingModal } from '@/components/dashboard/DailyClosingModal';
import { useToast } from '@/components/ui/use-toast';

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
        } catch (error) {
            console.error('Data fetch failed', error);
            toast({
                title: 'Dashboard Error',
                description: 'Unable to load latest goal data.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        if (!plannerData || plannerData.today_log?.is_closed) return;

        const checkReminder = () => {
            const now = new Date();
            const isAfterTenPm = now.getHours() >= 22;
            if (!isAfterTenPm || reminderTriggeredRef.current) return;

            reminderTriggeredRef.current = true;
            playReminderTone();
            toast({
                title: 'Close Day Reminder',
                description: 'Please set tomorrow task and close your day plan.',
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
                title: 'Task Update Failed',
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
                title: 'Add Task Failed',
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
                title: 'Task Rescheduled',
                description: `Task moved to ${selectedDate}.`,
            });
        } catch (error) {
            console.error('Reschedule failed', error);
            toast({
                title: 'Reschedule Failed',
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
                title: 'Focus Section Error',
                description: 'Could not add focus section.',
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
                title: 'Timer Start Failed',
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
                title: 'Timer Stop Failed',
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
                title: 'Section Update Failed',
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
                title: 'Delete Failed',
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
                title: 'Reorder Failed',
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

    if (loading || !plannerData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin h-8 w-8 border-4 border-indigo-600 rounded-full border-t-transparent" />
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
            title: 'Daily Focus',
            value: dailyPercent >= 100 ? 'Done' : `${Math.round(dailyPercent)}%`,
            done: dailyPercent >= 100,
        },
        {
            title: 'Weekly Track',
            value: weeklyReport.target_minutes ? `${Math.round(weeklyPercent)}%` : 'No goal',
            done: weeklyPercent >= 100,
        },
        {
            title: 'Monthly Track',
            value: monthlyReport.target_minutes ? `${Math.round(monthlyPercent)}%` : 'No goal',
            done: monthlyPercent >= 100,
        },
    ];

    return (
        <div className="min-h-screen bg-background pb-32">
            <div className="pt-8 px-6 pb-6">
                <div className="flex justify-between items-end gap-4 flex-wrap">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                            Hello, {stats?.user_name || 'Champion'}
                        </h1>
                        <p className="text-gray-500 mt-1 flex items-center gap-2">
                            <Sun className="h-4 w-4 text-amber-500" />
                            Plan. Focus. Close the day strong.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setShowClosingModal(true)}
                        className="rounded-full px-6 border-purple-200 text-purple-700 hover:bg-purple-50"
                    >
                        <Moon className="h-4 w-4 mr-2" />
                        End Day
                    </Button>
                </div>
            </div>

            <div className="px-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {statusCards.map((card) => (
                        <div
                            key={card.title}
                            className={cn(
                                'rounded-2xl border p-4 flex items-center justify-between',
                                card.done ? 'border-green-200 bg-green-50' : 'border-blue-100 bg-white'
                            )}
                        >
                            <div>
                                <p className="text-xs uppercase tracking-widest text-gray-500">{card.title}</p>
                                <p className="text-lg font-bold text-gray-900">{card.value}</p>
                            </div>
                            <div
                                className={cn(
                                    'h-8 w-8 rounded-full flex items-center justify-center',
                                    card.done ? 'bg-green-500' : 'bg-blue-100'
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
                    <div className="xl:col-span-2 bg-white dark:bg-card rounded-[2.5rem] p-6 shadow-sm border border-card-border">
                        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                            <h3 className="text-lg font-bold">Performance Snapshot</h3>
                            <span className="text-xs uppercase tracking-widest text-gray-500">
                                Tests + Accuracy + Study
                            </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                {
                                    title: 'Tests Attempted',
                                    value: `${totalTestsAttempted}`,
                                    subtitle: 'Completed tests',
                                    icon: Trophy,
                                    className: 'bg-amber-50 border-amber-100 text-amber-700',
                                    iconClass: 'bg-amber-100 text-amber-700',
                                },
                                {
                                    title: 'Accuracy',
                                    value: `${overallAccuracy}%`,
                                    subtitle: 'Overall accuracy',
                                    icon: Target,
                                    className: 'bg-blue-50 border-blue-100 text-blue-700',
                                    iconClass: 'bg-blue-100 text-blue-700',
                                },
                                {
                                    title: 'Average Score',
                                    value: `${averageScore}`,
                                    subtitle: 'Across tests',
                                    icon: CheckCircle2,
                                    className: 'bg-emerald-50 border-emerald-100 text-emerald-700',
                                    iconClass: 'bg-emerald-100 text-emerald-700',
                                },
                                {
                                    title: 'Study Streak',
                                    value: `${studyStreak} days`,
                                    subtitle: 'Current streak',
                                    icon: CalendarDays,
                                    className: 'bg-purple-50 border-purple-100 text-purple-700',
                                    iconClass: 'bg-purple-100 text-purple-700',
                                },
                            ].map((item) => (
                                <div key={item.title} className={cn('rounded-2xl border p-4', item.className)}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-[11px] uppercase tracking-widest opacity-70">{item.title}</p>
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
                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                <p className="text-xs uppercase tracking-widest text-gray-500">Today Tests</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{todayTestsCount}</p>
                            </div>
                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                <p className="text-xs uppercase tracking-widest text-gray-500">Today Study</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{todayStudyMinutes} min</p>
                                <p className="text-xs text-gray-500 mt-1">Reading {todayReadingHours}h</p>
                            </div>
                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                <p className="text-xs uppercase tracking-widest text-gray-500">Total Study Time</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{totalStudyMinutes} min</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-card rounded-[2.5rem] p-6 shadow-sm border border-card-border">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Recent Activity</h3>
                            <span className="text-xs uppercase tracking-widest text-gray-500">Last actions</span>
                        </div>

                        {activityFeed.length > 0 ? (
                            <div className="space-y-3">
                                {activityFeed.slice(0, 6).map((activity, index) => {
                                    const durationMinutes = Math.max(1, Math.round((activity.duration_sec || 0) / 60));
                                    return (
                                        <div key={`${activity.type}-${activity.activity_at}-${index}`} className="rounded-xl border border-gray-100 p-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm font-semibold text-gray-900 line-clamp-1">{activity.title}</p>
                                                <span
                                                    className={cn(
                                                        'text-[10px] uppercase tracking-widest rounded-full px-2 py-1',
                                                        activity.type === 'test'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-emerald-100 text-emerald-700'
                                                    )}
                                                >
                                                    {activity.type}
                                                </span>
                                            </div>
                                            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                                                <span>{formatActivityTime(activity.activity_at)}</span>
                                                {activity.type === 'test' ? (
                                                    <span className="font-semibold text-gray-700">
                                                        Score: {activity.score || 0}/{activity.total_marks || 0}
                                                    </span>
                                                ) : (
                                                    <span className="font-semibold text-gray-700">{durationMinutes} min</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">No activity yet. Start a test or study timer.</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StudyTimer onSessionComplete={() => fetchDashboardData()} />

                    <div className="bg-white dark:bg-card rounded-[2.5rem] p-8 shadow-sm border border-card-border relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-500 uppercase tracking-widest">Today&apos;s Target</h3>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                                        {formatMinutes(dailyReport.actual_minutes)}
                                    </span>
                                    <span className="text-gray-400">/ {formatMinutes(dailyReport.target_minutes)}</span>
                                </div>
                                {plannerData.targets?.rollover_minutes > 0 && (
                                    <p className="text-xs mt-2 text-orange-500 font-semibold">
                                        Includes rollover: {formatMinutes(plannerData.targets.rollover_minutes)}
                                    </p>
                                )}
                            </div>
                            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
                                <Target className="h-6 w-6 text-green-600" />
                            </div>
                        </div>

                        <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden mb-4">
                            <div
                                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000 ease-out"
                                style={{ width: `${dailyPercent}%` }}
                            />
                        </div>

                        <div className="flex justify-between text-sm text-gray-500">
                            <span>{dailyPercent.toFixed(0)}% Complete</span>
                            <span>
                                {plannerData.today_log.is_closed
                                    ? 'Day Closed'
                                    : `${formatMinutes(dailyReport.remaining_minutes)} left`}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-card rounded-[2.5rem] p-8 shadow-sm border border-card-border">
                        <div className="flex flex-col gap-4 mb-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold">Today&apos;s Tasks</h3>
                                <p className="text-xs uppercase tracking-widest text-gray-500">
                                    Pending: {pendingTasksCount}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    value={newTaskTitle}
                                    onChange={(event) => setNewTaskTitle(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') {
                                            event.preventDefault();
                                            handleAddTask();
                                        }
                                    }}
                                    placeholder="Add today task..."
                                    className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm"
                                />
                                <select
                                    value={newTaskScope}
                                    onChange={(event) => setNewTaskScope(event.target.value as 'daily' | 'weekly')}
                                    className="rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                </select>
                                <Button size="sm" onClick={handleAddTask} disabled={addingTask || !newTaskTitle.trim()}>
                                    <span className="inline-flex items-center gap-1">
                                        <span>+</span>
                                        <span>Add</span>
                                    </span>
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
                                                ? 'bg-green-50/50 border-green-100'
                                                : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm'
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors',
                                                task.is_completed
                                                    ? 'bg-green-500 border-green-500'
                                                    : 'border-gray-300 group-hover:border-blue-400'
                                            )}
                                        >
                                            {task.is_completed && <CheckCircle2 className="h-4 w-4 text-white" />}
                                        </div>

                                        <span
                                            className={cn(
                                                'text-lg font-medium transition-all flex-1',
                                                task.is_completed ? 'text-gray-400 line-through' : 'text-gray-700'
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
                                                className="h-9 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
                                            >
                                                <RotateCcw className="h-3.5 w-3.5" />
                                                Move
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <p>No tasks set for today. Add one to get started.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />

                        <h3 className="text-white/70 font-medium uppercase tracking-widest mb-2">Monthly Goal</h3>
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
                                <div className="rounded-xl bg-orange-500/20 border border-orange-300/20 p-3 text-xs">
                                    Overdue tasks waiting: {plannerData.overdue_tasks_count}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-card rounded-[2.5rem] p-8 shadow-sm border border-card-border">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold">Weekly Tasks</h3>
                        <p className="text-xs uppercase tracking-widest text-gray-500">
                            Pending: {pendingWeeklyTasksCount}
                        </p>
                    </div>

                    {weeklyTasks.length > 0 ? (
                        <div className="space-y-3">
                            {weeklyTasks.map((task) => (
                                <div
                                    key={task.id}
                                    onClick={() => handleTaskToggle(task.id)}
                                    className={cn(
                                        'flex items-center gap-3 rounded-xl border p-3 cursor-pointer',
                                        task.is_completed
                                            ? 'border-green-100 bg-green-50/60'
                                            : 'border-gray-100 hover:border-blue-200'
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'h-5 w-5 rounded-full border-2 flex items-center justify-center',
                                            task.is_completed ? 'border-green-500 bg-green-500' : 'border-gray-300'
                                        )}
                                    >
                                        {task.is_completed && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                                    </div>
                                    <span className={cn(
                                        'flex-1 text-sm font-medium',
                                        task.is_completed ? 'line-through text-gray-400' : 'text-gray-700'
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
                                            className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
                                        >
                                            Move
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400">No weekly tasks yet. Add one using the Weekly option.</p>
                    )}
                </div>

                <div className="bg-white dark:bg-card rounded-[2.5rem] p-8 shadow-sm border border-card-border">
                    <div className="flex items-center justify-between gap-3 mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Clock3 className="h-5 w-5 text-indigo-600" />
                            Section Timers
                        </h3>
                        {activeSectionSession ? (
                            <span className="text-xs uppercase tracking-widest text-emerald-600 font-semibold">
                                Running: {formatSeconds(activeSectionElapsed)}
                            </span>
                        ) : (
                            <span className="text-xs uppercase tracking-widest text-gray-500">No active section</span>
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
                            placeholder="Add chapter/topic/task section..."
                            className="md:col-span-2 rounded-xl border border-gray-200 px-3 py-2 text-sm"
                        />
                        <select
                            value={newSectionType}
                            onChange={(event) => setNewSectionType(event.target.value as 'chapter' | 'topic' | 'task')}
                            className="rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white"
                        >
                            <option value="chapter">Chapter</option>
                            <option value="topic">Topic</option>
                            <option value="task">Task</option>
                        </select>
                        <select
                            value={newSectionParentId ?? ''}
                            onChange={(event) => setNewSectionParentId(event.target.value ? Number(event.target.value) : null)}
                            className="rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white"
                        >
                            <option value="">Auto Parent (Today)</option>
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
                            className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                        />
                        <div className="flex gap-2">
                            <input
                                type="number"
                                min={1}
                                value={newSectionTarget}
                                onChange={(event) => setNewSectionTarget(Math.max(1, Number(event.target.value) || 1))}
                                className="w-20 rounded-xl border border-gray-200 px-2 py-2 text-sm"
                            />
                            <Button
                                size="sm"
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
                                            isRunning ? 'border-emerald-300 bg-emerald-50/40' : 'border-gray-100 bg-gray-50/50'
                                        )}
                                        style={{ marginLeft: `${Math.min(depth, 4) * 16}px` }}
                                    >
                                        <div className="flex items-center justify-between gap-3 flex-wrap">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{section.title}</p>
                                                <p className="text-xs uppercase tracking-widest text-gray-500">
                                                    {section.node_type}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isRunning ? (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleStopSectionTimer(section.id)}
                                                        className="border-red-200 text-red-600 hover:bg-red-50"
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
                                                    className="h-8 w-8 rounded border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 inline-flex items-center justify-center"
                                                    title="Move Up"
                                                >
                                                    <ChevronUp className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleMoveSection(section.id, 'down')}
                                                    className="h-8 w-8 rounded border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 inline-flex items-center justify-center"
                                                    title="Move Down"
                                                >
                                                    <ChevronDown className="h-4 w-4" />
                                                </button>
                                                {section.status === 'completed' ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSectionStatus(section.id, 'active')}
                                                        className="h-8 px-2 rounded border border-gray-200 text-xs text-gray-600 hover:border-blue-300 hover:text-blue-600"
                                                    >
                                                        Reopen
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSectionStatus(section.id, 'completed')}
                                                        className="h-8 px-2 rounded border border-green-200 text-xs text-green-700 hover:bg-green-50"
                                                    >
                                                        Complete
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteSection(section.id)}
                                                    className="h-8 w-8 rounded border border-red-200 text-red-600 hover:bg-red-50 inline-flex items-center justify-center"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mt-3 h-2 bg-white rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="mt-2 text-xs text-gray-600 flex items-center justify-between">
                                            <span>Spent: {formatMinutes(section.spent_minutes)}</span>
                                            <span>Target: {formatMinutes(section.target_minutes)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400">No section timers yet. Add a chapter/topic/task and start the timer.</p>
                    )}
                </div>

                <div className="bg-white dark:bg-card rounded-[2.5rem] p-8 shadow-sm border border-card-border">
                    <div className="flex items-center justify-between gap-3 mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-amber-500" />
                            Report: Target vs Actual
                        </h3>
                        <span className="text-xs uppercase tracking-widest text-gray-500">Daily / Weekly / Monthly</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { label: 'Daily', data: dailyReport, color: 'from-emerald-400 to-green-500' },
                            { label: 'Weekly', data: weeklyReport, color: 'from-blue-400 to-indigo-500' },
                            { label: 'Monthly', data: monthlyReport, color: 'from-purple-400 to-pink-500' },
                        ].map((item) => {
                            const progress = minutesPercent(item.data.actual_minutes, item.data.target_minutes);
                            return (
                                <div key={item.label} className="rounded-2xl border border-gray-100 p-5 bg-gray-50/70">
                                    <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">{item.label}</p>
                                    <p className="text-sm text-gray-600">Target: {formatMinutes(item.data.target_minutes)}</p>
                                    <p className="text-sm text-gray-600">Actual: {formatMinutes(item.data.actual_minutes)}</p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        Remaining: {formatMinutes(item.data.remaining_minutes)}
                                    </p>
                                    <div className="h-2 mt-3 bg-white rounded-full overflow-hidden">
                                        <div
                                            className={`h-full bg-gradient-to-r ${item.color} transition-all duration-1000`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                        <p className="text-sm text-blue-900">{plannerData.report?.suggestion}</p>
                    </div>
                </div>

                {plannerData.weekly_timeline?.length > 0 && (
                    <div className="bg-white dark:bg-card rounded-[2.5rem] p-8 shadow-sm border border-card-border">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <CalendarDays className="h-5 w-5 text-indigo-600" />
                            Weekly Timeline
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                            {plannerData.weekly_timeline.map((day) => (
                                <div key={day.date} className="rounded-xl border border-gray-100 p-3 bg-gray-50/70">
                                    <p className="text-xs uppercase tracking-widest text-gray-500">{day.label}</p>
                                    <p className="text-sm text-gray-700 mt-1">T: {formatMinutes(day.target_minutes)}</p>
                                    <p className="text-sm text-gray-900 font-semibold">A: {formatMinutes(day.actual_minutes)}</p>
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
