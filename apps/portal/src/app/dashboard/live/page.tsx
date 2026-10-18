'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart2, Calendar, ChevronRight, Hand, MessageSquare, Play, Radio, Settings2, Video } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/components/providers/AuthProvider';
import ClassCard from '@/components/live/ClassCard';
import { canTeach } from '@/components/live/format';
import type { LiveClassSummary, Paginated } from '@/components/live/types';

type Buckets = { live: LiveClassSummary[]; upcoming: LiveClassSummary[]; ended: LiveClassSummary[] };

const EMPTY: Buckets = { live: [], upcoming: [], ended: [] };

export default function LiveClassesPage() {
    const { user, loading: authLoading } = useAuth();
    const [data, setData] = useState<Buckets>(EMPTY);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isTeacher = canTeach(user);

    useEffect(() => {
        if (authLoading) return;
        let cancelled = false;

        const load = async () => {
            try {
                const [live, upcoming, ended] = await Promise.all([
                    api.get<Paginated<LiveClassSummary>>('/live-classes', { params: { status: 'live', per_page: 12 } }),
                    api.get<Paginated<LiveClassSummary>>('/live-classes', { params: { status: 'upcoming', per_page: 12 } }),
                    api.get<Paginated<LiveClassSummary>>('/live-classes', { params: { status: 'ended', per_page: 12 } }),
                ]);
                if (cancelled) return;
                setData({ live: live.data.data, upcoming: upcoming.data.data, ended: ended.data.data });
                setError(null);
            } catch {
                if (!cancelled) setError('Could not load live classes. Please refresh.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        // Live-now list refreshes every 30 s so a class that just started shows up.
        const t = setInterval(load, 30000);
        return () => {
            cancelled = true;
            clearInterval(t);
        };
    }, [authLoading]);

    const recordings = data.ended.filter(c => c.recording_url);

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-16 animate-in fade-in duration-700 px-4 md:px-0">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-red-950 to-rose-900 p-8 md:p-10 shadow-2xl">
                <div className="absolute -top-20 -right-10 h-64 w-64 rounded-full bg-red-400/20 blur-[80px]" />
                <div className="absolute -bottom-16 -left-12 h-56 w-56 rounded-full bg-rose-600/20 blur-[80px]" />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-rose-300">
                            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Live classes</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight">
                            Learn live, <span className="text-red-400">ask live</span>
                        </h1>
                        <p className="text-white/60 text-sm font-medium max-w-lg">
                            Interactive sessions with your teachers — chat, raise your hand, answer polls, and catch the recording if you miss one.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                            {[
                                { icon: Video, label: 'Video' },
                                { icon: MessageSquare, label: 'Chat' },
                                { icon: BarChart2, label: 'Polls' },
                                { icon: Hand, label: 'Raise hand' },
                            ].map(({ icon: Icon, label }) => (
                                <span key={label} className="flex items-center gap-1.5 bg-white/10 border border-white/10 text-white/70 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                                    <Icon className="h-3 w-3" /> {label}
                                </span>
                            ))}
                        </div>
                    </div>
                    {isTeacher && (
                        <Link
                            href="/dashboard/live/manage"
                            className="shrink-0 flex items-center gap-2 px-6 py-3.5 bg-white text-slate-950 hover:bg-rose-50 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl active:scale-95"
                        >
                            <Settings2 className="h-4 w-4" /> Teacher panel <ChevronRight className="h-4 w-4" />
                        </Link>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-600 rounded-2xl px-5 py-4 text-sm font-bold">{error}</div>
            )}

            {/* Live now */}
            <Section icon={Radio} title="Live now" count={data.live.length} accent="text-red-500">
                {loading ? (
                    <SkeletonGrid count={2} big />
                ) : data.live.length === 0 ? (
                    <Empty text="No class is live right now. Upcoming sessions are listed below." />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {data.live.map(c => <ClassCard key={c.id} cls={c} featured />)}
                    </div>
                )}
            </Section>

            {/* Upcoming */}
            <Section icon={Calendar} title="Upcoming" count={data.upcoming.length} accent="text-blue-500">
                {loading ? (
                    <SkeletonGrid count={3} />
                ) : data.upcoming.length === 0 ? (
                    <Empty text="Nothing scheduled yet. Check back soon." />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {data.upcoming.map(c => <ClassCard key={c.id} cls={c} />)}
                    </div>
                )}
            </Section>

            {/* Recordings */}
            <Section icon={Play} title="Recordings" count={recordings.length} accent="text-indigo-500">
                {loading ? (
                    <SkeletonGrid count={3} />
                ) : recordings.length === 0 ? (
                    <Empty text="Recordings of past classes will appear here." />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {recordings.map(c => <ClassCard key={c.id} cls={c} />)}
                    </div>
                )}
            </Section>
        </div>
    );
}

function Section({ icon: Icon, title, count, accent, children }: {
    icon: typeof Radio; title: string; count: number; accent: string; children: React.ReactNode;
}) {
    return (
        <section className="space-y-4">
            <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${accent}`} />
                <h2 className="text-lg font-black text-foreground tracking-tight">{title}</h2>
                <span className="text-[10px] font-black text-foreground/40 bg-foreground/5 px-2 py-0.5 rounded-full">{count}</span>
            </div>
            {children}
        </section>
    );
}

function Empty({ text }: { text: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-14 gap-3 bg-card-bg border border-dashed border-card-border rounded-[2rem]">
            <Video className="h-8 w-8 text-foreground/10" />
            <p className="text-xs font-bold text-foreground/40 text-center px-6">{text}</p>
        </div>
    );
}

function SkeletonGrid({ count, big = false }: { count: number; big?: boolean }) {
    return (
        <div className={`grid grid-cols-1 ${big ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'} gap-5`}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-card-bg border border-card-border rounded-[2rem] p-6 space-y-4 animate-pulse">
                    <div className="h-3 w-16 bg-foreground/5 rounded-full" />
                    <div className="h-5 w-3/4 bg-foreground/10 rounded-xl" />
                    <div className="h-3 w-1/2 bg-foreground/5 rounded-full" />
                    <div className="h-11 w-full bg-foreground/5 rounded-2xl mt-4" />
                </div>
            ))}
        </div>
    );
}
