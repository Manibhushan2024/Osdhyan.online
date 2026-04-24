'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import {
    Trophy,
    Target,
    Clock,
    TrendingUp,
    Zap,
    AlertTriangle,
    BrainCircuit,
    ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
        } catch (error) {
            console.error('Failed to fetch analytics', error);
        } finally {
            setLoading(false);
        }
    };

    const accuracyData = [
        { date: 'Mon', score: 65 },
        { date: 'Tue', score: 72 },
        { date: 'Wed', score: 68 },
        { date: 'Thu', score: 85 },
        { date: 'Fri', score: 77 },
        { date: 'Sat', score: 82 },
        { date: 'Sun', score: 90 },
    ];

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Performance Insights</h1>
                <p className="mt-2 text-gray-600">Deep dive into your test performance with AI-powered analysis.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Overall Accuracy', value: `${data?.stats?.accuracy_percentage || 0}%`, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Tests Completed', value: data?.stats?.total_tests || 0, icon: Trophy, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Avg. Time/Question', value: '45s', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Syllabus Covered', value: '34%', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className={cn("p-3 rounded-xl", stat.bg)}>
                            <stat.icon className={cn("h-6 w-6", stat.color)} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Accuracy Trend */}
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Accuracy Trend</h2>
                            <p className="text-sm text-gray-500">Your performance over the last 7 days</p>
                        </div>
                        <div className="flex items-center gap-1 text-green-600 text-sm font-bold bg-green-50 px-2.5 py-1 rounded-full">
                            <TrendingUp className="h-4 w-4" />
                            +12%
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={accuracyData}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI Suggestions */}
                <div className="bg-blue-600 p-8 rounded-2xl shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <BrainCircuit className="h-24 w-24 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <BrainCircuit className="h-6 w-6" />
                        AI Smart Recommendation
                    </h2>
                    <div className="space-y-6 relative z-10">
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                            <h3 className="text-blue-100 text-sm font-bold mb-1 uppercase tracking-wider">Top Priority</h3>
                            <p className="text-white font-medium">Focus on **Bihar Geography**. Your accuracy fell by 15% in the last test.</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                            <h3 className="text-blue-100 text-sm font-bold mb-1 uppercase tracking-wider">Time Strategy</h3>
                            <p className="text-white font-medium">You are spending too long on **Mathematics**. Try the 'Elimination Method' for PYQs.</p>
                        </div>
                        <button className="w-full bg-white text-blue-600 font-bold py-3 rounded-xl shadow-md hover:bg-blue-50 transition-colors">
                            Start Practice Session
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Topic Strengths */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="h-8 w-8 bg-green-50 rounded-lg flex items-center justify-center">
                            <Zap className="h-5 w-5 text-green-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Your Strengths</h2>
                    </div>
                    <div className="space-y-4">
                        {topics?.strengths?.map((topic: any) => (
                            <div key={topic.topic_name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <span className="font-semibold text-gray-800">{topic.topic_name}</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-bold text-green-600">{Math.round(topic.accuracy)}% Accuracy</span>
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Areas for Improvement */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="h-8 w-8 bg-red-50 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Weak Areas</h2>
                    </div>
                    <div className="space-y-4">
                        {topics?.weaknesses?.map((topic: any) => (
                            <div key={topic.topic_name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <span className="font-semibold text-gray-800">{topic.topic_name}</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-bold text-red-600">{Math.round(topic.accuracy)}% Accuracy</span>
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
