'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/components/providers/AuthProvider';
import AuthModal from '@/components/auth/AuthModal';
import {
    Radio, Users, Clock, Calendar, Plus, Play, BookOpen,
    ChevronRight, Video, Mic, MessageSquare, BarChart2, Zap, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

type LiveClass = {
    id: number;
    title: string;
    description: string;
    subject: string;
    status: 'scheduled' | 'live' | 'ended' | 'cancelled';
    scheduled_at: string;
    started_at: string;
    teacher: { id: number; name: string; avatar: string };
    active_participants_count: number;
    chat_enabled: boolean;
    qa_enabled: boolean;
    polls_enabled: boolean;
};

const TABS = ['live', 'scheduled', 'ended'] as const;
type Tab = typeof TABS[number];

export default function LiveClassesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [tab, setTab] = useState<Tab>('live');
    const [classes, setClasses] = useState<LiveClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [authModal, setAuthModal] = useState(false);
    const [showSchedule, setShowSchedule] = useState(false);
    const [scheduling, setScheduling] = useState(false);
    const [form, setForm] = useState({
        title: '', description: '', subject: '', scheduled_at: '',
    });

    const isTeacher = user?.is_teacher || user?.is_admin;

    useEffect(() => {
        fetchClasses();
    }, [tab]);

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const res = await api.get('/live-classes', { params: { status: tab } });
            setClasses(res.data.data ?? res.data);
        } catch {
            setClasses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = (cls: LiveClass) => {
        if (!user) { setAuthModal(true); return; }
        router.push(`/dashboard/live/${cls.id}`);
    };

    const handleGoLive = async () => {
        if (!user) { setAuthModal(true); return; }
        if (!form.title.trim()) { toast.error('Enter a class title'); return; }
        setScheduling(true);
        try {
            const res = await api.post('/live-classes', form);
            toast.success('Class created!');
            setShowSchedule(false);
            setForm({ title: '', description: '', subject: '', scheduled_at: '' });
            router.push(`/dashboard/live/${res.data.id}`);
        } catch {
            toast.error('Failed to create class');
        } finally {
            setScheduling(false);
        }
    };

    const statusBadge = (status: Tab) => ({
        live: <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full"><span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />LIVE</span>,
        scheduled: <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full"><Clock className="h-2.5 w-2.5" />Scheduled</span>,
        ended: <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-foreground/30 bg-foreground/5 border border-card-border px-3 py-1 rounded-full"><Check className="h-2.5 w-2.5" />Ended</span>,
    }[status]);

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-16 animate-in fade-in duration-700 px-4 md:px-0">

            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-red-950 to-rose-900 p-8 md:p-10 shadow-2xl">
                <div className="absolute -top-20 -right-10 h-64 w-64 rounded-full bg-red-400/20 blur-[80px]" />
                <div className="absolute -bottom-16 -left-12 h-56 w-56 rounded-full bg-rose-600/20 blur-[80px]" />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-rose-300">
                            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Live Zone — Real-Time Learning</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic leading-tight">
                            Attend Live <span className="text-red-400">Classes</span>
                        </h1>
                        <p className="text-white/50 text-sm font-bold max-w-lg">
                            Interactive lectures with live Q&amp;A, polls, and real-time chat. Learn directly from expert teachers.
                        </p>
                        <div className="flex flex-wrap gap-3 pt-1">
                            {[
                                { icon: Video, label: 'HD Video' },
                                { icon: MessageSquare, label: 'Live Chat' },
                                { icon: BarChart2, label: 'Polls' },
                                { icon: Mic, label: 'Q&A' },
                            ].map(({ icon: Icon, label }) => (
                                <span key={label} className="flex items-center gap-1.5 bg-white/10 border border-white/10 text-white/70 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                                    <Icon className="h-3 w-3" /> {label}
                                </span>
                            ))}
                        </div>
                    </div>
                    {isTeacher && (
                        <button
                            onClick={() => setShowSchedule(true)}
                            className="shrink-0 flex items-center gap-2 px-8 py-4 bg-red-500 hover:bg-red-400 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-red-500/30 active:scale-95"
                        >
                            <Plus className="h-4 w-4" /> Schedule Class
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1.5 bg-card-bg border border-card-border p-1.5 rounded-2xl w-fit">
                {TABS.map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            tab === t ? "bg-background shadow text-foreground" : "text-foreground/30 hover:text-foreground/60"
                        )}
                    >
                        {t === 'live' ? '🔴 Live Now' : t === 'scheduled' ? '📅 Upcoming' : '📼 Past'}
                    </button>
                ))}
            </div>

            {/* Teacher's My Classes shortcut */}
            {isTeacher && (
                <Link
                    href="/dashboard/live/manage"
                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors"
                >
                    <Zap className="h-3.5 w-3.5" /> Manage my classes <ChevronRight className="h-3.5 w-3.5" />
                </Link>
            )}

            {/* Class Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-card-bg border border-card-border rounded-[2.5rem] p-8 space-y-4 animate-pulse">
                            <div className="h-3 w-16 bg-foreground/5 rounded-full" />
                            <div className="h-6 w-3/4 bg-foreground/8 rounded-xl" />
                            <div className="h-4 w-1/2 bg-foreground/5 rounded-full" />
                            <div className="h-12 w-full bg-foreground/5 rounded-2xl mt-4" />
                        </div>
                    ))}
                </div>
            ) : classes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4 bg-card-bg border border-dashed border-card-border rounded-[3rem]">
                    <Video className="h-12 w-12 text-foreground/10" />
                    <p className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">
                        {tab === 'live' ? 'No classes live right now' : tab === 'scheduled' ? 'No upcoming classes' : 'No past classes'}
                    </p>
                    {isTeacher && tab !== 'ended' && (
                        <button onClick={() => setShowSchedule(true)} className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-400 transition-all">
                            <Plus className="h-3.5 w-3.5" /> Schedule first class
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classes.map(cls => (
                        <div
                            key={cls.id}
                            className={cn(
                                "group bg-card-bg border rounded-[2.5rem] p-8 flex flex-col gap-5 transition-all hover:shadow-xl relative overflow-hidden",
                                cls.status === 'live'
                                    ? "border-red-500/30 shadow-lg shadow-red-500/5"
                                    : "border-card-border"
                            )}
                        >
                            {cls.status === 'live' && (
                                <div className="absolute inset-0 bg-gradient-to-br from-red-500/3 to-transparent pointer-events-none" />
                            )}

                            <div className="flex items-start justify-between gap-3">
                                <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0">
                                    <Video className="h-6 w-6 text-red-500" />
                                </div>
                                {statusBadge(cls.status as Tab)}
                            </div>

                            <div className="space-y-1.5 flex-1">
                                {cls.subject && (
                                    <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">{cls.subject}</p>
                                )}
                                <h3 className="text-lg font-black text-foreground uppercase tracking-tight italic leading-snug group-hover:text-red-500 transition-colors">
                                    {cls.title}
                                </h3>
                                <p className="text-[10px] font-bold text-foreground/40 line-clamp-2">{cls.description}</p>
                            </div>

                            <div className="flex items-center gap-4 text-[9px] font-black text-foreground/40 uppercase tracking-widest">
                                <span className="flex items-center gap-1.5">
                                    <Users className="h-3 w-3" /> {cls.active_participants_count ?? 0}
                                </span>
                                {cls.status === 'scheduled' && cls.scheduled_at && (
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(cls.scheduled_at).toLocaleString('en-IN', {
                                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </span>
                                )}
                                {cls.status === 'live' && cls.started_at && (
                                    <span className="flex items-center gap-1.5 text-red-500">
                                        <Clock className="h-3 w-3" /> Started {formatAgo(cls.started_at)}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                                    {cls.teacher?.name?.charAt(0) ?? 'T'}
                                </div>
                                <span className="text-[10px] font-black text-foreground/50 uppercase tracking-widest truncate">{cls.teacher?.name}</span>
                            </div>

                            {/* Feature chips */}
                            <div className="flex flex-wrap gap-1.5">
                                {cls.chat_enabled && <span className="text-[8px] font-black uppercase tracking-widest text-foreground/30 bg-foreground/5 px-2 py-0.5 rounded-full">Chat</span>}
                                {cls.qa_enabled && <span className="text-[8px] font-black uppercase tracking-widest text-foreground/30 bg-foreground/5 px-2 py-0.5 rounded-full">Q&A</span>}
                                {cls.polls_enabled && <span className="text-[8px] font-black uppercase tracking-widest text-foreground/30 bg-foreground/5 px-2 py-0.5 rounded-full">Polls</span>}
                            </div>

                            <button
                                onClick={() => handleJoin(cls)}
                                disabled={cls.status === 'ended' || cls.status === 'cancelled'}
                                className={cn(
                                    "w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95",
                                    cls.status === 'live'
                                        ? "bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/20"
                                        : cls.status === 'scheduled'
                                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                                            : "bg-foreground/5 text-foreground/30 cursor-not-allowed"
                                )}
                            >
                                {cls.status === 'live' ? (
                                    <><span className="h-2 w-2 rounded-full bg-white animate-pulse" /> Join Now</>
                                ) : cls.status === 'scheduled' ? (
                                    <><Calendar className="h-3.5 w-3.5" /> Set Reminder</>
                                ) : (
                                    <><Play className="h-3.5 w-3.5" /> Watch Recording</>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Schedule Class Modal */}
            {showSchedule && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowSchedule(false)} />
                    <div className="relative z-10 w-full max-w-lg bg-card-bg border border-card-border rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 fade-in duration-200 space-y-6">
                        <div>
                            <h2 className="text-xl font-black text-foreground uppercase tracking-tight italic">Schedule a Live Class</h2>
                            <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-1">Fill in the details below</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest block mb-2">Class Title *</label>
                                <input
                                    autoFocus
                                    value={form.title}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    placeholder="e.g. Algebra Masterclass"
                                    className="w-full bg-background border border-card-border rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest block mb-2">Subject</label>
                                <input
                                    value={form.subject}
                                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                                    placeholder="e.g. Mathematics"
                                    className="w-full bg-background border border-card-border rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest block mb-2">Description</label>
                                <textarea
                                    rows={3}
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="What will students learn in this class?"
                                    className="w-full bg-background border border-card-border rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest block mb-2">Schedule Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={form.scheduled_at}
                                    onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))}
                                    className="w-full bg-background border border-card-border rounded-2xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setShowSchedule(false)}
                                className="flex-1 py-3 border border-card-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGoLive}
                                disabled={scheduling || !form.title.trim()}
                                className="flex-1 py-3 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-400 transition-all disabled:opacity-40"
                            >
                                {scheduling ? 'Creating...' : 'Create & Go Live'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <AuthModal open={authModal} onClose={() => setAuthModal(false)} reason="join live classes" redirectTo="/dashboard/live" />
        </div>
    );
}

function formatAgo(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
}
