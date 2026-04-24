'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
    ChevronRight,
    Clock,
    FileText,
    Trophy,
    PlayCircle,
    CheckCircle2,
    Lock,
    Search,
    LayoutDashboard,
    Video,
    ClipboardCheck,
    BookOpen,
    RotateCcw,
    Sparkles,
    Zap,
    Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTheme } from '@/components/providers/ThemeProvider';
import Link from 'next/link';

type Test = {
    id: number;
    name_en: string;
    name_hi: string;
    mode: 'chapter' | 'subject' | 'full_mock';
    duration_sec: number;
    total_marks: number;
    status: string;
    is_locked?: boolean;
};
const categories = [
    { id: 'all', name: 'All', icon: LayoutDashboard },
    { id: 'live', name: 'Live Tests', icon: Video, badge: 'NEW' },
    { id: 'full_mock', name: 'Full Mock Tests', icon: ClipboardCheck },
    { id: 'subject', name: 'Subject Tests', icon: BookOpen },
    { id: 'chapter', name: 'Chapter Tests', icon: RotateCcw },
    { id: 'pyp', name: 'Prev. Year Papers', icon: FileText },
];

export default function TestSeriesPage() {
    const { theme } = useTheme();
    const [tests, setTests] = useState<Test[]>([]);
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchTests();
    }, [activeTab]);

    const fetchTests = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (activeTab !== 'all') {
                params.mode = activeTab;
            }
            const res = await api.get('/tests', { params });
            setTests(res.data);
        } catch (error) {
            console.error('Failed to fetch tests', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTests = tests.filter(test =>
        test.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.name_hi.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-1000 pb-20 px-4 md:px-0">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <Trophy className="h-6 w-6" />
                        </div>
                        <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter italic leading-none">Intelligence <span className="text-blue-600">Hub</span></h1>
                    </div>
                    <p className="text-foreground/40 font-black uppercase tracking-widest text-[10px]">Access 50,000+ Mock Tests & Selection Audits</p>
                </div>

                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/20 group-hover:text-blue-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search for Exams, Subjects or Papers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-card-bg border border-card-border p-5 pl-14 rounded-[2rem] text-sm font-black uppercase tracking-tight focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Premium Category Navigation */}
            <div className="bg-card-bg border border-card-border p-4 rounded-[3rem] shadow-sm overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-3 min-w-[800px]">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            className={cn(
                                "flex items-center gap-3 px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all relative group",
                                activeTab === cat.id
                                    ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20 scale-105"
                                    : "text-foreground/40 hover:bg-background hover:text-blue-600"
                            )}
                        >
                            <cat.icon className={cn("h-4 w-4", activeTab === cat.id ? "text-white" : "group-hover:text-blue-600")} />
                            {cat.name}
                            {cat.badge && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[7px] font-black px-2 py-0.5 rounded-full shadow-lg">
                                    {cat.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Test List with Detailed Cards */}
            {loading ? (
                <div className="flex justify-center py-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredTests.length > 0 ? filteredTests.map((test) => (
                        <div
                            key={test.id}
                            className="bg-card-bg border border-card-border p-10 rounded-[3.5rem] shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                                {/* Left Side: Branding & Info */}
                                <div className="space-y-6 flex-1">
                                    <div className="flex items-center gap-6">
                                        <div className="h-20 w-20 bg-white rounded-[2rem] flex items-center justify-center shadow-md border border-gray-100 shrink-0 group-hover:scale-105 transition-transform">
                                            <Sparkles className="h-10 w-10 text-blue-600" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-2xl font-black text-foreground uppercase tracking-tight italic leading-tight group-hover:text-blue-600 transition-colors">
                                                    {test.name_en}
                                                </h3>
                                                {!test.is_locked ? (
                                                    <span className="bg-green-500/10 text-green-600 text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-green-500/20">
                                                        Free Test
                                                    </span>
                                                ) : (
                                                    <span className="bg-orange-500/10 text-orange-600 text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-orange-500/20">
                                                        Super Pass
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-[9px] font-black text-foreground/40 uppercase tracking-widest">
                                                <span className="flex items-center gap-1.5 bg-background px-3 py-1 rounded-full border border-card-border">
                                                    <Zap className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                                    206.1k Students
                                                </span>
                                                <span className="flex items-center gap-1.5 bg-background px-3 py-1 rounded-full border border-card-border">
                                                    <Trophy className="h-3 w-3 text-blue-500" />
                                                    4.8 Rating
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Features Bar */}
                                    <div className="flex flex-wrap items-center gap-10 pl-2">
                                        <div className="flex items-center gap-3 text-[11px] font-black text-foreground/40 uppercase tracking-widest">
                                            <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-white/5 flex items-center justify-center">
                                                <ClipboardCheck className="h-4 w-4 text-blue-600" />
                                            </div>
                                            {test.total_marks / 1} Questions
                                        </div>
                                        <div className="flex items-center gap-3 text-[11px] font-black text-foreground/40 uppercase tracking-widest">
                                            <div className="h-8 w-8 rounded-xl bg-orange-50 dark:bg-white/5 flex items-center justify-center">
                                                <Clock className="h-4 w-4 text-orange-500" />
                                            </div>
                                            {Math.floor(test.duration_sec / 60)} Mins
                                        </div>
                                        <div className="flex items-center gap-3 text-[11px] font-black text-foreground/40 uppercase tracking-widest">
                                            <div className="h-8 w-8 rounded-xl bg-green-50 dark:bg-white/5 flex items-center justify-center">
                                                <Target className="h-4 w-4 text-green-600" />
                                            </div>
                                            {test.total_marks} Marks
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] bg-blue-50 dark:bg-blue-900/10 px-8 py-3 rounded-full w-fit">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Advanced Video Solutions
                                        <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                                        Performance Audit Ready
                                    </div>
                                </div>

                                {/* Right Side: Action Button */}
                                <div className="shrink-0 flex flex-col items-center gap-4">
                                    {test.is_locked ? (
                                        <button className="px-16 py-6 bg-gray-900 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 flex items-center gap-4 border border-white/10 opacity-50 cursor-not-allowed">
                                            <Lock className="h-5 w-5" />
                                            Activate Pass
                                        </button>
                                    ) : (
                                        <Link
                                            href={`/dashboard/tests/play/${test.id}`}
                                            className="px-16 py-6 bg-cyan-500 hover:bg-cyan-600 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] transition-all shadow-xl shadow-cyan-500/20 active:scale-95 flex items-center gap-4 group/btn"
                                        >
                                            Start Mission
                                            <ChevronRight className="h-5 w-5 group-hover/btn:translate-x-2 transition-transform" />
                                        </Link>
                                    )}
                                    <span className="text-[9px] font-black text-foreground/20 uppercase tracking-[0.3em]">English, Hindi Available</span>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="py-40 flex flex-col items-center justify-center text-center space-y-6 bg-card-bg border border-dashed border-card-border rounded-[4rem]">
                            <Search className="h-16 w-16 text-foreground/10" />
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight italic">No Intelligence Matches</h3>
                                <p className="text-sm font-bold text-foreground/40 uppercase tracking-widest">Adjust your search parameters or try another category Explorer.</p>
                            </div>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                            >
                                Reset Search Terminal
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
