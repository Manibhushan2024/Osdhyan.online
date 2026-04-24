'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    Target,
    ClipboardCheck,
    Zap,
    Sparkles,
    Trophy,
    CheckCircle2,
    Lock,
    PlayCircle,
    Info,
    Calendar,
    Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/ThemeProvider';
import Link from 'next/link';

type Test = {
    id: number;
    name_en: string;
    name_hi: string;
    category: string;
    duration_sec: number;
    total_marks: number;
    status: string;
    is_locked?: boolean;
    questions_count?: number;
};

type TestSeries = {
    id: number;
    name_en: string;
    name_hi: string;
    description_en: string;
    exam: { name_en: string };
};

export default function TestSeriesDetail() {
    const params = useParams();
    const { theme } = useTheme();
    const [series, setSeries] = useState<TestSeries | null>(null);
    const [content, setContent] = useState<Record<string, Test[]>>({});
    const [activeTab, setActiveTab] = useState('full_test');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchDetail();
    }, [params.id]);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/test-series/${params.id}`);
            setSeries(res.data.series);
            setContent(res.data.content);
            // Set first available category as active tab
            const categories = Object.keys(res.data.content);
            if (categories.length > 0 && !categories.includes(activeTab)) {
                setActiveTab(categories[0]);
            }
        } catch (error) {
            console.error('Failed to fetch series detail', error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'full_test', name: 'Mock Tests', icon: ClipboardCheck },
        { id: 'pyq', name: 'Previous Year Papers', icon: Calendar },
        { id: 'chapter_test', name: 'Chapter Tests', icon: Target },
        { id: 'subject_test', name: 'Subject Tests', icon: Trophy },
        { id: 'mega_live', name: 'Live Tests', icon: Zap },
    ];

    // Filter available tabs based on content
    const availableTabs = tabs.filter(t => content[t.id] && content[t.id].length > 0);

    const currentTests = content[activeTab] || [];
    const filteredTests = currentTests.filter(t =>
        t.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.name_hi.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center py-40">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-1000 pb-20 px-4 md:px-0">
            {/* Breadcrumbs & Back */}
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                <Link href="/dashboard/test-series" className="hover:text-blue-600 transition-colors">Test Series Hub</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground/80">{series?.name_en}</span>
            </div>

            {/* Hero Section */}
            <div className="bg-card-bg border border-card-border p-12 rounded-[4rem] shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Sparkles className="h-40 w-40 text-blue-600" />
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 relative z-10">
                    <div className="space-y-6 flex-1">
                        <div className="flex items-center gap-4">
                            <span className="bg-blue-600 text-white text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                                {series?.exam.name_en}
                            </span>
                            <div className="flex items-center gap-2 text-[9px] font-black text-foreground/40 uppercase tracking-widest">
                                <Zap className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                206.1k Enrolled
                            </div>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-foreground uppercase tracking-tighter italic leading-none">
                            {series?.name_en}
                        </h1>
                        <p className="text-sm font-bold text-foreground/40 uppercase tracking-widest leading-relaxed max-w-2xl">
                            {series?.description_en || "Complete preparation package including full mocks, chapter-wise tests and detailed year-wise analysis."}
                        </p>
                    </div>

                    <div className="bg-background/50 backdrop-blur-md p-8 rounded-[3rem] border border-card-border shrink-0 min-w-[300px] space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-foreground/40">
                                <span>Total Tests</span>
                                <span className="text-foreground">630+</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-foreground/40">
                                <span>Free Tests</span>
                                <span className="text-green-600">5 Tests</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-foreground/40">
                                <span>Validity</span>
                                <span className="text-foreground">12 Months</span>
                            </div>
                        </div>
                        <button className="w-full py-5 bg-green-500 hover:bg-green-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.4em] transition-all shadow-xl shadow-green-500/20 active:scale-95">
                            Unlocked with Pass
                        </button>
                    </div>
                </div>
            </div>

            {/* Search & Tabs */}
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="bg-card-bg border border-card-border p-3 rounded-[3rem] shadow-sm flex items-center gap-2 overflow-x-auto no-scrollbar">
                        {availableTabs.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={cn(
                                    "flex items-center gap-3 px-8 py-4 rounded-[2rem] text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                    activeTab === t.id
                                        ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20"
                                        : "text-foreground/40 hover:bg-background hover:text-blue-600"
                                )}
                            >
                                <t.icon className="h-4 w-4" />
                                {t.name}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-hover:text-blue-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search in these tests..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-card-bg border border-card-border p-4 pl-12 rounded-[2rem] text-[10px] font-black uppercase tracking-tight focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Test List */}
                <div className="grid grid-cols-1 gap-6">
                    {filteredTests.length > 0 ? filteredTests.map((t) => (
                        <div
                            key={t.id}
                            className="bg-card-bg border border-card-border p-10 rounded-[4rem] shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-12"
                        >
                            <div className="space-y-6 flex-1">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-2xl font-black text-foreground uppercase tracking-tight italic leading-tight group-hover:text-blue-600 transition-colors">
                                        {t.name_en}
                                    </h3>
                                    <span className="flex items-center gap-2 text-[9px] font-black text-foreground/40 uppercase tracking-widest bg-background border border-card-border px-4 py-1.5 rounded-full">
                                        <Info className="h-3 w-3 text-blue-500" />
                                        Solutions Included
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-10">
                                    <div className="flex items-center gap-3 text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                                        <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-white/5 flex items-center justify-center">
                                            <ClipboardCheck className="h-4 w-4 text-blue-600" />
                                        </div>
                                        {t.questions_count || 100} Questions
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                                        <div className="h-8 w-8 rounded-xl bg-orange-50 dark:bg-white/5 flex items-center justify-center">
                                            <Clock className="h-4 w-4 text-orange-500" />
                                        </div>
                                        {Math.floor(t.duration_sec / 60)} Mins
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                                        <div className="h-8 w-8 rounded-xl bg-green-50 dark:bg-white/5 flex items-center justify-center">
                                            <Target className="h-4 w-4 text-green-600" />
                                        </div>
                                        {t.total_marks} Marks
                                    </div>
                                </div>
                            </div>

                            <div className="shrink-0 flex flex-col items-center gap-4">
                                <Link
                                    href={`/dashboard/tests/play/${t.id}`}
                                    className="px-16 py-6 bg-cyan-500 hover:bg-cyan-600 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] transition-all shadow-xl shadow-cyan-500/20 active:scale-95 flex items-center gap-4 group/btn"
                                >
                                    Start Mission
                                    <PlayCircle className="h-5 w-5 group-hover/btn:scale-110 transition-transform" />
                                </Link>
                                <span className="text-[9px] font-black text-foreground/20 uppercase tracking-[0.3em]">Last Attempted: Never</span>
                            </div>
                        </div>
                    )) : (
                        <div className="py-40 flex flex-col items-center justify-center text-center space-y-6 bg-card-bg border border-dashed border-card-border rounded-[4rem]">
                            <Target className="h-16 w-16 text-foreground/10" />
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight italic">No Missions in this Sector</h3>
                                <p className="text-sm font-bold text-foreground/40 uppercase tracking-widest">More tests will be added soon as per the exam schedule.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
