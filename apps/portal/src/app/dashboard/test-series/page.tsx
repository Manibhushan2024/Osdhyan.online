'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
    Search,
    Check,
    ClipboardCheck,
    LayoutDashboard,
    FileText,
    Play,
    BookOpen,
    Trophy,
    Users,
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

// Exam tabs match on the exam / series name (case-insensitive keywords).
const examCategories = [
    { id: 'all', name: 'All exams', icon: LayoutDashboard, match: [] as string[] },
    { id: 'dsssb', name: 'DSSSB', icon: Trophy, match: ['dsssb'] },
    { id: 'state', name: 'State PSC (BPSC)', icon: Trophy, match: ['bpsc', 'psc', 'aedo'] },
    { id: 'teaching', name: 'Teaching (DSSSB / KVS / CTET)', icon: BookOpen, match: ['dsssb', 'tgt', 'pgt', 'prt', 'kvs', 'ctet', 'teacher'] },
    { id: 'ssc', name: 'SSC & Govt', icon: FileText, match: ['ssc', 'cgl', 'chsl', 'bssc', 'railway', 'rrb', 'police'] },
    { id: 'banking', name: 'Banking', icon: BookOpen, match: ['bank', 'ibps', 'sbi', 'rbi'] },
];

const matchesCategory = (s: { name_en?: string; exam?: { name_en?: string } | null }, id: string) => {
    const cat = examCategories.find(c => c.id === id);
    if (!cat || cat.match.length === 0) return true;
    const hay = `${s.name_en || ''} ${s.exam?.name_en || ''}`.toLowerCase();
    return cat.match.some(k => hay.includes(k));
};

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
            toast.success('Enrolled');
            fetchEnrolled();
        } catch (error) {
            // Revert on failure
            setEnrolledIds(prev => { const next = new Set(prev); next.delete(id); return next; });
            toast.error('Could not enrol. Please try again.');
        }
    };

    const handleUnenroll = async (id: number) => {
        // Optimistic update
        setEnrolledIds(prev => { const next = new Set(prev); next.delete(id); return next; });
        try {
            await api.post(`/test-series/${id}/unenroll`);
            toast.success('Removed from your series');
            fetchEnrolled();
        } catch (error) {
            // Revert on failure
            setEnrolledIds(prev => new Set([...prev, id]));
            toast.error('Could not remove. Please try again.');
        }
    };

    const enrolledSeries = series.filter(s => isEnrolled(s.id));
    const filteredSeries = series.filter(s =>
        matchesCategory(s, activeCategory) && (
            (s.name_en || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.name_hi || '').toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    return (
        <>
            <div className="space-y-8 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="page-title">Test series</h1>
                        <p className="page-subtitle">Structured sets of mock tests for your exam. Enrol to track your progress across the series.</p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="search"
                            placeholder="Search test series"
                            aria-label="Search test series"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input pl-10"
                        />
                    </div>
                </div>

                {/* Enrolled */}
                {enrolledSeries.length > 0 && (
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Your test series</h2>
                            <Link href="/dashboard/test-series/enrolled" className="text-sm font-semibold text-primary hover:underline">View all</Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {enrolledSeries.slice(0, 3).map((s) => (
                                <div key={s.id} className="card card-hover p-5 flex flex-col gap-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-muted-foreground">{s.exam?.name_en || 'Exam'}</p>
                                            <h3 className="text-base font-semibold leading-snug mt-0.5">{s.name_en}</h3>
                                        </div>
                                        <span className="badge badge-green shrink-0"><Check className="h-3 w-3" /> Enrolled</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                        <ClipboardCheck className="h-4 w-4" /> {s.stats?.total_tests || 0} tests
                                    </p>
                                    <div className="flex gap-2 mt-auto pt-1">
                                        <Link href={`/dashboard/test-series/${s.id}`} className="btn btn-primary flex-1">
                                            <Play className="h-4 w-4" /> Continue
                                        </Link>
                                        <button onClick={() => handleUnenroll(s.id)} className="btn btn-ghost">
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Categories + grid */}
                <section className="space-y-4">
                    <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-2 w-max">
                            {examCategories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={cn(
                                        'flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-full text-sm font-medium border transition-colors whitespace-nowrap',
                                        activeCategory === cat.id
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-card-bg text-muted-foreground border-card-border hover:text-foreground hover:bg-muted'
                                    )}
                                >
                                    <cat.icon className="h-4 w-4" />
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="card p-5 space-y-3 animate-pulse">
                                    <div className="h-3 w-20 bg-muted rounded" />
                                    <div className="h-5 w-3/4 bg-muted rounded" />
                                    <div className="h-4 w-full bg-muted rounded" />
                                    <div className="h-10 w-full bg-muted rounded-xl mt-2" />
                                </div>
                            ))}
                        </div>
                    ) : filteredSeries.length === 0 ? (
                        <div className="card p-10 text-center">
                            <Search className="h-10 w-10 mx-auto text-muted-foreground/50" />
                            <h3 className="mt-4 text-lg font-semibold">No test series found</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {searchQuery ? 'Try a different search.' : 'No test series are available yet.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredSeries.map((s) => {
                                const enrolled = isEnrolled(s.id);
                                const enrolledCount = s.stats?.enrolled_count || 0;
                                return (
                                    <div key={s.id} className="card card-hover p-5 flex flex-col gap-3">
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-muted-foreground">{s.exam?.name_en || 'Exam'}</p>
                                            <h3 className="text-base font-semibold leading-snug mt-0.5">{s.name_en}</h3>
                                            {s.description_en && (
                                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{s.description_en}</p>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1.5">
                                                <ClipboardCheck className="h-4 w-4" /> {s.stats?.total_tests || 0} tests
                                            </span>
                                            {enrolledCount > 0 && (
                                                <span className="flex items-center gap-1.5">
                                                    <Users className="h-4 w-4" /> {enrolledCount} enrolled
                                                </span>
                                            )}
                                            {enrolled && (
                                                <span className="badge badge-green"><Check className="h-3 w-3" /> Enrolled</span>
                                            )}
                                        </div>

                                        <div className="flex gap-2 mt-auto pt-1">
                                            <Link href={`/dashboard/test-series/${s.id}`} className="btn btn-secondary flex-1">
                                                View details
                                            </Link>
                                            {enrolled ? (
                                                <Link href={`/dashboard/test-series/${s.id}`} className="btn btn-primary flex-1">
                                                    <Play className="h-4 w-4" /> Attempt tests
                                                </Link>
                                            ) : (
                                                <button onClick={() => handleEnroll(s.id)} className="btn btn-primary flex-1">
                                                    Enrol
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>

            <AuthModal
                open={authModal}
                onClose={() => setAuthModal(false)}
                reason="enrol in a test series"
                redirectTo="/dashboard/test-series"
            />
        </>
    );
}
