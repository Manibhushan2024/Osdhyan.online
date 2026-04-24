'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/components/providers/AuthProvider';
import { Video, Radio, Clock, Users, Play, Trash2, ArrowLeft, Plus, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

type LiveClass = {
    id: number;
    title: string;
    subject: string;
    status: 'scheduled' | 'live' | 'ended' | 'cancelled';
    scheduled_at: string;
    started_at: string;
    active_participants_count: number;
    chat_enabled: boolean;
    qa_enabled: boolean;
    polls_enabled: boolean;
};

export default function ManageClassesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [classes, setClasses] = useState<LiveClass[]>([]);
    const [loading, setLoading] = useState(true);

    const isTeacher = user?.is_teacher || user?.is_admin;

    useEffect(() => {
        if (authLoading) return;
        if (!user) { router.replace('/auth/login'); return; }
        if (!isTeacher) { router.replace('/dashboard/live'); return; }
        fetchMyClasses();
    }, [authLoading, user]);

    const fetchMyClasses = async () => {
        try {
            const res = await api.get('/live-classes/my/classes');
            setClasses(res.data);
        } catch {
            toast.error('Failed to load classes');
        } finally {
            setLoading(false);
        }
    };

    const deleteClass = async (id: number) => {
        if (!confirm('Delete this class? This cannot be undone.')) return;
        try {
            await api.delete(`/live-classes/${id}`);
            setClasses(prev => prev.filter(c => c.id !== id));
            toast.success('Class deleted');
        } catch {
            toast.error('Failed to delete class');
        }
    };

    const statusBadge = (status: LiveClass['status']) => ({
        live: <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full"><span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />LIVE</span>,
        scheduled: <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full"><Clock className="h-2.5 w-2.5" />Scheduled</span>,
        ended: <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-foreground/30 bg-foreground/5 border border-card-border px-2.5 py-1 rounded-full">Ended</span>,
        cancelled: <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-foreground/30 bg-foreground/5 border border-card-border px-2.5 py-1 rounded-full">Cancelled</span>,
    }[status]);

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="h-6 w-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-16 px-4 md:px-0 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/live" className="p-2 rounded-xl hover:bg-card-bg border border-transparent hover:border-card-border transition-all text-foreground/40 hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-foreground uppercase tracking-tight italic">My Classes</h1>
                        <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">{classes.length} total</p>
                    </div>
                </div>
                <Link
                    href="/dashboard/live"
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                    <Plus className="h-3.5 w-3.5" /> New Class
                </Link>
            </div>

            {/* Empty state */}
            {classes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 gap-4 bg-card-bg border border-dashed border-card-border rounded-[3rem]">
                    <Video className="h-10 w-10 text-foreground/10" />
                    <p className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">No classes yet</p>
                    <Link href="/dashboard/live" className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-400 transition-all">
                        <Plus className="h-3.5 w-3.5" /> Schedule First Class
                    </Link>
                </div>
            )}

            {/* Class list */}
            <div className="space-y-3">
                {classes.map(cls => (
                    <div key={cls.id} className="group bg-card-bg border border-card-border rounded-[2rem] p-6 flex items-center gap-5 hover:border-foreground/20 transition-all">
                        {/* Icon */}
                        <div className={cn(
                            "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0",
                            cls.status === 'live' ? "bg-red-500/10" : "bg-foreground/5"
                        )}>
                            {cls.status === 'live'
                                ? <Radio className="h-6 w-6 text-red-500" />
                                : <Video className="h-6 w-6 text-foreground/30" />}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                {statusBadge(cls.status)}
                                {cls.subject && <span className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">{cls.subject}</span>}
                            </div>
                            <h3 className="text-sm font-black text-foreground uppercase tracking-tight italic truncate">{cls.title}</h3>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="flex items-center gap-1 text-[9px] font-black text-foreground/30 uppercase tracking-widest">
                                    <Users className="h-2.5 w-2.5" /> {cls.active_participants_count ?? 0}
                                </span>
                                {cls.scheduled_at && cls.status === 'scheduled' && (
                                    <span className="flex items-center gap-1 text-[9px] font-black text-foreground/30 uppercase tracking-widest">
                                        <Clock className="h-2.5 w-2.5" />
                                        {new Date(cls.scheduled_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                            {cls.status !== 'ended' && cls.status !== 'cancelled' && (
                                <Link
                                    href={`/dashboard/live/${cls.id}`}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all",
                                        cls.status === 'live'
                                            ? "bg-red-500 text-white hover:bg-red-400"
                                            : "bg-indigo-600 text-white hover:bg-indigo-500"
                                    )}
                                >
                                    {cls.status === 'live' ? <><Radio className="h-3 w-3" /> Enter</> : <><Play className="h-3 w-3" /> Open</>}
                                </Link>
                            )}
                            <button
                                onClick={() => deleteClass(cls.id)}
                                className="h-9 w-9 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
