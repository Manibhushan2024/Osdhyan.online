'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
    Trophy,
    Sparkles,
    Zap,
    ChevronLeft,
    ClipboardCheck,
    Play,
    Minus,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

type TestSeries = {
    id: number;
    name_en: string;
    description_en: string;
    is_enrolled: boolean;
    exam?: {
        name_en: string;
    };
    stats?: {
        total_tests: number;
    }
};

export default function EnrolledMissionsPage() {
    const [enrolledSeries, setEnrolledSeries] = useState<TestSeries[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchEnrolled();
    }, []);

    const fetchEnrolled = async () => {
        setLoading(true);
        try {
            const res = await api.get('/test-series/enrolled');
            setEnrolledSeries(res.data);
        } catch (error) {
            console.error('Failed to fetch enrolled series', error);
            toast.error('Failed to load enrolled missions');
        } finally {
            setLoading(false);
        }
    };

    const handleUnenroll = async (id: number) => {
        // Optimistic removal
        setEnrolledSeries(prev => prev.filter(s => s.id !== id));
        try {
            await api.post(`/test-series/${id}/unenroll`);
            toast.success('Successfully unenrolled!');
        } catch (error) {
            toast.error('Unenrollment failed');
            fetchEnrolled(); // re-fetch on failure
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20 px-4 md:px-0">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4 hover:translate-x-1 transition-transform"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back to Hub
                    </button>
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter italic">Your Enrolled <span className="text-blue-600">Missions</span></h1>
                    <p className="text-foreground/40 font-black uppercase tracking-widest text-[10px]">Active Intelligence Operations & Strategic Tracking</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : enrolledSeries.length === 0 ? (
                <div className="bg-card-bg border border-card-border rounded-[3rem] p-20 text-center space-y-6">
                    <div className="h-20 w-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto">
                        <Trophy className="h-10 w-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-black text-foreground uppercase italic">No Active Missions</h2>
                    <p className="text-gray-500 max-w-sm mx-auto font-medium italic">You haven't enrolled in any test series yet. Head back to the Hub to start your journey.</p>
                    <Link
                        href="/dashboard/test-series"
                        className="inline-block py-4 px-10 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20"
                    >
                        Return to Hub
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {enrolledSeries.map((s) => (
                        <div key={s.id} className="group bg-card-bg border border-card-border p-10 rounded-[3.5rem] shadow-sm hover:shadow-2xl transition-all relative overflow-hidden flex flex-col min-h-[380px]">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Sparkles className="h-20 w-20 text-blue-600" />
                            </div>
                            <div className="flex justify-between items-start mb-8">
                                <div className="h-16 w-16 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center shadow-md border border-gray-100 dark:border-white/5 group-hover:scale-110 transition-transform">
                                    <Trophy className="h-8 w-8 text-blue-600" />
                                </div>
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-green-600 uppercase tracking-widest bg-green-500/10 px-4 py-1.5 rounded-full border border-green-500/20">
                                    Enrolled ✓
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tight italic mb-3 leading-tight">
                                {s.name_en}
                            </h3>
                            <div className="flex items-center justify-between text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-6">
                                <span>{s.exam?.name_en || 'Exam'}</span>
                            </div>

                            <div className="grid grid-cols-1 gap-2 mt-auto">
                                <div className="bg-background/50 p-4 rounded-2xl border border-card-border flex items-center justify-between">
                                    <span className="text-[8px] font-black text-foreground/30 uppercase flex items-center gap-2"><ClipboardCheck className="h-3 w-3" /> Total Tests</span>
                                    <span className="text-sm font-black text-foreground">{s.stats?.total_tests || 0}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <Link
                                    href={`/dashboard/test-series/${s.id}`}
                                    className="py-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl shadow-cyan-500/20 active:scale-95 text-center flex items-center justify-center gap-2"
                                >
                                    <Play className="h-3.5 w-3.5" /> Attempt
                                </Link>
                                <button
                                    onClick={() => handleUnenroll(s.id)}
                                    className="py-4 bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/20 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Minus className="h-3.5 w-3.5" /> Unenroll
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
