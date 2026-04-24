'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
    ChevronLeft,
    Clock,
    Target,
    ClipboardCheck,
    Zap,
    Play,
    RotateCcw,
    CheckCircle2,
    Lock,
    Trophy,
    BarChart3,
    Minus,
    Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/components/providers/AuthProvider';
import AuthModal from '@/components/auth/AuthModal';

type Test = {
    id: number;
    name_en: string;
    total_marks: number;
    duration_sec: number;
    questions_count?: number;
    description_en: string;
    attempt_status: 'none' | 'ongoing' | 'completed';
    attempt_id: number | null;
};

type SeriesDetail = {
    series: {
        id: number;
        name_en: string;
        description_en: string;
        image: string;
        exam?: { name_en: string };
    };
    is_enrolled: boolean;
    content: Record<string, Test[]>;
    stats: {
        total_tests: number;
        users_count: number;
    };
};

export default function TestSeriesDetail() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [data, setData] = useState<SeriesDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>('all');
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const [authModal, setAuthModal] = useState(false);

    useEffect(() => {
        fetchSeriesDetail();
    }, [params.id]);

    // Also check enrollment from the enrolled list (more reliable than is_enrolled flag)
    useEffect(() => {
        if (user) {
            api.get('/test-series/enrolled').then(res => {
                const ids: number[] = (res.data || []).map((s: any) => s.id);
                setIsEnrolled(ids.includes(Number(params.id)));
            }).catch(() => {});
        }
    }, [params.id, user]);

    const fetchSeriesDetail = async () => {
        try {
            const res = await api.get(`/test-series/${params.id}`);
            setData(res.data);
            // Use the API's is_enrolled as initial value; enrolled check above will correct it
            setIsEnrolled(res.data.is_enrolled ?? false);
            const keys = Object.keys(res.data.content);
            if (keys.length > 0) setActiveTab(keys[0]);
        } catch (error) {
            console.error('Failed to fetch series details', error);
            toast.error('Failed to load test series');
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        if (!user) {
            setAuthModal(true);
            return;
        }
        setEnrolling(true);
        // Optimistic update
        setIsEnrolled(true);
        try {
            await api.post(`/test-series/${params.id}/enroll`);
            toast.success('Successfully enrolled! You can now attempt tests.');
            fetchSeriesDetail();
        } catch (error) {
            setIsEnrolled(false);
            toast.error('Enrollment failed');
        } finally {
            setEnrolling(false);
        }
    };

    const handleUnenroll = async () => {
        setEnrolling(true);
        // Optimistic update
        setIsEnrolled(false);
        try {
            await api.post(`/test-series/${params.id}/unenroll`);
            toast.success('Successfully unenrolled!');
            fetchSeriesDetail();
        } catch (error) {
            setIsEnrolled(true);
            toast.error('Unenrollment failed');
        } finally {
            setEnrolling(false);
        }
    };

    const handleStartTest = async (testId: number, status: string) => {
        if (!user) {
            setAuthModal(true);
            return;
        }
        if (!isEnrolled) {
            toast.error('Please enroll in this test series first');
            return;
        }
        router.push(`/dashboard/tests/play/${testId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!data) return null;

    const categories = Object.keys(data.content);
    const activeTests = activeTab === 'all'
        ? Object.values(data.content).flat()
        : data.content[activeTab] || [];

    return (
        <>
        <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4 md:px-0 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <Link href="/dashboard/test-series" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-blue-600 transition-colors">
                        <ChevronLeft className="h-3 w-3" />
                        Back to Test Hub
                    </Link>
                    <div className="space-y-2">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{data.series.exam?.name_en || 'Exam Series'}</span>
                        <h1 className="text-4xl lg:text-5xl font-black text-foreground uppercase tracking-tighter italic leading-none">
                            {data.series.name_en}
                        </h1>
                    </div>
                </div>

                {/* Enrollment button — shows correct state */}
                {!isEnrolled ? (
                    <button
                        onClick={handleEnroll}
                        disabled={enrolling}
                        className="px-12 py-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-4 animate-pulse"
                    >
                        {enrolling ? 'Enrolling...' : 'Enroll Now to Unlock'}
                        <Plus className="h-5 w-5" />
                    </button>
                ) : (
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                        <div className="px-8 py-4 bg-green-500/10 border border-green-500/20 text-green-600 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                            <CheckCircle2 className="h-5 w-5" />
                            Active Mission Series
                        </div>
                        <button
                            onClick={handleUnenroll}
                            disabled={enrolling}
                            className="px-6 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-600 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            <Minus className="h-4 w-4" />
                            Unenroll
                        </button>
                    </div>
                )}
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-card-bg border border-card-border p-6 rounded-[2rem] flex items-center gap-4">
                    <div className="h-10 w-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-600">
                        <ClipboardCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-foreground/40 uppercase tracking-widest">Total Tests</p>
                        <p className="text-xl font-black text-foreground">{data.stats.total_tests}</p>
                    </div>
                </div>
                <div className="bg-card-bg border border-card-border p-6 rounded-[2rem] flex items-center gap-4">
                    <div className="h-10 w-10 bg-purple-600/10 rounded-xl flex items-center justify-center text-purple-600">
                        <Target className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-foreground/40 uppercase tracking-widest">Enrolled</p>
                        <p className="text-xl font-black text-foreground">{data.stats.users_count}</p>
                    </div>
                </div>
                <div className="col-span-2 bg-card-bg border border-card-border p-6 rounded-[2rem] flex items-center gap-4">
                    <div className="h-10 w-10 bg-green-600/10 rounded-xl flex items-center justify-center text-green-600">
                        <Zap className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-foreground/40 uppercase tracking-widest">Status</p>
                        <p className={cn("text-xl font-black", isEnrolled ? "text-green-600" : "text-foreground/40")}>
                            {isEnrolled ? 'Enrolled — Ready to Attempt' : 'Not Enrolled'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Enrollment CTA if not enrolled */}
            {!isEnrolled && (
                <div className="bg-blue-600/5 border border-blue-500/20 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h3 className="text-lg font-black text-foreground uppercase tracking-tight italic">Enroll to Unlock All Tests</h3>
                        <p className="text-foreground/40 text-sm font-medium">You must enroll in this series to attempt any test. It's free!</p>
                    </div>
                    <button
                        onClick={handleEnroll}
                        disabled={enrolling}
                        className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-60"
                    >
                        <Plus className="h-4 w-4" />
                        {enrolling ? 'Enrolling...' : 'Enroll Now — Free'}
                    </button>
                </div>
            )}

            {/* Content Tabs */}
            <div className="space-y-8">
                <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2 border-b border-card-border">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={cn(
                            "px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all",
                            activeTab === 'all'
                                ? "bg-foreground text-background"
                                : "bg-card-bg border border-card-border text-foreground/40 hover:text-foreground"
                        )}
                    >
                        All Missions ({Object.values(data.content).flat().length})
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={cn(
                                "px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all",
                                activeTab === cat
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                    : "bg-card-bg border border-card-border text-foreground/40 hover:text-blue-600"
                            )}
                        >
                            {cat} ({data.content[cat]?.length || 0})
                        </button>
                    ))}
                </div>

                {/* Test List */}
                <div className="space-y-4">
                    {activeTests.length === 0 && (
                        <div className="text-center py-20 text-foreground/20 font-bold uppercase tracking-widest">
                            No Missions Available in this Sector
                        </div>
                    )}

                    {activeTests.map((test) => (
                        <div key={test.id} className="group bg-card-bg border border-card-border p-6 md:p-8 rounded-[2.5rem] hover:border-blue-500/30 transition-all shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-start gap-6">
                                    <div className={cn(
                                        "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:scale-110",
                                        test.attempt_status === 'completed'
                                            ? "bg-green-500 text-white shadow-green-500/20"
                                            : test.attempt_status === 'ongoing'
                                                ? "bg-orange-500 text-white shadow-orange-500/20 animate-pulse"
                                                : isEnrolled
                                                    ? "bg-blue-600/10 border border-blue-500/20 text-blue-600"
                                                    : "bg-background border border-card-border text-foreground/20"
                                    )}>
                                        {test.attempt_status === 'completed' ? <Trophy className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-black text-foreground uppercase tracking-tight italic">{test.name_en}</h3>
                                            {test.attempt_status === 'completed' && (
                                                <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-green-500/20">
                                                    Completed
                                                </span>
                                            )}
                                            {test.attempt_status === 'ongoing' && (
                                                <span className="px-3 py-1 bg-orange-500/10 text-orange-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-orange-500/20 animate-pulse">
                                                    In Progress
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-6 text-[9px] font-black text-foreground/40 uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {Math.floor(test.duration_sec / 60)} Mins</span>
                                            <span className="flex items-center gap-1.5"><Target className="h-3 w-3" /> {test.total_marks} Marks</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 self-end md:self-auto w-full md:w-auto">
                                    {!isEnrolled ? (
                                        /* Not enrolled — show lock + enroll button */
                                        <button
                                            onClick={handleEnroll}
                                            className="w-full md:w-auto px-8 py-4 bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-600/20 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                        >
                                            <Lock className="h-3 w-3" />
                                            Enroll to Unlock
                                        </button>
                                    ) : (
                                        <>
                                            {test.attempt_status === 'completed' ? (
                                                <>
                                                    <Link
                                                        href={`/dashboard/tests/result/${test.attempt_id}`}
                                                        className="flex-1 md:flex-none px-6 py-4 bg-background border border-card-border hover:border-blue-500/30 text-foreground/60 hover:text-blue-600 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <BarChart3 className="h-3 w-3" />
                                                        Analysis
                                                    </Link>
                                                    <button
                                                        onClick={() => handleStartTest(test.id, 'completed')}
                                                        className="flex-1 md:flex-none px-8 py-4 bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-600/20 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <RotateCcw className="h-3 w-3" />
                                                        Re-Attempt
                                                    </button>
                                                </>
                                            ) : test.attempt_status === 'ongoing' ? (
                                                <button
                                                    onClick={() => handleStartTest(test.id, 'ongoing')}
                                                    className="w-full md:w-auto px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 animate-pulse"
                                                >
                                                    <Play className="h-3 w-3" />
                                                    Resume Mission
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleStartTest(test.id, 'none')}
                                                    className="w-full md:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                                                >
                                                    <Play className="h-3 w-3" />
                                                    Start Mission
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <AuthModal
            open={authModal}
            onClose={() => setAuthModal(false)}
            reason="attempt this test"
            redirectTo={`/dashboard/test-series/${params.id}`}
        />
        </>
    );
}
