'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import api from '@/lib/api';
import {
    Shield,
    Target,
    Zap,
    Trophy,
    User as UserIcon,
    Mail,
    Phone,
    Calendar,
    Award,
    Flame,
    Clock,
    TrendingUp,
    ChevronRight,
    QrCode,
    GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ProfileEditModal from './ProfileEditModal';

export default function IdentityPage() {
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
            console.error('Failed to fetch identity data', error);
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
            <div className="flex justify-center py-40">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const rank = data?.stats?.rank || 42;
    const points = data?.stats?.points || 950;
    const level = Math.floor(points / 500) + 1;

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-1000 pb-20 px-4">
            <ProfileEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={user}
                onUpdate={(u) => window.location.reload()}
            />

            {/* User Dossier Header */}
            <div className="relative bg-card-bg border border-card-border p-8 md:p-12 rounded-[3.5rem] shadow-2xl overflow-hidden group transition-all duration-700 hover:border-blue-500/30">
                <div className="absolute top-0 right-0 h-64 w-64 bg-blue-600/5 rounded-full blur-[80px]" />
                <div className="absolute -bottom-20 -left-20 h-64 w-64 bg-indigo-600/5 rounded-full blur-[80px]" />

                <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                    <div className="relative group/avatar cursor-pointer" onClick={() => setIsEditModalOpen(true)}>
                        <div className="h-40 w-40 rounded-[2.5rem] bg-gradient-to-tr from-blue-600 to-indigo-600 p-1 shadow-2xl shadow-blue-500/20 group-hover/avatar:shadow-neon transition-all flex items-center justify-center overflow-hidden relative">
                            {user?.avatar ? (
                                <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '')}/storage/${user.avatar}`}
                                    alt={user?.name}
                                    className="h-full w-full object-cover rounded-[2.2rem]"
                                />
                            ) : (
                                <div className="h-full w-full bg-background rounded-[2.2rem] flex items-center justify-center text-4xl font-black text-blue-600 uppercase italic">
                                    {user?.name?.charAt(0)}
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                <span className="text-white text-xs font-bold uppercase tracking-widest">Edit</span>
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-3 rounded-2xl shadow-xl border-4 border-card-bg">
                            <Shield className="h-6 w-6" />
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 justify-center md:justify-start">
                            <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter italic">{user?.name}</h1>
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="px-4 py-1.5 bg-blue-600/10 hover:bg-blue-600 hover:text-white transition-all text-blue-600 border border-blue-600/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] self-center"
                            >
                                Edit Profile
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-foreground/50 font-bold uppercase tracking-widest text-[10px]">
                            <div className="flex items-center gap-3 justify-center md:justify-start">
                                <Mail className="h-4 w-4 text-blue-600" />
                                <span>{user?.email}</span>
                            </div>
                            <div className="flex items-center gap-3 justify-center md:justify-start">
                                <Phone className="h-4 w-4 text-blue-600" />
                                <span>{user?.phone || 'No Phone'}</span>
                            </div>
                            <div className="flex items-center gap-3 justify-center md:justify-start">
                                <GraduationCap className="h-4 w-4 text-blue-600" />
                                <span>{user?.exam_preference || 'General'} Aspirant</span>
                            </div>
                            <div className="flex items-center gap-3 justify-center md:justify-start">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                <span>Target: {user?.target_year || new Date().getFullYear()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-background/50 backdrop-blur-md rounded-3xl p-6 border border-card-border shadow-inner text-center md:text-right">
                        <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] mb-1">Dossier ID</p>
                        <p className="text-sm font-black text-foreground tracking-widest tabular-nums">OS-{user?.id?.toString().padStart(6, '0')}</p>
                        <div className="mt-4 flex items-center justify-center md:justify-end gap-2 text-blue-600">
                            <QrCode className="h-4 w-4 opacity-50" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Digital Auth Tag</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Identity Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Points Card */}
                <div className="bg-card-bg border border-card-border p-8 rounded-[3rem] shadow-lg flex flex-col items-center group hover:translate-y-[-4px] transition-all">
                    <Trophy className="h-10 w-10 text-yellow-500 mb-6 group-hover:scale-110 transition-transform" />
                    <p className="text-5xl font-black text-foreground tracking-tighter tabular-nums mb-2">{points}</p>
                    <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mb-6">Mastery Points</p>
                    <div className="w-full bg-background/50 h-2 rounded-full overflow-hidden border border-card-border">
                        <div className="bg-yellow-500 h-full rounded-full transition-all duration-1000" style={{ width: `${(points % 500) / 5}%` }} />
                    </div>
                    <p className="mt-4 text-[9px] font-bold text-foreground/40 uppercase tracking-widest">Level {level} Elite • {500 - (points % 500)} pts to Level {level + 1}</p>
                </div>

                {/* Streak Card */}
                <div className="bg-card-bg border border-card-border p-8 rounded-[3rem] shadow-lg flex flex-col items-center group hover:translate-y-[-4px] transition-all">
                    <Flame className="h-10 w-10 text-red-500 mb-6 group-hover:scale-110 transition-transform" />
                    <p className="text-5xl font-black text-foreground tracking-tighter tabular-nums mb-2">{data?.stats?.study_streak || 0}</p>
                    <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mb-6">Day Streak</p>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5, 6, 7].map(i => (
                            <div key={i} className={cn("h-6 w-1 rounded-full", i <= (data?.stats?.study_streak % 7 || 0) ? "bg-red-500" : "bg-card-border")} />
                        ))}
                    </div>
                    <p className="mt-6 text-[9px] font-bold text-red-500 uppercase tracking-widest">Consistency: Unstoppable</p>
                </div>

                {/* Accuracy Card */}
                <div className="bg-card-bg border border-card-border p-8 rounded-[3rem] shadow-lg flex flex-col items-center group hover:translate-y-[-4px] transition-all">
                    <Target className="h-10 w-10 text-blue-600 mb-6 group-hover:scale-110 transition-transform" />
                    <p className="text-5xl font-black text-foreground tracking-tighter tabular-nums mb-2">{data?.stats?.accuracy_percentage || 0}%</p>
                    <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mb-6">Precision Audit</p>
                    <div className="flex items-center gap-4 w-full">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Global Top 5%</span>
                    </div>
                </div>
            </div>

            {/* Growth Metrics Table & Strengths */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Metrics */}
                <div className="bg-card-bg border border-card-border rounded-[3.5rem] p-8 md:p-12 shadow-xl relative overflow-hidden">
                    <h2 className="text-2xl font-black text-foreground uppercase tracking-tight italic mb-8">Identity Metrics</h2>
                    <div className="space-y-8">
                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 border border-blue-600/20 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-foreground/40 font-black uppercase tracking-widest italic">Temporal Focus</p>
                                    <p className="text-lg font-black text-foreground uppercase tracking-tight">Total Focus</p>
                                </div>
                            </div>
                            <p className="text-xl font-black text-foreground tabular-nums tracking-tighter">{Math.floor((data?.stats?.total_time_spent_min || 0) / 60)}h {Math.floor(data?.stats?.total_time_spent_min % 60)}m</p>
                        </div>

                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 border border-indigo-600/20 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <Zap className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-foreground/40 font-black uppercase tracking-widest italic">Neural Efficiency</p>
                                    <p className="text-lg font-black text-foreground uppercase tracking-tight">Avg Accuracy</p>
                                </div>
                            </div>
                            <p className="text-xl font-black text-foreground uppercase tracking-tighter tabular-nums">{data?.stats?.accuracy_percentage || 0}%</p>
                        </div>
                    </div>
                </div>

                {/* Cognitive Profile (Strengths/Weaknesses) */}
                <div className="bg-card-bg border border-card-border rounded-[3.5rem] p-8 md:p-12 shadow-xl relative overflow-hidden flex flex-col justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-foreground uppercase tracking-tight italic mb-8">Cognitive Profile</h2>

                        <div className="space-y-6">
                            {/* Strengths */}
                            <div>
                                <h3 className="text-[10px] font-black text-green-500 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                                    <TrendingUp className="h-3 w-3" /> Dominant Sectors
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {performance?.strengths?.length > 0 ? performance.strengths.map((t: any, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                            {t.topic_name} ({Math.round(t.accuracy)}%)
                                        </span>
                                    )) : (
                                        <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">No data available</span>
                                    )}
                                </div>
                            </div>

                            {/* Weaknesses */}
                            <div>
                                <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                                    <Target className="h-3 w-3" /> Critical Gaps
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {performance?.weaknesses?.length > 0 ? performance.weaknesses.map((t: any, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                            {t.topic_name} ({Math.round(t.accuracy)}%)
                                        </span>
                                    )) : (
                                        <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">No critical gaps detected</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-card-border">
                        <div className="flex flex-wrap gap-4">
                            {[
                                { name: 'Early Adopter', icon: Award },
                                { name: 'Focus Master', icon: Shield },
                                { name: 'High Accuracy', icon: Zap },
                                { name: 'Weekly Champion', icon: Trophy }
                            ].map((badge, i) => (
                                <div key={i} className="flex items-center gap-2 bg-background/50 px-3 py-2 rounded-xl border border-card-border hover:border-blue-500/30 transition-all cursor-pointer opacity-50 hover:opacity-100">
                                    <badge.icon className="h-3 w-3 text-blue-600" />
                                    <span className="text-[9px] font-black text-foreground uppercase tracking-widest">{badge.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-center p-8 bg-blue-600/5 rounded-[2.5rem] border border-blue-600/10">
                <p className="text-xs font-bold text-foreground/60 italic text-center max-w-xl">
                    "Your identity is defined by your consistency. Every session recorded in the system increases your selection probability. Keep evolving."
                </p>
            </div>
        </div>
    );
}
