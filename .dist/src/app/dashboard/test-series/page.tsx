'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
    ChevronRight,
    Search,
    Plus,
    Check,
    Trophy,
    Sparkles,
    Zap,
    ChevronLeft,
    Clock,
    Target,
    ClipboardCheck,
    LayoutDashboard,
    Video,
    BookOpen,
    FileText,
    RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/ThemeProvider';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

type TestSeries = {
    id: number;
    exam_id: number;
    name_en: string;
    name_hi: string;
    description_en: string;
    description_hi: string;
    image: string;
    is_enrolled: boolean;
    exam?: {
        name_en: string;
    };
    stats?: {
        total_tests: number;
        enrolled_count: number;
    }
};

const examCategories = [
    { id: 'all', name: 'All Exams', icon: LayoutDashboard },
    { id: 'state', name: 'State PSC (BPSC)', icon: Trophy },
    { id: 'engineering', name: 'AE & JE Exams', icon: Zap },
    { id: 'regulatory', name: 'Regulatory Body', icon: Target },
    { id: 'banking', name: 'Banking & Insurance', icon: Landmark },
    { id: 'ssc', name: 'SSC & Govt', icon: FileText },
];

export default function TestSeriesHub() {
    const { theme } = useTheme();
    const [series, setSeries] = useState<TestSeries[]>([]);
    const [enrolledSeries, setEnrolledSeries] = useState<TestSeries[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    useEffect(() => {
        fetchSeries();
        fetchEnrolled();
    }, [activeCategory]);

    const fetchSeries = async () => {
        setLoading(true);
        try {
            const res = await api.get('/test-series');
            setSeries(res.data);
        } catch (error) {
            console.error('Failed to fetch test series', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEnrolled = async () => {
        try {
            const res = await api.get('/test-series/enrolled');
            setEnrolledSeries(res.data);
        } catch (error) {
            console.error('Failed to fetch enrolled series', error);
        }
    };

    const handleEnroll = async (id: number) => {
        try {
            await api.post(`/test-series/${id}/enroll`);
            toast.success('Successfully enrolled!');
            fetchSeries();
            fetchEnrolled();
        } catch (error) {
            toast.error('Enrollment failed');
        }
    };

    const filteredSeries = series.filter(s =>
        s.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name_hi.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-1000 pb-20 px-4 md:px-0">
            {/* Header with Search */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <Zap className="h-6 w-6" />
                        </div>
                        <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter italic leading-none">Test <span className="text-blue-600">Series Hub</span></h1>
                    </div>
                    <p className="text-foreground/40 font-black uppercase tracking-widest text-[10px]">Track Missions, Unlock Mastery & Audit Performance</p>
                </div>

                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/20 group-hover:text-blue-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search Exam Test Series..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-card-bg border border-card-border p-5 pl-14 rounded-[2rem] text-sm font-black uppercase tracking-tight focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Your Enrolled Series (Recent Intelligence) */}
            {enrolledSeries.length > 0 && (
                <div className="space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter italic">Your Enrolled <span className="text-blue-600">Missions</span></h2>
                        <Link href="/dashboard/test-series/enrolled" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View All</Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {enrolledSeries.slice(0, 3).map((s) => (
                            <div key={s.id} className="group bg-card-bg border border-card-border p-10 rounded-[3.5rem] shadow-sm hover:shadow-2xl transition-all relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Sparkles className="h-20 w-20 text-blue-600" />
                                </div>
                                <div className="flex justify-between items-start mb-8">
                                    <div className="h-16 w-16 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center shadow-md border border-gray-100 dark:border-white/5 group-hover:scale-110 transition-transform">
                                        <Trophy className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-foreground/40 uppercase tracking-widest bg-white/50 dark:bg-white/5 px-4 py-1.5 rounded-full border border-white/20">
                                        Active Mission
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight italic mb-6 leading-tight min-h-[56px]">
                                    {s.name_en}
                                </h3>
                                <div className="flex items-center justify-between text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-3">
                                    <span>{s.exam?.name_en || 'Exam'}</span>
                                    <span className="text-green-600">Enrolled ✓</span>
                                </div>
                                <Link
                                    href={`/dashboard/test-series/${s.id}`}
                                    className="w-full py-5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.4em] transition-all shadow-xl shadow-cyan-500/20 active:scale-95 block text-center"
                                >
                                    Go To Test Series
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Content Area: Categories + Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Sidebar Categories */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-card-bg border border-card-border rounded-[3rem] p-6 shadow-sm overflow-hidden">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 px-6 mb-6">Series Categories</h3>
                        <div className="space-y-2">
                            {examCategories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={cn(
                                        "w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all",
                                        activeCategory === cat.id
                                            ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20"
                                            : "text-foreground/40 hover:bg-background hover:text-blue-600"
                                    )}
                                >
                                    <cat.icon className="h-4 w-4" />
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Series Grid */}
                <div className="lg:col-span-9 space-y-8">
                    {loading ? (
                        <div className="flex justify-center py-40">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {filteredSeries.map((s) => (
                                <div
                                    key={s.id}
                                    className="bg-card-bg border border-card-border p-8 rounded-[3.5rem] shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="space-y-1">
                                            <span className="text-[8px] font-black text-blue-600 uppercase tracking-[0.2em]">{s.exam?.name_en || 'Exam'}</span>
                                            <h3 className="text-xl font-black text-foreground uppercase tracking-tight italic leading-tight group-hover:text-blue-600 transition-colors">
                                                {s.name_en}
                                            </h3>
                                        </div>
                                        <button
                                            onClick={() => s.is_enrolled ? null : handleEnroll(s.id)}
                                            className={cn(
                                                "h-12 w-12 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95",
                                                s.is_enrolled
                                                    ? "bg-green-500 text-white shadow-green-500/20 cursor-default"
                                                    : "bg-blue-600 text-white shadow-blue-500/20 hover:scale-110"
                                            )}
                                        >
                                            {s.is_enrolled ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-8 mb-8 text-[9px] font-black text-foreground/40 uppercase tracking-widest bg-background/50 p-4 rounded-2xl border border-card-border">
                                        <div className="flex items-center gap-2">
                                            <ClipboardCheck className="h-4 w-4 text-orange-500" />
                                            {s.stats?.total_tests || 0} Mock Tests
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                            {s.stats?.enrolled_count || 0} Enrolled
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        <Link
                                            href={`/dashboard/test-series/${s.id}`}
                                            className="flex-1 py-4 bg-background border border-card-border hover:border-blue-500/30 text-foreground/60 hover:text-blue-600 rounded-[1.5rem] font-black text-[9px] uppercase tracking-[0.2em] transition-all text-center"
                                        >
                                            View Details
                                        </Link>
                                        <button
                                            disabled={s.is_enrolled}
                                            onClick={() => handleEnroll(s.id)}
                                            className={cn(
                                                "flex-1 py-4 rounded-[1.5rem] font-black text-[9px] uppercase tracking-[0.2em] transition-all",
                                                s.is_enrolled
                                                    ? "bg-green-500/10 text-green-600 border border-green-500/20"
                                                    : "bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
                                            )}
                                        >
                                            {s.is_enrolled ? "Enrolled ✓" : "Enroll Now +"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Missing Lucide Icons
function Landmark(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="3" y1="22" x2="21" y2="22" />
            <line x1="6" y1="18" x2="6" y2="11" />
            <line x1="10" y1="18" x2="10" y2="11" />
            <line x1="14" y1="18" x2="14" y2="11" />
            <line x1="18" y1="18" x2="18" y2="11" />
            <polygon points="12 2 20 7 4 7 12 2" />
        </svg>
    )
}
