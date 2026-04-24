'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
    Target,
    Plus,
    Clock,
    TrendingUp,
    Calendar,
    CheckCircle2,
    Trash2,
    Loader2
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { cn } from '@/lib/utils';

export default function ProductivityPage() {
    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddGoal, setShowAddGoal] = useState(false);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [chapters, setChapters] = useState<any[]>([]);
    const [topics, setTopics] = useState<any[]>([]);
    const [newGoal, setNewGoal] = useState({
        goalable_type: 'Subject',
        goalable_id: '',
        target_hours: 50
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (newGoal.goalable_type === 'Subject' && newGoal.goalable_id) {
            fetchChapters(parseInt(newGoal.goalable_id));
        }
    }, [newGoal.goalable_id, newGoal.goalable_type]);

    const fetchData = async () => {
        try {
            const [goalsRes, subjectsRes] = await Promise.all([
                api.get('/study-goals'),
                api.get('/exams')
            ]);
            setGoals(goalsRes.data);

            if (subjectsRes.data.length > 0) {
                const firstExamDetails = await api.get(`/exams/${subjectsRes.data[0].id}/subjects`);
                setSubjects(firstExamDetails.data);
                if (firstExamDetails.data.length > 0) {
                    setNewGoal(prev => ({ ...prev, goalable_id: firstExamDetails.data[0].id.toString() }));
                }
            }
        } catch (error) {
            console.error('Failed to fetch productivity data', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchChapters = async (subjectId: number) => {
        try {
            const res = await api.get(`/subjects/${subjectId}/chapters`);
            setChapters(res.data);
            setTopics([]);
        } catch (error) {
            console.error("Failed to fetch chapters", error);
        }
    };

    const fetchTopics = async (chapterId: number) => {
        try {
            const res = await api.get(`/chapters/${chapterId}/topics`);
            setTopics(res.data);
        } catch (error) {
            console.error("Failed to fetch topics", error);
        }
    };

    const handleCreateGoal = async () => {
        try {
            await api.post('/study-goals', newGoal);
            setShowAddGoal(false);
            fetchData();
        } catch (error) {
            alert('Failed to save goal');
        }
    };

    const handleDeleteGoal = async (id: number) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.delete(`/study-goals/${id}`);
            fetchData();
        } catch (error) {
            alert('Failed to delete goal');
        }
    };

    const chartData = goals.map(g => ({
        name: g.goalable?.name_en || 'Subject',
        spent: parseFloat(g.spent_hours) || 0,
        target: g.target_hours
    }));

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight italic uppercase">Productivity Hub</h1>
                    <p className="text-foreground/60 mt-1 font-medium italic">Master your time. Conquer your osdhyan goals.</p>
                </div>
                <button
                    onClick={() => setShowAddGoal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                    <Plus className="h-4 w-4" />
                    Set New Goal
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Goals Progress */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card-bg border border-card-border rounded-3xl p-8 shadow-sm">
                        <h2 className="text-xl font-black text-foreground uppercase tracking-tight italic mb-8 flex items-center gap-3">
                            <TrendingUp className="h-6 w-6 text-accent-blue" />
                            Goal Performance
                        </h2>

                        <div className="h-[400px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--card-border)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--foreground)', opacity: 0.4 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--foreground)', opacity: 0.4 }} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                        contentStyle={{ backgroundColor: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--card-border)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                                        itemStyle={{ color: 'var(--foreground)' }}
                                    />
                                    <Bar dataKey="spent" name="Spent Hours" radius={[4, 4, 0, 0]} fill="var(--accent-blue)" barSize={40} />
                                    <Bar dataKey="target" name="Target Hours" radius={[4, 4, 0, 0]} fill="var(--card-border)" barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {goals.map((goal) => (
                            <div key={goal.id} className="bg-card-bg border border-card-border rounded-3xl p-6 shadow-sm hover:border-accent-blue/30 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                                        <Clock className="h-6 w-6" />
                                    </div>
                                    <button onClick={() => handleDeleteGoal(goal.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg">{goal.goalable?.name_en || 'Goal'}</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Study Goal: {goal.target_hours} Hours</p>

                                <div className="mt-6 flex items-end justify-between">
                                    <div>
                                        <p className="text-2xl font-black text-gray-900">
                                            {Math.floor(goal.spent_hours || 0)}h {Math.round(((goal.spent_hours || 0) % 1) * 60)}m
                                        </p>
                                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Time Dedicated</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-black text-orange-400">
                                            {Math.max(0, goal.target_hours - (goal.spent_hours || 0)).toFixed(1)}h
                                        </p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Remaining</p>
                                    </div>
                                </div>

                                <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(100, (goal.spent_hours / goal.target_hours) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info Sidebar */}
                <div className="space-y-6">
                    <div className="bg-gray-900 rounded-3xl p-8 text-white shadow-xl shadow-gray-200 relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 h-40 w-40 bg-blue-500/20 rounded-full blur-3xl" />
                        <h2 className="text-xl font-black uppercase tracking-tight italic mb-4 relative z-10">osdhyan Habits</h2>
                        <p className="text-gray-400 text-sm italic font-medium leading-relaxed relative z-10 mb-8">
                            "Productivity is never an accident. It is always the result of a commitment to excellence, intelligent planning, and focused effort."
                        </p>

                        <div className="space-y-4 relative z-10">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-400" />
                                <span className="text-sm font-bold">100% Focused Today</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-400" />
                                <span className="text-sm font-bold">PYQ Analysis Done</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card-bg border border-card-border rounded-3xl p-8 shadow-sm">
                        <h2 className="text-sm font-black text-foreground uppercase tracking-widest italic mb-6">Upcoming Milestones</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-card-border">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-orange-600" />
                                    <span className="text-xs font-bold text-foreground/60">Polity Mastery</span>
                                </div>
                                <span className="text-[10px] font-black text-foreground/40">TUE</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Goal Modal */}
            {
                showAddGoal && (
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-card-bg rounded-3xl shadow-2xl w-full max-w-md p-8 border border-card-border">
                            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight italic mb-6">New Study Goal</h2>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">1. Choose Subject</label>
                                        <select
                                            className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-gray-800"
                                            value={newGoal.goalable_type === 'Subject' ? newGoal.goalable_id : (subjects.find(s => s.id)?.id || '')}
                                            onChange={(e) => {
                                                setNewGoal({ ...newGoal, goalable_type: 'Subject', goalable_id: e.target.value });
                                            }}
                                        >
                                            <option value="">Select Subject</option>
                                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name_en}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">2. Choose Chapter (Optional)</label>
                                        <select
                                            className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-gray-800"
                                            value={newGoal.goalable_type === 'Chapter' ? newGoal.goalable_id : ''}
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    setNewGoal({ ...newGoal, goalable_type: 'Chapter', goalable_id: e.target.value });
                                                    fetchTopics(parseInt(e.target.value));
                                                }
                                            }}
                                        >
                                            <option value="">Select Chapter</option>
                                            {chapters.map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">3. Choose Topic (Optional)</label>
                                        <select
                                            className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-gray-800"
                                            value={newGoal.goalable_type === 'Topic' ? newGoal.goalable_id : ''}
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    setNewGoal({ ...newGoal, goalable_type: 'Topic', goalable_id: e.target.value });
                                                }
                                            }}
                                        >
                                            <option value="">Select Topic</option>
                                            {topics.map(t => <option key={t.id} value={t.id}>{t.name_en}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Target Hours (1 - 500)</label>
                                    <input
                                        type="number"
                                        max="500"
                                        className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-gray-800"
                                        value={newGoal.target_hours}
                                        onChange={(e) => setNewGoal({ ...newGoal, target_hours: Math.min(500, parseInt(e.target.value)) })}
                                    />
                                </div>

                                <div className="flex gap-4 mt-8">
                                    <button
                                        onClick={() => setShowAddGoal(false)}
                                        className="flex-1 py-4 font-bold text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-widest text-xs"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreateGoal}
                                        className="flex-1 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all uppercase tracking-widest text-xs"
                                    >
                                        Save Goal
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}
