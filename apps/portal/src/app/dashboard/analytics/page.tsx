'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
    Trophy,
    Target,
    Clock,
    TrendingUp,
    TrendingDown,
    Zap,
    AlertTriangle,
    Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function AnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [topics, setTopics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [overviewRes, topicsRes] = await Promise.all([
                api.get('/analytics/overview'),
                api.get('/analytics/topics')
            ]);
            setData(overviewRes.data);
            setTopics(topicsRes.data);
        } catch {
            // data remains null — empty state shown below
        } finally {
            setLoading(false);
        }
    };

    // Use server-provided trend data when available; fall back to an empty array
    // so the chart renders cleanly instead of showing stale hardcoded values.
    const accuracyData: { date: string; score: number }[] = data?.score_trend ?? [];

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            </div>
        );
    }

    const avgTimeSec = data?.stats?.avg_time_per_question_sec;
    const avgTimeDisplay = avgTimeSec != null ? `${avgTimeSec}s` : '—';
    const syllabusCovered = data?.stats?.syllabus_covered_percentage != null
        ? `${data.stats.syllabus_covered_percentage}%`
        : '—';
    const totalTests = data?.stats?.total_tests ?? 0;
    const trend = data?.stats?.accuracy_trend;

    const insights: string[] = [data?.ai_suggestion, data?.ai_time_suggestion].filter(
        (v): v is string => typeof v === 'string' && v.trim().length > 0
    );

    return (
        <div className="space-y-6 pb-12">
            <div>
                <h1 className="page-title">Performance</h1>
                <p className="page-subtitle">How you are doing across all your test attempts.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                    { label: 'Overall accuracy', value: `${data?.stats?.accuracy_percentage ?? 0}%`, icon: Target },
                    { label: 'Tests completed', value: totalTests, icon: Trophy },
                    { label: 'Avg. time per question', value: avgTimeDisplay, icon: Clock },
                    { label: 'Syllabus covered', value: syllabusCovered, icon: Zap },
                ].map((stat, i) => (
                    <div key={i} className="card p-4 sm:p-5">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <stat.icon className="h-4 w-4" />
                            <span>{stat.label}</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Accuracy trend */}
                <div className="lg:col-span-2 card p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3 mb-6">
                        <div>
                            <h2 className="text-lg font-semibold">Accuracy trend</h2>
                            <p className="text-sm text-muted-foreground">Your last few test attempts</p>
                        </div>
                        {trend != null && (
                            <div className={cn(
                                'badge',
                                trend >= 0 ? 'badge-green' : 'badge-amber'
                            )}>
                                {trend >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                                {trend >= 0 ? '+' : ''}{trend}%
                            </div>
                        )}
                    </div>
                    {accuracyData.length > 0 ? (
                        <div className="h-[260px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={accuracyData}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.25)" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} width={32} />
                                    <Tooltip
                                        formatter={(value) => [`${value}%`, 'Accuracy']}
                                        contentStyle={{ borderRadius: '12px', border: '1px solid rgba(148,163,184,0.3)', background: 'var(--card-bg)', color: 'var(--foreground)' }}
                                    />
                                    <Area type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorScore)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[200px] flex flex-col items-center justify-center text-center text-sm text-muted-foreground">
                            <p>No attempts yet. Your accuracy will be charted here after your first test.</p>
                            <Link href="/dashboard/tests" className="btn btn-primary btn-sm mt-4">Start a test</Link>
                        </div>
                    )}
                </div>

                {/* AI feedback */}
                <div className="card p-5 sm:p-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        AI feedback
                    </h2>
                    {insights.length > 0 ? (
                        <ul className="mt-4 space-y-3 text-sm leading-relaxed">
                            {insights.map((line, i) => (
                                <li key={i} className="rounded-xl bg-muted/60 p-3">{line}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-3 text-sm text-muted-foreground">
                            Complete a few more tests and we will summarise your weak areas and time management here.
                        </p>
                    )}
                    <Link href="/dashboard/tests" className="btn btn-secondary w-full mt-5">
                        Practise now
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="card p-5 sm:p-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                        <Zap className="h-5 w-5 text-green-600" />
                        Strong topics
                    </h2>
                    {topics?.strengths?.length ? (
                        <ul className="space-y-2">
                            {topics.strengths.map((topic: any) => (
                                <li key={topic.topic_name} className="flex items-center justify-between gap-3 rounded-xl bg-muted/60 p-3">
                                    <span className="text-sm font-medium">{topic.topic_name}</span>
                                    <span className="text-sm font-semibold text-green-700 dark:text-green-300">{Math.round(topic.accuracy)}%</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">Attempt a few tests to see your strong topics.</p>
                    )}
                </div>

                {/* Weak areas */}
                <div className="card p-5 sm:p-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        Topics to improve
                    </h2>
                    {topics?.weaknesses?.length ? (
                        <ul className="space-y-2">
                            {topics.weaknesses.map((topic: any) => (
                                <li key={topic.topic_name} className="flex items-center justify-between gap-3 rounded-xl bg-muted/60 p-3">
                                    <span className="text-sm font-medium">{topic.topic_name}</span>
                                    <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">{Math.round(topic.accuracy)}%</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">Attempt a few tests to see which topics need more practice.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
