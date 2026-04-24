'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    BookOpen,
    Rocket,
    Clock,
    TrendingUp,
    Loader2,
    ChevronRight,
    Activity
} from 'lucide-react';
import axios from '@/lib/api';
import { cn } from '@/lib/utils';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/admin/analytics/overview');
                setData(response.data);
            } catch (error) {
                console.error('Failed to fetch admin stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Synching Data Vectors...</p>
            </div>
        );
    }

    const statsCards = [
        { label: 'Total Students', value: data.stats.total_students, trend: `+${data.stats.new_students_today} today`, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Global Attempts', value: data.stats.total_attempts, trend: `+${data.stats.attempts_today} today`, icon: Rocket, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        { label: 'Study Hours', value: `${data.stats.total_study_hours}h`, trend: 'Lifetime Focus', icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Live Courses', value: data.stats.total_subjects, trend: `${data.stats.total_tests} Tests live`, icon: BookOpen, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header Description */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">Command Overview</h2>
                    <p className="text-[9px] font-black text-indigo-400/50 uppercase tracking-widest mt-1">Real-time Global Ecosystem Metrics</p>
                </div>
                <div className="h-px flex-1 mx-8 bg-gradient-to-r from-indigo-500/20 to-transparent" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((stat, i) => (
                    <div key={i} className="bg-white/[0.03] border border-white/10 p-8 rounded-[2rem] group hover:border-indigo-500/30 transition-all duration-500 relative overflow-hidden">
                        <div className={cn("absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-10 rounded-full -mr-8 -mt-8", stat.bg)} />

                        <div className="flex justify-between items-start relative z-10">
                            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border border-white/5", stat.bg, stat.color)}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-3xl font-black text-white tracking-tighter italic mt-1">{stat.value}</p>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/40">
                            <TrendingUp className="h-3 w-3 text-emerald-500" />
                            {stat.trend}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Acquisition Chart */}
                <div className="lg:col-span-2 bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Student Acquisition</h3>
                            <p className="text-[8px] font-black text-indigo-400/50 uppercase tracking-widest mt-1">Last 7 Days Growth Curve</p>
                        </div>
                        <Activity className="h-5 w-5 text-indigo-500/50" />
                    </div>

                    <div className="h-80 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.acquisition_trend}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#475569"
                                    fontSize={8}
                                    tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { weekday: 'short' })}
                                />
                                <YAxis stroke="#475569" fontSize={8} />
                                <Tooltip
                                    contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', fontSize: '10px' }}
                                    itemStyle={{ color: '#818cf8', fontWeight: '900' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Global Activity */}
                <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-10 flex flex-col">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8">Global Activity</h3>

                    <div className="space-y-6 flex-1">
                        {data.recent_activity.map((act: any, i: number) => (
                            <div key={i} className="flex items-center gap-4 group cursor-default">
                                <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                    <span className="text-[8px] font-black text-indigo-400 uppercase">{act.user_name.substring(0, 2)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black text-white tracking-tight uppercase truncate">{act.user_name}</p>
                                    <p className="text-[8px] font-black text-indigo-400/50 uppercase tracking-widest truncate">{act.test_title}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-emerald-500 italic">+{act.total_score}</p>
                                    <p className="text-[7px] font-black text-white/20 uppercase">
                                        {new Date(act.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="mt-10 w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[8px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2 group">
                        Live Monitor Active
                        <span className="h-1 w-1 rounded-full bg-emerald-500 animate-ping" />
                    </button>
                </div>
            </div>
        </div>
    );
}
