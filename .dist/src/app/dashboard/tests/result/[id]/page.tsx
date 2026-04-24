'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
    ChevronLeft,
    ChevronRight,
    Trophy,
    CheckCircle2,
    XCircle,
    Clock,
    Target,
    Zap,
    Sparkles,
    BarChart3,
    ArrowUpRight,
    TrendingUp,
    MessageSquare,
    ClipboardCheck,
    Download,
    Share2,
    RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from 'recharts';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

type SectionStat = {
    correct: number;
    incorrect: number;
    total: number;
    marks: number;
};

type Attempt = {
    id: number;
    total_score: number;
    completed_at: string;
    time_taken_sec: number;
    metadata: {
        correct_count: number;
        incorrect_count: number;
        accuracy: number;
        sectional_stats: Record<string, SectionStat>;
    };
    test: {
        name_en: string;
        total_marks: number;
    }
};

export default function TestResult() {
    const params = useParams();
    const router = useRouter();
    const [attempt, setAttempt] = useState<Attempt | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResult();
    }, [params.id]);

    const fetchResult = async () => {
        try {
            const res = await api.get(`/attempts/${params.id}`);
            setAttempt(res.data);
        } catch (error) {
            console.error('Failed to fetch result', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        window.print();
    };

    const handleShare = async () => {
        if (!attempt) return;
        const shareData = {
            title: `Mission Debrief: ${attempt.test.name_en}`,
            text: `I just scored ${attempt.total_score}/${attempt.test.total_marks} in ${attempt.test.name_en}! Check out my performance on OSDHYAN.`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard!');
            } catch (err) {
                toast.error('Failed to copy link');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-6">
                <div className="h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40">Auditing Performance Payload...</p>
            </div>
        );
    }

    if (!attempt) return null;

    const pieData = [
        { name: 'Correct', value: attempt.metadata.correct_count, color: '#10b981' },
        { name: 'Incorrect', value: attempt.metadata.incorrect_count, color: '#ef4444' },
        { name: 'Unattempted', value: (Object.values(attempt.metadata.sectional_stats).reduce((acc, s) => acc + s.total, 0) - (attempt.metadata.correct_count + attempt.metadata.incorrect_count)), color: '#6b7280' }
    ];

    const sectionalData = Object.entries(attempt.metadata.sectional_stats).map(([name, stat]) => ({
        name,
        Score: stat.marks,
        Accuracy: Math.round((stat.correct / (stat.correct + stat.incorrect || 1)) * 100)
    }));

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20 px-4 md:px-0 animate-in fade-in duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                        <Link href="/dashboard/test-series" className="hover:text-blue-600 transition-colors">Test Series</Link>
                        <ChevronRight className="h-3 w-3" />
                        <span>Mission Summary</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-foreground uppercase tracking-tighter italic leading-none">
                        Mission <span className="text-blue-600">Debrief</span>
                    </h1>
                </div>

                <div className="flex items-center gap-4 print:hidden">
                    <button
                        onClick={handleDownload}
                        className="p-4 bg-card-bg border border-card-border rounded-2xl hover:bg-background transition-all text-foreground/40 hover:text-blue-600"
                    >
                        <Download className="h-5 w-5" />
                    </button>
                    <button
                        onClick={handleShare}
                        className="p-4 bg-card-bg border border-card-border rounded-2xl hover:bg-background transition-all text-foreground/40 hover:text-blue-600"
                    >
                        <Share2 className="h-5 w-5" />
                    </button>
                    <Link
                        href={`/dashboard/tests/play/${attempt.id}`}
                        className="px-10 py-4 bg-blue-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 flex items-center gap-3"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Re-attempt
                    </Link>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Score Big Card */}
                <div className="lg:col-span-4 bg-card-bg border border-card-border p-12 rounded-[4rem] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Trophy className="h-40 w-40 text-blue-600" />
                    </div>
                    <div className="space-y-10 relative z-10">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em]">Total Mission Score</p>
                            <h2 className="text-7xl font-black text-foreground tracking-tighter italic">
                                {attempt.total_score}<span className="text-blue-600 text-3xl"> / {attempt.test.total_marks}</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <p className="text-[8px] font-black text-green-500 uppercase tracking-widest">Accuracy</p>
                                <p className="text-2xl font-black text-foreground">{attempt.metadata.accuracy}%</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest">Mission Time</p>
                                <p className="text-2xl font-black text-foreground">{Math.floor(attempt.time_taken_sec / 60)}m {attempt.time_taken_sec % 60}s</p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-card-border print:hidden">
                            <Link href={`/dashboard/tests/solutions/${attempt.id}`} className="w-full py-5 bg-background border border-card-border rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:border-blue-500/30 hover:text-blue-600 transition-all group/btn">
                                Detailed Solutions
                                <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Accuracy Chart */}
                <div className="lg:col-span-8 bg-card-bg border border-card-border p-12 rounded-[4rem] shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-black text-foreground uppercase tracking-tight italic">Precision <span className="text-blue-600">Dynamics</span></h3>
                        <div className="flex gap-4">
                            {pieData.map((d, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-foreground/40">{d.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sectionalData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 9, fontWeight: 900, fill: 'rgba(255,255,255,0.4)' }}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: 'rgba(255,255,255,0.4)' }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                    contentStyle={{ background: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                                />
                                <Bar dataKey="Accuracy" radius={[10, 10, 0, 0]}>
                                    {sectionalData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.Accuracy > 70 ? '#10b981' : entry.Accuracy > 40 ? '#3b82f6' : '#ef4444'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Sectional Performance */}
            <div className="space-y-8">
                <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter italic">Sectional <span className="text-blue-600">Intelligence</span></h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Object.entries(attempt.metadata.sectional_stats).map(([name, stat]) => (
                        <div key={name} className="bg-card-bg border border-card-border p-10 rounded-[3.5rem] shadow-sm group hover:border-blue-500/20 transition-all">
                            <div className="flex justify-between items-start mb-8">
                                <h4 className="text-lg font-black text-foreground uppercase tracking-tight italic leading-tight max-w-[150px]">{name}</h4>
                                <div className={cn(
                                    "px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                                    stat.correct / stat.total > 0.7 ? "bg-green-500/10 text-green-600" : "bg-blue-500/10 text-blue-600"
                                )}>
                                    {Math.round((stat.correct / stat.total) * 100)}% Match
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-foreground/40">
                                        <span>Accuracy Grid</span>
                                        <span>{stat.correct} / {stat.total}</span>
                                    </div>
                                    <div className="h-2 bg-background rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                                            style={{ width: `${(stat.correct / stat.total) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-background rounded-2xl border border-card-border space-y-1">
                                        <p className="text-[7px] font-black text-foreground/20 uppercase tracking-widest">Correct</p>
                                        <p className="text-xl font-black text-green-500">{stat.correct}</p>
                                    </div>
                                    <div className="p-4 bg-background rounded-2xl border border-card-border space-y-1">
                                        <p className="text-[7px] font-black text-foreground/20 uppercase tracking-widest">Incorrect</p>
                                        <p className="text-xl font-black text-red-500">{stat.incorrect}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Insights Placeholder */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-1 rounded-[4rem] shadow-2xl shadow-blue-500/20 animate-pulse">
                <div className="bg-background rounded-[3.8rem] p-12 flex flex-col lg:flex-row items-center justify-between gap-12">
                    <div className="space-y-4 text-center lg:text-left">
                        <div className="flex items-center justify-center lg:justify-start gap-4">
                            <Sparkles className="h-8 w-8 text-blue-600" />
                            <h3 className="text-3xl font-black text-foreground uppercase tracking-tighter italic">Selection <span className="text-blue-600">Guarantee Analysis</span></h3>
                        </div>
                        <p className="text-sm font-bold text-foreground/40 uppercase tracking-widest max-w-xl">
                            Our selection engine is computing your current probability based on this mission and 45 other parameters.
                        </p>
                    </div>
                    <button className="px-12 py-6 bg-blue-600 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4">
                        Unlock AI Report
                        <ArrowUpRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body { background: white; color: black; }
                    .print\\:hidden { display: none !important; }
                    /* Force background colors to print */
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            `}</style>
        </div>
    );
}
