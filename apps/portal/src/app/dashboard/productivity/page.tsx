'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
    Target, Plus, Clock, TrendingUp, Calendar, CheckCircle2,
    Trash2, Loader2, ChevronRight, X, Zap, BookOpen, Layers
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

const PRESET_HOURS = [10, 20, 30, 50, 75, 100, 150, 200];

export default function ProductivityPage() {
    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddGoal, setShowAddGoal] = useState(false);
    const [saving, setSaving] = useState(false);

    // Syllabus data
    const [exams, setExams] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [chapters, setChapters] = useState<any[]>([]);
    const [topics, setTopics] = useState<any[]>([]);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [loadingChapters, setLoadingChapters] = useState(false);
    const [loadingTopics, setLoadingTopics] = useState(false);

    const [analytics, setAnalytics] = useState<any>(null);

    // Goal form state — fully controlled
    const [selectedExamId, setSelectedExamId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [selectedChapterId, setSelectedChapterId] = useState('');
    const [selectedTopicId, setSelectedTopicId] = useState('');
    const [goalLevel, setGoalLevel] = useState<'subject' | 'chapter' | 'topic'>('subject');
    const [targetHoursInput, setTargetHoursInput] = useState('50');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [goalsRes, examsRes, analyticsRes] = await Promise.all([
                api.get('/study-goals'),
                api.get('/exams'),
                api.get('/analytics/overview').catch(() => ({ data: null }))
            ]);
            setGoals(goalsRes.data);
            setExams(examsRes.data);
            setAnalytics(analyticsRes.data);
        } catch {
            toast.error('Failed to load productivity data');
        } finally {
            setLoading(false);
        }
    };

    // When exam changes → load its subjects
    useEffect(() => {
        if (!selectedExamId) { setSubjects([]); setSelectedSubjectId(''); return; }
        setLoadingSubjects(true);
        api.get(`/exams/${selectedExamId}/subjects`)
            .then(r => { setSubjects(r.data); setSelectedSubjectId(''); setChapters([]); setTopics([]); })
            .catch(() => toast.error('Failed to load subjects'))
            .finally(() => setLoadingSubjects(false));
    }, [selectedExamId]);

    // When subject changes → load its chapters
    useEffect(() => {
        if (!selectedSubjectId) { setChapters([]); setSelectedChapterId(''); return; }
        setLoadingChapters(true);
        api.get(`/subjects/${selectedSubjectId}/chapters`)
            .then(r => { setChapters(r.data); setSelectedChapterId(''); setTopics([]); })
            .catch(() => toast.error('Failed to load chapters'))
            .finally(() => setLoadingChapters(false));
    }, [selectedSubjectId]);

    // When chapter changes → load its topics
    useEffect(() => {
        if (!selectedChapterId) { setTopics([]); setSelectedTopicId(''); return; }
        setLoadingTopics(true);
        api.get(`/chapters/${selectedChapterId}/topics`)
            .then(r => { setTopics(r.data); setSelectedTopicId(''); })
            .catch(() => toast.error('Failed to load topics'))
            .finally(() => setLoadingTopics(false));
    }, [selectedChapterId]);

    const openAddModal = () => {
        setSelectedExamId('');
        setSelectedSubjectId('');
        setSelectedChapterId('');
        setSelectedTopicId('');
        setGoalLevel('subject');
        setTargetHoursInput('50');
        setShowAddGoal(true);
    };

    // Derived: what entity is the goal actually for
    const goalableType = goalLevel === 'topic' ? 'Topic'
        : goalLevel === 'chapter' ? 'Chapter'
        : 'Subject';
    const goalableId = goalLevel === 'topic' ? selectedTopicId
        : goalLevel === 'chapter' ? selectedChapterId
        : selectedSubjectId;

    const handleCreateGoal = async () => {
        const hrs = parseInt(targetHoursInput);
        if (!goalableId) { toast.error('Please select a subject'); return; }
        if (isNaN(hrs) || hrs < 1 || hrs > 500) { toast.error('Target hours must be between 1 and 500'); return; }

        setSaving(true);
        try {
            await api.post('/study-goals', {
                goalable_type: goalableType,
                goalable_id: parseInt(goalableId),
                target_hours: hrs,
            });
            toast.success('Goal saved!');
            setShowAddGoal(false);
            fetchData();
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? 'Failed to save goal');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteGoal = async (id: number) => {
        if (!confirm('Delete this goal?')) return;
        try {
            await api.delete(`/study-goals/${id}`);
            setGoals(p => p.filter(g => g.id !== id));
            toast.success('Goal deleted');
        } catch {
            toast.error('Failed to delete goal');
        }
    };

    const chartData = goals.map(g => ({
        name: g.goalable?.name_en?.slice(0, 12) || 'Goal',
        spent: parseFloat(g.spent_hours) || 0,
        target: g.target_hours
    }));

    const habits = [
        { label: goals.length > 0 ? `${goals.length} Study Goal${goals.length > 1 ? 's' : ''} Active` : 'No Study Goals Set', achieved: goals.length > 0 },
        { label: (analytics?.tests_completed || 0) > 0 ? `${analytics?.tests_completed} Tests Completed` : 'No Tests Attempted Yet', achieved: (analytics?.tests_completed || 0) > 0 },
        { label: (analytics?.overall_accuracy || 0) >= 70 ? `${analytics?.overall_accuracy}% Accuracy — Strong` : 'Accuracy Below 70%', achieved: (analytics?.overall_accuracy || 0) >= 70 },
    ];

    const milestones = goals
        .filter(g => g.target_hours > 0)
        .map(g => ({
            name: g.goalable?.name_en || 'Goal',
            pct: Math.min(100, Math.round(((g.spent_hours || 0) / g.target_hours) * 100)),
            remaining: Math.max(0, g.target_hours - (g.spent_hours || 0)).toFixed(1)
        }))
        .sort((a, b) => b.pct - a.pct)
        .slice(0, 3);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight italic uppercase">Growth Lab</h1>
                    <p className="text-foreground/50 mt-1 font-bold text-sm italic">Track your study hours. Crush your goals.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-600/20 text-[11px] uppercase tracking-widest"
                >
                    <Plus className="h-4 w-4" /> Set New Goal
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Goals Performance */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card-bg border border-card-border rounded-3xl p-8">
                        <h2 className="text-base font-black text-foreground uppercase tracking-tight italic mb-6 flex items-center gap-3">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                            Goal Performance
                        </h2>
                        {chartData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 gap-3 text-foreground/20">
                                <Target className="h-12 w-12" />
                                <p className="text-[11px] font-black uppercase tracking-widest">No goals yet — set your first goal</p>
                            </div>
                        ) : (
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} barGap={4}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--card-border)" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: 'var(--foreground)', opacity: 0.4 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: 'var(--foreground)', opacity: 0.4 }} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                            contentStyle={{ backgroundColor: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--card-border)' }}
                                            itemStyle={{ color: 'var(--foreground)', fontSize: 10, fontWeight: 700 }}
                                        />
                                        <Bar dataKey="spent" name="Spent Hours" radius={[6, 6, 0, 0]} fill="#3b82f6" barSize={32} />
                                        <Bar dataKey="target" name="Target Hours" radius={[6, 6, 0, 0]} fill="var(--card-border)" barSize={16} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    {/* Goal Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {goals.map((goal) => {
                            const pct = goal.target_hours > 0 ? Math.min(100, Math.round(((goal.spent_hours || 0) / goal.target_hours) * 100)) : 0;
                            const remaining = Math.max(0, goal.target_hours - (goal.spent_hours || 0));
                            return (
                                <div key={goal.id} className="group bg-card-bg border border-card-border rounded-3xl p-6 hover:border-blue-500/30 transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="h-10 w-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                            <Target className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <button
                                            onClick={() => handleDeleteGoal(goal.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-xl hover:bg-red-500/10 text-foreground/30 hover:text-red-500 transition-all"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                    <h3 className="font-black text-foreground text-sm uppercase tracking-tight">{goal.goalable?.name_en || 'Goal'}</h3>
                                    <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest mt-0.5">{goal.goalable_type}</p>

                                    <div className="mt-4 flex items-end justify-between">
                                        <div>
                                            <p className="text-2xl font-black text-foreground">
                                                {Math.floor(goal.spent_hours || 0)}h {Math.round(((goal.spent_hours || 0) % 1) * 60)}m
                                            </p>
                                            <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Spent</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-orange-400">{remaining.toFixed(1)}h</p>
                                            <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Left</p>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">{goal.target_hours}h target</span>
                                            <span className="text-[9px] font-black text-blue-500">{pct}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 rounded-full transition-all duration-700"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Add goal CTA if empty */}
                        {goals.length === 0 && (
                            <div
                                onClick={openAddModal}
                                className="cursor-pointer border border-dashed border-card-border rounded-3xl p-8 flex flex-col items-center justify-center gap-3 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all col-span-2"
                            >
                                <Plus className="h-8 w-8 text-foreground/20" />
                                <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Set your first goal</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 h-40 w-40 bg-blue-500/20 rounded-full blur-3xl" />
                        <h2 className="text-base font-black uppercase tracking-tight italic mb-4 relative z-10 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-400" /> Habits Check
                        </h2>
                        <div className="space-y-4 relative z-10">
                            {habits.map((habit, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <CheckCircle2 className={cn("h-4 w-4 shrink-0", habit.achieved ? 'text-green-400' : 'text-gray-600')} />
                                    <span className={cn("text-xs font-bold", habit.achieved ? 'text-white' : 'text-gray-500')}>{habit.label}</span>
                                </div>
                            ))}
                        </div>
                        {analytics && (
                            <div className="mt-6 pt-6 border-t border-white/10 relative z-10 grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-black text-white">{analytics.overall_accuracy ?? 0}%</p>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Accuracy</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-black text-white">{analytics.tests_completed ?? 0}</p>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Tests Done</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-card-bg border border-card-border rounded-3xl p-6">
                        <h2 className="text-[10px] font-black text-foreground uppercase tracking-widest italic mb-5 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-orange-500" /> Milestones
                        </h2>
                        <div className="space-y-4">
                            {milestones.length === 0 ? (
                                <p className="text-[10px] text-foreground/30 font-black italic uppercase tracking-widest">Set goals to see milestones</p>
                            ) : milestones.map((m, i) => (
                                <div key={i} className="p-3 bg-background rounded-2xl border border-card-border">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black text-foreground/60 truncate flex-1">{m.name}</span>
                                        <span className="text-[10px] font-black text-blue-500 ml-2">{m.pct}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${m.pct}%` }} />
                                    </div>
                                    <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest mt-1">{m.remaining}h remaining</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Add Goal Modal ──────────────────────────────────────────────── */}
            {showAddGoal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card-bg rounded-[2rem] shadow-2xl w-full max-w-lg border border-card-border animate-in zoom-in-95 fade-in duration-200">
                        {/* Modal header */}
                        <div className="flex items-center justify-between px-8 pt-8 pb-0">
                            <div>
                                <h2 className="text-xl font-black text-foreground uppercase tracking-tight italic">New Study Goal</h2>
                                <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mt-0.5">Select what you want to track</p>
                            </div>
                            <button onClick={() => setShowAddGoal(false)} className="p-2 rounded-xl hover:bg-foreground/5 text-foreground/30 hover:text-foreground transition-all">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Step 1: Exam */}
                            <div>
                                <label className="text-[10px] font-black text-foreground/50 uppercase tracking-widest mb-2 block flex items-center gap-1.5">
                                    <BookOpen className="h-3 w-3" /> 1. Exam
                                </label>
                                <select
                                    className="w-full bg-background border border-card-border rounded-2xl px-4 py-3 text-[11px] font-black text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={selectedExamId}
                                    onChange={e => setSelectedExamId(e.target.value)}
                                >
                                    <option value="">Select Exam...</option>
                                    {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.name_en}</option>)}
                                </select>
                            </div>

                            {/* Step 2: Subject */}
                            <div>
                                <label className="text-[10px] font-black text-foreground/50 uppercase tracking-widest mb-2 block flex items-center gap-1.5">
                                    <Target className="h-3 w-3" /> 2. Subject
                                    {loadingSubjects && <Loader2 className="h-2.5 w-2.5 animate-spin ml-1" />}
                                </label>
                                <select
                                    className="w-full bg-background border border-card-border rounded-2xl px-4 py-3 text-[11px] font-black text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-40"
                                    value={selectedSubjectId}
                                    disabled={!selectedExamId || loadingSubjects}
                                    onChange={e => { setSelectedSubjectId(e.target.value); setGoalLevel('subject'); setSelectedChapterId(''); setSelectedTopicId(''); }}
                                >
                                    <option value="">Select Subject...</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name_en}</option>)}
                                </select>
                            </div>

                            {/* Step 3: Chapter (optional) */}
                            {selectedSubjectId && chapters.length > 0 && (
                                <div>
                                    <label className="text-[10px] font-black text-foreground/50 uppercase tracking-widest mb-2 block flex items-center gap-1.5">
                                        <Layers className="h-3 w-3" /> 3. Chapter
                                        <span className="text-foreground/20">(optional)</span>
                                        {loadingChapters && <Loader2 className="h-2.5 w-2.5 animate-spin ml-1" />}
                                    </label>
                                    <select
                                        className="w-full bg-background border border-card-border rounded-2xl px-4 py-3 text-[11px] font-black text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-40"
                                        value={selectedChapterId}
                                        disabled={loadingChapters}
                                        onChange={e => { setSelectedChapterId(e.target.value); setGoalLevel(e.target.value ? 'chapter' : 'subject'); setSelectedTopicId(''); }}
                                    >
                                        <option value="">Keep at Subject level</option>
                                        {chapters.map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
                                    </select>
                                </div>
                            )}

                            {/* Step 4: Topic (optional) */}
                            {selectedChapterId && topics.length > 0 && (
                                <div>
                                    <label className="text-[10px] font-black text-foreground/50 uppercase tracking-widest mb-2 block flex items-center gap-1.5">
                                        <ChevronRight className="h-3 w-3" /> 4. Topic
                                        <span className="text-foreground/20">(optional)</span>
                                        {loadingTopics && <Loader2 className="h-2.5 w-2.5 animate-spin ml-1" />}
                                    </label>
                                    <select
                                        className="w-full bg-background border border-card-border rounded-2xl px-4 py-3 text-[11px] font-black text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-40"
                                        value={selectedTopicId}
                                        disabled={loadingTopics}
                                        onChange={e => { setSelectedTopicId(e.target.value); setGoalLevel(e.target.value ? 'topic' : 'chapter'); }}
                                    >
                                        <option value="">Keep at Chapter level</option>
                                        {topics.map(t => <option key={t.id} value={t.id}>{t.name_en}</option>)}
                                    </select>
                                </div>
                            )}

                            {/* Target Hours */}
                            <div>
                                <label className="text-[10px] font-black text-foreground/50 uppercase tracking-widest mb-3 block flex items-center gap-1.5">
                                    <Clock className="h-3 w-3" /> Target Hours
                                </label>
                                {/* Preset buttons */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {PRESET_HOURS.map(h => (
                                        <button
                                            key={h}
                                            type="button"
                                            onClick={() => setTargetHoursInput(String(h))}
                                            className={cn(
                                                "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                                targetHoursInput === String(h)
                                                    ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20"
                                                    : "bg-background text-foreground/50 border-card-border hover:border-blue-500/30 hover:text-foreground"
                                            )}
                                        >
                                            {h}h
                                        </button>
                                    ))}
                                </div>
                                {/* Manual input */}
                                <div className="relative">
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        min="1"
                                        max="500"
                                        placeholder="Custom hours (1–500)"
                                        className="w-full bg-background border border-card-border rounded-2xl px-4 py-3 pr-14 text-[13px] font-black text-foreground placeholder:text-foreground/20 focus:outline-none focus:ring-2 focus:ring-blue-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        value={targetHoursInput}
                                        onChange={(e) => {
                                            const raw = e.target.value;
                                            // Allow empty string while typing
                                            if (raw === '' || raw === '-') {
                                                setTargetHoursInput('');
                                                return;
                                            }
                                            // Only accept positive integers
                                            const n = parseInt(raw, 10);
                                            if (!isNaN(n) && n >= 0) {
                                                setTargetHoursInput(String(Math.min(500, n)));
                                            }
                                        }}
                                        onBlur={() => {
                                            const n = parseInt(targetHoursInput, 10);
                                            if (isNaN(n) || n < 1) setTargetHoursInput('1');
                                            else if (n > 500) setTargetHoursInput('500');
                                        }}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-foreground/30 uppercase tracking-widest">hrs</span>
                                </div>
                            </div>

                            {/* Goal level indicator */}
                            {selectedSubjectId && (
                                <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                                    <Target className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                                        Goal set at: {goalableType} level
                                        {goalableType === 'Subject' && subjects.find(s => s.id == selectedSubjectId)?.name_en && ` — ${subjects.find(s => s.id == selectedSubjectId)?.name_en}`}
                                        {goalableType === 'Chapter' && chapters.find(c => c.id == selectedChapterId)?.name_en && ` — ${chapters.find(c => c.id == selectedChapterId)?.name_en}`}
                                        {goalableType === 'Topic' && topics.find(t => t.id == selectedTopicId)?.name_en && ` — ${topics.find(t => t.id == selectedTopicId)?.name_en}`}
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowAddGoal(false)}
                                    className="flex-1 py-3.5 border border-card-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateGoal}
                                    disabled={saving || !goalableId || !targetHoursInput || parseInt(targetHoursInput) < 1}
                                    className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                    {saving ? 'Saving...' : 'Save Goal'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
