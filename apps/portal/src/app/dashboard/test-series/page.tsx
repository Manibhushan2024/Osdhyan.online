'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
    Search,
    Plus,
    Check,
    Minus,
    Trophy,
    Sparkles,
    Zap,
    ClipboardCheck,
    LayoutDashboard,
    FileText,
    Play,
    BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';
import AuthModal from '@/components/auth/AuthModal';
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
    { id: 'ssc', name: 'SSC & Govt', icon: FileText },
    { id: 'banking', name: 'Banking', icon: BookOpen },
];

export default function TestSeriesHub() {
    const { user } = useAuth();
    const [series, setSeries] = useState<TestSeries[]>([]);
    const [enrolledIds, setEnrolledIds] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [authModal, setAuthModal] = useState(false);

    useEffect(() => {
        fetchSeries();
        if (user) fetchEnrolled();
    }, [activeCategory, user]);

    const fetchSeries = async () => {
        setLoading(true);
        try {
            const res = await api.get('/test-series');
            setSeries(res.data);
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    };

    const fetchEnrolled = async () => {
        try {
            const res = await api.get('/test-series/enrolled');
            const ids = new Set<number>((res.data || []).map((s: TestSeries) => s.id));
            setEnrolledIds(ids);
        } catch {
            // silent
        }
    };

    // Determine enrollment from the authoritative enrolledIds set
    const isEnrolled = (id: number): boolean => {
        // Cross-reference: use local enrolled set if user is logged in,
        // else fall back to API's is_enrolled field
        if (user) return enrolledIds.has(id);
        return false;
    };

    const handleEnroll = async (id: number) => {
        if (!user) {
            setAuthModal(true);
            return;
        }
        // Optimistic update
        setEnrolledIds(prev => new Set([...prev, id]));
        try {
            await api.post(`/test-series/${id}/enroll`);
            toast.success('Successfully enrolled!');
            fetchEnrolled();
        } catch (error) {
            // Revert on failure
            setEnrolledIds(prev => { const next = new Set(prev); next.delete(id); return next; });
            toast.error('Enrollment failed');
        }
    };

    const handleUnenroll = async (id: number) => {
        // Optimistic update
        setEnrolledIds(prev => { const next = new Set(prev); next.delete(id); return next; });
        try {
            await api.post(`/test-series/${id}/unenroll`);
            toast.success('Successfully unenrolled!');
            fetchEnrolled();
        } catch (error) {
            // Revert on failure
            setEnrolledIds(prev => new Set([...prev, id]));
            toast.error('Unenrollment failed');
        }
    };

    const enrolledSeries = series.filter(s => isEnrolled(s.id));
    const filteredSeries = series.filter(s =>
        s.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name_hi.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
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

            {/* Your Enrolled Series */}
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
                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-green-600 uppercase tracking-widest bg-green-500/10 px-4 py-1.5 rounded-full border border-green-500/20">
                                        <Check className="h-3 w-3" /> Enrolled
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight italic mb-6 leading-tight min-h-[56px]">
                                    {s.name_en}
                                </h3>
                                <div className="flex items-center justify-between text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-3">
                                    <span>{s.exam?.name_en || 'Exam'}</span>
                                    <span>{s.stats?.total_tests || 0} Tests</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-auto">
                                    <Link
                                        href={`/dashboard/test-series/${s.id}`}
                                        className="py-5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.4em] transition-all shadow-xl shadow-cyan-500/20 active:scale-95 text-center flex items-center justify-center gap-2"
                                    >
                                        <Play className="h-4 w-4" /> Attempt
                                    </Link>
                                    <button
                                        onClick={() => handleUnenroll(s.id)}
                                        className="py-5 bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/20 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.4em] transition-all active:scale-95 text-center flex items-center justify-center gap-2"
                                    >
                                        <Minus className="h-4 w-4" /> Unenroll
                                    </button>
                                </div>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="bg-card-bg border border-card-border p-8 rounded-[3.5rem] space-y-6 animate-pulse">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2 flex-1">
                                            <div className="h-2.5 w-20 bg-foreground/5 rounded-full" />
                                            <div className="h-5 w-3/4 bg-foreground/8 rounded-xl" />
                                        </div>
                                        <div className="h-12 w-12 rounded-2xl bg-foreground/5 shrink-0" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-3 w-full bg-foreground/5 rounded-full" />
                                        <div className="h-3 w-2/3 bg-foreground/5 rounded-full" />
                                    </div>
                                    <div className="flex gap-4 pt-2">
                                        <div className="h-8 w-24 bg-foreground/5 rounded-2xl" />
                                        <div className="h-8 w-24 bg-foreground/5 rounded-2xl" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredSeries.length === 0 ? (
                        <div className="py-40 flex flex-col items-center justify-center text-center space-y-6 bg-card-bg border border-dashed border-card-border rounded-[4rem]">
                            <Search className="h-16 w-16 text-foreground/10" />
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight italic">No Series Found</h3>
                                <p className="text-sm font-bold text-foreground/40 uppercase tracking-widest">No test series are available yet.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {filteredSeries.map((s) => {
                                const enrolled = isEnrolled(s.id);
                                return (
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
                                            {/* Enrollment toggle button */}
                                            <button
                                                onClick={() => enrolled ? handleUnenroll(s.id) : handleEnroll(s.id)}
                                                className={cn(
                                                    "h-12 w-12 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95 group/check",
                                                    enrolled
                                                        ? "bg-green-500 text-white shadow-green-500/20 hover:bg-red-500 hover:shadow-red-500/20"
                                                        : "bg-blue-600 text-white shadow-blue-500/20 hover:scale-110"
                                                )}
                                                title={enrolled ? "Click to Unenroll" : "Click to Enroll"}
                                            >
                                                {enrolled ? (
                                                    <>
                                                        <Check className="h-5 w-5 group-hover/check:hidden" />
                                                        <Minus className="h-5 w-5 hidden group-hover/check:block" />
                                                    </>
                                                ) : <Plus className="h-5 w-5" />}
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
                                            {enrolled && (
                                                <div className="flex items-center gap-2 text-green-600">
                                                    <Check className="h-4 w-4" />
                                                    You're In
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between gap-4">
                                            <Link
                                                href={`/dashboard/test-series/${s.id}`}
                                                className="flex-1 py-4 bg-background border border-card-border hover:border-blue-500/30 text-foreground/60 hover:text-blue-600 rounded-[1.5rem] font-black text-[9px] uppercase tracking-[0.2em] transition-all text-center"
                                            >
                                                View Details
                                            </Link>
                                            {enrolled ? (
                                                <Link
                                                    href={`/dashboard/test-series/${s.id}`}
                                                    className="flex-1 py-4 rounded-[1.5rem] font-black text-[9px] uppercase tracking-[0.2em] transition-all bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                                                >
                                                    <Play className="h-3.5 w-3.5" /> Attempt Tests
                                                </Link>
                                            ) : (
                                                <button
                                                    onClick={() => handleEnroll(s.id)}
                                                    className="flex-1 py-4 rounded-[1.5rem] font-black text-[9px] uppercase tracking-[0.2em] transition-all bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
                                                >
                                                    Enroll Now +
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>

        <AuthModal
            open={authModal}
            onClose={() => setAuthModal(false)}
            reason="enroll in a test series"
            redirectTo="/dashboard/test-series"
        />
        </>
    );
}
