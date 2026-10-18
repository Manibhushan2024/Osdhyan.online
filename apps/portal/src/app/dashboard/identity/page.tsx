'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import api from '@/lib/api';
import {
    Target,
    Mail,
    Phone,
    Calendar,
    Flame,
    Clock,
    TrendingUp,
    GraduationCap,
    Trophy,
    Pencil,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ProfileEditModal from './ProfileEditModal';
import Link from 'next/link';

const getBaseUrl = () =>
    (process.env.NEXT_PUBLIC_STORAGE_URL ?? process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') ?? '').replace(/\/$/, '');

function formatMinutes(total?: number) {
    const safe = Math.max(0, Math.floor(total || 0));
    const h = Math.floor(safe / 60);
    const m = safe % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function ProfilePage() {
    const { user } = useAuth();
    const [data, setData] = useState<any>(null);
    const [performance, setPerformance] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        fetchAnalytics();
        fetchTopics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await api.get('/analytics/overview');
            setData(res.data);
        } catch (error) {
            console.error('Failed to fetch profile data', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTopics = async () => {
        try {
            const res = await api.get('/analytics/topics');
            setPerformance(res.data);
        } catch (error) {
            console.error('Failed to fetch topics', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            </div>
        );
    }

    const stats = data?.stats || {};
    const streak = Number(stats.study_streak || 0);
    const accuracy = Number(stats.accuracy_percentage || 0);
    const totalTests = Number(stats.total_tests || 0);
    const avatarUrl = user?.avatar ? `${getBaseUrl()}/storage/${user.avatar}` : null;

    return (
        <div className="space-y-6 pb-12">
            <ProfileEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={user}
                onUpdate={() => window.location.reload()}
            />

            {/* Profile header */}
            <div className="card p-5 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                    <button
                        type="button"
                        onClick={() => setIsEditModalOpen(true)}
                        className="relative h-24 w-24 shrink-0 rounded-full overflow-hidden bg-accent text-accent-foreground flex items-center justify-center text-3xl font-bold uppercase mx-auto sm:mx-0"
                        aria-label="Change profile photo"
                    >
                        {avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={avatarUrl} alt={user?.name || 'Profile photo'} className="h-full w-full object-cover" />
                        ) : (
                            <span>{user?.name?.charAt(0) || '?'}</span>
                        )}
                    </button>

                    <div className="flex-1 min-w-0 text-center sm:text-left">
                        <h1 className="page-title truncate">{user?.name}</h1>
                        <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-muted-foreground">
                            {user?.email && (
                                <div className="flex items-center gap-2 justify-center sm:justify-start min-w-0">
                                    <Mail className="h-4 w-4 shrink-0" /><span className="truncate">{user.email}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 justify-center sm:justify-start">
                                <Phone className="h-4 w-4 shrink-0" /><span>{user?.phone || 'No phone number added'}</span>
                            </div>
                            <div className="flex items-center gap-2 justify-center sm:justify-start">
                                <GraduationCap className="h-4 w-4 shrink-0" /><span>{user?.exam_preference ? `Preparing for ${user.exam_preference}` : 'Target exam not set'}</span>
                            </div>
                            <div className="flex items-center gap-2 justify-center sm:justify-start">
                                <Calendar className="h-4 w-4 shrink-0" /><span>Target year {user?.target_year || new Date().getFullYear()}</span>
                            </div>
                        </dl>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                        <button onClick={() => setIsEditModalOpen(true)} className="btn btn-secondary">
                            <Pencil className="h-4 w-4" /> Edit profile
                        </button>
                        <Link href="/dashboard/settings" className="btn btn-ghost">Account settings</Link>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card p-5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><Trophy className="h-4 w-4" /> Tests completed</div>
                    <p className="mt-2 text-3xl font-bold">{totalTests}</p>
                </div>
                <div className="card p-5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><Flame className="h-4 w-4" /> Study streak</div>
                    <p className="mt-2 text-3xl font-bold">{streak} <span className="text-base font-medium text-muted-foreground">{streak === 1 ? 'day' : 'days'}</span></p>
                    <div className="mt-3 flex gap-1.5" aria-hidden="true">
                        {[1, 2, 3, 4, 5, 6, 7].map(i => (
                            <div key={i} className={cn('h-2 flex-1 rounded-full', i <= (streak % 7 || (streak > 0 ? 7 : 0)) ? 'bg-orange-500' : 'bg-muted')} />
                        ))}
                    </div>
                </div>
                <div className="card p-5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><Target className="h-4 w-4" /> Overall accuracy</div>
                    <p className="mt-2 text-3xl font-bold">{accuracy}%</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Study summary */}
                <div className="card p-5 sm:p-6">
                    <h2 className="text-lg font-semibold mb-4">Study summary</h2>
                    <div className="divide-y divide-card-border">
                        <div className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                Total study time
                            </div>
                            <p className="font-semibold">{formatMinutes(stats.total_time_spent_min)}</p>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3 text-sm">
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                Average score
                            </div>
                            <p className="font-semibold">{stats.average_score ?? 0}</p>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3 text-sm">
                                <Target className="h-4 w-4 text-muted-foreground" />
                                Accuracy
                            </div>
                            <p className="font-semibold">{accuracy}%</p>
                        </div>
                    </div>
                    <Link href="/dashboard/analytics" className="btn btn-secondary btn-sm mt-4">See full analytics</Link>
                </div>

                {/* Topics */}
                <div className="card p-5 sm:p-6">
                    <h2 className="text-lg font-semibold mb-4">Topics</h2>
                    <div className="space-y-5">
                        <div>
                            <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">Strong topics</h3>
                            <div className="flex flex-wrap gap-2">
                                {performance?.strengths?.length > 0 ? performance.strengths.map((t: any, i: number) => (
                                    <span key={i} className="badge badge-green">
                                        {t.topic_name} · {Math.round(t.accuracy)}%
                                    </span>
                                )) : (
                                    <span className="text-sm text-muted-foreground">Attempt a few tests to see your strong topics.</span>
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-2">Topics to improve</h3>
                            <div className="flex flex-wrap gap-2">
                                {performance?.weaknesses?.length > 0 ? performance.weaknesses.map((t: any, i: number) => (
                                    <span key={i} className="badge badge-amber">
                                        {t.topic_name} · {Math.round(t.accuracy)}%
                                    </span>
                                )) : (
                                    <span className="text-sm text-muted-foreground">Nothing to show yet.</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
