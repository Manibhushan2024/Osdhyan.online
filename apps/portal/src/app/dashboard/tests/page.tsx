'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import {
    Clock,
    FileText,
    Lock,
    Search,
    LayoutDashboard,
    Video,
    ClipboardCheck,
    BookOpen,
    RotateCcw,
    HelpCircle,
    Award,
    MinusCircle,
    Play,
    CheckCircle2,
    History,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';
import AuthModal from '@/components/auth/AuthModal';

type Test = {
    id: number;
    name_en: string;
    name_hi: string;
    mode: 'chapter' | 'subject' | 'full_mock' | string;
    duration_sec: number;
    total_marks: number;
    questions_count?: number;
    negative_marking?: number;
    status: string;
    is_locked?: boolean;
    is_free?: boolean;
    requires_purchase?: boolean;
    attempt_status?: 'in_progress' | 'completed' | 'abandoned' | 'none' | string;
    attempt_id?: number | null;
    last_completed_attempt_id?: number | null;
    attempts_count?: number;
};

const categories = [
    { id: 'all', name: 'All', icon: LayoutDashboard },
    { id: 'live', name: 'Live tests', icon: Video },
    { id: 'full_mock', name: 'Full mock tests', icon: ClipboardCheck },
    { id: 'subject', name: 'Subject tests', icon: BookOpen },
    { id: 'chapter', name: 'Chapter tests', icon: RotateCcw },
    { id: 'pyp', name: 'Previous year papers', icon: FileText },
];

function formatDuration(sec: number) {
    const mins = Math.round(sec / 60);
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h} hr ${m} min` : `${h} hr`;
}

export default function TestsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [tests, setTests] = useState<Test[]>([]);
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [authModal, setAuthModal] = useState<{ open: boolean; redirectTo: string }>({ open: false, redirectTo: '' });

    const handleStartTest = (testId: number) => {
        const playUrl = `/dashboard/tests/play/${testId}`;
        if (!user) {
            setAuthModal({ open: true, redirectTo: playUrl });
            return;
        }
        router.push(playUrl);
    };

    useEffect(() => {
        fetchTests();
    }, [activeTab]);

    const fetchTests = async () => {
        setLoading(true);
        try {
            const params: { mode?: string } = {};
            if (activeTab !== 'all') {
                params.mode = activeTab;
            }
            const res = await api.get('/tests', { params });
            setTests(res.data);
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    };

    const filteredTests = tests.filter(test =>
        (test.name_en || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (test.name_hi || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <div className="space-y-6 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="page-title">Free tests</h1>
                        <p className="page-subtitle">Timed tests on the real exam pattern. Available in Hindi and English.</p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="search"
                            placeholder="Search tests"
                            aria-label="Search tests"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input pl-10"
                        />
                    </div>
                </div>

                {/* Category tabs */}
                <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-2 w-max">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.id)}
                                className={cn(
                                    'flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-full text-sm font-medium border transition-colors whitespace-nowrap',
                                    activeTab === cat.id
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

                {/* Test list */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="card p-5 animate-pulse space-y-3">
                                <div className="h-5 w-3/4 bg-muted rounded" />
                                <div className="h-4 w-1/2 bg-muted rounded" />
                                <div className="h-10 w-32 bg-muted rounded-xl mt-4" />
                            </div>
                        ))}
                    </div>
                ) : filteredTests.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredTests.map((test) => {
                            const isPaid = test.requires_purchase === true || test.is_free === false || test.is_locked === true;
                            const hasPricingInfo = typeof test.is_free === 'boolean' || typeof test.requires_purchase === 'boolean' || typeof test.is_locked === 'boolean';
                            const inProgress = test.attempt_status === 'in_progress' || test.attempt_status === 'ongoing';
                            // Last finished attempt — reachable even while a re-attempt is in progress.
                            const lastResultId = test.last_completed_attempt_id
                                ?? (test.attempt_status === 'completed' ? test.attempt_id : null);
                            const completed = !!lastResultId;
                            const attemptsCount = Number(test.attempts_count ?? 0);
                            const negative = Number(test.negative_marking ?? 0);

                            return (
                                <div key={test.id} className="card card-hover p-5 flex flex-col gap-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="text-base sm:text-lg font-semibold leading-snug">{test.name_en}</h3>
                                            {test.name_hi && <p className="text-sm text-muted-foreground mt-0.5 truncate">{test.name_hi}</p>}
                                        </div>
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            {hasPricingInfo && (
                                                isPaid
                                                    ? <span className="badge badge-amber"><Lock className="h-3 w-3" /> Paid</span>
                                                    : <span className="badge badge-green">Free</span>
                                            )}
                                            {inProgress && <span className="badge badge-blue">In progress</span>}
                                            {completed && !inProgress && <span className="badge badge-gray"><CheckCircle2 className="h-3 w-3" /> Completed</span>}
                                            {attemptsCount > 0 && <span className="badge badge-gray">Attempted {attemptsCount}×</span>}
                                        </div>
                                    </div>

                                    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <HelpCircle className="h-4 w-4 shrink-0" />
                                            <span><span className="font-semibold text-foreground">{test.questions_count ?? 0}</span> questions</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Clock className="h-4 w-4 shrink-0" />
                                            <span className="font-semibold text-foreground">{formatDuration(test.duration_sec)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Award className="h-4 w-4 shrink-0" />
                                            <span><span className="font-semibold text-foreground">{test.total_marks}</span> marks</span>
                                        </div>
                                        {negative > 0 && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <MinusCircle className="h-4 w-4 shrink-0" />
                                                <span><span className="font-semibold text-foreground">−{negative}</span> per wrong</span>
                                            </div>
                                        )}
                                    </dl>

                                    <div className="flex flex-wrap items-center gap-2 pt-1 mt-auto">
                                        {isPaid && !inProgress && !completed ? (
                                            <button disabled className="btn btn-secondary" title="This test is part of a paid test series">
                                                <Lock className="h-4 w-4" />
                                                Paid test
                                            </button>
                                        ) : inProgress ? (
                                            <>
                                                <button onClick={() => handleStartTest(test.id)} className="btn btn-primary">
                                                    <Play className="h-4 w-4" />
                                                    Resume
                                                </button>
                                                {lastResultId && (
                                                    <Link href={`/dashboard/tests/result/${lastResultId}`} className="btn btn-secondary">
                                                        Last result
                                                    </Link>
                                                )}
                                            </>
                                        ) : completed ? (
                                            <>
                                                <Link href={`/dashboard/tests/result/${lastResultId}`} className="btn btn-primary">
                                                    View result
                                                </Link>
                                                <button onClick={() => handleStartTest(test.id)} className="btn btn-secondary">
                                                    <RotateCcw className="h-4 w-4" />
                                                    Re-attempt
                                                </button>
                                            </>
                                        ) : (
                                            <button onClick={() => handleStartTest(test.id)} className="btn btn-primary">
                                                <Play className="h-4 w-4" />
                                                Start test
                                            </button>
                                        )}
                                        {attemptsCount > 0 && (
                                            <Link href={`/dashboard/history?test=${test.id}`} className="btn btn-ghost">
                                                <History className="h-4 w-4" />
                                                All attempts
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="card p-10 text-center">
                        <Search className="h-10 w-10 mx-auto text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-semibold">No tests found</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {searchQuery ? 'Try a different search or category.' : 'No tests are available in this category yet.'}
                        </p>
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="btn btn-secondary mt-5">
                                Clear search
                            </button>
                        )}
                    </div>
                )}
            </div>

            <AuthModal
                open={authModal.open}
                onClose={() => setAuthModal({ open: false, redirectTo: '' })}
                reason="attempt this test"
                redirectTo={authModal.redirectTo}
            />
        </>
    );
}
